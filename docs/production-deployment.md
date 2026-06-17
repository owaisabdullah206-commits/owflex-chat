# Production Deployment Guide

## Architecture

All three surfaces are one Next.js 16 app, routed by hostname in `proxy.ts` (project root — Next.js 16 replaces `middleware.ts` with `proxy.ts`):

| Subdomain             | Routes to    | Purpose             |
|-----------------------|--------------|---------------------|
| `octively.com`        | `/`          | Marketing site      |
| `admin.octively.com`  | `/dashboard` | Developer dashboard |
| `app.octively.com`    | `/portal`    | Client portal       |

---

## Hosting

| Environment    | Platform              | Trigger                                      | URL                          |
|----------------|-----------------------|----------------------------------------------|------------------------------|
| **Production** | Hetzner CX33 + Dokploy | `git push origin master` → GitHub Actions  | https://octively.com         |
| **Dev/Preview**| Vercel                | `git push vercel master`                     | https://octively.vercel.app  |

> Netlify is decommissioned. The `vercel` remote and `release` branch are no longer part of the deploy workflow.

---

## How to Deploy to Production

```bash
# 1. Ensure build passes locally
npm run build   # must exit 0

# 2. Push to origin master — auto-deploys
git push origin master
# GitHub Actions → builds Docker image → pushes to GHCR → triggers Dokploy deploy
```

Deploy takes ~10–12 min (first build). Subsequent builds are faster via GitHub Actions cache.
Watch progress at: `github.com/MrOwaisAbdullah/Owflex-Chatbot-Saas/actions`

---

## Infrastructure

| Component        | Details                                                  |
|------------------|----------------------------------------------------------|
| VPS              | Hetzner CX33 — Intel, 4 vCPU, 8 GB RAM, Nuremberg (nbg1) |
| IP               | `195.201.122.202`                                        |
| OS               | Ubuntu 26.04 LTS                                         |
| Container runtime| Docker 29.x + Docker Swarm (single node)                 |
| Reverse proxy    | Traefik v3 (via Dokploy)                                 |
| Panel            | Dokploy v0.29.8 at `https://deploy.octively.com`         |
| CI/CD            | GitHub Actions → GHCR → Dokploy deploy API              |
| Image            | `ghcr.io/mrowaisabdullah/owflex-chat:latest`             |
| Swap             | 4 GB (`/swapfile`)                                       |

---

## DNS (Cloudflare)

All records **orange cloud (Proxied)**. SSL mode: **Full (Strict)**.

| Type | Name    | Target              | Proxy  |
|------|---------|---------------------|--------|
| A    | `@`     | `195.201.122.202`   | Orange |
| A    | `www`   | `195.201.122.202`   | Orange |
| A    | `admin` | `195.201.122.202`   | Orange |
| A    | `app`   | `195.201.122.202`   | Orange |
| A    | `deploy`| `195.201.122.202`   | Grey   |

**Email records stay grey (DNS-only)** — MX, SPF TXT, DKIM CNAMEs, DMARC TXT.
Proxying email records breaks DKIM verification and SMTP delivery.

### Cloudflare Cache Rules

| Rule              | Expression                                  | Action            |
|-------------------|---------------------------------------------|-------------------|
| Bypass API + SSE  | `http.request.uri.path contains "/api/"`    | Bypass cache      |
| Cache embed.js    | `http.request.uri.path eq "/embed.js"`      | Cache, TTL 1 day  |

> `/api/*` must bypass cache — SSE streaming will buffer and break otherwise.

---

## Environment Variables

`NEXT_PUBLIC_*` vars are **build-time only** — baked into the Docker image via GitHub Actions
build-args. Set them as **GitHub Secrets**, not in Dokploy.

All other secrets are **runtime** — set in Dokploy → app → Environment panel.

### Build-time (GitHub Secrets)

