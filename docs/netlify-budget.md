# Netlify Build Budget

Monthly limit: **300 build minutes**  
Estimated per build: **~4.5 minutes** (TypeScript check is the bottleneck at ~3.3 min)  
Max safe builds/month: **50** (leaves ~75 min safety buffer)  
Budget resets: **1st of each month**

## Rules

- ✅ Check this file BEFORE every production push (`git push vercel release` — Netlify watches the `vercel` remote)
- ✅ Record the push immediately after: date, build number, brief note
- ✅ Only push to `release` for user-facing changes — features, bug fixes, content
- ❌ Do NOT push to `release` for: docs-only changes, CLAUDE.md edits, `.env.example` tweaks,
  or anything that doesn't affect the deployed site
- ⚠️  If you reach 40+ builds this month, delay non-urgent releases until next cycle

## Build Log

| Date       | Build # | Duration   | Notes                                        |
|------------|---------|------------|----------------------------------------------|
| 2026-05-24 | 1       | <1 min     | FAILED — embed workspace picked up instead of root |
| 2026-05-24 | 2       | ~4.5 min   | Fix netlify.toml base=. + initial production deploy |
