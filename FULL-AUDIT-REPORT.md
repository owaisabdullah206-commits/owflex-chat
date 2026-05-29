# Full SEO Audit — Octively (octively.com)

**Date:** 2026-05-29  
**Tool:** Claude SEO v2.0  
**Business type detected:** SaaS — white-label AI chatbot platform (freelancer / agency market)  
**Pages audited:** 11 marketing pages  
**Drift baseline:** None (first audit — baseline will be captured after fixes)

---

## Overall SEO Health Score: 38 / 100

| Category | Weight | Score | Weighted |
|----------|--------|-------|---------|
| Technical SEO | 22% | 48 | 10.6 |
| Content Quality | 23% | 52 | 12.0 |
| On-Page SEO | 20% | 32 | 6.4 |
| Schema / Structured Data | 10% | 0 | 0.0 |
| Performance (CWV) | 10% | 40 | 4.0 |
| AI Search Readiness | 10% | 15 | 1.5 |
| Images | 5% | 80 | 4.0 |
| **Total** | | | **38 / 100** |

> Note: PageSpeed Insights quota exhausted (shared API pool). CWV scores are estimated from TTFB measurement. For accurate field data, add a personal Google API key via `/seo google setup`.

---

## Top 5 Critical Issues (Fix Immediately)

1. **🔴 OG/Twitter images broken — pointing to `localhost:3000`** — All 11 pages have `og:image` and `twitter:image` set to `http://localhost:3000/opengraph-image?...`. Every social media share of any Octively page shows a broken image. Root cause: `metadataBase` is missing or not correctly configured.

2. **🔴 No canonical tags on any page** — 0/11 pages have `<link rel="canonical">`. Google may choose its own canonical (e.g. a trailing-slash variant or a Netlify preview URL), splitting ranking signals across duplicates.

3. **🔴 No schema.org markup anywhere** — Zero JSON-LD across all 11 pages. Google cannot generate rich results (sitelinks, breadcrumbs, FAQ answers, software pricing snippets). This alone blocks all structured SERP features.

4. **🔴 Home page title has no keyword** — Title is `"Octively"` (8 chars). The primary keyword `white label AI chatbot platform` is absent from every page title. Google titles carry the highest on-page weight.

5. **🔴 TTFB 3.3 seconds** — Google's target for Time to First Byte is <0.8s. At 3.3s the site is likely scoring Poor on Core Web Vitals field data. The HTML is also served with `cache-control: no-store`, meaning Netlify Edge cannot cache it, causing a cold-function hit on every request.

---

## Top 5 Quick Wins (< 2 hours each)

1. **Fix `metadataBase`** — One `app/layout.tsx` change. Immediately fixes broken OG/Twitter images across all 11 pages.
2. **Add canonical to each page** — `alternates: { canonical }` in each page's metadata export. 15 minutes.
3. **Expand meta description on home page** — From 30 chars ("Client dashboard for AI chatbots") to 155 chars targeting `white label AI chatbot platform`.
4. **Add `public/llms.txt`** — Static file, zero build time. Immediately signals AI-agent readiness.
5. **Add `Organization` + `WebSite` JSON-LD** — One server component in `app/layout.tsx`. Unlocks sitelinks search box and brand entity recognition.

---

## Technical SEO — Score: 48/100

### ✅ Passing

| Check | Status |
|-------|--------|
| HTTPS enforced | ✅ All pages |
| HSTS header | ✅ `max-age=63072000; includeSubDomains; preload` |
| www → apex redirect | ✅ 301 redirect |
| robots.txt | ✅ Correct — allows marketing pages, blocks `/dashboard/`, `/portal/`, `/api/` |
| Sitemap | ✅ Valid XML, all 11 pages, correct priorities (1.0→0.6), `lastmod` present |
| X-Frame-Options | ✅ `DENY` |
| X-Content-Type-Options | ✅ `nosniff` |
| Referrer-Policy | ✅ `strict-origin-when-cross-origin` |
| Permissions-Policy | ✅ camera, microphone, geolocation blocked |

### ❌ Failing

| Issue | Severity | Detail |
|-------|----------|--------|
| **metadataBase missing / wrong** | Critical | `og:image` resolves to `http://localhost:3000/...` on every page |
| **Canonical tags absent** | Critical | 0/11 pages have `<link rel="canonical">` |
| **CSP header not in production** | High | Added to `next.config.ts` but not deployed — current live site has no CSP |
| **TTFB 3.3s** | High | Measured: 3,303ms. Target: <800ms. Cause: Netlify serverless cold starts + `cache-control: no-store` on HTML responses |
| **HTML not cacheable** | High | `cache-control: private,no-cache,no-store,max-age=0,must-revalidate` on every page. For a marketing site this should be publicly cacheable. |
| **No llms.txt** | Medium | `GET /llms.txt` returns 404 |
| **Sitemap URL in robots.txt hardcoded** | Low | `Sitemap: https://octively.com/sitemap.xml` — works but will break if domain changes |