| Secret                          | Production value                     |
|---------------------------------|--------------------------------------|
| `NEXT_PUBLIC_APP_URL`           | `https://admin.octively.com`         |
| `NEXT_PUBLIC_PORTAL_URL`        | `https://app.octively.com`           |
| `NEXT_PUBLIC_SANITY_PROJECT_ID` | Sanity project ID                    |
| `NEXT_PUBLIC_SANITY_DATASET`    | `production`                         |
| `NEXT_PUBLIC_SANITY_API_VERSION`| `2024-01-01`                         |
| `NEXT_PUBLIC_WHATSAPP_NUMBER`   | `923001234567`                       |
| `NEXT_PUBLIC_DEMO_VIDEO_URL`    | YouTube/Loom share URL               |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | `G-XXXXXXXXXX`                       |
| `NEXT_PUBLIC_GTM_ID`            | `GTM-XXXXXXX`                        |

### Dokploy secrets (also GitHub Secrets for deploy trigger)

| Secret           | Value                                |
|------------------|--------------------------------------|
| `DOKPLOY_URL`    | `https://deploy.octively.com`        |
| `DOKPLOY_API_KEY`| Dokploy → Settings → API            |
| `DOKPLOY_APP_ID` | App ID from Dokploy panel URL        |

### Key runtime vars (Dokploy env panel)

| Variable             | Production value                          |
|----------------------|-------------------------------------------|
| `BETTER_AUTH_URL`    | `https://admin.octively.com`              |
| `RESEND_FROM_EMAIL`  | `Octively <noreply@octively.com>`         |
| `EMBEDDING_PROVIDER` | `onnx` (BGE-M3 self-hosted, see below)    |
| `R2_BUCKET_NAME`     | `octively-documents`                      |

See `.env.example` for the full list.

---

## Embeddings — BGE-M3 (Self-Hosted ONNX)

**Decision (June 2026):** Replace Jina AI API with self-hosted BGE-M3 via ONNX on the VPS.

**Why BGE-M3 over Jina API:**
- Zero per-token cost at any volume
- Multilingual: handles English, Urdu, and Roman Urdu (Jina API is English-focused)
- 1024-dim output (migration 0014 updated the schema from 768 → 1024)
- Apache 2.0 license, runs on CPU (no GPU needed on CX33)
- Jina free tier (1M tokens/month) runs out at modest usage scale
- Jina fallback also updated to `jina-embeddings-v3` (1024-dim native) for consistency

**Why NOT Qdrant (stay on pgvector):**
- At sub-10M vectors (years of Octively scale), pgvector and Qdrant perform identically
- pgvector throughput is 11.4x higher than Qdrant at 50M vectors (May 2025 benchmarks)
- pgvector is already in Neon — zero migration, zero new service
- Adding Qdrant = another container to manage, full embedding migration, rewritten queries
- YAGNI: adding complexity for zero measurable benefit at this scale

**Setup in Dokploy:**
1. Set `EMBEDDING_PROVIDER=onnx` in Dokploy env panel
2. App → Mounts → Add volume:
   - Container path: `/app/.cache/transformers`
   - Volume name: `octively-model-cache`
3. On first deploy after the volume is attached, BGE-M3 (~570 MB) downloads once and persists

---

## Monitoring

Public status page: `https://octively.instatus.com`

| Component     | Monitor URL                  | Current uptime |
|---------------|------------------------------|----------------|
| Marketing     | `https://octively.com`       | 100%           |
| Dashboard     | `https://admin.octively.com` | 100%           |
| Client Portal | `https://app.octively.com`   | 100%           |

---

## Third-Party Webhooks

| Service        | Webhook URL                                               |
|----------------|-----------------------------------------------------------|
| Lemon Squeezy  | `https://admin.octively.com/api/webhooks/lemon-squeezy`  |
| PayFast        | Auto-derived from `NEXT_PUBLIC_APP_URL` env var           |

---

## SSH Access

```bash
ssh -i ~/.ssh/octively_dokploy root@195.201.122.202
# Or as the non-root user:
ssh -i ~/.ssh/octively_dokploy octively@195.201.122.202
```

Root login is key-only (password auth disabled). fail2ban active on port 22.

---

## Rollback

In Dokploy panel → app → Deployments tab → click any previous deployment → Redeploy.
Or revert the commit locally and `git push origin master`.
