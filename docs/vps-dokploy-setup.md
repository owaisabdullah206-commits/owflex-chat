# VPS + Dokploy + GitHub Actions Setup (Next.js + local ONNX embeddings)

How to host the Octively Next.js app on a Hetzner VPS with Dokploy, building the
Docker image off-box in GitHub Actions, and running local ONNX embeddings on the box.
This is the concrete runbook that sits alongside the higher-level migration plan in
`docs/production-deployment.md` (read that first for the data-layer move and the
Cloudflare DNS rules).

> Sources proofread against: Next.js official `with-docker` example (standalone output),
> Dokploy docs (Docker Registry + Auto Deploy / API, Cloudflare SSL, Cloudflare Tunnels),
> the Hetzner Community "Setup Dokploy on your VPS" tutorial, Transformers.js (ONNX) Node
> usage, and live Hetzner European Cloud pricing (post Apr 2026).

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

## What is already in the repo (done — committed in `feat(deploy): containerize…`)

- `lib/knowledge/embedder.ts` — provider switch (`EMBEDDING_PROVIDER` = `jina` default |
  `onnx`). ONNX path uses `@huggingface/transformers`, dynamically imported so serverless
  never loads the native runtime.
- `next.config.ts` — `output: 'standalone'` gated on `DOCKER_BUILD`, plus
  `serverExternalPackages: ['@huggingface/transformers', 'onnxruntime-node']`.
- `Dockerfile` (Node 22, multi-stage, runs `build:embed` + copies native ONNX modules),
  `.dockerignore`, `.github/workflows/deploy.yml` (GHCR build → Dokploy deploy on `release`).
- `@huggingface/transformers` installed (`package.json`); local `npm run build` passes (exit 0).

## What is still to do (the VPS side — this doc, §1-§12)

- Buy the CX33, bootstrap it (§2), install Dokploy, secure the panel + close port 3000.
- Create the app from the GHCR image, attach the 3 domains, set runtime env
  (`EMBEDDING_PROVIDER=onnx` + EU data layer), wire the GitHub secrets, push `release`.
- Watch the **first** Docker build/boot closely — it's the first real `docker build` ever
  run for this repo (no Docker in the dev WSL box), so treat deploy #1 as a validation run.

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
- **Ubuntu 24.04 LTS.** Dokploy's stated minimum is 2 GB RAM / 30 GB disk; the CX33's
  8 GB / 80 GB is comfortably above it. The Hetzner Community Dokploy tutorial explicitly
  notes **arm64 is "untested and not recommended"** for Dokploy — a second reason to take
  the Intel **CX33** over an ARM CAX box (the first being that CX33 is now cheaper).
- Firewall (see §2 for the commands): SSH (22), HTTP (80), HTTPS (443), and Dokploy's UI
  port **3000 only temporarily during setup** — close 3000 once the panel is on a domain.
  Prefer the **Hetzner Cloud Firewall** (panel, applied at the network edge, free) over,
  or in addition to, UFW so a bad UFW rule can't lock you out of the box.
- **Add swap** even with 8 GB (cheap insurance against memory spikes):

```bash
fallocate -l 4G /swapfile && chmod 600 /swapfile && mkswap /swapfile && swapon /swapfile
echo '/swapfile none swap sw 0 0' >> /etc/fstab
```

---

## 2. Server bootstrap + install Dokploy

### 2a. SSH key (do this on your laptop, before creating the server)

```bash
# ed25519 is the modern default; name it so you can tell keys apart
ssh-keygen -t ed25519 -f ~/.ssh/octively_dokploy -C "octively-dokploy"
cat ~/.ssh/octively_dokploy.pub        # paste this PUBLIC key into Hetzner → SSH keys
```

Add the **public** key in the Hetzner create-server screen (set as default). You never
paste the private key anywhere. With a key attached, Hetzner does not email a root
password and SSH password login can be disabled entirely.

### 2b. First login + update

```bash
ssh -i ~/.ssh/octively_dokploy root@<vps-ip>
apt update && apt upgrade -y
```

### 2c. Non-root sudo user (recommended)

```bash
adduser octively                       # set a password; fields can be left blank
usermod -aG sudo octively              # grant sudo
rsync --archive --chown=octively:octively ~/.ssh /home/octively   # copy the SSH key over
```

