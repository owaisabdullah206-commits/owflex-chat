# syntax=docker/dockerfile:1
# Octively production image. Built off-box in GitHub Actions, deployed via Dokploy.
# See docs/vps-dokploy-setup.md.
# Node 22: @huggingface/transformers v4 requires node >=22.22.
ARG NODE_VERSION=22-slim

# ── deps ──────────────────────────────────────────────────────────────────────
# npm workspaces: the embed widget is a workspace, so its package.json must be
# present for `npm ci` to resolve it.
FROM node:${NODE_VERSION} AS deps
WORKDIR /app
# node:22-slim ships with npm 10; lock file is generated with npm 11.
# Upgrade to match so npm ci resolves the lock file correctly.
RUN npm install -g npm@11 --quiet
COPY package.json package-lock.json* ./
COPY embed/package.json ./embed/package.json
RUN npm ci --no-audit --no-fund

# ── builder ───────────────────────────────────────────────────────────────────
FROM node:${NODE_VERSION} AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# DOCKER_BUILD=1 makes next.config emit `output: 'standalone'`.
ENV NODE_ENV=production DOCKER_BUILD=1
# NEXT_PUBLIC_* values are inlined at BUILD time — they must be present here.
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
# build:embed rebuilds embed/dist + copies it to public/embed.js (the served file).
RUN npm run build:embed && npm run build

# ── runner ────────────────────────────────────────────────────────────────────
FROM node:${NODE_VERSION} AS runner
WORKDIR /app
ENV NODE_ENV=production PORT=3000 HOSTNAME=0.0.0.0 \
    EMBEDDING_PROVIDER=onnx \
    TRANSFORMERS_CACHE=/app/.cache/transformers
COPY --from=builder --chown=node:node /app/public ./public
COPY --from=builder --chown=node:node /app/.next/standalone ./
COPY --from=builder --chown=node:node /app/.next/static ./.next/static
# Native packages aren't reliably traced into the standalone bundle (.node binaries),
# so copy the ONNX runtime + transformers explicitly. If you ever see a runtime
# "Cannot find module" for an embedding dep, copy the whole /app/node_modules instead.
COPY --from=builder --chown=node:node /app/node_modules/@huggingface ./node_modules/@huggingface
COPY --from=builder --chown=node:node /app/node_modules/onnxruntime-node ./node_modules/onnxruntime-node
COPY --from=builder --chown=node:node /app/node_modules/onnxruntime-common ./node_modules/onnxruntime-common
COPY --from=builder --chown=node:node /app/node_modules/sharp ./node_modules/sharp
RUN mkdir -p /app/.cache/transformers && chown -R node:node /app/.cache
USER node
EXPOSE 3000
CMD ["node", "server.js"]
