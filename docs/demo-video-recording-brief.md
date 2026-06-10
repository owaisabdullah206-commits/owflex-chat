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

Record these as **5 separate clips**:

| Clip file | What to capture | Pacing notes |
|---|---|---|
| `video/raw/admin-01-dashboard.mp4` | Land on the admin dashboard (bots list / overview). Sit still 2s, then move cursor toward "Create bot". | Establishing shot. Calm. |
| `video/raw/admin-02-create-form.mp4` | Click **Create bot** → the form opens. Type the bot name slowly. **Open the model dropdown** so the option **"Llama 3.3 70B"** (with its ⚡ Fast speed badge) is visible, then select it. | Type at human speed, not instant paste. Let the dropdown sit open 1.5s. Do NOT imply the model is "free" — "free" belongs to the pricing plan in the CTA, not the model. |
| `video/raw/admin-03-create-success.mp4` | Click the Sky-Teal **Create bot** button → success state / toast appears. | Hold on the success toast 2s. |
| `video/raw/admin-04-embed-copy.mp4` | Open the bot's **Embed** view so the `<script ... data-key="...">` code block is fully visible. Click the **Copy** button → "Copied!" state. | Hold on the full code block 2s before copying. This is the hero shot. |
| `video/raw/admin-05-widget-preview.mp4` | **Use the dashboard's built-in Live Preview** (the `preview · Auraline Cosmetics` panel — it runs the *real* `/embed.js` widget in a mini browser frame). Click the chat bubble → it opens → type one message → bot replies. | No external site needed — this is the genuine widget. I'll caption it "Live on any website." |

**Bot name to use:** **"Auraline Cosmetics"** (the featured bot the seed script links to the client portal).

> ⚠️ **Two bots, by design.** The *create* clips (`admin-02/03`) make a **fresh** bot to show the
> "build in 60s" story. Everything that needs real data — **embed, live preview, knowledge base,
> unanswered, guardrail** — must be recorded on the **already-seeded "Auraline Cosmetics"** bot (the
> one with documents, conversations, and leads). In the final edit these stitch into one smooth flow;
> viewers won't notice it's technically two bots. If a duplicate name in the list looks odd during the
> create clip, name the throwaway anything (e.g. "Test Bot") — I only need the create *motion*, not the name.

---

## FLOW A-2 — Admin: Smart Features (overview) (`admin.octively.com`)
*Maps to new Storyboard beats in Scene 2. Dark UI. Record on the **seeded** Auraline Cosmetics bot.*

These are quick **overview** shots — open the tab, let it sit, move on. Don't deep-dive each one.

| Clip file | What to capture | Pacing notes |
|---|---|---|
| `video/raw/admin-06-knowledge.mp4` | Open the bot's **Knowledge Base** tab — shows the 4 ready docs (3 files + 1 scraped URL, all "Ready" with chunk counts). Then **upload `Auraline-Cosmetics-Store-Guide.md`** live and let it process **Queued → Parsing → Ready**. | This is the RAG differentiator. Hold on the populated list 2s, then do the live upload. Upload on **production** admin (R2/QStash/Gemini must be live, or it stalls at Queued). |
| `video/raw/admin-07-unanswered.mp4` | Open the **Unanswered** tab — shows the **Q&A pairs**: each visitor question ("Asked") with the bot's "I don't know" reply ("Bot") and a View conversation link. Slow scroll 2-3 rows. | Proves the bot is honest (no hallucinating) and the tool keeps improving. Pause on a full pair 2s. |
| `video/raw/admin-08-guardrail.mp4` | Open the **Settings** tab — show the **"I don't know" guardrail toggle ON** ("Bot refuses questions outside its knowledge base"). Hover/pause on it. | Quick flash. Reassures SMBs the bot won't make things up. |

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

- [ ] Demo account seeded with realistic conversations + leads (✅ done — incl. KB docs, unanswered, guardrail)
- [ ] `docs/demo-assets/Auraline-Cosmetics-Store-Guide.md` handy for the live KB upload
- [ ] Browser cleaned (incognito, 100% zoom, maximized, notifications off)
- [ ] ScreenPal set to 1920×1080 @ 30fps, click-highlight on, mic OFF
- [ ] Flow A: 5 clips (`admin-01` … `admin-05`)
- [ ] Flow A-2: 3 clips (`admin-06` knowledge · `admin-07` unanswered · `admin-08` guardrail) — on the **seeded** bot
- [ ] Flow B: 4 clips (`portal-01` … `portal-04`)
- [ ] All clips exported as MP4 into `video/raw/`
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
