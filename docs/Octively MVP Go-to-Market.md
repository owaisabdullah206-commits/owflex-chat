A living playbook for Octively's $0-budget go-to-market. Updated as tasks are completed. Last updated: 2026-06-07.

> **Strategy source:** `docs/octively-validation-and-distribution-plan.md` — the critic-driven plan this doc executes.

---

## ⭐ North-Star & Positioning

**North-star metric:** **3 freelancers paying within 30 days of starting outreach.** If that happens,
profitability becomes realistic. If it doesn't happen after dozens of real conversations and demos, the
bottleneck is the **market assumption — not the software.** Do not answer "no" by building more features.

**Positioning — sell the outcome, not the platform.** Use this line verbatim everywhere:

> **"Turn the clients you already have into ₨10,000–30,000/month AI chatbot retainers."**

Octively is "an AI-retainer business in a box." Lead every customer-facing message with the outcome and
this worked example — never with "cheaper than Stammer" (most PK freelancers have never heard of it;
competitor comparisons stay internal / on SEO alternative pages):

> A ₨50,000 website client → upsell an AI chatbot at ₨10,000/month → **₨120,000/year** new recurring
> revenue from a client you already have. Octively costs ₨2,500–₨7,500. Margin: 50–75%.

---

## Launch Status Overview

| Area | Status | Notes |
|------|--------|-------|
| Custom domain + subdomains | ✅ DONE | `octively.com`, `admin.octively.com`, `app.octively.com` live on Netlify |
| "Powered by Octively" | ✅ DONE | Free plan widget shows branding + link |
| Blog (8 posts) | ✅ DONE | See Phase 3 for full list |
| GA4 analytics | ⬜ TODO | Wire up conversion events + UTM tracking |
| Demo video | ⬜ TODO | 60-second screen recording of the full flow |
| Social media accounts | ⬜ TODO | LinkedIn, X, Facebook Page — none created yet |
| Facebook group outreach | ⬜ TODO | Blocked until demo video exists |
| 5 free beta testers | ⬜ TODO | Outreach starts after demo video is ready |
| Product Hunt listing | ⬜ TODO | Draft after 5 real users are onboarded |

---

## AI Skills Available (Use These — Don't Write From Scratch)

You have Claude Code skills that handle the heavy lifting for marketing content. Use them in every session before writing any copy manually.

| Skill | Trigger | What It Does |
|-------|---------|-------------|
| `/social-media-writer` | Before writing any LinkedIn, X, or Facebook post | Generates platform-native posts optimized for engagement; handles hashtags, tone, length |
| `/humanizer-main` | After any AI-generated copy | Removes AI writing patterns — inflated symbolism, em dash overuse, filler phrases, passive voice. Run every piece of content through this before publishing |
| `/brevo-email` | Before writing onboarding or upgrade emails | Builds transactional and marketing email sequences; integrates with your existing Brevo + Resend stack |
| `/claude-seo:seo-content` | After publishing a blog post | Reviews E-E-A-T signals, content depth, readability, AI citation readiness |
| `/claude-seo:seo-geo` | On the landing page | Optimizes for AI Overviews, ChatGPT, Perplexity citations — your "answer blocks" strategy |
| `/claude-seo:seo-cluster` | Before writing more blog posts | Semantic topic clustering so new posts don't cannibalize existing ones |

**Workflow for every piece of content:**
1. Draft with `/social-media-writer` or Claude directly
2. Run through `/humanizer-main` to strip AI fingerprints
3. Publish
4. Run `/claude-seo:seo-content` to catch gaps

---

## Claude Pro Routines — 5/Month Allocation

Routines run in Anthropic's cloud. Set them up at `claude.ai/code/routines` or via `/schedule` in Claude Code CLI. No laptop needed after setup.

