# Octively Demo — Screen Recording Brief (Shot List)

> **For:** Owais, recording with ScreenPal.
> **Goal:** Capture clean real-product footage of the two flows so it drops straight
> into the Remotion edit (`docs/demo-video-storyboard.md`) with zero re-takes.
> **You record:** 2 flows as short discrete clips. **I build:** intro, outro, captions,
> zooms, transitions, VO + music, and composite into the final 1080p MP4.

⚠️ **Why discrete clips?** I can't scrub through video frame-by-frame. If you give me
**one short clip per beat** (named exactly as below), I can sequence and time everything
deterministically. One long take would force guesswork. Short clips = clean edit.

---

## 0. Before You Hit Record (Prerequisites)

**A. Seed a dedicated Agency-tier demo account.** ✅ DECIDED: use a **dedicated demo account on the
Agency plan** (not Free, not your real account). Agency = unlimited bots + white-label + no upgrade
nags, so the footage stays clean and shows the full retainer story. The "free forever" message lives
in the closing CTA, not in the footage. Seed it so nothing looks empty:

- **Admin side (Flow A):** **5 client bots** with fictional SMB names — featured **"Auraline Cosmetics"**
  plus "Noor Dental Clinic", "Mehfil Caterers", "Bizpro Builders", "ChaiWala Express". Each shows an
  Active status + some metrics. The seed creates all 5; **"Auraline Cosmetics"** is the featured one.
- **Portal side (Flow B):** the **featured bot ("Auraline Cosmetics")** seeded with **~589 conversations** and
  **~47 captured leads** (real-looking PK names + phone numbers + timestamps spread over recent weeks),
  so the stat cards read 589 / 47 / 12 and the leads table is full.
- No "limit reached" / upgrade banners should be visible anywhere (Agency tier prevents these).
- ⚠️ If seeding by hand is painful, **point me at a seed script** (or `lib/db`) and I'll help write one
  to populate conversations + leads for the demo account. Empty tables kill the demo.

**B. Clean the browser:**
- Use a fresh Chrome profile or Incognito — **no bookmarks bar, no extensions icons, no other tabs.**
- Set browser zoom to **100%**. Window **maximized**.
- Hide OS notifications (Focus Assist / Do Not Disturb ON).
- Light/dark: admin records in its **dark** default; portal records in its **light** default. Don't toggle.

**C. ScreenPal settings:**
- Recording size: **1920×1080** (or 2560×1440 and I downscale — sharper text). Pick one and keep it for BOTH flows.
- Frame rate: **30fps**.
- **Cursor click-highlight: ON** (subtle) — helps viewers follow; I won't track the cursor myself.
- Capture the **browser window only** (consistent crop), not the whole desktop with taskbar.
- **No microphone / no narration** — VO is added later. Record silent.
- Move the mouse **slowly and deliberately.** Pause ~2 seconds on every key screen so I have room to hold/zoom.

**D. Padding:** Start each clip ~1s before the action and end ~1s after. Extra handles = safer cuts.

**E. File handoff:** Export each clip as MP4, drop into `video/raw/` using the exact names below.

---

## FLOW A — Admin: Build a Bot (`admin.octively.com`)
*Maps to Storyboard Scene 2. Dark UI.*

> ⚠️ **Two bots — read before recording.**
> **Noor Dental** = the bot you create live. All of clips 2–6 stay on it (create → upload KB → embed → preview).
> **Auraline Cosmetics** = the seeded bot. Used only for clips 7–8 (Unanswered + Guardrail) and the portal.
>
> **Recording order matters for clip 5 (live preview):** record clip 4 (KB upload) first and wait for
> the doc to reach **Ready** status before recording clip 5. The bot needs the knowledge loaded so it
> gives a real answer during the chat demo.

Record these as **8 separate clips** (5 admin + 3 smart-features):