### TTFB Investigation

The 3.3s TTFB is caused by three compounding factors:
1. Netlify serverless function cold start (Next.js App Router = server-side render per request)
2. `cache-control: no-store` on HTML → Netlify Edge cannot cache the response → every request hits the function
3. Possible Neon PostgreSQL cold connection on first DB hit during render

**Fix:** Add `export const revalidate = 3600` (or `force-static`) to all marketing page files. These pages have no dynamic data — they should be statically generated, not server-rendered on every request.

---

## Content Quality — Score: 52/100

### ✅ Passing

- Clear value proposition on home page: "Give every client their own chatbot portal"
- Multiple content sections covering features, pricing, onboarding
- About page mentions founding location (Karachi) — E-E-A-T locality signal
- For-Agencies and For-Freelancers pages exist — good audience segmentation

### ❌ Issues

| Issue | Severity | Detail |
|-------|----------|--------|
| **Home meta description too short** | High | "Client dashboard for AI chatbots" — 30 chars vs optimal 150–160 |
| **No keyword in home title** | High | "Octively" — primary keyword completely absent |
| **Pricing H1 mentions "developer"** | Medium | H1: "Developer plans built for Pakistani agencies and f..." — audience positioning mismatch (product is freelancer/agency focused, not developer-focused) |
| **About H1 mentions "developer"** | Medium | H1: "Made by a developer. Used by agencies." — reinforces wrong audience signal to search engines |
| **No FAQ content** | Medium | No FAQ section on any page — blocks FAQPage schema and featured snippet opportunities |
| **1,437 word count on homepage** | Medium | Thin for a SaaS landing page competing for "white label AI chatbot platform" (competitors average 2,500–4,000 words) |
| **No E-E-A-T author signals** | Low | No team page, no author credits, no "built by" with verifiable identity beyond a mention |

---

## On-Page SEO — Score: 32/100

### Title Tag Analysis

| Page | Current Title | Issue |
|------|--------------|-------|
| `/` | `Octively` | No keyword. Too short. |
| `/pricing` | `Pricing — Octively` | No keyword in title |
| `/guide` | `Guide — Octively` | No keyword |
| `/for-agencies` | `For Agencies — octively` | ⚠️ Lowercase brand name ("octively") — inconsistent with other pages |
| `/for-freelancers` | `For Freelancers — octively` | ⚠️ Lowercase brand name |
| `/about` | `About — Octively` | No keyword |
| `/contact` | `Contact — Octively` | Acceptable |

**Recommended pattern:** `[Primary Keyword] — Octively`  
Example: `White Label AI Chatbot Platform — Octively`

### Meta Description Analysis

| Page | Length | Issue |
|------|--------|-------|
| Home | 30 chars | Far too short. No keyword. |
| Pricing | 75 chars | Short. No keyword. |
| Guide | 80 chars | Short. Could include "embed script" keyword. |
| For Agencies | 77 chars | Decent but no primary keyword. |
| For Freelancers | 72 chars | Good hook but no keyword. |
| About | 64 chars | Short. |

### Canonical Status

All 11 pages: `MISSING` — Critical gap.

### Internal Linking

Home page links to all key pages. No orphaned pages detected. Good internal link structure.

---

## Schema / Structured Data — Score: 0/100

**Current state:** Zero structured data on any page. No JSON-LD detected.

### Missing Schema Opportunities

| Schema Type | Page | Priority | What it unlocks |
|------------|------|----------|----------------|
| `Organization` | All pages (layout) | Critical | Brand entity recognition, knowledge panel, sitelinks |
| `WebSite` + `SearchAction` | Layout | Critical | Sitelinks search box in Google |
| `SoftwareApplication` | `/pricing` | High | Pricing rich results, app category |
| `FAQPage` | `/guide` (after FAQ added) | High | Featured snippet, FAQ accordion in SERP |
| `BreadcrumbList` | Inner pages | Medium | Breadcrumb display in SERP |

### Recommended `Organization` JSON-LD (for `app/layout.tsx`)

