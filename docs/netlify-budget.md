# Netlify Build Budget

## Credit System (free plan: 300 credits/month, resets 1st of each month)

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
| 2026-05-24 | 4        | 15           | Fix secrets scanner omit keys — pending result      |