| Routine | Schedule | Prompt |
|---------|----------|--------|
| **Competitor monitor** | Weekly, Monday 9am PKT | "Check Stammer.ai, ChatLab, and ConvoCore pricing pages and feature lists. Compare to Octively's current plans. Report any changes in pricing, new features added, or positioning shifts. Keep under 200 words." |
| **LinkedIn post draft** | Weekly, Tuesday 8am PKT | "Generate a founder-story LinkedIn post about Octively (white-label AI chatbot client portal for Pakistani freelancers). Angle: one insight from building or selling the product this week. 150-200 words, no hashtag spam, conversational tone." |
| **Facebook community post draft** | Weekly, Wednesday 9am PKT | "Draft a post for Pakistani freelancer Facebook groups (Pakistan Freelancers Network tone). Story-first format about adding AI chatbots as a client service. Do not sound like marketing copy. 100-150 words. End with a soft CTA." |
| **Lead follow-up drafter** | Daily, 9am PKT | "Draft a WhatsApp-style follow-up message for a new Octively signup. Personalized opening, ask one question about their current client work, offer to help set up their first bot. Under 80 words." |
| **Weekly GTM summary** | Weekly, Friday 5pm PKT | "Summarize this week's Octively GTM progress: signups, active bots, any community posts, any paid upgrades. Surface the single most important action for next week. Under 150 words." |

---

## 🚨 Still Blocking Launch: Do These First

> **Sequence corrected (per critic):** validation conversations + founder demos come BEFORE Product Hunt
> and before treating SEO as acquisition. Product Hunt is an *amplifier* gated behind 5 active users — not
> a first acquisition channel.

### 1. 30-Day Validation Sprint (Highest Priority)

Before any launch noise, **talk to 20 freelancers/agencies.** Goal: real signal, not assumptions.
Full detail in `docs/octively-validation-and-distribution-plan.md` §4.

Ask exactly these 4 questions:
1. Do you currently offer AI chatbots to clients?
2. Have any clients asked you for an AI chatbot?
3. How do you report chatbot leads/results to clients today?
4. Would you pay **₨2,500/month** for a tool that gives each client their own branded portal?

**Targets:** 20 conversations · 10 live demos · **first 3 paying customers.**
**Go signal:** ≥5 say "I'd use this today." **Stop/re-examine:** most say "my clients don't ask for chatbots."

### 2. Demo Video (Powers Your Founder Demos)

