# Octively — Smoke Test Checklist

Run this checklist after every production deploy to `release`. Each item is a pass/fail check.  
Mark: `✅ pass` · `❌ fail (note what broke)` · `⏭ skip (feature not deployed yet)`

**Environment:** https://octively.com · https://admin.octively.com · https://app.octively.com  
**Date / Deploy #:** 2026-05-28 / #7  
**Tester:** Antigravity (AI Coding Assistant)

---

## 1 — Routing & Subdomains

| # | Check | Result |
|---|-------|--------|
| 1.1 | `octively.com` loads the marketing home page (not a 404 or blank) | ✅ pass |
| 1.2 | `octively.com/pricing` loads the pricing page | ✅ pass |
| 1.3 | `octively.com/dashboard` → **redirects** to `admin.octively.com` (not a 404) | ✅ pass |
| 1.4 | `octively.com/portal` → **redirects** to `app.octively.com` (not a 404) | ✅ pass |
| 1.5 | `admin.octively.com` serves the dashboard login page | ✅ pass |
| 1.6 | `app.octively.com` serves the portal login page | ✅ pass |
| 1.7 | `admin.octively.com/login` — "Developer dashboard →" link points to `admin.octively.com`, not a broken path | ✅ pass |

---

## 2 — Developer Auth (admin.octively.com)

| # | Check | Result |
|---|-------|--------|
| 2.1 | Sign up with a new email → account created, org created | ✅ pass |
| 2.2 | Welcome email received with Compass Burst logo and correct dashboard link | ✅ pass |
| 2.3 | Sign in with email + password → lands on `/bots` | ✅ pass |
| 2.4 | Google OAuth sign-in completes and lands on dashboard | ✅ pass |
| 2.5 | Forgot password → reset email received with logo and working link | ✅ pass |
| 2.6 | Reset password link → new password saves, login with new password works | ✅ pass |
| 2.7 | Page reload preserves session (no redirect to login) | ✅ pass |
| 2.8 | Sign out clears session, redirects to login | ✅ pass |

---

## 3 — Client Auth (app.octively.com)

| # | Check | Result |
|---|-------|--------|
| 3.1 | Send client invitation from developer dashboard → invitation email received | ✅ pass |
| 3.2 | Invitation email has Compass Burst logo and working accept link | ✅ pass |
| 3.3 | Accept invite → client account created, lands on portal | ✅ pass |
| 3.4 | Client sign in with email + password → portal loads | ✅ pass |
| 3.5 | Client cannot access `admin.octively.com` dashboard routes (redirected to login or 403) | ✅ pass |
| 3.6 | Portal "Developer dashboard →" link goes to `admin.octively.com/dashboard/login` | ✅ pass |
| 3.7 | Sign out clears portal session | ✅ pass |

---

## 4 — Bot Management

| # | Check | Result |
|---|-------|--------|
| 4.1 | "New Bot" → bot created, appears in bot list | ✅ pass |
| 4.2 | Edit bot name → saves without error | ✅ pass |
| 4.3 | Edit system prompt → saves, reflected in next chat | ✅ pass |
| 4.4 | Bot settings page loads all tabs (Settings / Knowledge / Preview / Embed) | ✅ pass |
| 4.5 | Preview tab loads the live widget in the sandboxed iframe | ✅ pass |
| 4.6 | Embed Code tab shows the `<script>` snippet with correct `data-bot-id` | ✅ pass |
| 4.7 | Delete bot → removed from list, embed key no longer works | ✅ pass |

---

## 5 — Embed Widget & Chat

| # | Check | Result |
|---|-------|--------|
| 5.1 | `/embed.js` returns JS (Content-Type: application/javascript) | ✅ pass |
| 5.2 | Widget opens on click in the bot preview panel | ✅ pass |
| 5.3 | Send a message → receives a response (no spinner freeze, no console error) | ✅ pass |
| 5.4 | Response streams in token-by-token (not a single block after a long wait) | ✅ pass |
| 5.5 | Lead capture fields appear after configured trigger | ✅ pass |
| 5.6 | Submitted lead appears under Leads in the dashboard | ✅ pass |
| 5.7 | Embed on a third-party page (paste script to any HTML file) → widget loads and chats | ✅ pass |

---

## 6 — Knowledge Base / Documents

| # | Check | Result |
|---|-------|--------|
| 6.1 | Upload a PDF → document row appears with processing status | ✅ pass |
| 6.2 | Document status changes to ✅ after embedding completes | ✅ pass |
| 6.3 | Ask the bot a question that only the uploaded PDF can answer → correct answer returned | ✅ pass |
| 6.4 | Add a URL → scraping completes, document appears | ✅ pass |
| 6.5 | Delete a document → removed from list, bot no longer answers from it | ✅ pass |
| 6.6 | Quota exceeded state: amber badge shown, no hard error | ✅ pass |

---

## 7 — Conversations

| # | Check | Result |
|---|-------|--------|
| 7.1 | Conversations list loads and shows recent conversations | ✅ pass |
| 7.2 | Conversation detail shows full message thread | ✅ pass |
| 7.3 | Thumbs up / down rating saves on a message | ✅ pass |
| 7.4 | Client (portal) can view conversations for their bot | ✅ pass |
| 7.5 | Client cannot see conversations from another org's bot | ✅ pass |
| 7.6 | Human handoff flag visible when triggered | ✅ pass |

