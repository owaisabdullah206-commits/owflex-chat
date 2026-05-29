# Spec: Security Hardening (005)

**Phase:** Post-MVP / Go-Live  
**Status:** Implemented (commit 7edd3f8 + subsequent fixes)  
**Surface:** All three (admin, portal, embed widget)

---

## Overview

A defensive security audit of the platform after the MVP go-live found two critical payment vulnerabilities, one medium XSS vector, and several lower-severity hardening gaps. All items are now fixed.

---

## Issues Found & Fixed

### 🔴 HIGH-1 — PayFast Payment Tampering (Unsigned Checkout)

**File:** `lib/billing/payfast.ts`, `app/api/webhooks/payfast/route.ts`

**Problem:** The outgoing PayFast checkout URL is built by the server but sent as a browser redirect. The `amount` field in the URL is unsigned — a user can intercept it with a proxy, change `2500` to `1`, pay the minimum, and the ITN webhook would still grant the full plan/pack because it only verified the MD5 signature (which covers the *received* data, not the expected price).

**Fix:**
- `verifyItn` now parses `amount_gross` from the ITN and computes `expectedAmount` from `CREDIT_PACKS[packId].pkr` or `PLAN_PRICES_PKR[planId]` server-side.
- Exposes `amountValid: boolean` in `ItnVerifyResult`.
- Webhook (`app/api/webhooks/payfast/route.ts`) rejects with a log and 200 response if `!result.amountValid`.

---

### 🔴 HIGH-2 — PayFast Forgeable ITN Signature (Missing Passphrase)

**File:** `lib/billing/payfast.ts`

**Problem:** `verifyItn` only appended the passphrase to the MD5 hash if `PAYFAST_PASSPHRASE` was set. If the env var was unset, the signature was computable from semi-public fields (`merchant_id`, `merchant_key`), making every ITN forgeable.

**Fix:**
- `verifyItn` now fails closed (`valid: false`) and logs an error if `PAYFAST_PASSPHRASE` is not configured.
- Signature comparison uses `timingSafeEqual` via the shared `safeEqual` helper (`lib/security.ts`).
- Hashing order changed to received order (correct PayFast spec; previously sorted).
- `.env.example` updated with a comment noting the var is mandatory for live payments.

---

### 🟡 MEDIUM — Product Card XSS in Embed Widget

**File:** `embed/src/embed.js`, `public/embed.js`

**Problem:** The `esc()` helper escaped `<`, `>`, and `&` but not `"` or `'`. Product card `image` and `url` fields from the LLM were interpolated into `src="…"` and `href="…"` attribute contexts. A `"` in those fields broke out of the attribute, enabling injection of `onerror`/`onload` event handlers. The `href` field had no scheme check, allowing `javascript:` URIs. Reachable via prompt-injection of the bot.

**Fix:**
- `esc()` now also replaces `"` → `&quot;` and `'` → `&#39;`.
- New `safeUrl(u)` helper whitelists only `http(s):` schemes; returns `""` for anything else.
- Product card `image` and `url` pass through `safeUrl()` before `esc()`.
- Branding URL (`burl`, from developer config) also passes through `safeUrl()`.
- Minified widget rebuilt (`npm run build:embed`).

---

### 🟠 MEDIUM — SSRF via Bot Lead Webhook

**File:** `lib/webhooks/outbound.ts`

**Problem:** `fireLeadWebhook` called `fetch(webhookUrl)` with no restriction on the URL. Developers configure `webhook_url` in bot settings. A malicious developer (or a compromised account) could point it at `http://169.254.169.254/latest/meta-data/` (AWS/cloud metadata), `http://10.x.x.x/…` (internal services), or `http://localhost:…`, enabling blind SSRF from the server.

**Fix:**
- `assertSafeWebhookUrl(url)` throws for:
  - Non-`https:` schemes.
  - Hostnames matching RFC-1918 private ranges, loopback (`127.x`, `::1`), link-local (`169.254.x`, `fe80:`), CGNAT (`100.64–127.x`), `.local`, `.internal`.
- The guard runs before signing or fetching; logs and returns without delivery on failure.

---

### 🟠 MEDIUM — Auth Rate Limiting Ineffective on Serverless

**File:** `lib/auth/index.ts`

**Problem:** BetterAuth's default rate limiter uses in-process memory. On Netlify/Vercel, each serverless function instance has its own memory with no shared state. The rate-limit counter resets on every cold start, making it trivially bypassed for credential stuffing or password-reset spam.