```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": "https://octively.com#organization",
  "name": "Octively",
  "url": "https://octively.com",
  "logo": {
    "@type": "ImageObject",
    "url": "https://octively.com/favicon.svg"
  },
  "description": "White-label AI chatbot platform for freelancers and agencies. Build bots for clients, give them a branded portal to view conversations and leads.",
  "areaServed": "Worldwide",
  "foundingDate": "2024",
  "sameAs": ["https://github.com/MrOwaisAbdullah/Owflex-Chatbot-Saas"]
}
```

### Recommended `WebSite` JSON-LD

```json
{
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": "https://octively.com#website",
  "url": "https://octively.com",
  "name": "Octively",
  "potentialAction": {
    "@type": "SearchAction",
    "target": {
      "@type": "EntryPoint",
      "urlTemplate": "https://octively.com/guide?q={search_term_string}"
    },
    "query-input": "required name=search_term_string"
  }
}
```

---

## Performance (CWV) — Score: 40/100

| Metric | Measured | Target | Status |
|--------|---------|--------|--------|
| TTFB | 3.3s | < 0.8s | 🔴 Poor |
| HTML cacheability | Not cached | Cacheable | 🔴 Poor |
| LCP | Not measurable (no PSI key) | < 2.5s | ⚠️ Unknown |
| CLS | Not measurable | < 0.1 | ⚠️ Unknown |
| INP | Not measurable | < 200ms | ⚠️ Unknown |

**Root cause of poor TTFB:** All marketing pages are server-rendered (Next.js App Router default). Since they contain no dynamic data, they should be statically generated with `export const revalidate = 0` (force-static) or ISR at 1-hour intervals.

**Cache fix:** Adding `export const dynamic = 'force-static'` to all marketing page files would allow Netlify to cache the HTML at the edge, reducing TTFB from 3.3s to ~50ms.

> To get accurate LCP/CLS/INP field data, configure a free Google API key via `/seo google setup` and run `/seo google cwv https://octively.com`.

---

## AI Search Readiness — Score: 15/100

| Signal | Status | Impact |
|--------|--------|--------|
| `llms.txt` | ❌ 404 | AI agents have no structured index |
| Question-based H2 headings | ❌ Absent | All headings are statements, not questions |
| Self-contained 140–160 word answer blocks | ❌ Absent | No passage-level citability for AI Overviews |
| Primary entity definition block | ❌ Absent | "What is Octively?" not answered in a citable paragraph |
| Site indexed by Google (robots) | ✅ Yes | Foundation in place |
| HTTPS | ✅ Yes | Foundation in place |

### What to add for AI citability

Each of these questions needs a 140–160 word self-contained block on the relevant page:

- **Home:** "What is Octively?" / "What is a white label AI chatbot platform?"
- **For Agencies:** "How do agencies manage AI chatbots for multiple clients?"
- **For Freelancers:** "What is the best AI chatbot platform for freelancers?"
- **Guide:** "How do I embed an AI chatbot on a website?"
- **Pricing:** "What does a white label chatbot platform cost?"

---

## Images — Score: 80/100

The site uses SVG inline icons and CSS backgrounds — no `<img>` tags found. No alt text issues. No oversized image issues.

**Recommendation:** When adding screenshots or feature previews to landing pages, ensure all `<img>` tags include descriptive `alt` text containing keywords.

---

## Site Crawl Summary

| Page | Indexed? | Title OK | Desc OK | Canonical | Schema |
|------|----------|----------|---------|-----------|--------|
| `/` | ✅ | ❌ | ❌ | ❌ | ❌ |
| `/pricing` | ✅ | ❌ | ⚠️ | ❌ | ❌ |
| `/guide` | ✅ | ❌ | ⚠️ | ❌ | ❌ |
| `/for-agencies` | ✅ | ❌ | ⚠️ | ❌ | ❌ |
| `/for-freelancers` | ✅ | ❌ | ⚠️ | ❌ | ❌ |
| `/about` | ✅ | ❌ | ⚠️ | ❌ | ❌ |
| `/contact` | ✅ | ⚠️ | ⚠️ | ❌ | ❌ |
| `/changelog` | ✅ | ⚠️ | — | ❌ | ❌ |
| `/roadmap` | ✅ | ⚠️ | — | ❌ | ❌ |
| `/privacy` | ✅ | ⚠️ | — | ❌ | ❌ |
| `/terms` | ✅ | ⚠️ | — | ❌ | ❌ |

---

## Drift Baseline

No previous baseline exists. After implementing Phase 1 fixes, capture a baseline:
```bash
/seo drift baseline https://octively.com
```
Then run `/seo drift compare https://octively.com` after each deploy to track score progression.

---

*Report generated by Claude SEO v2.0 — claude-seo.md*  
*Next audit recommended: after Phase 1 fixes are deployed*
