# SEO Action Plan — Octively

**Audit score:** 38/100  
**Target after Phase 1:** 68+/100  
**Date:** 2026-05-29

---

## 🔴 CRITICAL — Fix Immediately (blocks social sharing and ranking)

### C1. Fix `metadataBase` — OG/Twitter images broken on all pages

**File:** `app/layout.tsx`  
**Impact:** Broken social media previews on all 11 pages  
**Fix:** Add `metadataBase` to the root layout metadata export

```ts
export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? 'https://octively.com'),
  title: { default: 'Octively', template: '%s — Octively' },
  description: 'The white-label AI chatbot platform for freelancers and agencies. Build bots for your SMB clients, give them a branded portal to view conversations, leads, and analytics.',
  openGraph: {
    siteName: 'Octively',
    type: 'website',
    images: [{ url: '/opengraph-image.png', width: 1200, height: 630, alt: 'Octively — White Label AI Chatbot Platform' }],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@octively',
    images: ['/opengraph-image.png'],
  },
}
```

---

### C2. Add canonical tags to all pages

**Files:** All 11 page files  
**Impact:** Prevents duplicate content, consolidates ranking signals  
**Fix:** Add `alternates: { canonical: '/path' }` to each page's metadata export

Example for `app/pricing/page.tsx`:
```ts
export const metadata: Metadata = {
  ...
  alternates: { canonical: '/pricing' },
}
```

---

### C3. Fix keyword-less home page title

**File:** `app/page.tsx`  
**Impact:** Highest on-page ranking signal — currently empty of keywords  
**Fix:**
```ts
export const metadata: Metadata = {
  title: 'White Label AI Chatbot Platform for Agencies & Freelancers — Octively',
  description: 'The easiest white-label AI chatbot platform for freelancers and agencies. Build AI chatbots for your SMB clients in minutes. Clients get their own branded portal — free plan available.',
  alternates: { canonical: '/' },
}
```

---

### C4. Add Organization + WebSite JSON-LD schema

**Files:** `app/layout.tsx` (new `<SchemaOrg>` component)  
**Impact:** Enables Google Knowledge Panel, sitelinks search box, brand entity recognition  
**Fix:** Create `components/shared/SchemaOrg.tsx`:
```tsx
export function SchemaOrg() {
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": "https://octively.com#organization",
        "name": "Octively",
        "url": "https://octively.com",
        "logo": { "@type": "ImageObject", "url": "https://octively.com/favicon.svg" },
        "description": "White-label AI chatbot platform for freelancers and agencies.",
        "foundingDate": "2024",
        "areaServed": "Worldwide",
        "sameAs": ["https://github.com/MrOwaisAbdullah/Owflex-Chatbot-Saas"]
      },
      {
        "@type": "WebSite",
        "@id": "https://octively.com#website",
        "url": "https://octively.com",
        "name": "Octively"
      }
    ]
  }
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
}
```
Import and render in `app/layout.tsx` body.

---

## 🟠 HIGH — Fix Within 1 Week

### H1. Expand all meta descriptions to 150–160 chars with primary keyword

| Page | Current (chars) | Recommended |
|------|----------------|-------------|
| `/` | 30 | "The white-label AI chatbot platform for freelancers and agencies. Build AI chatbots for your SMB clients in minutes. Each client gets a branded portal to view conversations, leads, and analytics. Free plan available." |
| `/for-agencies` | 77 | "Manage all your client chatbots from one dashboard. White-label portal — clients log in under your brand, see their conversations and leads. From ₨2,500/month. Much cheaper than Stammer or ConvoCore." |
| `/for-freelancers` | 72 | "Add a recurring revenue stream to every web project. Deploy an AI chatbot for clients in minutes. They log into their own branded portal. You earn monthly retainers. Free plan to start." |
| `/guide` | 80 | "Step-by-step guide to embedding an AI chatbot on any website. Copy one script tag. Works on WordPress, Webflow, Shopify, and any HTML site. No coding required. Setup takes under 5 minutes." |
| `/pricing` | 75 | "Simple, affordable white-label AI chatbot pricing. Free plan available. Starter from ₨2,500/month (~$9 USD). Much cheaper than Stammer.ai ($197/mo) or ConvoCore ($220/mo). Keep 100% client revenue." |

---

### H2. Fix title inconsistency — lowercase brand name on some pages

**Files:** `app/for-agencies/page.tsx`, `app/for-freelancers/page.tsx`  
Current: `"For Agencies — octively"` (lowercase)  
Fix: `"White Label Chatbot for Agencies — Octively"` (include keyword, fix capitalisation)

---

### H3. Add `SoftwareApplication` schema to pricing page

