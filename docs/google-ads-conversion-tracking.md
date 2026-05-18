# Google Ads Conversion Tracking — Voice of Holy Quran

## Overview

This document covers how Google Ads conversion tracking is installed on the site, which forms fire conversions, what pitfalls were encountered, and how they were fixed.

---

## 1. Installation

### Environment Variables

Two `NEXT_PUBLIC_` variables are required in `.env.local`:

```env
NEXT_PUBLIC_GOOGLE_ADS_ID=AW-XXXXXXXXXX
NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_LABEL=XXXXXXXXXXXXXXXXXXXX
```

These are baked into the client bundle at build time by Next.js. Both are mandatory — if either is missing, `trackConversion()` will log a warning and do nothing.

### Script Initialization (`app/layout.tsx`)

The Google tag is loaded in the root layout so it is available on every page:

```tsx
// Inside <body> — NOT inside <head>
<Script
  src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GOOGLE_ADS_ID}`}
  strategy="afterInteractive"
/>
<Script id="gtag-config" strategy="afterInteractive">
  {`
    window.dataLayer = window.dataLayer || [];
    window.gtag = function(){window.dataLayer.push(arguments);}
    window.gtag('js', new Date());
    window.gtag('config', '${process.env.NEXT_PUBLIC_GOOGLE_ADS_ID}');
  `}
</Script>
```

**Critical:** Both scripts use `strategy="afterInteractive"` and must be inside `<body>`, not `<head>`. See [Pitfalls](#3-pitfalls) for why.

### Conversion Helper (`lib/gtm.ts`)

All form components call a single utility function:

```ts
import { trackConversion } from "@/lib/gtm";

// On successful form submit:
trackConversion(); // defaults: value=1.0, currency="PKR"
```

The function:
1. Guards against SSR (`typeof window === "undefined"`)
2. Checks env vars are present
3. Fires `window.gtag("event", "conversion", { send_to: "AW-ID/LABEL" })` if gtag is ready
4. Falls back to a raw `window.dataLayer.push(...)` if gtag hasn't initialized yet

---

## 2. Forms That Fire Conversions

| Form | Component | Page | API Route |
|------|-----------|------|-----------|
| Homepage hero enrollment | `components/hero-section.tsx` | `/` | `/api/enroll` |
| Full enrollment form | `components/lead-form-section.tsx` | `/enroll` | `/api/enroll` |
| Contact form | `components/contact-section.tsx` | `/contact` | `/api/contact` |

All three forms call `trackConversion()` only after the API responds with a success (`res.ok === true`). No conversion fires if the API returns an error or if the Brevo email send fails.

---

## 3. Pitfalls

### Pitfall 1 — `<Script>` inside `<head>` silently breaks `afterInteractive`

**What happened:** The two `<Script strategy="afterInteractive">` components were placed inside the JSX `<head>` element:

```tsx
// BROKEN — never do this
<html>
  <head>
    <Script src="..." strategy="afterInteractive" />
    <Script id="gtag-config" strategy="afterInteractive">...</Script>
  </head>
  ...
</html>
```

Next.js's `afterInteractive` strategy works by injecting the script after React hydration via a client-side effect. When the `<Script>` component is nested inside the `<head>` HTML element in the App Router, the injection mechanism breaks and the scripts never execute. `window.gtag` is never set, and every call to `trackConversion()` silently falls through.

**Fix:** Move both `<Script>` tags inside `<body>`:

```tsx
<body>
  {children}
  <Script src="..." strategy="afterInteractive" />
  <Script id="gtag-config" strategy="afterInteractive">...</Script>
</body>
```

---

### Pitfall 2 — `function gtag(){}` is not reliably global

**What happened:** The standard Google tag snippet uses a plain function declaration:

```js
function gtag(){dataLayer.push(arguments);}
```

In a classic (non-module) browser script, this does become `window.gtag`. But when Next.js injects an inline script via `<Script>`, the execution context is not guaranteed to be the bare global scope. The function declaration may be scoped to the injected script wrapper, leaving `window.gtag` undefined.

**Fix:** Assign explicitly to `window`:

```js
window.gtag = function(){window.dataLayer.push(arguments);}
```

---

### Pitfall 3 — Hero section form had zero conversion tracking

**What happened:** The homepage hero form (`hero-section.tsx`) submitted to `/api/enroll` and handled success/error state, but never imported or called `trackConversion()`. Every enrollment from the homepage was invisible to Google Ads.

**Fix:** Added `import { trackConversion } from "@/lib/gtm"` and `trackConversion()` call after `setIsSubmitted(true)`.

---

### Pitfall 4 — `console.log("FORM SUBMIT SUCCESS")` fired before `res.ok` check

**What happened:** In `lead-form-section.tsx`, a log saying "FORM SUBMIT SUCCESS - calling trackConversion" was placed *before* the `if (!res.ok)` guard:

```ts
const data = await res.json();

console.log("FORM SUBMIT SUCCESS - calling trackConversion"); // fires even on API error!

if (!res.ok) {
  throw new Error(data.error || "Something went wrong");
}
```

This made debugging extremely confusing — the "success" message appeared in the console even when the form was actually failing and `trackConversion()` was never reached.

**Fix:** Removed the misleading log. Conversion tracking now only fires after the `res.ok` guard passes.

---

### Pitfall 5 — Race condition: `trackConversion()` called before gtag script loads

**What happened:** `strategy="afterInteractive"` means the script executes after hydration, but there is a small window where a very fast user (or a test) could submit a form before the gtag script has had a chance to run. In that case, `typeof window.gtag !== "function"` and the conversion would be silently dropped.

**Fix:** Added a `dataLayer` fallback in `gtm.ts`. If `window.gtag` is not a function, the conversion event is pushed directly to `window.dataLayer`. The gtag library reads from dataLayer on initialization, so any events queued before it loads are still processed.

```ts
window.dataLayer = window.dataLayer || [];
window.dataLayer.push({
  event: "conversion",
  send_to: sendTo,
  value,
  currency,
});
```

---

## 4. Current Experience (After Fixes)

### On page load
Open DevTools → Console. You should see:
```
[gtag] initialized with ID: AW-18167275086
```
This confirms the script loaded and `window.gtag` is set.

### On form submit (success)
```
[trackConversion] called {value: 1, currency: 'PKR', CONVERSION_ID: 'AW-18167275086', CONVERSION_LABEL: 'loBECPbtkK4cEM686tZD'}
[trackConversion] gtag event fired → AW-18167275086/loBECPbtkK4cEM686tZD
```

### On form submit (API failure)
```
[trackConversion] called ...       ← will NOT appear; error is thrown first
```
The form shows an inline error message to the user. No conversion is fired — intentional.

### Verifying in Google Ads
- Google Ads dashboard → Tools → Conversions → your conversion action
- Allow 24–48 hours for data to appear after the first real conversion
- For immediate testing: use the **Google Tag Assistant** Chrome extension or check the Network tab for a request to `www.google.com/pagead/conversion/...`

---

## 5. File Reference

| File | Purpose |
|------|---------|
| `app/layout.tsx` | Loads the gtag JS library and initializes `window.gtag` |
| `lib/gtm.ts` | `trackConversion()` helper — single source of truth for all conversion events |
| `components/hero-section.tsx` | Homepage hero form — fires conversion on enroll submit |
| `components/lead-form-section.tsx` | `/enroll` page form — fires conversion on enroll submit |
| `components/contact-section.tsx` | `/contact` page form — fires conversion on contact submit |
| `.env.local` | Holds `NEXT_PUBLIC_GOOGLE_ADS_ID` and `NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_LABEL` |
