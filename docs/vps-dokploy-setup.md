# VPS + Dokploy + GitHub Actions Setup (Next.js + local ONNX embeddings)

How to host the Octively Next.js app on a Hetzner VPS with Dokploy, building the
Docker image off-box in GitHub Actions, and running local ONNX embeddings on the box.
This is the concrete runbook that sits alongside the higher-level migration plan in
`docs/production-deployment.md` (read that first for the data-layer move and the
Cloudflare DNS rules).

> Sources proofread against: Next.js official `with-docker` example (standalone output),
> Dokploy docs (Docker Registry + Auto Deploy / API), Transformers.js (ONNX) Node usage,
> and live Hetzner European Cloud pricing (post Apr 2026).

## Decisions made (June 2026)

- **Containerize now, deploy to the VPS later.** The Dockerfile + standalone output land
  in the repo before the box is bought, so the image is provable in CI immediately.
- **Embeddings move to local ONNX** (Jina's free tier is too limited). Implemented as a
  **provider switch**, not a rip-and-replace, because ONNX cannot run on serverless
  (Vercel/Netlify) — only on the long-running VPS process. See §10.
- **No clients, no embedding data yet** → switching the embedding model is free. There is
  **no re-embed migration** to worry about, and the model is chosen to keep the existing
  `vector(768)` schema unchanged.
- **Instance: Hetzner CX33** (Intel, 8 GB), not CX23 (4 GB) — see §1.

## What is already in the repo (done)

- `lib/knowledge/embedder.ts` — provider switch (`EMBEDDING_PROVIDER` = `jina` default |
  `onnx`). ONNX path uses `@huggingface/transformers`, dynamically imported so serverless
  never loads the native runtime.
- `next.config.ts` — `output: 'standalone'` gated on `DOCKER_BUILD`, plus
  `serverExternalPackages: ['@huggingface/transformers', 'onnxruntime-node']`.

## What is still to do (this doc)

- Add `Dockerfile`, `.dockerignore`, `.github/workflows/deploy.yml` (below).
- `npm install @huggingface/transformers` (adds onnxruntime-node).
- Buy the VPS, install Dokploy, set env (with `EMBEDDING_PROVIDER=onnx`), move data to EU.

---

## 0. The shape of it

```
push to release ──► GitHub Actions
                      ├─ build Docker image (next build, output: standalone)
                      ├─ push image to GHCR (ghcr.io/<you>/owflex-chat:<sha>)
                      └─ call Dokploy API to deploy that image
                                     │
                                     ▼
                      Hetzner VPS (Dokploy + Traefik)
                      pulls the image, runs it, terminates TLS
                                     │
                      Cloudflare (orange cloud) ──► octively.com / admin / app
```

Build happens in CI, never on the VPS. The box only runs the container. That is what
makes a small instance viable.

**Why Docker here:** Dokploy is Docker-native, and building in CI + deploying a
pre-built image is the clean "separate build and deploy" path. `output: 'standalone'`
keeps the image small.

---

## 1. Instance + OS

- **Hetzner CX33** (Intel, 4 vCPU, 8 GB, 80 GB), Germany. 8 GB gives headroom for the
  container plus the ONNX embedding model. €6.49/mo (post Apr 2026), +€0.50 IPv4,
  backups +20%. (CX23 4 GB only works if you never build on the box and never run a
  local model — CX33 removes that constraint for ~€2.50 more.)
- **Verified pricing finding (post April 1, 2026):** the Intel **CX33 (€6.49)** is now
  *cheaper* than the ARM **CAX21 (€7.99)** for the same 4 vCPU / 8 GB / 80 GB. So Intel
  wins on price *and* avoids arm64 image concerns (onnxruntime-node, sharp). Pick CX33.
  ARM (CAX) is only worth it for energy efficiency, which is irrelevant here. CX/CAX are
  EU-only (Germany/Finland), which is fine — the data layer moves to EU anyway.
  Current EU CX line: CX23 2/4/40 €3.99 · **CX33 4/8/80 €6.49** · CX43 8/16/160 €11.99.
- **Ubuntu 24.04 LTS.**
- Firewall: allow only 22 (SSH), 80, 443.
- **Add swap** even with 8 GB (cheap insurance against memory spikes):

```bash
fallocate -l 4G /swapfile && chmod 600 /swapfile && mkswap /swapfile && swapon /swapfile
echo '/swapfile none swap sw 0 0' >> /etc/fstab
```

---

## 2. Install Dokploy

```bash
# fresh Ubuntu 24.04 box
curl -sSL https://dokploy.com/install.sh | sh
```

Open `http://<vps-ip>:3000`, create the admin account. Dokploy installs Docker +
Traefik and manages TLS via Let's Encrypt.

---

## 3. Next.js standalone output (already in `next.config.ts`)

```ts
const nextConfig: NextConfig = {
  // Standalone only for the Docker/VPS build (the Dockerfile sets DOCKER_BUILD=1).
  // Vercel/Netlify use their own output, so leave it undefined there.
  output: process.env.DOCKER_BUILD ? 'standalone' : undefined,
  // Native, server-only packages must not be bundled by the compiler. Only loaded at
  // runtime when EMBEDDING_PROVIDER=onnx (VPS); harmless elsewhere.
  serverExternalPackages: ['@huggingface/transformers', 'onnxruntime-node'],
  // ...existing config (headers, outputFileTracingIncludes, etc.)
}
```

Two deliberate choices:
- **Conditional standalone.** Gating on `DOCKER_BUILD` keeps Vercel/Netlify builds
  untouched, so nothing breaks before the VPS exists. `standalone` emits
  `.next/standalone/server.js` (traced files only); run it with `node server.js`
  (honours `PORT` / `HOSTNAME`).
- **`serverExternalPackages`.** onnxruntime-node ships native `.node` binaries the bundler
  cannot pack. Marking them external makes Next require them from `node_modules` at
  runtime. Combined with the dynamic `import()` in the embedder, serverless deployments
  never touch them.

---

## 4. Dockerfile (multi-stage, runs build:embed)

Place at project root. Adapted from the official Next.js `with-docker` example, plus our
`build:embed` step (the live `/embed.js` serves `embed/dist/embed.min.js`, so it must be
built before `next build`).

```dockerfile
# syntax=docker/dockerfile:1
ARG NODE_VERSION=20-slim

# ── deps ──────────────────────────────────────────────────────────────────────
FROM node:${NODE_VERSION} AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci --no-audit --no-fund

# ── builder ───────────────────────────────────────────────────────────────────
FROM node:${NODE_VERSION} AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NODE_ENV=production
# NEXT_PUBLIC_* values are inlined at BUILD time — they must be present here.
# Declare each one as ARG, then promote to ENV so next build can read it.
ARG NEXT_PUBLIC_APP_URL
ARG NEXT_PUBLIC_PORTAL_URL
ARG NEXT_PUBLIC_SANITY_PROJECT_ID
ARG NEXT_PUBLIC_SANITY_DATASET
ARG NEXT_PUBLIC_SANITY_API_VERSION
ARG NEXT_PUBLIC_WHATSAPP_NUMBER
ARG NEXT_PUBLIC_DEMO_VIDEO_URL
ARG NEXT_PUBLIC_GA_MEASUREMENT_ID
ARG NEXT_PUBLIC_GTM_ID
ENV NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL \
    NEXT_PUBLIC_PORTAL_URL=$NEXT_PUBLIC_PORTAL_URL \
    NEXT_PUBLIC_SANITY_PROJECT_ID=$NEXT_PUBLIC_SANITY_PROJECT_ID \
    NEXT_PUBLIC_SANITY_DATASET=$NEXT_PUBLIC_SANITY_DATASET \
    NEXT_PUBLIC_SANITY_API_VERSION=$NEXT_PUBLIC_SANITY_API_VERSION \
    NEXT_PUBLIC_WHATSAPP_NUMBER=$NEXT_PUBLIC_WHATSAPP_NUMBER \
    NEXT_PUBLIC_DEMO_VIDEO_URL=$NEXT_PUBLIC_DEMO_VIDEO_URL \
    NEXT_PUBLIC_GA_MEASUREMENT_ID=$NEXT_PUBLIC_GA_MEASUREMENT_ID \
    NEXT_PUBLIC_GTM_ID=$NEXT_PUBLIC_GTM_ID
RUN npm run build:embed && npm run build

# ── runner ────────────────────────────────────────────────────────────────────
FROM node:${NODE_VERSION} AS runner
WORKDIR /app
ENV NODE_ENV=production PORT=3000 HOSTNAME=0.0.0.0
COPY --from=builder --chown=node:node /app/public ./public
COPY --from=builder --chown=node:node /app/.next/standalone ./
COPY --from=builder --chown=node:node /app/.next/static ./.next/static
USER node
EXPOSE 3000
CMD ["node", "server.js"]
```

**Critical Next.js gotcha:** `NEXT_PUBLIC_*` vars are baked into the client bundle at
build time. They must be passed as build args in CI (below). Server-only secrets
(`DATABASE_URL`, API keys, `BETTER_AUTH_SECRET`, etc.) are read at runtime and belong in
Dokploy's env, not the build.

Add a `.dockerignore`:

```
node_modules
.next
.git
.env*
npm-debug.log
```

---

## 5. GitHub Actions: build → GHCR → trigger Dokploy

`.github/workflows/deploy.yml`. Triggers on `release` (keeps master = dev, release = prod).

```yaml
name: Build and deploy
on:
  push:
    branches: [release]

env:
  IMAGE: ghcr.io/${{ github.repository_owner }}/owflex-chat

jobs:
  build:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: write    # push to GHCR
    steps:
      - uses: actions/checkout@v4

      - uses: docker/login-action@v3
        with:
          registry: ghcr.io
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}   # built-in, can push to GHCR

      - uses: docker/build-push-action@v6
        with:
          context: .
          push: true
          tags: |
            ${{ env.IMAGE }}:latest
            ${{ env.IMAGE }}:${{ github.sha }}
          build-args: |
            NEXT_PUBLIC_APP_URL=${{ secrets.NEXT_PUBLIC_APP_URL }}
            NEXT_PUBLIC_PORTAL_URL=${{ secrets.NEXT_PUBLIC_PORTAL_URL }}
            NEXT_PUBLIC_SANITY_PROJECT_ID=${{ secrets.NEXT_PUBLIC_SANITY_PROJECT_ID }}
            NEXT_PUBLIC_SANITY_DATASET=${{ secrets.NEXT_PUBLIC_SANITY_DATASET }}
            NEXT_PUBLIC_SANITY_API_VERSION=${{ secrets.NEXT_PUBLIC_SANITY_API_VERSION }}
            NEXT_PUBLIC_WHATSAPP_NUMBER=${{ secrets.NEXT_PUBLIC_WHATSAPP_NUMBER }}
            NEXT_PUBLIC_DEMO_VIDEO_URL=${{ secrets.NEXT_PUBLIC_DEMO_VIDEO_URL }}
            NEXT_PUBLIC_GA_MEASUREMENT_ID=${{ secrets.NEXT_PUBLIC_GA_MEASUREMENT_ID }}
            NEXT_PUBLIC_GTM_ID=${{ secrets.NEXT_PUBLIC_GTM_ID }}

      - name: Trigger Dokploy deploy
        run: |
          curl -fsSL -X POST "${{ secrets.DOKPLOY_URL }}/api/application.deploy" \
            -H "x-api-key: ${{ secrets.DOKPLOY_API_KEY }}" \
            -H "Content-Type: application/json" \
            -d '{"applicationId":"${{ secrets.DOKPLOY_APP_ID }}"}'
```

GitHub secrets needed: every `NEXT_PUBLIC_*` above, plus `DOKPLOY_URL`,
`DOKPLOY_API_KEY` (Dokploy → profile → API token), `DOKPLOY_APP_ID` (the application's id).
`GITHUB_TOKEN` is automatic.

---

## 6. Create the app in Dokploy (deploy from GHCR image)

1. New Project → New Application.
2. **Source type: Docker.** Image: `ghcr.io/<owner>/owflex-chat:latest`. Registry URL:
   `ghcr.io`. Username: your GitHub username. Password: a GitHub PAT (classic) with
   `read:packages` (the image can be private). Save.
3. **Domains** (Traefik): add all three as separate domains on the *same* application,
   container port **3000**, HTTPS on, Let's Encrypt:
   - `octively.com`
   - `admin.octively.com`
   - `app.octively.com`
   `proxy.ts` does the hostname routing in the Node runtime, so one app serves all three.
   No wildcard cert, no edge runtime.
4. **Health check:** path `/api/v1/widget-config?key=<demo-key>` (or any always-200 route),
   so Dokploy does zero-downtime swaps and rolls back a bad image.
5. Grab the **Application ID** for `DOKPLOY_APP_ID` and the **Webhook/API** so CI can deploy.

---

## 7. Environment variables (runtime, set in Dokploy)

Paste from `.env.example` (production column). Server secrets live here, NOT in the build.
Only the data-layer endpoints change vs Netlify:

| Var | Value |
|---|---|
| `DATABASE_URL` | new **EU** Neon (aws-eu-central-1) |
| `UPSTASH_REDIS_REST_URL` / `_TOKEN` | new **EU** Upstash |
| `BETTER_AUTH_URL` | `https://admin.octively.com` |
| `BETTER_AUTH_SECRET` | unchanged |
| `R2_*` | unchanged (R2 is location-agnostic) |
| `RESEND_API_KEY`, `BREVO_API_KEY`, sender vars | unchanged |
| **`EMBEDDING_PROVIDER`** | **`onnx`** on the VPS (defaults to `jina` everywhere else) |
| `JINA_API_KEY` | not needed once `EMBEDDING_PROVIDER=onnx` (keep elsewhere as fallback) |
| `QSTASH_*`, `FIRECRAWL_API_KEY` | unchanged |
| `CRON_SECRET` | unchanged |
| PayFast / Lemon Squeezy keys | unchanged (URLs are domain-derived) |

> The model files (~110 MB quantized bge-base) are downloaded by Transformers.js on first
> use into a cache dir. Set `TRANSFORMERS_CACHE=/app/.cache/transformers` and persist it on
> a Docker volume, or bake the model into the image (see §10), so a fresh container does
> not download on the first request.

The Netlify `SECRETS_SCAN_OMIT_KEYS` problem disappears (no Netlify scanner).

---

## 8. Cron jobs

Netlify scheduled functions go away. Use Dokploy **Schedule Jobs** (or a system cron) to
hit the existing endpoints with the bearer secret:

```bash
# monthly reset (1st of month) and weekly digest (Mon) — set the schedule in Dokploy
curl -fsSL -X POST https://admin.octively.com/api/cron/monthly-reset \
  -H "Authorization: Bearer $CRON_SECRET"
curl -fsSL -X POST https://admin.octively.com/api/cron/weekly-digest \
  -H "Authorization: Bearer $CRON_SECRET"
```

---

## 9. DNS / Cloudflare

Follow `docs/production-deployment.md` exactly:
- Orange-cloud the three **web** records (`@`, `admin`, `app`) → VPS IP. SSL **Full (strict)**.
- Cache rule: **bypass `/api/*`** (SSE chat must stream unbuffered). Cache `/embed.js` hard.
- **Email records stay grey** (MX / DKIM / SPF / DMARC) — never proxy them.

---

## 10. Local ONNX embeddings (provider switch — already wired)

**Why:** Jina's free tier is too limited. Local ONNX is free and unlimited, but only on a
long-running process — it **cannot run on serverless** (Vercel/Netlify cold-start a fresh
function per request, which would re-download a ~110 MB model and time out). So the code
keeps both providers and selects one by env.

**How it's wired in `lib/knowledge/embedder.ts`:**

```ts
const PROVIDER = process.env.EMBEDDING_PROVIDER === 'onnx' ? 'onnx' : 'jina'

// ONNX path: dynamic import so serverless never loads the native runtime.
let onnxExtractor: Promise<...> | null = null
function getOnnxExtractor() {
  onnxExtractor ??= import('@huggingface/transformers').then(({ pipeline }) =>
    pipeline('feature-extraction', 'Xenova/bge-base-en-v1.5', { dtype: 'q8' }))
  return onnxExtractor
}
// embedTexts() and embedQuery() branch on PROVIDER; the public interface is unchanged,
// so the retriever and the QStash ingest route do not change.
```

**Model: `Xenova/bge-base-en-v1.5`, quantized (`dtype: 'q8'`), 768 dims.**
- 768 dims means the existing `document_chunks` `vector(768)` + HNSW schema is **unchanged —
  no migration**.
- BGE retrieval needs a query instruction. The embedder prepends
  `"Represent this sentence for searching relevant passages: "` to **queries only**
  (`embedQuery`); passages (`embedTexts`) are embedded as-is.
- Quantized, the model is ~110 MB and fast on CPU.

**No re-embed needed (yet).** There are no clients and no `document_chunks` rows, so
switching from Jina to ONNX is a clean cut — nothing to back-fill. (If you ever switch
models again *after* you have data, you would re-embed every chunk, since vectors from two
different models are not comparable. Not a concern today.)

**Install:**
```bash
npm install @huggingface/transformers
```
This pulls `onnxruntime-node` with native binaries for the build platform. Build the image
on **linux/amd64** (GitHub Actions ubuntu + the Intel CX33 both are) so the binaries match.

**Turn it on:** set `EMBEDDING_PROVIDER=onnx` in Dokploy env (only on the VPS). Everywhere
else it stays `jina`, so Vercel previews and any interim Netlify deploy keep working.

**Operational notes:**
- Memory: ~110 MB model + ~150–300 MB peak inference. Fine on 8 GB alongside the app
  (this is why CX33, not CX23).
- CPU-bound. **Ingest** embedding runs in the QStash handler (background), so it never
  blocks chat. **Query-time** embedding (chat retrieval) runs in-process — fine at low
  traffic; if it ever adds latency under load, move it to a worker thread or a tiny sidecar.
- **Bake or persist the model.** Either download it in the Dockerfile builder stage, or
  mount a Docker volume at `TRANSFORMERS_CACHE` (e.g. `/app/.cache/transformers`), so a
  fresh container does not download ~110 MB on the first request. Pre-warm by calling
  `embedQuery('warmup')` at startup.

---

## 11. Cutover + rollback (from production-deployment.md)

1. Lower Cloudflare TTL to 60s the day before.
2. Deploy to the VPS, smoke-test directly (hosts-file override or `staging.octively.com`):
   login, bot chat stream, embed on a test page, lead email, portal login, doc upload.
3. Move the data layer to EU (new `DATABASE_URL` + EU Upstash), re-smoke-test.
4. Flip the three DNS records to the VPS (orange cloud). Watch Dokploy logs.
5. Keep Netlify untouched for 48h as instant rollback (flip DNS back).
6. After 48h clean: decommission Netlify, remove `@netlify/plugin-nextjs` from
   `package.json`, cancel the old US Neon/Upstash, record the final entry in
   `docs/netlify-budget.md`.

## 12. Monitoring (free, same day)

- UptimeRobot: HTTPS checks on all three subdomains + the health route.
- Dokploy's built-in CPU/RAM/disk dashboard.
- Keep Vercel previews for development — that workflow does not change.
