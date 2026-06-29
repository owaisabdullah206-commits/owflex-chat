# Installing the Octively chat widget

Add your agent to any website with **one script tag**. Copy it from your dashboard
(Bot → Settings → Embed Script):

```html
<script src="https://admin.octively.com/api/embed" data-key="pk_your_embed_key"></script>
```

## Where to put it

**Recommended: just before the closing `</body>` tag.** The page renders first, then
the widget loads, so it never slows down how fast your site appears.

It is also safe in the `<head>` — the widget waits for the page to be ready before it
draws anything. But a plain script in the `<head>` is render-blocking, so if you must
put it there, add `defer`:

```html
<script src="https://admin.octively.com/api/embed" data-key="pk_your_embed_key" defer></script>
```

You only need **one** tag. It loads once, is cached for an hour, and adds the chat
launcher to the bottom corner of every page where the tag is present.

> **Important — domain lock:** each bot is tied to the Store URL set in its settings.
> The widget only runs on that domain, so a copied embed key cannot be used to load
> your bot (and spend your credits) on another website. If the widget does not appear,
> first check that the site's domain matches the bot's Store URL.

---

## Plain HTML / static site

Paste the tag right before `</body>` on every page (or in a shared footer include):

```html
  ...
    <script src="https://admin.octively.com/api/embed" data-key="pk_your_embed_key"></script>
  </body>
</html>
```

---

## WordPress

Pick whichever is easiest for you:

**A. Plugin (no theme editing — recommended)**
1. Install a header/footer plugin such as **WPCode** or **Insert Headers and Footers**.
2. Open its settings and find the **Body** or **Footer** section (not Header).
3. Paste the script tag and save.

**B. Theme editor**
1. Appearance → Theme File Editor → `footer.php`.
2. Paste the tag just before `</body>` and update the file.
3. Use a child theme so a theme update does not overwrite it.

**C. Block editor (single page)**
- Edit the page → add a **Custom HTML** block → paste the tag. (Use a plugin instead
  if you want it on every page.)

---

## Shopify

1. Online Store → Themes → on your live theme click **... → Edit code**.
2. Open `layout/theme.liquid`.
3. Paste the tag on its own line just **above** `</body>`.
4. Save.

It now loads on every storefront page.

---

## Webflow

1. Project Settings → **Custom Code**.
2. Paste the tag into **Footer Code** (this renders before `</body>`).
3. Save, then **Publish** the site.

For a single page only: Page Settings → Custom Code → Before `</body>` tag.

---

## Wix

1. Site Dashboard → Settings → **Custom Code** (under Advanced).
2. **+ Add Custom Code**, paste the tag.
3. Set **Add Code to Pages** = All pages, and **Place Code in** = **Body – end**.
4. Apply.

---

## Squarespace

1. Settings → **Advanced → Code Injection**.
2. Paste the tag into the **Footer** box.
3. Save.

For a single page: add a **Code** block to that page and paste the tag.
(Code Injection requires a Business plan or higher.)

---

## Framer

1. Project Settings → **General → Custom Code**.
2. Paste the tag into **End of `<body>` tag**.
3. Publish.

---

## Carrd

1. Add an **Embed** element where you want it (position does not matter for the launcher).
2. Set type to **Code**, paste the tag.
3. Save and publish. (Embed elements require a Pro plan.)

---

## Google Tag Manager

1. Tags → **New** → Tag Configuration → **Custom HTML**.
2. Paste the tag.
3. Trigger: **All Pages**.
4. Save and **Submit / Publish** the container.

---

## React / Next.js

Use the framework's script component so it loads after hydration:

```tsx
// Next.js (App Router) — in app/layout.tsx
import Script from 'next/script'

<Script
  src="https://admin.octively.com/api/embed"
  data-key="pk_your_embed_key"
  strategy="afterInteractive"
/>
```

For plain React, append the script once in a top-level `useEffect`.

---

## Verify it works

1. Open your website in a normal browser tab.
2. The chat launcher appears in the bottom corner within a second or two.
3. Send a test message — it should reply, and the conversation shows up in your
   dashboard under that bot's **Conversations** and **Analytics**.

## If the widget does not appear

- **Domain mismatch** — the site's domain must match the bot's **Store URL** in settings.
- **Wrong key** — confirm the `data-key` matches the one in your dashboard.
- **Caching** — clear the site/CDN cache, or hard-refresh (Ctrl/Cmd + Shift + R).
- **Tag stripped** — some page builders strip `<script>` from normal content areas; use
  the platform's dedicated custom-code / footer setting shown above, not a text block.
- **Console errors** — open the browser console (F12) and look for messages prefixed
  with `octively`.