**Fix:**
- Added `secondaryStorage` adapter backed by Upstash Redis REST API (raw `fetch` — no extra SDK dependency).
- Added `rateLimit` config with `storage: 'secondary-storage'` and per-path `customRules`:
  - `/sign-in/email`: 5 requests / 60 s
  - `/sign-up/email`: 3 requests / 60 s
  - `/forget-password`: 3 requests / 60 s

---

### 🟡 MEDIUM — Platform Owner Email in Client Bundle

**File:** `components/dashboard/Sidebar.tsx`, `lib/auth/session.ts`

**Problem:** `NEXT_PUBLIC_PLATFORM_OWNER_EMAIL` was read in `Sidebar.tsx` (a `'use client'` component) to decide whether to show the Admin nav section. `NEXT_PUBLIC_*` variables are inlined into the JavaScript bundle at build time and sent to every visitor — exposing the admin's email address for targeted credential-stuffing or phishing.

**Fix:**
- New API route `app/api/dashboard/is-admin/route.ts` — performs the email comparison server-side and returns `{ isAdmin: boolean }`, never the email itself.
- `Sidebar` fetches this endpoint on mount (alongside the existing escalations poll); shows Admin section based on the response.
- `requirePlatformOwner` in `lib/auth/session.ts` now reads `PLATFORM_OWNER_EMAIL` (server-only, no `NEXT_PUBLIC_` prefix) with a fallback to the legacy `NEXT_PUBLIC_PLATFORM_OWNER_EMAIL` for backwards compatibility during the env migration.
- `NEXT_PUBLIC_PLATFORM_OWNER_EMAIL` can be removed from production env vars once `PLATFORM_OWNER_EMAIL` is set.

---

### 🟢 LOW — Constant-Time Auth Token Comparison

**File:** `app/api/cron/monthly-reset/route.ts`, `app/api/cron/weekly-digest/route.ts`, `app/api/internal/migrate/route.ts`

**Problem:** `CRON_SECRET` bearer token comparisons used `!==` (non-constant-time), vulnerable in theory to timing side-channels on high-entropy secrets.

**Fix:** All three endpoints now use `verifyBearer()` from `lib/security.ts` which wraps `timingSafeEqual`.

---

### 🟢 LOW — `/api/internal/migrate` Standing DDL Endpoint

**File:** `app/api/internal/migrate/route.ts`

**Problem:** The endpoint executes `ALTER TABLE` and `CREATE TABLE` statements. Even with bearer-token auth, a standing DDL endpoint is unnecessary attack surface in normal operation.

**Fix:** Added `MIGRATIONS_ENABLED` env-var kill switch (default `false` / unset). Endpoint returns `404` unless `MIGRATIONS_ENABLED=true` is explicitly set. Documented in `.env.example`.

---

### 🟢 LOW — Content-Security-Policy Missing

**File:** `next.config.ts`

**Problem:** No CSP header was set. Without it, any XSS that did execute (e.g., via a future template injection) had unrestricted access to load scripts, exfiltrate data, etc.

**Fix:** Added `Content-Security-Policy` header to all routes:
```
default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';
img-src 'self' data: blob: https:; connect-src 'self' https:;
frame-src 'none'; object-src 'none'; base-uri 'self'; form-action 'self'
```
`unsafe-inline` on scripts/styles is required for Next.js hydration and Tailwind; this can be tightened with nonces in a future pass.

---

### 🟢 LOW — CORS Wildcard on All `/api/v1/*`

**File:** `next.config.ts`

**Problem:** `Access-Control-Allow-Origin: *` was applied to the entire `/api/v1/:path*` wildcard, including authenticated endpoints (documents upload, bot management).

**Fix:** Wildcard CORS is now applied only to the five genuinely public embed endpoints: `/api/v1/chat`, `/api/v1/widget-config`, `/api/v1/leads`, `/api/v1/rating`, `/api/v1/feedback`. Authenticated routes have no CORS wildcard.

---

### 🟢 LOW — `WEBHOOK_SIGNING_SECRET` Hardcoded Fallback

**File:** `lib/webhooks/outbound.ts`

**Problem:** If `WEBHOOK_SIGNING_SECRET` was unset, the code fell back to the literal string `'owflex-webhook-secret'`. Any developer receiver using that "secret" would accept forged payloads from anyone who found the source code.

**Fix:** Webhook delivery is now skipped entirely if `WEBHOOK_SIGNING_SECRET` is not configured. A `console.error` is logged so the operator knows to set the env var.

