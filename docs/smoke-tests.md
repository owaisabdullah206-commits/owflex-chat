# Octively — Smoke Test Checklist

Run this checklist after every production deploy to `release`. Each item is a pass/fail check.  
Mark: `✅ pass` · `❌ fail (note what broke)` · `⏭ skip (feature not deployed yet)`

**Environment:** https://octively.com · https://admin.octively.com · https://app.octively.com  
**Date / Deploy #:** ___________  
**Tester:** ___________

---

## 1 — Routing & Subdomains

| # | Check | Result |
|---|-------|--------|
| 1.1 | `octively.com` loads the marketing home page (not a 404 or blank) | |
| 1.2 | `octively.com/pricing` loads the pricing page | |
| 1.3 | `octively.com/dashboard` → **redirects** to `admin.octively.com` (not a 404) | |
| 1.4 | `octively.com/portal` → **redirects** to `app.octively.com` (not a 404) | |
| 1.5 | `admin.octively.com` serves the dashboard login page | |
| 1.6 | `app.octively.com` serves the portal login page | |
| 1.7 | `admin.octively.com/login` — "Developer dashboard →" link points to `admin.octively.com`, not a broken path | |

---

## 2 — Developer Auth (admin.octively.com)

| # | Check | Result |
|---|-------|--------|
| 2.1 | Sign up with a new email → account created, org created | |
| 2.2 | Welcome email received with Compass Burst logo and correct dashboard link | |
| 2.3 | Sign in with email + password → lands on `/bots` | |
| 2.4 | Google OAuth sign-in completes and lands on dashboard | |
| 2.5 | Forgot password → reset email received with logo and working link | |
| 2.6 | Reset password link → new password saves, login with new password works | |
| 2.7 | Page reload preserves session (no redirect to login) | |
| 2.8 | Sign out clears session, redirects to login | |

---

## 3 — Client Auth (app.octively.com)

| # | Check | Result |
|---|-------|--------|
| 3.1 | Send client invitation from developer dashboard → invitation email received | |
| 3.2 | Invitation email has Compass Burst logo and working accept link | |
| 3.3 | Accept invite → client account created, lands on portal | |
| 3.4 | Client sign in with email + password → portal loads | |
| 3.5 | Client cannot access `admin.octively.com` dashboard routes (redirected to login or 403) | |
| 3.6 | Portal "Developer dashboard →" link goes to `admin.octively.com/dashboard/login` | |
| 3.7 | Sign out clears portal session | |

---

## 4 — Bot Management

| # | Check | Result |
|---|-------|--------|
| 4.1 | "New Bot" → bot created, appears in bot list | |
| 4.2 | Edit bot name → saves without error | |
| 4.3 | Edit system prompt → saves, reflected in next chat | |
| 4.4 | Bot settings page loads all tabs (Settings / Knowledge / Preview / Embed) | |
| 4.5 | Preview tab loads the live widget in the sandboxed iframe | |
| 4.6 | Embed Code tab shows the `<script>` snippet with correct `data-bot-id` | |
| 4.7 | Delete bot → removed from list, embed key no longer works | |

---

## 5 — Embed Widget & Chat

| # | Check | Result |
|---|-------|--------|
| 5.1 | `/embed.js` returns JS (Content-Type: application/javascript) | |
| 5.2 | Widget opens on click in the bot preview panel | |
| 5.3 | Send a message → receives a response (no spinner freeze, no console error) | |
| 5.4 | Response streams in token-by-token (not a single block after a long wait) | |
| 5.5 | Lead capture fields appear after configured trigger | |
| 5.6 | Submitted lead appears under Leads in the dashboard | |
| 5.7 | Embed on a third-party page (paste script to any HTML file) → widget loads and chats | |

---

## 6 — Knowledge Base / Documents

| # | Check | Result |
|---|-------|--------|
| 6.1 | Upload a PDF → document row appears with processing status | |
| 6.2 | Document status changes to ✅ after embedding completes | |
| 6.3 | Ask the bot a question that only the uploaded PDF can answer → correct answer returned | |
| 6.4 | Add a URL → scraping completes, document appears | |
| 6.5 | Delete a document → removed from list, bot no longer answers from it | |
| 6.6 | Quota exceeded state: amber badge shown, no hard error | |

---

## 7 — Conversations

