# Octively — 60-Second Demo Video Storyboard & Animation Plan

> **Status:** PLAN ONLY — awaiting approval before any Remotion code is written.
> **Format:** 16:9 landscape, 1920×1080, 30fps → 1800 frames total.
> **Audio:** AI voiceover (ElevenLabs) + light music bed + UI SFX.
> **Engine:** [Remotion](https://www.remotion.dev) (React → MP4), isolated in `/video`.
> **Source script:** `docs/Octively MVP Go-to-Market.md` → "The 60-second script".
> Last updated: 2026-05-31.

This document is the **planning phase** from the workflow: *analyze the script → plan the
animations → define the branding*. Approve it (or mark it up) and I'll move to the build phase.

> **🔄 PRODUCTION MODEL (UPDATED):** Hybrid. **You record real product footage** for Scenes 2 & 3
> (per `docs/demo-video-recording-brief.md`); **I build** Scene 1 (intro), Scene 4 (outro/CTA), and
> all captions, framing, zooms, transitions, VO + music in Remotion, then composite around your clips.
> Demo account = **Agency tier, seeded** (3–5 client bots; featured client ~589 convos / 47 leads).
> Scenes 2 & 3 below describe *what the footage shows* — the authoritative click-list is the recording brief.

---

## 1. Objective & Success Criteria

**One sentence:** A 60-second, premium, fully-animated product film that shows a freelancer
creating a bot on `admin.octively.com` and the client viewing leads on `app.octively.com`,
ending on the "free forever + PKR pricing" hook — rendered to a single 1080p MP4 that drops
into Product Hunt, LinkedIn, the landing page, and WhatsApp.

**Done when:**
- [ ] Single `octively-demo-1080p.mp4`, 16:9, ≈60s, < 25 MB (web-embeddable).
- [ ] Reads correctly **muted** (captions carry the message) AND with VO.
- [ ] Every frame uses only brand tokens — Sky-Teal `#0EA5E9`, Inter, JetBrains Mono (admin metrics only).
- [ ] Shows both surfaces authentically: admin = near-black, portal = off-white.
- [ ] No competitor names, no fake testimonials, no unshippable features on screen.

---

## 2. Constraints, Invariants, Non-Goals

**Invariants (from `DESIGN.md` / `CLAUDE.md`):**
- Accent is **Sky-Teal `#0EA5E9` only**. No indigo, no purple, no orange.
- **JetBrains Mono** appears ONLY on admin metrics / embed keys / model names. Never on portal scenes.
- Admin surface canvas `#0C0A09`; portal surface canvas `#FAFAFA`; marketing cream `#F5F1EC`.
- Inter for all UI/body text. Animated captions use Inter 600/700.
- Pricing shown must match live plans: Free (₨0, 1 bot, 200 convos), Starter **₨2,500 / $15**.
- Model shown on screen: the dropdown label **"Llama 3.3 70B"** (⚡ Fast badge) — the product's friendly label, NOT a raw `...:free` string. The model is never labeled "free"; "free" applies only to the Scene 4 pricing CTA.

**Constraints:**
- Remotion lives in `/video` with its **own `package.json`** — never added to the Next.js app deps (protects the build gate).
- ElevenLabs needs an API key (see §8 Risks) — VO is generated once, committed as an asset.
- WSL: install Remotion serially (no concurrent npm) to avoid `ENOTEMPTY`.

**Non-goals (v1):**
- No 9:16 vertical cut yet (16:9 master first; vertical is a later adapt).
- No mockup recreation of Scenes 2 & 3 — those use **your real screen recordings** (Scenes 1 & 4 stay 100% Remotion).
- No drag-and-drop builder shown (we don't build one — per CLAUDE.md).
- No Free-tier footage — demo account is **Agency tier**; "free forever" is sold in the CTA only.

---

## 3. Visual System ("Branding" phase)

A single cohesive **dark stage** ties all four scenes together (premium product-film feel,
à la Linear/Vercel launch videos). Product windows are recreated **authentically** per surface
and float on the stage, so each surface still reads as its real self.

| Element | Spec |
|---|---|
| **Stage background** | `#0C0A09` near-black with a faint Sky-Teal radial glow + 1px grid at 4% opacity, slow parallax drift |
| **Accent** | Sky-Teal `#0EA5E9`; glow/highlight `#38BDF8` (Sky 400) |
| **Product window chrome** | Rounded 16px "browser" frame, hairline border, subtle shadow, fake URL bar showing the real subdomain |
| **Admin window** | Authentic dark UI: canvas `#0C0A09`, surface `#171512`, ink `#F5F0EB`, JetBrains Mono metrics/keys |
| **Portal window** | Authentic light UI: canvas `#FAFAFA`, white cards, ink `#171717`, Inter Bold metrics (NO mono) |
| **Captions** | Inter 700, white `#F5F0EB`, key words highlighted in Sky-Teal; bottom-third, safe-margin 96px |
| **Logo** | Octively wordmark + Sky-Teal dot (use `public/brand/logo-horizontal-*` assets) |
| **Motion language** | Remotion `spring()` for entrances (damping ~12), `interpolate` for opacity/translate, ease-out; nothing linear; 0.3–0.5s beats |
| **Transitions** | Scene-to-scene via `@remotion/transitions` slide/fade, 15-frame (0.5s) wipes |

**Pinterest/reference moodboard to confirm:** "dark product launch video", "Linear release video",
"Vercel ship", "SaaS UI motion graphics". *(You can drop reference links here for me to match.)*

---

## 4. The Voiceover Script (ElevenLabs)

Tone: confident, plain, slightly conversational — a freelancer talking to peers. Voice suggestion:
ElevenLabs "Adam" or "Daniel" (calm male) or "Rachel" (warm female). ~150 words ≈ 60s at clear pace.

> **(S1)** "Every freelancer who builds AI chatbots hits the same wall. The bot works — but the
> client keeps asking: how many people chatted? What leads did we get? And you never have a clean answer."
>
> **(S2)** "So we built Octively. Create a chatbot in under a minute — name it, pick a model, done.
> Copy one embed line, paste it on any client site. That's the whole setup."
>
> **(S3)** "Then your client gets their own branded portal. They log in and see every conversation,
> every lead with a phone number, and export it all to CSV. No more support calls asking 'how's it going?'"
>
> **(S4)** "Octively. A white-label client portal for your chatbots. Free forever for your first bot.
> Just two-thousand-five-hundred rupees a month when you scale. Octively dot com."

**Workflow note (matches the transcript):** generate the VO **first**, measure each clip's exact
duration, then lock the scene frame ranges in §5 to the audio. The ranges below are the *target*;
final timing follows the rendered narration.

---

## 5. Shot-by-Shot Breakdown (30fps)

### SCENE 1 — The Problem · 0:00–0:11 (frames 0–330)

| Beat | Frames | On screen | Animation | VO/Caption |
|---|---|---|---|---|
| 1.1 | 0–45 | Black → Sky-Teal glow blooms; Octively dot pulses in center | Scale+fade `spring`, glow `interpolate` opacity 0→1 | (music in) |
| 1.2 | 45–150 | Caption: **"The bot works."** then below, faded: "…but the client keeps asking:" | Word-by-word fade-up, 4px translate | VO S1 (a) |
| 1.3 | 150–300 | Two chat-bubble questions float in: *"How many people chatted?"* / *"What leads did we get?"* | Bubbles slide from right, gentle bob | VO S1 (b) |
| 1.4 | 300–330 | Question mark / "no clean answer" — screen subtly desaturates | Quick fade, hold | VO S1 (c) |

**Goal:** name the pain in 10s. No product yet — pure tension.

---

### SCENE 2 — Build a Bot (admin.octively.com) · 0:11–0:31 (frames 330–930)

| Beat | Frames | On screen | Animation | VO/Caption |
|---|---|---|---|---|
| 2.1 | 330–375 | Dark admin window flies onto stage; URL bar types `admin.octively.com` | Window slide-up `spring`; URL typewriter | VO S2 (a) "So we built Octively." |
| 2.2 | 375–510 | "Create bot" form: cursor types bot name **"Auraline Cosmetics"**; model dropdown shows **"Llama 3.3 70B"** with its ⚡ Fast speed badge (product label, not a raw `:free` string) | Animated typing, dropdown open/close, Sky-Teal focus ring | VO S2 (b) "Create a chatbot in under a minute…" |
| 2.3 | 510–570 | Sky-Teal **"Create bot"** button press → success toast (✓ emerald) | Button depress, toast slide bottom-right | SFX click + success |
| 2.4 | 570–750 | Embed code block reveals: `<script src="https://cdn.octively.com/embed.js" data-key="ob_live_…"></script>` (JetBrains Mono, key in Sky 400) | Code lines stagger in; copy button → "Copied!" | VO S2 (c) "Copy one embed line…" |
| 2.5 | 750–870 | Dashboard **Live Preview** (real `/embed.js` widget in a browser-framed panel); chat bubble pops, opens, user message + bot reply. Caption: "Live on any website." | Widget `spring` pop; bubble bounce | VO S2 (d) "…paste it on any client site." |
| 2.6 | 870–930 | Caption stamp: **"Setup: under 60 seconds."** | Stamp scale-in | "That's the whole setup." |

**Goal:** show the developer's 60-second win. Embed key + model string in mono = technical credibility.

---

### SCENE 3 — The Client Portal (app.octively.com) · 0:31–0:46 (frames 930–1380)

| Beat | Frames | On screen | Animation | VO/Caption |
|---|---|---|---|---|
| 3.1 | 930–990 | Stage lightens; light portal window flies in; URL `app.octively.com` | Crossfade stage tint; window slide | VO S3 (a) "Then your client gets their own branded portal." |
| 3.2 | 990–1110 | Portal dashboard: 3 stat cards count up — **Customers 589 · Leads 47 · This week 12** (Inter Bold, NO mono) | Numbers count via `interpolate`; cards stagger | VO S3 (b) "They log in and see every conversation…" |
| 3.3 | 1110–1230 | Leads table fills row-by-row: name, phone, snippet, time; one row highlights | Rows stagger-in 6f apart; Sky-Teal row highlight | VO S3 (c) "…every lead with a phone number…" |
| 3.4 | 1230–1320 | **"Export CSV"** button press → file-download chip animates out | Button press; chip slide + check | VO S3 (d) "…and export it all to CSV." |
| 3.5 | 1320–1380 | Caption: **"No more 'how's it going?' calls."** | Fade-up | "No more support calls…" |

**Goal:** the white-label portal is the retainer justification. Friendly, plain, light surface, Inter Bold numbers.

---

### SCENE 4 — Brand & CTA · 0:46–1:00 (frames 1380–1800)

| Beat | Frames | On screen | Animation | VO/Caption |
|---|---|---|---|---|
| 4.1 | 1380–1440 | Both windows shrink + dock side-by-side, stage returns to near-black | Scale-down `spring`, reposition | (music swell) |
| 4.2 | 1440–1560 | Octively logo assembles center; tagline **"White-label client portal for your chatbots."** | Logo dot draws in; tagline fade-up | VO S4 (a) "Octively. A white-label client portal…" |
| 4.3 | 1560–1680 | Two pills: **"Free forever — first bot"** · **"₨2,500/mo to scale"** | Pills pop-in, slight bounce | VO S4 (b) "Free forever for your first bot. Just ₨2,500…" |
| 4.4 | 1680–1800 | **octively.com** URL + Sky-Teal underline sweep; logo holds; fade to brand glow | Underline `interpolate` width; final fade | VO S4 (c) "Octively dot com." (music out) |

**Goal:** brand recall + the two differentiators competitors can't match (permanent free + PKR price).

---

## 6. Asset List

| Asset | Source | Status |
|---|---|---|
| Octively logo (horizontal, light/teal/white) | `public/brand/logo-horizontal-*.png` | ✅ in repo |
| Inter font | `@remotion/google-fonts/Inter` | install with Remotion |
| JetBrains Mono | `@remotion/google-fonts/JetBrainsMono` | install with Remotion |
| Color tokens | §3 above + `DESIGN.md` | ✅ defined |
| Voiceover MP3 (4 clips or 1 track) | ElevenLabs — generate from §4 | ⬜ needs API key |
| Music bed (60s, subtle, royalty-free) | e.g. Pixabay/Uppbeat free track | ⬜ to pick |
| UI SFX (click, success, whoosh) | Free SFX pack | ⬜ to pick |

---

## 7. Build Plan (after approval)

1. `mkdir video && cd video` → `npx create-video@latest` (Blank template, TypeScript). **Isolated `package.json`.**
2. Add `@remotion/google-fonts`, `@remotion/transitions`, `@remotion/media-utils`.
3. Build reusable components: `<Stage>`, `<BrowserWindow>`, `<Caption>`, `<AdminMockup>`, `<PortalMockup>`, `<StatCard>`, `<LeadsTable>`, `<EmbedCode>`, `<CtaPills>`.
4. Compose 4 `<Sequence>` scenes in `<DemoVideo>` (1800 frames, 30fps, 1920×1080).
5. Generate ElevenLabs VO → drop in `video/public/audio/` → place with `<Audio>` → re-time scenes to narration.
6. Add music bed + SFX with volume ducking under VO.
7. Preview in Remotion Studio (`npm run dev` inside `/video`), iterate on timing.
8. Render: `npx remotion render DemoVideo out/octively-demo-1080p.mp4 --codec=h264`.
9. Compress if > 25 MB; deliver MP4 + a poster frame (thumbnail) for Product Hunt.

**Note:** `/video` will be added to `.gitignore` for `node_modules`/`out`, but the source + final MP4 committed.

---

## 8. Follow-ups & Risks

- ⚠️ **ElevenLabs API key required** for the VO scene. Options: (a) you provide a key and I generate + commit the MP3; (b) we ship a captions-only v1 now and add VO later; (c) you record VO yourself. **Need your call.**
- ⚠️ **Render time/memory on WSL** — Remotion spins headless Chrome; 1800 frames may take several minutes and RAM. Manageable, but the first render is the slow one.
- ⚠️ **Music/SFX licensing** — I'll only use clearly royalty-free sources; confirm you're OK self-hosting them in the repo.

---

## 9. Open Questions Before Build

1. Voice gender/style for ElevenLabs (Adam/Daniel calm-male vs Rachel warm-female)?
2. Any moodboard/reference links to match (else I default to the dark Linear/Vercel look in §3)?
3. Featured bot is **"Auraline Cosmetics"** (fictional cosmetics SMB); the other 4 seeded bots — Noor Dental Clinic, Mehfil Caterers, Bizpro Builders, ChaiWala Express — fill the admin list. Swap any name if you prefer.
4. Confirm the exact embed snippet format so the on-screen code matches production.