| Clip file | What to capture | Which bot | Pacing notes |
|---|---|---|---|
| `video/raw/admin-01-dashboard.mp4` | Land on the admin dashboard — all 5 seeded bots visible. Sit still 2s, move cursor toward **Create bot**. | — (overview) | Establishing shot. Calm. |
| `video/raw/admin-02-create-form.mp4` | Click **Create bot** → form opens. Type **"Noor Dental"** slowly. Open the model dropdown so **"Llama 3.3 70B"** with ⚡ badge is visible, then select it. | **Noor Dental** | Type at human speed. Dropdown open 1.5s. Do NOT imply the model is "free". |
| `video/raw/admin-03-create-success.mp4` | Click the Sky-Teal **Create bot** button → success toast appears. | **Noor Dental** | Hold on the toast 2s. |
| `video/raw/admin-04-knowledge.mp4` | Open **Noor Dental's Knowledge Base** tab (empty after creation). **Upload `Noor-Dental-Clinic-Guide.md`** and let it process **Queued → Parsing → Ready**. | **Noor Dental** | RAG differentiator. Hold on Queued 1s, then on Ready 2s. **Record this before clip 5** so the bot has knowledge loaded for the chat. Upload on production (R2 + QStash + Gemini must be live). |
| `video/raw/admin-05-embed-copy.mp4` | Open **Noor Dental's Embed** tab — the full `<script ... data-key="...">` code block is visible. Click **Copy** → "Copied!" state. | **Noor Dental** | Hold on the code block 2s before copying. This is the hero shot. |
| `video/raw/admin-06-widget-preview.mp4` | Use **Noor Dental's built-in Live Preview** panel. Click the chat bubble → it opens → type one message about dental services → bot replies using the uploaded guide. | **Noor Dental** | Bot should answer from the KB (e.g. ask about a service or price). Pause on the reply 2s. I'll caption it "Live on any website." |
| `video/raw/admin-07-unanswered.mp4` | **Switch to "Auraline Cosmetics".** Open its **Unanswered** tab — shows Q&A pairs: visitor question ("Asked") + bot reply ("Bot") + View link. Slow scroll 2–3 rows. | **Auraline Cosmetics** | Proves the bot is honest and the improvement loop works. Pause on a full pair 2s. |
| `video/raw/admin-08-guardrail.mp4` | Still on **Auraline Cosmetics**. Open **Settings** tab — show the **"I don't know" guardrail toggle ON**. Hover and pause. | **Auraline Cosmetics** | Quick flash ~3s. Reassures SMBs the bot won't hallucinate. |

---

## FLOW B — Client Portal: Leads & Export (`app.octively.com`)
*Maps to Storyboard Scene 3. Light UI.*

Record these as **4 separate clips**:

| Clip file | What to capture | Pacing notes |
|---|---|---|
| `video/raw/portal-01-dashboard.mp4` | Portal landing after login: the **stat cards** (Customers / Leads / This week) and welcome header. Sit still 2.5s. | Let the numbers breathe — I may animate a count-up over a freeze frame. |
| `video/raw/portal-02-conversations.mp4` | Navigate to **Conversations**; scroll the list slowly so a few real chats are visible. Open one conversation. | Slow scroll. Pause on an open conversation 2s. |
| `video/raw/portal-03-leads-table.mp4` | Navigate to **Leads**; show the table with names, phone numbers, timestamps. Slow scroll through a few rows. | This proves the value. Pause on the full table 2s. |
| `video/raw/portal-04-export-csv.mp4` | Click **Export CSV** → the download happens (show the browser download chip if visible). | Hold on the click + download 2s. |

---

## Recording Order Checklist

- [ ] Demo account seeded (✅ done — Auraline has conversations, leads, unanswered, guardrail)
- [ ] `docs/demo-assets/Noor-Dental-Clinic-Guide.md` ready to upload (admin-04)
- [ ] Browser cleaned (incognito, 100% zoom, maximised, notifications off)
- [ ] Windows Game Bar ready: `Win+Alt+R` to start/stop · 1080p / 30fps · mic OFF
- [ ] **Noor Dental** clips — record in this order: `admin-02` → `admin-03` → `admin-04` (wait for Ready) → `admin-05` → `admin-06`
- [ ] **Auraline** clips: `admin-01` (dashboard overview) · `admin-07` (unanswered) · `admin-08` (guardrail)
- [ ] **Portal** clips (log in as Auraline client): `portal-01` … `portal-04`
- [ ] All 12 clips renamed and dropped into `video/raw/`
- [ ] Tell me when they're in — I start the Remotion build

---

## What I Build Around Your Clips

- **Scene 1 (intro / problem hook)** — 100% Remotion, no footage needed.
- **Scenes 2 & 3** — your clips, framed in a branded browser window on the dark stage, with
  animated captions, gentle zoom/punch-ins on hero moments, and Sky-Teal highlights.
- **Scene 4 (brand + CTA)** — 100% Remotion.
- **Transitions** between every clip, **ElevenLabs VO**, music bed, and UI SFX.

If a clip is missing or unusable, I'll bridge that beat with a motion-graphic caption so the
video still works — just flag anything you couldn't capture.