| # | Check | Result |
|---|-------|--------|
| 7.1 | Conversations list loads and shows recent conversations | |
| 7.2 | Conversation detail shows full message thread | |
| 7.3 | Thumbs up / down rating saves on a message | |
| 7.4 | Client (portal) can view conversations for their bot | |
| 7.5 | Client cannot see conversations from another org's bot | |
| 7.6 | Human handoff flag visible when triggered | |

---

## 8 — Leads

| # | Check | Result |
|---|-------|--------|
| 8.1 | Leads list loads for developer | |
| 8.2 | Leads list loads for client in portal | |
| 8.3 | Lead detail shows name, email, and captured conversation | |
| 8.4 | Leads filter by bot works | |

---

## 9 — Credits

| # | Check | Result |
|---|-------|--------|
| 9.1 | Credit pill visible in dashboard header (not a blank skeleton) | |
| 9.2 | Pill color: teal when > 20% remaining, amber 5–20%, red < 5% | |
| 9.3 | Balance decreases after sending a chat message | |
| 9.4 | Admin: "Sync Credits" (↺) button on developers table resets balance to plan allocation | |
| 9.5 | Admin: Give/Remove Credits modal saves and reflects in the Credits column | |
| 9.6 | Usage page shows credit transaction log with correct deltas | |

---

## 10 — Admin Panel

| # | Check | Result |
|---|-------|--------|
| 10.1 | `/dashboard/admin/developers` loads developer list | |
| 10.2 | Plan dropdown change → plan updates, credit balance adjusts (no manual migration needed) | |
| 10.3 | Sync Credits (↺) button → balance resets to full plan quota, green check flashes | |
| 10.4 | Ban org → row turns dim, org's bots return 403 on chat | |
| 10.5 | Unban org → bots resume responding | |
| 10.6 | Send password reset → email arrives for the target developer | |
| 10.7 | Analytics page loads without error | |
| 10.8 | Platform config editor (system prompt, default model) saves | |

---

## 11 — Emails (Logo Check)

All emails must show the **Compass Burst SVG + "Octively" wordmark** — no letter-in-a-box "O".

| # | Email | Logo present? | Link works? |
|---|-------|--------------|-------------|
| 11.1 | Welcome | | |
| 11.2 | Password Reset | | |
| 11.3 | Client Invitation | | |
| 11.4 | Credit Grace (credits depleted) | | |
| 11.5 | Usage Warning (approaching limit) | | |
| 11.6 | Human Handoff notification | | |
| 11.7 | Weekly Digest | | |

---

## 12 — API Endpoints

| # | Check | Result |
|---|-------|--------|
| 12.1 | `POST /api/v1/chat` with valid embed key → 200 + response | |
| 12.2 | `POST /api/v1/chat` with invalid embed key → 404 | |
| 12.3 | `POST /api/v1/chat` — rate limit fires after burst threshold (returns 429) | |
| 12.4 | `POST /api/v1/leads` with valid payload → 201 | |
| 12.5 | `GET /api/auth/session` with valid cookie → returns user | |
| 12.6 | Security headers present on responses (`X-Frame-Options`, `X-Content-Type-Options`) | |

---

## 13 — Marketing Site

| # | Check | Result |
|---|-------|--------|
| 13.1 | Hero shows **v1.1.0** badge (not v0.9) | |
| 13.2 | Footer shows **v1.1.0** (not v0.9.0) | |
| 13.3 | "Get Started" / "Sign Up" CTA → reaches `admin.octively.com` (not `octively.com/dashboard`) | |
| 13.4 | Pricing page renders all plan cards | |
| 13.5 | Changelog page shows v1.1.0 as the latest release | |
| 13.6 | Contact/WhatsApp link opens correctly | |
| 13.7 | No console errors on marketing home | |

---

## 14 — Post-Deploy Infra Checks

| # | Check | Result |
|---|-------|--------|
| 14.1 | Netlify deploy status: **Published** (not failed/building) | |
| 14.2 | Neon DB reachable (any dashboard page that loads data confirms this) | |
| 14.3 | Upstash Redis reachable (credit pill shows a number, not a skeleton) | |
| 14.4 | Resend sending (welcome or reset email received within 60 s) | |
| 14.5 | Cloudflare R2 reachable (document upload succeeds) | |
| 14.6 | Update `docs/netlify-budget.md` with deploy # and credit cost | |

---

## Sign-Off

| | |
|---|---|
| All critical checks passed? | ☐ Yes &nbsp; ☐ No — see failures above |
| Known failures deferred to next deploy? | ☐ Yes (link issue) &nbsp; ☐ No |
| Budget log updated? | ☐ Yes |
| Tester signature | |
