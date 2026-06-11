# Netlify Build Budget

## Credit System (free plan: 300 credits/month, resets 24th of each month)
## Current cycle: May 24 – Jun 23 · ~50 credits remaining (CRITICAL) · 12 deploys used (10 confirmed + #14 + #15 pending)
## Breakdown (per Netlify billing, Jun 11): deploys 150cr · compute 48.9cr · requests 7.7cr · bandwidth 12.7cr = 219.3cr used
## CRITICAL: ~50cr left, 12 days of traffic will consume ~45cr. NO MORE DEPLOYS before Jun 23 reset.
## NOTE: compute (48.9cr, 4.89 GB-hrs) is the budget killer — each SSR request burns it.

| Resource              | Cost               | With 300 credits     |
|-----------------------|--------------------|----------------------|
| Production deploy     | **15 credits**     | 20 deploys max       |
| Web requests          | 2 credits / 10K    | 1.5M requests        |
| Web bandwidth         | 20 credits / GB    | 15 GB                |
| Serverless compute    | 10 credits / GB-hr | 30 GB-hours          |
| Netlify DB            | N/A                | Using Neon instead   |

**Real per-deploy cost: ~15.1 credits** (15 deploy + ~0.1 compute during build).  
**Real safe limit: 10 production deploys/month** (leaves ~149 credits for traffic/compute).  
At early stage (~100K requests + 0.5 GB bandwidth + 1 GB-hr compute ≈ 40 credits), 10 deploys = ~191 credits total.

## Rules

- ✅ Check this file BEFORE every production push (`git push vercel release` — Netlify watches the `vercel` remote)
- ✅ Record the push immediately after: date, deploy number, credits used, brief note
- ✅ Only push to `release` for user-facing changes — features, bug fixes, content
- ❌ Do NOT push to `release` for: docs-only changes, CLAUDE.md edits, `.env.example` tweaks,
  or anything that doesn't affect the deployed site
- ⚠️  If you reach 10+ deploys in a month, batch remaining changes and release together
- ⚠️  Monitor traffic credits in Netlify dashboard — high traffic months reduce deploy headroom

## Deploy Log

| Date       | Deploy # | Credits used | Notes                                               |
|------------|----------|--------------|-----------------------------------------------------|
| 2026-05-24 | 1        | 0 (failed)   | FAILED — embed workspace picked up instead of root  |
| 2026-05-24 | 2        | 0 (failed)   | FAILED — missing env vars (Resend API key)          |
| 2026-05-24 | 3        | 0 (failed)   | FAILED — secrets scanner blocked non-sensitive vars |
| 2026-05-24 | 4        | 15           | Fix secrets scanner omit keys — SUCCEEDED           |
| 2026-05-25 | 5        | ~15          | fix: proxy.ts double-prefix bug → /dashboard/login 404 |
| 2026-05-28 | 6        | ~15          | fix: canonical subdomain routing + crossSubDomainCookies |
| 2026-05-28 | 7        | ~15          | feat: sync credits button + email logos + v1.1.0 badges  |
| 2026-05-29 | 8        | ~15          | feat: GTM + GA4 + GSC verification + security fixes (PayFast, SSRF, CSP, CORS, auth rate limit) |
| 2026-05-30 | 9        | 0 (failed)   | FAILED — secrets scanner blocked NEXT_PUBLIC_SANITY_API_VERSION + NEXT_PUBLIC_SANITY_DATASET |
| 2026-05-30 | 10       | 0 (failed)   | FAILED — SECRETS_SCAN_OMIT_KEYS dashboard var didn't override netlify.toml value |
| 2026-05-30 | 11       | ~15          | fix: add Sanity vars to SECRETS_SCAN_OMIT_KEYS in netlify.toml (permanent fix) |
| 2026-06-09 | 12       | 0 (failed)   | FAILED — secrets scanner blocked BREVO_FROM_EMAIL + BREVO_DIGEST_EMAIL |
| 2026-06-09 | 13       | ~15          | feat: 4 free tools + /tools hub + directory fixes + bot-form links (added Brevo emails to SECRETS_SCAN_OMIT_KEYS) |
| 2026-06-11 | 14       | ~15          | feat: domain-lock, lead email, reply language, WhatsApp button, buyer-segment, CSV export gate, testimonials, VPS migration docs, env audit |
| 2026-06-11 | 15       | ~15          | fix: per-subdomain session cookies (admin/portal no longer share), remove Google login from portal |