---

## Files Changed

| File | Change |
|------|--------|
| `lib/security.ts` | **New** — `safeEqual()`, `verifyBearer()` helpers |
| `lib/billing/payfast.ts` | Amount validation, mandatory passphrase, constant-time sig, correct hash order |
| `app/api/webhooks/payfast/route.ts` | Amount integrity guard, uses `result.planId` |
| `lib/webhooks/outbound.ts` | SSRF guard, fail-closed on missing secret |
| `lib/auth/index.ts` | Upstash `secondaryStorage`, `rateLimit` with per-path rules |
| `lib/auth/session.ts` | `requirePlatformOwner` reads server-only `PLATFORM_OWNER_EMAIL` |
| `app/api/dashboard/is-admin/route.ts` | **New** — server-side admin check endpoint |
| `components/dashboard/Sidebar.tsx` | Fetches `/api/dashboard/is-admin` instead of reading `NEXT_PUBLIC_*` |
| `app/api/cron/monthly-reset/route.ts` | Constant-time `verifyBearer` |
| `app/api/cron/weekly-digest/route.ts` | Constant-time `verifyBearer` |
| `app/api/internal/migrate/route.ts` | `MIGRATIONS_ENABLED` kill switch + constant-time auth |
| `embed/src/embed.js` | `esc()` quote escaping, `safeUrl()` scheme guard, widget rebuilt |
| `public/embed.js` | Rebuilt minified widget |
| `next.config.ts` | CSP header, scoped CORS per-route |
| `.env.example` | Documents `MIGRATIONS_ENABLED`, `PLATFORM_OWNER_EMAIL` note, mandatory passphrase |

---

## Environment Variables

| Variable | Required | Notes |
|----------|----------|-------|
| `PLATFORM_OWNER_EMAIL` | Yes | Server-only replacement for `NEXT_PUBLIC_PLATFORM_OWNER_EMAIL` |
| `PAYFAST_PASSPHRASE` | Yes (for PayFast) | ITN webhook fails closed if unset |
| `WEBHOOK_SIGNING_SECRET` | Yes (for webhooks) | Delivery skipped if unset |
| `MIGRATIONS_ENABLED` | No | Set `true` only for one-shot migration runs |
| `UPSTASH_REDIS_REST_URL` | Yes (already set) | Now also used for auth rate limiting |
| `UPSTASH_REDIS_REST_TOKEN` | Yes (already set) | Now also used for auth rate limiting |

---

## Acceptance Criteria

- [ ] PayFast ITN with tampered `amount` is rejected (logged, 200 returned to PayFast)
- [ ] PayFast ITN with missing `PAYFAST_PASSPHRASE` is rejected
- [ ] Widget product card with `javascript:` URL in `url`/`image` field renders as no-op (link/img removed)
- [ ] Widget `<script onerror=…>` via LLM output does not execute
- [ ] `https://octively.com/` response headers include `Content-Security-Policy`
- [ ] `/api/v1/documents/upload` does NOT have `Access-Control-Allow-Origin: *`
- [ ] `/api/v1/chat` DOES have `Access-Control-Allow-Origin: *`
- [ ] Bot webhook to `http://169.254.169.254` is silently dropped (not delivered)
- [ ] Bot webhook to `http://localhost:3000` is silently dropped
- [ ] 6+ failed login attempts from the same IP within 60 s return 429
- [ ] Admin nav section visible only when logged in as platform owner
- [ ] `NEXT_PUBLIC_PLATFORM_OWNER_EMAIL` does NOT appear in the compiled JS bundle
- [ ] `/api/internal/migrate` returns 404 when `MIGRATIONS_ENABLED` is unset

---

## Known Limitations / Follow-up

- **CSP `unsafe-inline`**: Required for Next.js. Can be replaced with per-request nonces in a future pass once nonce injection is set up in the Next.js config.
- **Email verification** (`requireEmailVerification: false`): Allows unverified signups. Product decision — add verification in Phase 3 when user volume warrants it.
- **BYOK key derivation**: `LLM_KEY_ENCRYPTION_SECRET` is zero-padded to 32 bytes rather than KDF-derived. Document that the secret must be a strong ≥32-char random value.
- **PayFast server-side validation postback**: A second layer of defence would be calling PayFast's `/eng/query/validate` endpoint to confirm the ITN server-to-server. Not implemented — amount validation is sufficient for MVP.