Then reconnect as the user: `ssh -i ~/.ssh/octively_dokploy octively@<vps-ip>`. Optionally
harden SSH afterwards (`/etc/ssh/sshd_config`: `PermitRootLogin no`, `PasswordAuthentication no`,
then `systemctl restart ssh`).

### 2d. Firewall — allow SSH FIRST (and know that Docker bypasses UFW)

> Critical ordering: allow 22 **before** enabling UFW, or you lock yourself out (recover via
> Hetzner's web console if you do).

> ⚠️ **Docker bypasses UFW.** Dokploy runs in Docker, and Docker writes its own iptables
> rules *below* UFW — so a UFW `deny` will **not** reliably block a port a container
> publishes (including Dokploy's 3000). Dokploy's own security docs call this out. The fix:
> make the **Hetzner Cloud Firewall** (panel, applied at the network edge, before Docker's
> rules) your authoritative layer, and optionally install `ufw-docker` on the box. Treat UFW
> as defence-in-depth, not the real gate. See §13.

```bash
# UFW (defence-in-depth; the Hetzner Cloud Firewall is the authoritative layer)
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 3000/tcp                # Dokploy UI — TEMPORARY, removed in 2f
sudo ufw enable
```

Set up the **Hetzner Cloud Firewall** to mirror this (inbound: 22, 80, 443, + 3000
temporarily) and apply it to the server — that is what actually blocks Docker-published ports.

### 2e. Install Dokploy (must run as ROOT)

```bash
# the installer refuses to run under sudo/non-root — log in as root for this one command
curl -sSL https://dokploy.com/install.sh | sh
```

If you created the non-root user, `exit` back to root (or `sudo su -`) just for this step —
the script exits with "must run as root" otherwise (confirmed gotcha). It installs Docker +
Traefik and binds the UI to port 3000. Takes 2-5 min.

Open `http://<vps-ip>:3000` and create the admin account immediately (anyone who reaches
the box before you do could claim it). Use a real password from the start.

### 2f. Put the panel on a domain, then CLOSE 3000

1. DNS: point `deploy.octively.com` (A record) at the VPS IP. Through Cloudflare, leave it
   **grey-cloud (DNS only)** for now so Let's Encrypt can issue (see §9 for why).
2. Dokploy → **Settings → Server**: set Host = `deploy.octively.com`, enable HTTPS, save,
   and let it issue the cert. The panel is now at `https://deploy.octively.com`.
3. Lock the raw port so the UI can only be reached through Traefik/HTTPS. Because Docker
   bypasses UFW (§2d), the **Hetzner Cloud Firewall** is what actually closes it:
   ```bash
   sudo ufw delete allow 3000/tcp        # defence-in-depth only
   ```
   Then **remove the 3000 inbound rule in the Hetzner Cloud Firewall** — verify from your
   laptop that `http://<vps-ip>:3000` no longer connects.
4. Change/confirm your admin password and **enable 2FA** (Dokploy → profile) now that the
   panel is on HTTPS. See §13 for the rest of the hardening pass.

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

The real file is **committed at the project root** (`Dockerfile` + `.dockerignore`) — treat
those as the source of truth and do not re-copy from here. It is adapted from the official
Next.js `with-docker` example. The non-obvious decisions that make it work for us:

- **`ARG NODE_VERSION=22-slim`** — `@huggingface/transformers` v4 requires Node ≥22.22, so the
  Node 20 base from the vanilla example would silently break the ONNX runtime (EBADENGINE).
- **`COPY embed/package.json ./embed/package.json`** in the deps stage — `embed` is an npm
  workspace, so `npm ci` needs its manifest present or it fails to resolve the workspace.
- **`build:embed` before `build`** — the live `/embed.js` route serves
  `embed/dist/embed.min.js`, so the widget must be minified before `next build` traces it.
- **9 × `NEXT_PUBLIC_*` ARG→ENV in the builder** — these are inlined into the client bundle at
  **build time**, so they must be present then (passed as CI build-args, §5). Server-only
  secrets (`DATABASE_URL`, API keys, `BETTER_AUTH_SECRET`) are read at **runtime** and belong
  in Dokploy's env, never the image.
- **Runner copies the native ONNX modules explicitly** —
  `node_modules/{@huggingface,onnxruntime-node,onnxruntime-common,sharp}`. Standalone tracing
  does not reliably pull native `.node` binaries; the explicit copy guarantees they exist. If a
  transitive native dep ever errors at boot, copy the whole `node_modules` as a fallback.
- **Runner sets `EMBEDDING_PROVIDER=onnx` + `TRANSFORMERS_CACHE=/app/.cache/transformers`** and
  `HOSTNAME=0.0.0.0` so `node server.js` binds outside the container.

`.dockerignore` keeps secrets and bulk out of the build context (`node_modules`, `.next`,
`.env*`, `.git`, `.github`, `docs`, `social-media-posts`, `video`, `specs`, `history`, `.claude`).

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

> The snippet above is the minimal shape. The **committed** `.github/workflows/deploy.yml`
> additionally uses `docker/setup-buildx-action@v3`, pins **`platforms: linux/amd64`** (must
> match the Intel CX33 — an arm64 image would fail to run, and the native onnxruntime/sharp
> binaries are arch-specific), and adds GHA layer cache (`cache-from/to: type=gha`). Treat the
> committed file as source of truth.

GitHub secrets needed: every `NEXT_PUBLIC_*` above, plus `DOKPLOY_URL`,
`DOKPLOY_API_KEY` (Dokploy → profile → API token), `DOKPLOY_APP_ID` (the application's id).
`GITHUB_TOKEN` is automatic. Remember the **chicken-and-egg**: the three `DOKPLOY_*` secrets
can't exist until the box is up and the app is created (§2, §6), so set those secrets last,
right before the first `release` push.

---

## 6. Create the app in Dokploy (deploy from GHCR image)

1. New Project → New Application.
2. **Source type: Docker.** Image: `ghcr.io/<owner>/owflex-chat:latest`. Registry URL:
   `ghcr.io`. Username: your GitHub username. Password: a GitHub PAT (classic) with
   `read:packages` (the image can be private). Save.

> **⚠️ CRITICAL — Do NOT use "Github", "Gitlab", "Bitbucket", or "Git" as the Provider.**
> These providers make Dokploy **clone your repo and build its own Docker image from
> source**, completely bypassing the GHCR image that GitHub Actions built. The result:
> `NEXT_PUBLIC_*` build-args are never passed, Sanity Studio / blog / analytics break,
> and you waste ~5 min per deploy on a redundant build. **Always select the "Docker"
> provider** and point it at the GHCR image. If your app is already set to a Git provider,
> switch to Docker → save → redeploy.
3. **Domains** (Traefik): add all three as separate domains on the *same* application,
   container port **3000**, HTTPS on, Let's Encrypt:
   - `octively.com`
   - `admin.octively.com`
   - `app.octively.com`
   `proxy.ts` does the hostname routing in the Node runtime, so one app serves all three.
   No wildcard cert, no edge runtime. **Issue these the same way as the panel** (§2f / §9):
   grey-cloud each record in Cloudflare first so LE can validate, let Dokploy issue the
   certs, then orange-cloud them. The container's `PORT` is 3000; that is the internal port
   Traefik proxies to, unrelated to the panel's external 3000 you closed in §2f.
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

## 9. DNS / Cloudflare + SSL (the part that bites people)

DNS records (all A records → VPS IP, plus the panel):

| Record | Proxy after issuance | Purpose |
|---|---|---|
| `@` (octively.com) | orange | marketing |
| `admin` | orange | dashboard |
| `app` | orange | portal |
| `deploy` | orange | Dokploy panel |
| MX / DKIM / SPF / DMARC | **grey (never proxy)** | email |

### SSL mode: Full (Strict). NOT Flexible.

Dokploy runs **Traefik**, and Cloudflare's docs + Dokploy's docs both warn that **Flexible
mode causes redirect loops with Traefik** (Traefik redirects HTTP→HTTPS, Cloudflare sends
HTTP, loop). Some generic "VPS + Cloudflare" tutorials use Flexible, but those run plain
Nginx with no origin redirect. For us: **SSL/TLS → Overview → Full (Strict)**.

### The Let's Encrypt + Cloudflare-proxy gotcha

Traefik gets its cert from Let's Encrypt via the **HTTP-01** or **DNS-01** challenge. When a
record is **orange-clouded**, HTTP-01 is intercepted by Cloudflare and fails. Three solutions,
in order of recommendation:

#### Solution A (recommended): DNS-01 challenge with Cloudflare API token

Replace HTTP-01 with DNS-01 so LE validates via DNS record lookups instead of port 80. This
works **behind Cloudflare proxy permanently** — certs renew automatically every ~60 days with
zero intervention.

**Step 1 — Create a Cloudflare API token:**
Go to https://dash.cloudflare.com/profile/api-tokens → **Create Token** → use template
"Edit zone DNS" → set Zone Resources to `Include` → `Specific zone` → `octively.com` →
**Create Token**. Copy the token (shown once).

**Step 2 — Update Traefik config (`/etc/dokploy/traefik/traefik.yml`):**

Replace the `httpChallenge` block with:
```yaml
certificatesResolvers:
  letsencrypt:
    acme:
      email: m.owaismarksman@gmail.com
      storage: /etc/dokploy/traefik/dynamic/acme.json
      dnsChallenge:
        provider: cloudflare
        resolvers:
          - "1.1.1.1:53"
          - "8.8.8.8:53"
```

**Step 3 — Recreate Traefik with the API token:**

```bash
docker stop dokploy-traefik && docker rm dokploy-traefik

docker run -d \
  --name dokploy-traefik \
  --restart always \
  -p 80:80 \
  -p 443:443 \
  -p 443:443/udp \
  -v /etc/dokploy/traefik/traefik.yml:/etc/traefik/traefik.yml \
  -v /etc/dokploy/traefik/dynamic:/etc/dokploy/traefik/dynamic \
  -v /var/run/docker.sock:/var/run/docker.sock:ro \
  -e CF_DNS_API_TOKEN=<your-token> \
  --network bridge \
  traefik:v3.6.7

docker network connect dokploy-network dokploy-traefik
```

Verify: `docker logs dokploy-traefik --tail 30` should show LE certificate issuance. The
three subdomains can stay **orange-clouded** the entire time.

#### Solution B (simple): grey-cloud during issuance, then orange-cloud

Set each record to "DNS only" (grey), add the domain in Dokploy so LE issues the cert against
the bare origin, confirm HTTPS works, then switch the record to "Proxied" (orange). This is
what §2f and §6 reference. Order matters — Dokploy's own docs say "follow the steps in the
same order."

**Durable renewals (B only):** LE renews every ~60 days; with the proxy on, the renewal HTTP-01
will hit the same wall. Add a Cloudflare **Configuration Rule** scoped to
`*/.well-known/acme-challenge/*` that **disables Automatic HTTPS Rewrites** and **bypasses
cache**, so future challenges pass through over HTTP. Without this you'd have to grey-cloud
again at each renewal.

#### Solution C: Cloudflare Origin CA cert (15-year)

Bypass LE entirely — generate a free 15-year cert from Cloudflare dashboard and mount it onto
Traefik as a static certificate. Full (Strict) mode still works. No renewals ever. Caveat:
Origin CA certs are trusted **only by Cloudflare**, so any Next.js **server-side fetch to our
own public HTTPS domain** would fail cert validation in Node. We mostly avoid that (server
components hit Neon directly; auth is in-process), but LE keeps us safe without having to
audit every SSR fetch.

### Alternatives (documented, not chosen)

- **Cloudflare Origin CA cert (15-year, no renewals)** + Full (Strict): zero ACME hassle, but
  Origin CA certs are trusted **only by Cloudflare**, so any Next.js **server-side fetch to our
  own public HTTPS domain** would fail cert validation in Node. We mostly avoid that (server
  components hit Neon directly; auth is in-process), but LE keeps us safe without having to
  audit every SSR fetch. Keep this as a fallback if LE renewals become painful.
- **Cloudflare Tunnel** (`cloudflared`): no open 80/443 to the public internet at all, no origin
  cert needed — the tunnel handles edge TLS. Cleanest security story; adds a `cloudflared`
  dependency and Dokploy's "Cloudflare" service config. Worth considering later; not needed now.

### Cache / streaming

- Cache rule: **bypass `/api/*`** (SSE chat must stream unbuffered). Cache `/embed.js` hard.
- Keep **Email records grey** (MX / DKIM / SPF / DMARC) — never proxy them.

See `docs/production-deployment.md` for the full cache-rule list and the data-layer move.

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
4. Flip the three DNS records to the VPS. Per §9, point each at the VPS **grey-clouded
   first** so Traefik/LE can issue the real cert (it can't while DNS still points at
   Netlify), confirm HTTPS on each, then switch to **orange-cloud + Full (Strict)**. Watch
   Dokploy logs. The grey→orange window is short; do it per-subdomain.
5. Keep Netlify untouched for 48h as instant rollback (flip DNS back).
6. After 48h clean: decommission Netlify, remove `@netlify/plugin-nextjs` from
   `package.json`, cancel the old US Neon/Upstash, record the final entry in
   `docs/netlify-budget.md`.

## 12. Monitoring (free, same day)

- UptimeRobot: HTTPS checks on all three subdomains + the health route.
- Dokploy's built-in CPU/RAM/disk dashboard.
- Keep Vercel previews for development — that workflow does not change.

---

## 13. Security hardening + data safety (do this BEFORE pointing real DNS at the box)

> Sources: Dokploy's own Security docs (`docs/core/remote-servers/security`), the Dokploy
> "Production Hardening" guide + hardening discussion #4360, and current Ubuntu 24.04 VPS
> hardening guides. The single biggest gotcha is **Docker bypasses UFW** — read §13.2.

A self-hosted box is exposed to the same internet background-noise of brute-force bots as
any server. None of this is optional once real customer data (leads, conversations, auth
sessions) flows through it. Work top-down: lock the front door (SSH), then the firewall,
then the panel, then the app, then plan for the bad day (backups + recovery).

### 13.1 SSH (the #1 attack vector)

Done partly in §2; finish it here. Edit a dedicated drop-in so it survives Ubuntu updates
(do **not** rely on editing `/etc/ssh/sshd_config` directly — Ubuntu 24.04 ships
`/etc/ssh/sshd_config.d/50-cloud-init.conf` that re-enables password auth and wins):

```bash
sudo tee /etc/ssh/sshd_config.d/99-hardening.conf >/dev/null <<'EOF'
PermitRootLogin no
PasswordAuthentication no
KbdInteractiveAuthentication no
MaxAuthTries 3
X11Forwarding no
EOF
sudo systemctl restart ssh
```

- **Confirm key login works in a second terminal BEFORE you log out** — a bad SSH change
  plus no console access is how people brick a box. Hetzner's web console is the recovery path.
- Non-standard SSH port is optional and only slows scanners (a port scan finds it anyway).
  Skip it; fail2ban (§13.3) is the better spend.

### 13.2 Firewall — Hetzner Cloud Firewall is the authoritative layer

**Docker bypasses UFW.** Dokploy/Traefik run in Docker, which inserts its own iptables rules
*beneath* UFW, so a UFW `deny` does not reliably block a port a container publishes. This is
called out in Dokploy's security docs. Consequences:

- Use the **Hetzner Cloud Firewall** (panel) as the real gate — it filters at the network
  edge, before Docker's iptables. Inbound allow-list: **22, 80, 443** (and 3000 only during
  initial setup, removed in §2f). Everything else denied.
- Keep UFW too (default deny incoming) as defence-in-depth, and optionally install
  **`ufw-docker`** so Docker-published ports actually respect UFW.
- **Never expose a database/Redis port.** Not a risk for us — Neon and Upstash are external
  managed services reached outbound over TLS; nothing listens for them on the VPS.

### 13.3 Brute-force + auto-patching

```bash
sudo apt install -y fail2ban unattended-upgrades
sudo systemctl enable --now fail2ban           # bans IPs after repeated failed SSH logins
sudo dpkg-reconfigure -plow unattended-upgrades # automatic security updates
```

- fail2ban with SSH protection (aggressive mode if you want) kills the credential-stuffing
  noise. With password auth already off (§13.1) the risk is low, but it trims log spam and
  catches anything that slips through.
- `unattended-upgrades` keeps the OS patched without you babysitting it.

### 13.4 Dokploy panel + API

- **2FA on the admin account** (Dokploy ≥ v0.19 has it) — the panel can deploy/destroy
  everything, so treat it like root. Strong unique password from the start.
- Panel reachable **only via `https://deploy.octively.com`**, never the raw IP:3000 (§2f).
- **Scope the CI API token**: create a dedicated key (Dokploy → API keys, per-org with rate
  limiting), give it the least privilege that still lets it deploy, set an **expiry** (~90d),
  and store it only as the GitHub `DOKPLOY_API_KEY` secret. Rotate on any suspicion. A leaked
  full-access token = full infra compromise.
- **Keep Dokploy updated** (panel → Updates). Releases carry auth/Traefik security fixes.
- Optional but strong: put the panel behind a **Cloudflare Tunnel + Access policy** so it is
  not publicly reachable at all (only you, after Cloudflare auth). Same trick works for the
  whole app to remove open 80/443 (§9 alternatives).

### 13.5 Container + app

- **Run as non-root** — our Dockerfile already does (`USER node`). Keep it that way.
- **Set resource limits** in Dokploy (CPU/RAM caps) so one runaway container (or the ONNX
  model under load) can't OOM the whole box.
- **Secrets live in Dokploy env, never in the image** — already enforced (`.dockerignore`
  excludes `.env*`; only `NEXT_PUBLIC_*` are build-args). Generate every secret with
  `openssl rand` and **rotate `BETTER_AUTH_SECRET` only via a planned cutover** (rotating it
  invalidates all sessions).
- **HTTPS everywhere** (§9, Full Strict). HSTS is handled by Cloudflare edge certs.
- Our existing app-layer protections still apply and matter more now: Zod on every route,
  Upstash rate-limits on public embed endpoints, tenant `org_id`/`bot_id` isolation on every
  query, HMAC-signed lead webhooks. None of that changes on the VPS.
- Optional: enable **image vulnerability scanning** (Trivy/Grype) in CI against the GHCR
  image to catch a compromised base image or dependency before it ships.

### 13.6 Data safety + backups (the "bad day" plan)

Know where the data actually lives — most of it is **not** on the VPS, which is the point:

| Data | Where | Backup story |
|---|---|---|
| App DB (orgs, bots, leads, conversations, chunks) | **Neon (managed, EU)** | Neon point-in-time restore / branching — primary safety net. Verify the plan's PITR window. |
| Credits / rate-limit / sessions cache | **Upstash Redis (managed, EU)** | Upstash persistence; rebuildable (counters, not source-of-truth). |
| Uploaded documents | **Cloudflare R2** | R2 durability + optional versioning. |
| ONNX model cache | VPS volume (`TRANSFORMERS_CACHE`) | Disposable — re-downloads (~110 MB) if lost. |
| Dokploy's own config/state | VPS | **Back this up** (see below) — losing it means rebuilding the panel/app config by hand. |

- The container is **stateless** — app data is in managed, offsite services with their own
  backups. That is the strongest possible data-safety posture; a dead VPS loses no customer data.
- **Back up Dokploy's config** (and any volumes) to **Cloudflare R2 / S3** on a schedule
  (Dokploy → Backups). Note from Dokploy's hardening discussion: backup dumps are **plain
  SQL** — if you ever store real data in a Dokploy-managed DB, **encrypt the dump** (age/GPG,
  private key off-server) before upload so leaked S3 creds don't expose it. For us this is
  config only, but encrypt it anyway.
- **Enable Hetzner backups** (+20%/mo) or a weekly snapshot for whole-box restore.
- **Test the restore once** — an untested backup is a guess. Spin a throwaway box, restore,
  confirm it boots. Then document the steps so a 2am recovery isn't improvised.

### 13.7 Quick hardening checklist

```
Server   □ SSH keys only  □ root login off  □ password auth off  □ fail2ban  □ auto-updates
Firewall □ Hetzner Cloud FW = source of truth  □ only 22/80/443  □ 3000 closed  □ UFW deny-in
Panel    □ HTTPS-only via deploy.  □ 2FA on admin  □ scoped+expiring API token  □ Dokploy updated
App      □ non-root container  □ resource limits  □ secrets in env only  □ Full(Strict) TLS
Data     □ Neon PITR verified  □ Dokploy config backed up (encrypted) to R2  □ restore tested
```