Use **ScreenPal** (free tier: unlimited clips, 15 min each — better than Loom's 5-min cap).

**The 60-second script:**
1. **0-10s:** "Every freelancer building AI chatbots has the same problem. The bot works, but the client keeps asking: 'How many people chatted? What leads did we get?'"
2. **10-30s:** Screen share of `admin.octively.com` → create a bot in 30 seconds → copy embed script.
3. **30-45s:** Switch to `app.octively.com` → show conversations list → leads table → "Export CSV."
4. **45-60s:** "Octively. White-label client portal for your chatbots. Free forever for your first bot. ₨2,500/month when you scale."

This video goes everywhere: Product Hunt first comment, LinkedIn posts, Facebook group posts, WhatsApp outreach, Indie Hackers milestones.

### 3. Social Media Accounts (2 Hours, Do Today)

Create all three at once. Same bio everywhere:
> "White-label AI chatbot client portal for freelancers & agencies. Free forever for your first bot. octively.com"

| Platform | Handle to claim | Priority | Why |
|----------|----------------|----------|-----|
| **LinkedIn Company Page** | Octively | High | Pakistani agencies are here; credibility for B2B |
| **X / Twitter** | @octively or @octively_ai | High | "Built with Claude Code" thread drives dev community + Indie Hackers traffic |
| **Facebook Page** | Octively | High | Required to post in Pakistani freelancer groups without getting flagged as personal spam |
| Instagram | Skip for now | Low | Your buyer is not here — GTM doc rule #5 |

**After creating accounts:** Connect all three to **Buffer free tier** (3 channels, 10 posts/channel) for scheduled posting. Use `/social-media-writer` to generate posts, `/humanizer-main` to clean them, then queue in Buffer.

### 4. GA4 + UTM Setup (30 Minutes)

Without this you cannot tell which Facebook group or LinkedIn post drives signups. Every link you share from now on must have UTM parameters.

```
?utm_source=facebook&utm_medium=community&utm_campaign=pk-freelancers
?utm_source=linkedin&utm_medium=social&utm_campaign=founder-story
?utm_source=x&utm_medium=social&utm_campaign=build-thread
?utm_source=producthunt&utm_medium=launch&utm_campaign=2026-ph-launch
?utm_source=whatsapp&utm_medium=direct&utm_campaign=outreach
```

GA4 conversion events to wire up:
- `signup_complete` — when a user finishes registration
- `bot_created` — first bot created (activation event)
- `client_invited` — first client portal invite sent
- `plan_upgraded` — paid plan activated

---

## Distribution Engines (Committed)

No paid ads until ₨100k–200k MRR. **Distribution is the bottleneck, not engineering.** Next-60-day time split:

| Activity | % |
|---|---|
| Talking to agencies/freelancers | 35% |
| Content (build-in-public) | 25% |
| Demos & onboarding | 20% |
| Partnerships | 15% |
| Coding new features | **5%** |

Four engines, sequenced by bandwidth (full detail: `docs/octively-validation-and-distribution-plan.md` §5):

- **Engine A — Build-in-public (LinkedIn + X), week 1.** 3 pillars: building Octively / AI-freelancer
  economy / Claude Code dev. 2–3 posts/week via `/social-media-writer` → `/humanizer-main` → Buffer. *(maps to: Buffer TODO)*
- **Engine B — PK communities + founder DMs, week 1.** FB groups + WhatsApp + a personal WhatsApp to
  every signup. Story-first, never "Try Octively." The 20 validation interviews live here. *(maps to: FB group outreach TODO)*
- **Engine C — Partnerships + productized funnel, week 3.** ~20 agencies on 20% recurring commission;
  a "done-for-you chatbot setup" offer (₨15k, Octively underneath) as a higher-converting on-ramp. *(maps to: referral/partnership loop)*
- **Engine D — Free tools + case studies, once customer #1 exists.** Free AI-Retainer ROI Calculator
  (ranks + collects emails) and a before/after case study of customer #1. *(see Free Tools Funnel + Case Study Machine below)*

---

## Phase 0 — Pre-Launch Checklist (Current Week)

- [x] Custom domain live
- [x] "Powered by Octively" on free plan widget
- [ ] ScreenPal demo video recorded and uploaded
- [x] Social media accounts created (LinkedIn @octively, X @octivelyai, Facebook @octively, Instagram @getoctively)
- [x] Cover images + DPs uploaded to all platforms
- [ ] Buffer connected to all four accounts
- [x] GA4 installed + conversion events wired (signup_complete, bot_created, client_invited, plan_upgraded)
- [x] UTM capture live (localStorage persistence, attached to all GA4 events)
- [ ] 5 Claude routines set up at `claude.ai/code/routines`

---

## Phase 1 — Pakistani Community Blitz (Weeks 1-2)

Your first 10 customers come from Pakistani freelancer communities, not Product Hunt.

### The Story-First Post Template

Do not post like a marketer. Post like a freelancer sharing a side project. Run every draft through `/humanizer-main` before posting.

> "A client paid me ₨50,000 for a website. Last month I added one thing and now they pay me ₨10,000 every month on top — that's ₨120,000 a year from a client I already had.
>
> The thing was an AI chatbot on their site. The hard part was never the bot — it was the client asking 'how many people chatted? what leads did we get?' and me having no clean answer.
>
> So I built Octively: each client logs into their own branded dashboard to see conversations, leads, and stats. No coding on their side.
>
> [Demo video link]
>
> If you build websites, do SEO, or run social for clients — this is a new ₨10k–30k/month service you can add to clients you already have, without learning AI.
>
> Looking for 5 freelancers to try it free for 2 weeks. DM me."

### Where to Post (In Order)

| Platform | Specific Groups | Frequency |
|----------|----------------|-----------|
| **Facebook** | Pakistan Freelancers Network, Upwork Pakistan, Software Engineers Pakistan, AI & Automation Pakistan, Digital Agencies Pakistan (Karachi/Lahore), WordPress Pakistan | 1 group every 2 days |
| **WhatsApp** | "Web Developers Lahore," "Digital Marketing Karachi," "Freelancers Islamabad" — get invites from your network | Share demo video directly |
| **LinkedIn** | Personal post (not company page). Tag 3 freelancer contacts. `#pakistanfreelancers` `#digitalmarketingpakistan` | 2x per week |
| **X / Twitter** | Thread: "How I built a SaaS in 2 weeks with Claude Code" → screenshots → link | 1 thread |

Use `/social-media-writer` to adapt the template per platform tone. Always run the output through `/humanizer-main`.

### The "5 Free Testers" Tactic

- Offer exactly 5 spots — scarcity qualifies prospects
- After 2 weeks ask: "Has this been useful for your client conversations?"
- Convert to Starter (₨2,500) or Pro (₨7,500) based on usage
- Customers 6-10: Founding Member pricing at ₨1,500/month for life — creates urgency and ambassadors

---

## Phase 2 — Product Hunt Launch (Weeks 3-4)

Do NOT launch until 5 real users are active. Empty products get roasted.

> **Framing (per critic):** Product Hunt is an **amplifier, not a first acquisition channel.** PH visitors
> test tools and rarely become long-term B2B retainer customers — your first 20 customers come from the
> Validation Sprint + Engines A–C. Launch PH *after* validation, to amplify proof you already have.

### Pre-Launch Checklist

- [ ] Create draft listing — Tagline: "White-label AI chatbot client portal for freelancers"
- [ ] Thumbnail: 240x240px, Sky-Teal `#0EA5E9` background, white text "AI Chatbots + Client Portal" — use Canva free
- [ ] Gallery (3 screenshots): admin dashboard (dark), client portal (leads table), pricing page (PKR pricing)
- [ ] First comment: embed demo video + "Product Hunt exclusive: 50% off Agency plan for first 10 signups" — code `PHLAUNCH50`
- [ ] Self-hunt is fine in 2026. Algorithm no longer penalizes it.
- [ ] Add geo-detected banner: "🇵🇰 Pakistani freelancer? Pay in PKR. 🌍 International? Pay in USD via Lemon Squeezy."

### Launch Day (12:01 AM PST = ~10 AM Pakistan time)

- Post exactly at 12:01 AM PST
- First 2 hours: message 20 closest contacts personally — ask them to **comment** (not just upvote — comments drive ranking)
- Engage every comment within 5 minutes
- Cross-post to Indie Hackers, LinkedIn, X simultaneously

### Realistic Expectations

- Top 5 Product of the Day: 800-1,200 visitors, 80-180 signups, 4-14 paid customers
- If #1: 3,000-5,000 visitors, 20-30 paid conversions
- PKR pricing will confuse international visitors — geo-banner is mandatory

---

## Phase 3 — Content & SEO Engine (Month 2)

> **Reality check (per critic):** a new domain has no authority vs Chatbase/Botpress/Stammer. Treat SEO
> as a **6–12 month compounding bet, NOT an immediate acquisition channel.** Target higher-intent
> long-tail tied to the *outcome* (what to charge, how to sell), not head terms like "white label ai chatbot."

### Blog Posts — Status

You cannot outspend Stammer.ai ($3M content budget). You out-niche them.

| Post | Target Keyword | Status |
|------|---------------|--------|
| Stammer.ai alternative comparison | `stammer.ai alternative` | ✅ Published May 29 |
| ConvoCore alternative comparison | `convocore alternative` | ✅ Published May 30 |
| ChatLab alternative comparison | `chatlab alternative` | ✅ Published May 30 |
| White-label AI chatbot pricing 2026 | `white label chatbot cost` | ✅ Published May 29 |
| AI chatbot for lead generation | `ai chatbot lead generation small business` | ✅ Published May 30 |
| How to give clients their own chatbot dashboard | `white label chatbot client portal` | ✅ Published May 30 |
| How to embed chatbot on any website | `embed ai chatbot wordpress webflow shopify` | ✅ Published May 30 |
| How to add chatbot to client projects as a freelancer | `ai chatbot for freelancers` | ✅ Published May 29 |

**8 posts published. Core content engine is live.**

### Next Blog Posts to Write (Month 2)

Use `/claude-seo:seo-cluster` before writing these to avoid keyword cannibalization with existing posts.

| Post | Target Keyword | Priority |
|------|---------------|----------|
| "Free white-label chatbot platform: what the free tier actually includes" | `free white label chatbot` | High — nobody covers permanent free tier |
| "Chatbot retainer pricing: what to charge your clients in 2026" | `ai chatbot retainer pricing` | High — targets your buyer's exact problem |
| "How to train an AI chatbot on your client's website" | `train chatbot on website` | Medium |
| "Best AI chatbot for Pakistani websites and businesses" | `ai chatbot pakistan` | Medium — local SEO |
| "How to charge clients for AI chatbots (freelancer guide)" | `how to charge clients for ai chatbots` | High — outcome-led, high intent |
| "AI chatbot retainer pricing: what to charge in 2026" | `ai chatbot retainer pricing` | High — buyer's exact question |
| "AI chatbot for WordPress agencies: add it as a service" | `ai chatbot for wordpress agencies` | Medium — buyer-segment intent |

### AI Search Optimization (GEO)

Add 140-160 word "answer blocks" to the landing page for these questions. Use `/claude-seo:seo-geo` to audit and optimize.

- "What is a white label AI chatbot platform?"
- "What is the cheapest white label chatbot platform for agencies?"
- "What AI chatbot platforms have a free plan for agencies?"

This captures ChatGPT/Perplexity traffic where users ask questions rather than type keywords.

---

## Phase 4 — Referral & Partnership Loop (Month 2-3)

### Manual Referral System

Every paying customer gets this message within 3 days of upgrading. Draft with `/brevo-email` then run through `/humanizer-main`.

> "Hey [Name], thanks for joining Octively.
>
> Quick question — do you know any other freelancer or agency owner who manages client websites? I'm giving ₨500 credit to you and ₨500 to anyone you refer when they upgrade.
>
> Just reply with their name and WhatsApp number and I'll reach out personally."

Automate only after 50 customers.

### Partnership Outreach

Target freelancers who offer adjacent services (not competing):
- **Web designers** → 20% lifetime commission on referred clients
- **SEO consultants** → same commission; their traffic clients need chatbots
- **Social media managers** → can resell Octively as "AI customer support"

Pitch: "Add ₨10,000/month in pure margin to every client you already have. I handle the tech, you handle the relationship."

---

## Free Tier as the Viral Engine

| Tactic | Status | Notes |
|--------|--------|-------|
| "Powered by Octively" on free widget | ✅ Done | Links back to homepage — free advertising on every client site |
| Usage limit email at 75% (150 convos) | ⬜ TODO | Wire via Brevo — use `/brevo-email` skill |
| CSV export gate (view free, export paid) | ⬜ Verify | Confirm gate is enforced in the portal |
| "Free Forever" language (never "trial") | Check marketing copy | Trials create pressure; free tiers create loyalty |

---

## Free Tools Funnel & Case Study Machine (Engine D)

Slower to start, strongest long-term assets. Begin once customer #1 exists.

**Free Tools Funnel** — build a free **AI-Retainer ROI Calculator** (input: # clients, retainer price,
tool cost → output: monthly/yearly margin). It ranks on Google, gets shared on LinkedIn, and collects
emails. A chatbot/retainer pricing calculator is the same idea. *(Backlog spec — not built yet; see plan doc §9.)*

**Case Study Machine** — document customer #1 end-to-end: before/after, leads captured, conversations,
revenue the chatbot generated for their client. People trust case studies more than feature lists —
this becomes your single strongest sales asset and feeds every other channel.

---

## Free Tool Stack

### Already Have — Use These

| Tool | Use For |
|------|---------|
| Claude Pro + Claude Code | All strategy, copy, code — primary workhorse |
| `/social-media-writer` skill | Platform-native social post generation |
| `/humanizer-main` skill | Strip AI fingerprints from every piece of content |
| `/brevo-email` skill | Onboarding sequences, upgrade nudges, referral messages |
| Brevo (in stack) | 300 emails/day free — transactional + marketing |
| Resend (in stack) | Transactional email |
| Google Analytics 4 | Traffic + conversion tracking — set up now |

### Add Now (Free)

| Tool | What For | Free Limit |
|------|---------|------------|
| **Buffer** | Schedule posts to LinkedIn + X + Facebook Page | 3 channels, 10 posts/channel |
| **Canva** | Product Hunt thumbnail, social graphics, cover images | Generous free tier |
| **ScreenPal** | Demo video recording | Unlimited clips, 15 min each |
| **NotebookLM** | Upload competitor pages + your docs for research | Fully free, unlimited |
| **Mixpanel** | Activation funnel (signup → bot created → client invited) | Free tier |

### Free Tiers Worth Activating

| Tool | What For |
|------|---------|
| Zapier free (100 tasks/month) | PayFast webhook → Slack DM on upgrade |
| Zoho Social free | Alt to Buffer — 1 brand across 7 channels |
| Adobe Express free | Firefly AI for graphics, product screenshots |

---

## Metrics to Track

| Metric | Tool | Target |
|--------|------|--------|
| Website visitors | GA4 | 500/month by Month 2 |
| Signups | GA4 `signup_complete` event | 10% of visitors |
| Activation (first bot created) | GA4 `bot_created` event | 60% of signups |
| Free → Paid | PayFast + Lemon Squeezy dashboards | 5-8% by Month 3 |
| Traffic by source | UTM parameters | Know which channel drives most signups |
| Product Hunt rank | Manual | Top 5 = success |

---

### Monthly Monitoring Dashboard (5 Risk Lenses)

Track these every month. **Any metric degrading 2–3 months straight = the real emerging problem** —
usually long before revenue visibly drops.

| Lens | Metrics |
|---|---|
| **Market** | Demos booked · agencies/freelancers interviewed · paying customers |
| **Product** | Activation rate (signup → bot created) · free→paid % |
| **Financial** | Revenue · AI cost · **gross margin (target ≥ 70%)** |
| **Competitive** | New competitor features · pricing changes |
| **Distribution** | Traffic by channel · CAC · conversion by channel |

---

## 90-Day Timeline — Updated

| Week | Action | Status |
|------|--------|--------|
| **Pre-launch** | Custom domain + subdomains | ✅ Done |
| **Pre-launch** | "Powered by Octively" widget | ✅ Done |
| **Pre-launch** | 8 blog posts published | ✅ Done |
| **This week** | Record demo video (ScreenPal) | ⬜ |
| **This week** | Create LinkedIn, X, Facebook accounts | ⬜ |
| **This week** | Connect Buffer, queue first 10 posts | ⬜ |
| **This week** | Set up GA4 + wire conversion events | ✅ Done |
| **This week** | UTM capture + session attribution | ✅ Done |
| **This week** | Set up 5 Claude routines | ⬜ |
| **Week 2** | Post in 3 Pakistani Facebook groups | ⬜ |
| **Week 2** | DM 10 freelancers personally | ⬜ |
| **Week 2** | Recruit 5 free testers | ⬜ |
| **Week 3** | Onboard testers personally via WhatsApp | ⬜ |
| **Week 3** | Convert testers to Founding Member pricing | ⬜ |
| **Week 3** | Draft Product Hunt listing | ⬜ |
| **Week 4** | Product Hunt launch (12:01 AM PST) | ⬜ |
| **Month 2** | 4 more blog posts (see Phase 3 table) | ⬜ |
| **Month 2** | Outreach to 10 web designers/SEO consultants | ⬜ |
| **Month 2** | Wire usage-limit email via Brevo | ⬜ |
| **Month 3** | Analyze UTM data. Double down on best channel. | ⬜ |
| **Month 3** | Target: 10 paying customers (₨25,000-50,000 MRR) | ⬜ |

---

## Product Hunt Exclusive Offer

> **"Product Hunt Special: 50% off Agency plan for 3 months + free credit top-up"**
>
> Code: `PHLAUNCH50`
>
> Agency plan at $39.50 (half of $79) undercuts Stammer.ai's $197 by 80%.

---

## What NOT to Do

1. **Don't launch Product Hunt before 5 real users.** Empty products get roasted.
2. **Don't post in Pakistani groups more than once per week per group.** You will be banned.
3. **Don't offer lifetime deals.** Product Hunt users will ask. Say no. LTDs kill MRR.
4. **Don't build a visual flow builder before 100 customers.** Stay disciplined.
5. **Don't spend time on TikTok/Instagram.** Your buyer is on Facebook, WhatsApp, and LinkedIn.
6. **Don't publish content without running it through `/humanizer-main`.** AI-sounding copy hurts credibility with Pakistani freelancers who know what Claude-generated text reads like.

---

## Your Next 48 Hours

1. **Today:** Create LinkedIn + X + Facebook Page accounts. Claim handles. Write bio.
2. **Today:** Connect Buffer. Queue the first 3 social posts (use `/social-media-writer` + `/humanizer-main`).
3. **Today:** Set up GA4 on `octively.com` — install tag, wire the 4 conversion events.
4. **Tomorrow:** Record 60-second demo video with ScreenPal.
5. **Day 2:** Post in "Pakistan Freelancers Network" Facebook group with the demo video link.
6. **Day 2:** DM 10 freelancers you personally know with the demo video. Personal outreach converts 5x better than group posts.
