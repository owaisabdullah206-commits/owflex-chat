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

## Future Migration (VPS + Dokploy on Hetzner EU)

> **Decision (June 2026):** Hetzner **EU** (Falkenstein or Helsinki), NOT Ashburn.
> EU plans are cheaper, include 20TB traffic (US: 1TB), and sit ~120–150ms from
> Pakistan vs ~220ms+ for US East. The catch: Neon and Upstash currently live in
> AWS us-east-1, so the **data layer must move to EU in the same migration** —
> an EU box talking to a Virginia database adds ~90–100ms to every query, and the
> chat route makes several per request. Never run the split configuration.

### Trigger — do NOT migrate before one of these

1. First paying customer (revenue covers the box), OR
2. Netlify deploy rationing is actively blocking the validation sprint.

This is 1–2 days of infra work that acquires zero customers. Feature-freeze
discipline (validation plan §8) applies to infrastructure too.

### Why self-hosting is a product upgrade here (not just cost)

- **SSE chat streaming** — no serverless duration limits, always-warm process, no
  cold starts on the embed widget's chat endpoint (the most latency-sensitive path).
- **BullMQ on local Redis** becomes possible (CLAUDE.md's chosen queue) — wants a
  persistent process.
- **Phase 3 ONNX local embeddings** — free on a VPS, impossible on Netlify functions.
- Unlimited deploys, flat cost. No more build-budget rationing.

### Server spec

| Item | Choice | Notes |
|---|---|---|
| Instance | **CX32** (4 vCPU Intel, 8 GB, 80 GB) or CAX21 (ARM, cheaper — verify Docker images are arm64-clean first) | ~€8–10/mo after the April 2026 price rise — verify current pricing at order time |
| Location | Falkenstein (fsn1) or Helsinki (hel1) | 20TB traffic included |
| Backups | Hetzner automatic backups **ON** (+20% of instance cost) | Plus a manual snapshot before every risky change |
| RAM rule | 8 GB minimum if building on-box | `next build` peaks 3–4 GB. Better: build the Docker image in **GitHub Actions → GHCR**, Dokploy pulls it — box stays serving-only and a 4 GB instance becomes viable |

### Data layer moves with it (same cutover window)

| Service | Move | How |
|---|---|---|
| Neon Postgres | us-east-1 → **aws-eu-central-1 (Frankfurt)** | Create new EU Neon project, enable `pgvector`, `pg_dump` → restore (DB is small), run drizzle migrations check, swap `DATABASE_URL`. Keep the old project paused 2 weeks as rollback |
| Upstash Redis | us-east-1 → EU region | ⚠️ Redis holds **live credit balances** — not throwaway cache. Either copy keys (upstash backup/restore) or cut over at a month boundary right after the monthly credit reset, when balances are freshly re-derivable from plans |
| Upstash QStash | No move | Global endpoint; just keep callback URLs (they're domain-based) |
| Cloudflare R2 | No move | Location-hint agnostic; access is via API |
| Resend / Brevo | No move | Domain DNS unchanged |

### Cloudflare goes orange (proxy ON — web records ONLY)

DNS already lives in Cloudflare (grey cloud). At migration, flip the **three web
records** to proxied:

- `A @`, `A admin`, `A app` → VPS IP, **orange cloud** — hides the VPS IP, free CDN
- SSL mode **Full (strict)** (Traefik/Let's Encrypt on the box provides origin certs)
- Cache rule: **bypass `/api/*`** — SSE streams must pass through unbuffered
- Cache rule: cache `/embed.js` aggressively (it loads on every client website
  worldwide) — it already serves with sensible cache headers; Cloudflare absorbs the egress

**⚠️ Email records stay grey (DNS-only) — non-negotiable.** Cloudflare's proxy
only carries HTTP/HTTPS; it cannot proxy SMTP, and proxying email records breaks
delivery or domain verification:

| Record | Service | Proxy status |
|---|---|---|
| `MX @` → `mx*.zoho.com` | Zoho inbound mail | No toggle exists for MX — but its *target* must never be a proxied hostname |
| `TXT` SPF / DMARC / verification | Resend, Brevo, Zoho | TXT has no proxy toggle — safe by nature |
| `CNAME` DKIM (e.g. `resend._domainkey`, Brevo DKIM) | Resend, Brevo | **Grey cloud, always.** Orange-clouding a DKIM CNAME makes it resolve to Cloudflare IPs and verification fails silently |
| `CNAME` bounce / tracking subdomains (if added later) | Resend / Brevo custom return-path | **Grey cloud** |
| Any future `mail.octively.com` A record | — | **Grey cloud** (SMTP can't pass the proxy) |

Rule of thumb: orange = only hostnames serving the website over HTTPS (`@`,
`admin`, `app`). Everything mail-related keeps the grey cloud it already has
today — the migration changes nothing for Resend, Brevo, or Zoho. After the DNS
flip, confirm with one test email per service and a fresh DKIM/SPF check
(e.g. Resend dashboard's domain status + a mail-tester.com run).

### Dokploy setup (chosen over Coolify — lighter, Traefik built in, Swarm path later)

```bash
# On a fresh Ubuntu 24.04 box (firewall: allow 22, 80, 443 only)
curl -sSL https://dokploy.com/install.sh | sh
```

1. Connect the GitHub App to the `vercel` remote repo (`owaisabdullah206-commits/owflex-chat`).
2. Create the app from the repo, branch **`release`** (keeps the existing release
   discipline: master = dev, release = production).
3. Build: Dockerfile with Next.js **`output: 'standalone'`** (add to `next.config.ts`),
   or GHCR image from GitHub Actions (preferred, see RAM rule).
4. Domains in Dokploy/Traefik: `octively.com`, `admin.octively.com`, `app.octively.com`
   — three fixed hosts, no wildcard cert needed. `proxy.ts` hostname routing works
   unchanged as Node middleware (no edge runtime involved).
5. Paste env vars from `.env.example` production column — only `DATABASE_URL` and
   Upstash vars change (new EU endpoints). Auth/webhook/email URLs are domain-based
   and unchanged.
6. Remove `@netlify/plugin-nextjs` from `package.json` once Netlify is decommissioned.

### Migration-day runbook

1. Lower Cloudflare DNS TTL to 60s the day before.
2. Deploy to VPS, leave production DNS pointing at Netlify.
3. Smoke-test the VPS directly (hosts-file override or a `staging.octively.com`
   CNAME): login, bot chat stream, embed on the test page, lead capture email,
   portal login, doc upload.
4. Cut over the data layer (Neon EU URL + Upstash EU) on the VPS env, re-smoke-test.
5. Flip the three DNS records to the VPS (orange cloud). Watch logs in Dokploy.
6. Keep Netlify untouched for 48h as instant rollback (flip DNS back).
7. After 48h clean: decommission Netlify site, cancel old Neon/Upstash, raise TTL,
   record the change here and in `docs/netlify-budget.md` (final entry).

### Monitoring (free tier, set up the same day)

- UptimeRobot or BetterStack: HTTPS checks on all three subdomains + `/api/v1/widget-config?key=<demo>` as an API health probe.
- Dokploy's built-in CPU/RAM/disk dashboard for the box itself.
- Keep Vercel previews for development — that workflow doesn't change.
