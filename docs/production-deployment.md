# Production Deployment Guide

## Architecture

All three surfaces are one Next.js 16 app, routed by hostname in `proxy.ts` (project root — Next.js 16 replaces `middleware.ts` with `proxy.ts`):

| Subdomain             | Routes to   | Purpose             |
|-----------------------|-------------|---------------------|
| `octively.com`        | `/`         | Marketing site      |
| `admin.octively.com`  | `/dashboard` | Developer dashboard |
| `app.octively.com`    | `/portal`   | Client portal       |

## Hosting

| Environment   | Platform | Remote watched / Branch                               | URL                        |
|---------------|----------|-------------------------------------------------------|----------------------------|
| **Production**| Netlify  | `vercel` remote (`owaisabdullah206-commits`) / `release` | https://octively.com    |
| **Development**| Vercel  | `vercel` remote / every push                          | https://octively.vercel.app |

> ⚠️ Netlify watches the **`vercel` remote**, not `origin`. Pushing to `origin/release` alone will NOT deploy.

## How to Release to Production

> ⚠️ Check `docs/netlify-budget.md` FIRST — confirm build count is under 50 this month.

```bash
# 1. Ensure master is clean and build passes
npm run build

# 2. Merge and push to production branch
git checkout release
git merge master
git push vercel release   # ← triggers Netlify build (~4.5 min)
git push origin release   # ← keeps GitHub in sync
git checkout master

# 3. Record the push in docs/netlify-budget.md
```

Verify live within ~5 minutes at https://octively.com.

## Daily Development (unchanged)

```bash
npm run build            # must pass
git push origin master   # Vercel preview — does NOT trigger Netlify
git push vercel master   # Vercel deployment
```

## Environment Variables

Set in **Netlify → Site configuration → Environment variables**.  
See `.env.example` for all required vars and their production values.

Key production URLs (differ from dev):

| Variable                | Production value                        |
|-------------------------|-----------------------------------------|
| `BETTER_AUTH_URL`       | `https://admin.octively.com`            |
| `NEXT_PUBLIC_APP_URL`   | `https://admin.octively.com`            |
| `NEXT_PUBLIC_PORTAL_URL`| `https://app.octively.com`              |
| `RESEND_FROM_EMAIL`     | `Octively <noreply@octively.com>`       |
| `R2_BUCKET_NAME`        | `octively-documents`                    |

## DNS

Managed in **Cloudflare** (nameservers set in Namecheap → "Custom DNS").

```
A     @     → 75.2.60.5                    (Netlify load balancer)
CNAME www   → apex-loadbalancer.netlify.com
CNAME admin → <your-app>.netlify.app
CNAME app   → <your-app>.netlify.app
```

Use **DNS only (grey cloud)** — Netlify manages SSL via Let's Encrypt automatically.

Resend email DNS records also live in Cloudflare:
- `TXT @` — SPF
- `CNAME` ×2 — DKIM
- `TXT _dmarc` — DMARC

## Third-Party Webhooks

| Service       | Webhook URL                                          |
|---------------|------------------------------------------------------|
| Lemon Squeezy | `https://admin.octively.com/api/webhooks/lemon-squeezy` |
| PayFast       | Auto-derived from `NEXT_PUBLIC_APP_URL` env var      |

## Future Migration (VPS + Dokploy)

When monthly revenue covers cost (~$6–15/month), migrate to Hetzner VPS:

```bash
# Install Dokploy on VPS
curl -sSL https://dokploy.com/install.sh | sh
# Then: connect GitHub, create Next.js project, paste env vars
# Dokploy is lighter than Coolify — better for 4GB VPS
```

Benefits: zero cold starts, no build minute limits, always-warm process.