**File:** `app/pricing/page.tsx`  
Add JSON-LD for pricing rich results:
```json
{
  "@type": "SoftwareApplication",
  "name": "Octively",
  "applicationCategory": "BusinessApplication",
  "operatingSystem": "Web",
  "description": "White-label AI chatbot platform for freelancers and agencies. Build bots, give clients branded portal.",
  "offers": [
    { "@type": "Offer", "name": "Free", "price": "0", "priceCurrency": "PKR", "description": "1 bot, 100 conversations/month" },
    { "@type": "Offer", "name": "Starter", "price": "2500", "priceCurrency": "PKR" }
  ]
}
```

---

### H4. Add `public/llms.txt`

**File:** `public/llms.txt` (new)  
See plan file for exact content. This costs nothing and signals AI-agent readiness.

---

### H5. Fix keyword in per-page titles

| Page | New Title |
|------|-----------|
| `/pricing` | `Affordable White Label Chatbot Pricing — Octively` |
| `/guide` | `How to Embed an AI Chatbot on Any Website — Octively` |
| `/for-agencies` | `White Label Chatbot for Agencies — Octively` |
| `/for-freelancers` | `AI Chatbot Platform for Freelancers — Octively` |
| `/about` | `About Octively — AI Chatbot Platform for Agencies` |

---

## 🟡 MEDIUM — Fix Within 1 Month

### M1. Fix page caching for marketing pages (TTFB: 3.3s → ~50ms)

**Files:** All 11 marketing page files  
**Fix:** Add to each marketing page file:
```ts
export const dynamic = 'force-static'
// or for ISR (regenerate hourly):
export const revalidate = 3600
```
This tells Next.js to statically generate the page at build time. Netlify Edge will cache the HTML, eliminating the serverless cold-start TTFB.

---

### M2. Update H1s to remove "developer" references

- `/pricing` H1: "Developer plans built for Pakistani agencies..." → "Plans built for Pakistani agencies and freelancers..."
- `/about` H1: "Made by a developer. Used by agencies." → Keep as-is (this is an origin story, acceptable)

---

### M3. Add FAQ section to Guide page + FAQPage schema

Add a dedicated FAQ section to `components/marketing/GuidePage.tsx`:

**FAQ questions to answer:**
1. "Do I need to know how to code to use Octively?"
2. "Which website platforms does the embed work on?"
3. "How long does setup take?"
4. "How do my clients log in to their portal?"
5. "What chatbot AI models does Octively use?"

Then add `FAQPage` JSON-LD to `app/guide/page.tsx`.

---

### M4. Add AI-citability answer blocks to landing pages

Each page needs a 140–160 word self-contained answer block for AI Overviews. Add to components:

**Home:** Answer "What is Octively?" in a visually styled callout or intro paragraph.  
**For Agencies:** Answer "How do agencies manage AI chatbots for multiple clients?"  
**For Freelancers:** Answer "What is the best AI chatbot platform for freelancers?"  
**Pricing:** Answer "What does a white-label AI chatbot platform cost?"

---

### M5. Add pricing comparison table on `/pricing` and `/for-agencies`

Compare Octively vs Stammer.ai ($197/mo) vs ConvoCore ($220/mo) vs ChatLab ($360/mo).  
This directly targets "affordable white label chatbot" and "stammer.ai alternative" keyword clusters.

---

## 🟢 LOW — Backlog

### L1. Capture drift baseline after Phase 1 deploy
```bash
/seo drift baseline https://octively.com
```

### L2. Configure personal Google API key for CWV field data
```bash
/seo google setup
```
Then run `/seo google cwv https://octively.com` for accurate Lighthouse scores.

### L3. Add `BreadcrumbList` schema to inner pages

### L4. Tighten CSP to use nonces instead of `unsafe-inline`
Deploy Phase 1 security fixes first (CSP is in code but not yet on Netlify production).

### L5. Build Phase 2 blog pages
- `/blog/stammer-alternative`
- `/blog/affordable-white-label-chatbot`
- `/blog/ai-chatbot-for-freelancers`
- `/blog/free-white-label-chatbot`

---

## Estimated Score After Phase 1 Implementation

| Category | Current | After Phase 1 | Change |
|----------|---------|---------------|--------|
| Technical SEO | 48 | 78 | +30 (canonical, metadataBase, caching, llms.txt) |
| Content Quality | 52 | 65 | +13 (descriptions, titles) |
| On-Page SEO | 32 | 72 | +40 (titles, descriptions, canonical) |
| Schema | 0 | 55 | +55 (Organization, WebSite, SoftwareApplication) |
| Performance | 40 | 75 | +35 (caching fixes TTFB) |
| AI Search | 15 | 45 | +30 (llms.txt, citability blocks) |
| Images | 80 | 80 | 0 |
| **Estimated Total** | **38** | **68** | **+30** |

---

*Generated by Claude SEO v2.0 — octively.com*
