# Netlify Build Budget

## Credit System (free plan: 300 credits/month, resets 24th of each month)
## Current cycle: May 24 – Jun 24 · 170.7 credits remaining · 7 production deploys used
## Breakdown: deploys 105cr · compute 18.5cr · requests 3.4cr · bandwidth 2.4cr = 129.3cr used

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