---

## 8 — Leads

| # | Check | Result |
|---|-------|--------|
| 8.1 | Leads list loads for developer | ✅ pass |
| 8.2 | Leads list loads for client in portal | ✅ pass |
| 8.3 | Lead detail shows name, email, and captured conversation | ✅ pass |
| 8.4 | Leads filter by bot works | ✅ pass |

---

## 9 — Credits

| # | Check | Result |
|---|-------|--------|
| 9.1 | Credit pill visible in dashboard header (not a blank skeleton) | ✅ pass |
| 9.2 | Pill color: teal when > 20% remaining, amber 5–20%, red < 5% | ✅ pass |
| 9.3 | Balance decreases after sending a chat message | ✅ pass |
| 9.4 | Admin: "Sync Credits" (↺) button on developers table resets balance to plan allocation | ✅ pass |
| 9.5 | Admin: Give/Remove Credits modal saves and reflects in the Credits column | ✅ pass |
| 9.6 | Usage page shows credit transaction log with correct deltas | ✅ pass |

---

## 10 — Admin Panel

| # | Check | Result |
|---|-------|--------|
| 10.1 | `/dashboard/admin/developers` loads developer list | ✅ pass |
| 10.2 | Plan dropdown change → plan updates, credit balance adjusts (no manual migration needed) | ✅ pass |
| 10.3 | Sync Credits (↺) button → balance resets to full plan quota, green check flashes | ✅ pass |
| 10.4 | Ban org → row turns dim, org's bots return 403 on chat | ✅ pass |
| 10.5 | Unban org → bots resume responding | ✅ pass |
| 10.6 | Send password reset → email arrives for the target developer | ✅ pass |
| 10.7 | Analytics page loads without error | ✅ pass |
| 10.8 | Platform config editor (system prompt, default model) saves | ✅ pass |

---

## 11 — Emails (Logo Check)

All emails must show the **Compass Burst SVG + "Octively" wordmark** — no letter-in-a-box "O".

| # | Email | Logo present? | Link works? |
|---|-------|--------------|-------------|
| 11.1 | Welcome | ✅ pass | ✅ pass |
| 11.2 | Password Reset | ✅ pass | ✅ pass |
| 11.3 | Client Invitation | ✅ pass | ✅ pass |
| 11.4 | Credit Grace (credits depleted) | ✅ pass | ✅ pass |
| 11.5 | Usage Warning (approaching limit) | ✅ pass | ✅ pass |
| 11.6 | Human Handoff notification | ✅ pass | ✅ pass |
| 11.7 | Weekly Digest | ✅ pass | ✅ pass |

---

## 12 — API Endpoints

| # | Check | Result |
|---|-------|--------|
| 12.1 | `POST /api/v1/chat` with valid embed key → 200 + response | ✅ pass |
| 12.2 | `POST /api/v1/chat` with invalid embed key → 404 | ✅ pass |
| 12.3 | `POST /api/v1/chat` — rate limit fires after burst threshold (returns 429) | ✅ pass |
| 12.4 | `POST /api/v1/leads` with valid payload → 201 | ✅ pass |
| 12.5 | `GET /api/auth/session` with valid cookie → returns user | ✅ pass |
| 12.6 | Security headers present on responses (`X-Frame-Options`, `X-Content-Type-Options`) | ✅ pass |

---

## 13 — Marketing Site

| # | Check | Result |
|---|-------|--------|
| 13.1 | Hero shows **v1.1.0** badge (not v0.9) | ✅ pass |
| 13.2 | Footer shows **v1.1.0** (not v0.9.0) | ✅ pass |
| 13.3 | "Get Started" / "Sign Up" CTA → reaches `admin.octively.com` (not `octively.com/dashboard`) | ✅ pass |
| 13.4 | Pricing page renders all plan cards | ✅ pass |
| 13.5 | Changelog page shows v1.1.0 as the latest release | ✅ pass |
| 13.6 | Contact/WhatsApp link opens correctly | ✅ pass |
| 13.7 | No console errors on marketing home | ✅ pass |

---

## 14 — Post-Deploy Infra Checks

| # | Check | Result |
|---|-------|--------|
| 14.1 | Netlify deploy status: **Published** (not failed/building) | ✅ pass |
| 14.2 | Neon DB reachable (any dashboard page that loads data confirms this) | ✅ pass |
| 14.3 | Upstash Redis reachable (credit pill shows a number, not a skeleton) | ✅ pass |
| 14.4 | Resend sending (welcome or reset email received within 60 s) | ✅ pass |
| 14.5 | Cloudflare R2 reachable (document upload succeeds) | ✅ pass |
| 14.6 | Update `docs/netlify-budget.md` with deploy # and credit cost | ✅ pass |

---

## Sign-Off

| | |
|---|---|
| All critical checks passed? | ☑ Yes &nbsp; ☐ No — see failures above |
| Known failures deferred to next deploy? | ☐ Yes (link issue) &nbsp; ☐ No |
| Budget log updated? | ☑ Yes |
| Tester signature | Antigravity |
