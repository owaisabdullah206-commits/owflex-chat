# Octively SaaS Master Plan v1.0
## "White-Label AI Chatbot Builder for Freelancers & Agencies"

**Date:** May 2026 (originally OwFlex v7, rebranded to Octively)
**Status:** Phase 1 Shipped — Phase 2 Active
**Developer:** Solo (Owais Abdullah) + Claude Code
**Methodology:** Spec-Driven Development (SDD)
**Architecture:** Neon + Netlify → Hetzner Self-Hosted (Phase 3+)
**Primary Market:** Pakistani Freelancers & Digital Agencies → International

---

## Why v7 Exists: Lessons from v6

v6 was over-engineered before a single user existed. The plan grew into a sovereign,
ONNX-powered, multi-tenant, RabbitMQ-queued platform — a funded startup architecture
for a solo side project. v7 fixes that with one rule:

> **Ship the smallest thing a Pakistani agency owner will pay ₨2,000/month for. Then grow.**

**What killed v6 momentum:**
- Phase 1 required 6+ components before "Hello World"
- ONNX (500MB model) added unnecessary complexity at MVP stage
- DACA planetary-scale thinking polluted MVP scope
- No single shippable unit in under 2 weeks

---

## 1. The Product — One Sentence

A white-label AI chatbot builder for freelancers and agencies: build AI chatbots in a
visual no-code dashboard, deploy to any client website with one embed script, and give
each SMB client their own branded portal to view conversations, leads, and analytics.

**Octively has two sides:** the developer dashboard (`admin.octively.com`) where
freelancers and agencies build and manage bots, and the client portal (`app.octively.com`)
where their SMB clients log in and self-serve — without calling the developer every time.

**Primary market:** Pakistani freelancers and digital agencies (PKR pricing, affordable
plans). **Goal:** International expansion (USD pricing via Lemon Squeezy already live).

**Competitive advantage:** Stammer.ai ($197/mo), ConvoCore ($220/mo), and ChatLab
($360/mo) are expensive, USD-only, and don't target freelancers. Octively's Agency plan
at ₨20,000/month ($79) is 60–80% cheaper with a comparable feature set, a permanent
free tier, and flat pricing with no per-seat fees.

---

## 2. Target Customers

**Primary — Freelance Developer / Web Designer (Pakistan)**
Builds websites or chatbots for Pakistani SMB clients. Has 2–8 active client sites.
Uses Octively to build AI chatbots for each client, deploy them with one embed script,
and charge a monthly retainer. The client portal means zero "what are my leads?" calls.

**Secondary — Small Digital Agency (2–10 people, Pakistan → International)**
Offers AI chatbots as a managed service. Needs white-label client portals at an
affordable flat rate — no per-seat fees, no $200+/mo surprise bills.

**Also — Individual Developers / Solo Builders**
A single developer building their own product, portfolio site, or a bot for one client.
The Free plan (₨0, 1 bot, 200 convos/month) and Starter plan (₨2,500/$15) serve this
audience. No agency or white-label features required — just build a bot, deploy it, see
conversations and leads. These users are a real segment, not an afterthought.

**Future — International Freelancers & Agencies**
Same use cases, USD pricing. The go-to platform for affordable white-label AI chatbots
outside Pakistan once traction is established locally.

**End user (not a buyer) — The SMB Client**
Once the developer sets it up, the SMB owner logs into their own branded portal to
review leads, read conversations, and check analytics. They cannot create or modify bots
— that power stays with the developer.

---

## 3. Competitive Landscape (May 2026)

| Platform | White Label | Target | Price | Critical Gap |
|----------|-------------|--------|-------|--------------|
| Chatbase | $199/mo addon | Non-technical SMBs building own bots | $19–$499/mo | No custom-code dev support |
| Botpress | Enterprise only | Dev teams at companies | $495/mo Plus | Too complex, USD only |
| BotPenguin | Agency plan | Agencies | Custom | Forces their builder |
| Botsify | Yes | Agencies | $49–$149/mo | Their infrastructure |
| Tidio | $2,999/mo | Enterprise support | Very high | Wrong market |
| Stammer.ai | Yes | US/EU agencies | $497/mo | No PKR, no local market |
| Social Intents | Agency plan | SMBs | $99–$299/mo | Teams/Slack focused |
| FastBots | Reseller plan | Agencies | ~$40/client | Their infrastructure |

**The gap nobody fills:** A developer builds a custom chatbot in Next.js + any LLM.
There is zero tool to give that developer's SMB client a professional management
dashboard. Every existing platform requires building ON their platform. OwFlex
requires nothing — just one embed script.

---

## 4. Feature Matrix

> Plan-based feature gating (updated May 2026). See Section 8 for pricing and Section 25 for widget branding details.

| Feature | Free | Starter | Pro | Agency | Enterprise |
|---------|:----:|:-------:|:---:|:------:|:----------:|
| **Bots** | 1 | 2 | 8 | Unlimited | Unlimited |
| **Conversations/mo** | 200 | 3,000 | 15,000 | 75,000 | Custom |
| **Credits included/mo** | 2M | 30M | 150M | 750M | Custom |
| **Addon credit top-ups** | ❌ | ✅ | ✅ | ✅ better rate | ✅ best rate |
| **Leads/mo** | 15 | ∞ | ∞ | ∞ | ∞ |
| **Storage (docs only)** | None | 25 MB | 100 MB | 500 MB | Custom |
| **Conversation history** | 7 days | 30 days | Unlimited | Unlimited | Unlimited |
| **AI model selection** | Flash only (hidden) | Budget tier | Mid-range | All tiers | All tiers |
| **Analytics** | Basic counts | Basic counts | Advanced + flagged | Full | Full |
| **"Powered by OwFlex" on widget** | Forced ON | ON (can turn off) | ON (can turn off) | Custom or OFF | Custom or OFF |
| **Custom branding text + URL** | ❌ | ❌ | ❌ | ✅ | ✅ |
| **White-label portal login** | ❌ | ❌ | ❌ | ✅ | ✅ |
| **Separate client portal** (`app.octively.com`) | ✅ | ✅ | ✅ | ✅ white-label | ✅ white-label |
| **Full widget customization** | Color only | ✅ Full | ✅ Full | ✅ Full | ✅ Full |
| **Lead capture on/off control** | ❌ | ✅ | ✅ | ✅ | ✅ |
| **Strict mode** | ❌ | ✅ | ✅ | ✅ | ✅ |
| **Trigger tooltip** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Unanswered questions list** | ❌ | ❌ | ✅ | ✅ | ✅ |
| **Weekly email digest (Phase 2)** | ❌ | ❌ | ✅ | ✅ | ✅ |
| **Document upload — PDF (Phase 3)** | ❌ | ❌ | ✅ | ✅ | ✅ |
| **Website scraping — Firecrawl (Phase 3)** | ❌ | ❌ | ✅ | ✅ | ✅ |
| **Smart model routing (Phase 3)** | ❌ | ❌ | ✅ | ✅ | ✅ |
| **Sub-tenant management (Phase 3)** | ❌ | ❌ | ❌ | ✅ | ✅ |
| **Per-bot resource allocation (Phase 3)** | ❌ | ❌ | ❌ | ✅ | ✅ |
| **Custom client portal subdomain (Phase 3)** | ❌ | ❌ | ❌ | ✅ | ✅ |
| **Human handoff / escalation (Phase 3)** | ❌ | ❌ | ✅ | ✅ | ✅ |
| **API access (Phase 4)** | ❌ | ❌ | ❌ | ✅ | ✅ |
| **Webhook integrations — Zapier/n8n (Phase 4)** | ❌ | ❌ | ❌ | ✅ | ✅ |
| **Audit log viewer (Phase 4)** | ❌ | ❌ | ❌ | ✅ | ✅ |
| **BYOK — bring your own LLM key (Phase 4)** | ❌ | ❌ | ❌ | ❌ | ✅ |
| **WordPress plugin** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Support** | Community | Email | Priority email | Dedicated | Dedicated + SLA |

> Storage = R2 document storage only. Conversation history limits are time-based retention policies (PostgreSQL), not storage bytes.

**Permanently out of scope:** Visual flow builder, social media channels, voice/audio, built-in CRM, prompt A/B testing.

> **Phase 4 addition:** Each bot will have a creation mode — **Chatbot** (current default) or **AI Agent** (tool-calling mode). See Section 26 for the full agentic AI roadmap.

---

## 5. Tech Stack (Final — No More Debates)

| Component | Choice | Rejected + Why |
|-----------|--------|----------------|
| Frontend | Next.js 15 (App Router) + TypeScript | Remix (unfamiliar) |
| UI | shadcn/ui + Tailwind CSS | MUI (opinionated), Chakra (slow) |
| Chat Widget | assistant-ui (MIT) | ChatKit (OpenAI lock-in) |
| Auth | BetterAuth | Clerk ($25/mo scale), NextAuth (weaker multi-tenant) |
| ORM | Drizzle ORM | Prisma (heavy migrations) |
| Database | Neon PostgreSQL (free) → Hetzner Postgres | Supabase (tier limits) |
| Vector Search | pgvector on Neon/Postgres | Pinecone ($70/mo) |
| Embeddings P1–2 | Jina AI jina-embeddings-v5-text-small (1M tokens/day free) | OpenAI (costs immediately) |
| Embeddings P3+ | Local BGE-M3 ONNX on Hetzner | Keep API (cost scales) |
| LLM Gateway | LiteLLM (all models, one interface) | Direct API calls (no portability) |
| Cache + Credits | Upstash Redis (free) → Self-hosted Redis | Railway (15-min timeout) |
| Email | Resend (free 3K/mo) | SendGrid (complex), Mailgun (old) |
| Payments PKR | PayFast | Stripe (needs LLC) |
| Payments USD | Lemon Squeezy | Paddle (expensive) |
| Frontend Host | Netlify (free, commercial OK) | Vercel (no commercial free) |
| Backend Host | Hugging Face Spaces (free) → Hetzner | Render/Railway (sleeps fast) |
| VPS | Hetzner CX33 @ $8.59/mo | DigitalOcean ($12), AWS (complex) |
| Orchestration | Dokploy on Hetzner | Coolify (less stable) |
| Object Storage | Cloudflare R2 (free 10GB) | AWS S3 (egress costs) |
| Backups | Backblaze B2 @ €0.20/mo | AWS Glacier (complex) |
| Schema Validation | Zod | Yup (less TypeScript-native) |
| Monitoring | Sentry (free 5K errors/mo) | Datadog (expensive) |
| Uptime | UptimeRobot (free) | Pingdom (paid) |
| Task Queue P3+ | BullMQ on Redis | RabbitMQ (overkill), Celery (Python) |

---

## 6. AI Models (May 2026 Pricing)

All calls go through **LiteLLM**. One interface, all providers. Swap models in one
config line. Users select model from dashboard dropdown.

### Tier 0 — Free (MVP actual default — $0/month)

| Model | Input / Output per 1M | Context | Notes |
|-------|----------------------|---------|-------|
| **LLaMA 3.3 70B** | **$0 / $0** | **131K** | **Current OwFlex default — free via OpenRouter** |

`meta-llama/llama-3.3-70b-instruct:free` on OpenRouter. 70B parameters, multilingual,
outperforms many paid models on benchmarks. Free tier has rate limits (suitable for MVP
scale). When free quota is exhausted per-request, falls back to Tier 1 automatically.

### Tier 1 — Ultra Budget (Starter plan default, paid)

| Model | Input / Output per 1M | Context | Notes |
|-------|----------------------|---------|-------|
| Gemini 2.5 Flash-Lite | $0.10 / $0.40 | 1M | Cheapest capable model |
| **DeepSeek V4 Flash** | $0.14 / $0.28 | 1M | **Paid fallback default** |
| GPT-5 nano | $0.05 / $0.40 | 128K | Simple routing/classification only |

DeepSeek V4 Flash cache-hit pricing: $0.0028/M input. Repeated system prompts
cost nearly nothing. At 70% cache hit rate, real cost is ~$0.05/M effective.

### Tier 2 — Budget (Pro plan default)

| Model | Input / Output per 1M | Context | Notes |
|-------|----------------------|---------|-------|
| Gemini 2.5 Flash | $0.30 / $1.50 | 1M | Good multimodal support |
| Grok 4 Fast | $0.20 / $0.50 | 2M | Best value for long context |
| GPT-5 mini | $0.25 / $2.00 | 128K | OpenAI ecosystem preference |
| DeepSeek V4 Pro | $0.435 / $0.87 | 1M | Best reasoning/cost on promo |

### Tier 3 — Mid-Range (Agency default, credits required)

| Model | Input / Output per 1M | Context | Notes |
|-------|----------------------|---------|-------|
| Claude Haiku 4.5 | $1.00 / $5.00 | 200K | Strong reasoning, safe output |
| Gemini 3.1 Pro | $2.00 / $12.00 | 2M | Best flagship value |
| GPT-5.4 | $2.50 / $10.00 | 400K | Reliable tool calling |

### Tier 4 — Premium (Credits only, all plans)

| Model | Input / Output per 1M | Context | Notes |
|-------|----------------------|---------|-------|
| Claude Sonnet 4.6 | $3.00 / $15.00 | 1M | Best code + long reasoning |
| GPT-5.2 | $1.75 / $14.00 | 128K | OpenAI flagship |
| Claude Opus 4.6 | $5.00 / $25.00 | 200K | Most demanding tasks only |

### Smart Auto-Routing (Phase 3 feature)

```
Message type detection (cheap model classifies first):
├── Simple FAQ / greeting      → DeepSeek V4 Flash ($0.14/M)
├── Knowledge base retrieval   → Gemini 2.5 Flash ($0.30/M)
└── Complex reasoning / code   → Claude Sonnet 4.6 ($3.00/M) [credits]
```

Saves 60–80% of LLM costs without users noticing quality difference.

---

## 7. Credits System Design

### The Model (Industry Standard, Proven)

Subscription plans include a **monthly token allowance** for default-tier models.
Premium models or overages beyond the allowance require **credits** — a prepaid
balance the user buys in advance. Credits never expire. No auto-renewal.

### Why This Works

- Aligns your cost with their usage (you never absorb surprise costs)
- Lets agencies offer premium bots to high-value clients without upgrading the
  entire plan
- Familiar UX — every AI company does this (OpenAI, Anthropic, etc.)
- In Pakistan: PayFast handles one-time top-ups cleanly, no recurring headache

### Credit Pricing (Your Markup)

You buy at API cost. You sell at 3–4x markup. That spread is pure margin.

| Model | Raw API Cost/1M | OwFlex Credit Price/1M | Your Margin |
|-------|----------------|----------------------|-------------|
| DeepSeek V4 Flash | $0.14 input | Included in plan | N/A |
| GPT-5 mini | $0.25 input | $0.80 / 1M | 220% |
| Claude Haiku 4.5 | $1.00 input | $3.00 / 1M | 200% |
| Claude Sonnet 4.6 | $3.00 input | $9.00 / 1M | 200% |
| GPT-5.4 | $2.50 input | $7.50 / 1M | 200% |
| Claude Opus 4.6 | $5.00 input | $15.00 / 1M | 200% |

**Credit packages (PKR + USD):**

| Package | PKR | USD | Credits Value |
|---------|-----|-----|--------------|
| Starter Pack | ₨1,000 | $4 | $4 in credits |
| Standard Pack | ₨2,500 | $9 | $10 in credits (+11% bonus) |
| Power Pack | ₨5,000 | $18 | $22 in credits (+22% bonus) |
| Agency Pack | ₨10,000 | $36 | $50 in credits (+39% bonus) |

Bonus credits on larger packs incentivize buying more upfront.

### How Credits Work Technically

**Critical rule: Debit credits BEFORE making the API call. Refund on failure.**

```typescript
// lib/credits.ts — Redis-first credit system

async function consumeCredits(
  orgId: string,
  model: string,
  estimatedTokens: number
): Promise<boolean> {
  const cost = calculateCreditCost(model, estimatedTokens);
  
  // Atomic Redis DECRBY — fail fast if insufficient balance
  const remaining = await redis.decrby(`credits:${orgId}`, cost);
  
  if (remaining < 0) {
    // Rollback immediately
    await redis.incrby(`credits:${orgId}`, cost);
    return false; // Caller shows "insufficient credits" message
  }
  
  // Async write to Postgres (non-blocking)
  db.insert(creditLedger).values({
    orgId,
    amount: -cost,
    model,
    reason: 'message'
  }).catch(console.error);
  
  return true;
}
```

**Schema additions for Phase 2:**

```sql
-- Credit balance (source of truth: Redis, Postgres as ledger)
CREATE TABLE credit_balances (
  org_id     UUID PRIMARY KEY REFERENCES organizations(id),
  balance    BIGINT NOT NULL DEFAULT 0,  -- in micro-credits (1 credit = 1000)
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Full audit ledger
CREATE TABLE credit_ledger (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id     UUID REFERENCES organizations(id),
  amount     BIGINT NOT NULL,  -- positive = top-up, negative = usage
  model      VARCHAR(100),
  reason     VARCHAR(50),  -- 'topup', 'message', 'refund'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Top-up purchases
CREATE TABLE credit_purchases (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id         UUID REFERENCES organizations(id),
  amount_usd     DECIMAL(10,2),
  amount_pkr     DECIMAL(10,2),
  credits_granted BIGINT,
  payment_ref    VARCHAR(255),  -- PayFast/Lemon Squeezy transaction ID
  created_at     TIMESTAMPTZ DEFAULT NOW()
);
```

### Handling "Out of Credits" Gracefully

Never break the chatbot. User experience degrades gracefully:

```
Premium model selected, credits depleted:
1. Bot falls back to plan's default model silently
2. Client dashboard shows soft warning banner
3. Developer gets email: "Bot X fell back to default model — top up credits"
4. Bot continues working (never shows error to end-user)
```

---

## 8. Pricing Strategy

### Pakistan-First, Dual Currency

Landing page shows PKR and USD columns. Pakistani clients pay affordable local PKR; international clients pay a premium USD rate above the raw conversion (₨279 = $1). Promotional launch pricing is shown on the landing page — full prices will apply after launch period (duration undisclosed).

| Plan | PKR/mo (promo) | USD/mo (promo) | Full PKR | Full USD |
|------|---------------|---------------|---------|---------|
| **Free** | ₨0 | $0 | ₨0 | $0 |
| **Starter** | ₨2,500 | $15 | ₨3,500 | $19 |
| **Pro** | ₨7,500 | $29 | ₨9,000 | $39 |
| **Agency** | ₨20,000 | $79 | ₨22,000 | $99 |
| **Enterprise** | Custom | Custom | Custom | Custom |

Annual discount: 2 months free (pay 10, get 12).

### Why These Numbers Hold

**Against key competitors (BotPenguin, Stammer, Crisp):**
- Agency at $79 USD = 20% below BotPenguin King ($99), while offering white-label per-client branding that BotPenguin doesn't have
- Stammer Agency = $197 — OwFlex Agency is 60% cheaper with a comparable feature set
- Starter at ₨2,500 = low enough to be an impulse buy for a developer with their first client

**Pakistani market:**
- ₨2,500 Starter ≈ 5-10% of a small freelance project fee — no-brainer upgrade once the free branding embarrasses you in front of a client
- ₨20,000 Agency ≈ 1 hour of a Pakistani agency's client retainer (₨50-200k/mo) — agencies pay without negotiation
- Agency has unlimited bots — the only constraint is 75K conversations/mo, which most agencies won't hit

### Channel Conflict Resolution

Agencies worry: "If OwFlex prices are public, my client will bypass me."

This is solved at the architecture level:
1. **Developer-only bot creation** — SMBs get `app.octively.com` portal access, not bot creation access. They CANNOT self-serve.
2. **Agency white-label** — at Agency plan, "Powered by OwFlex" disappears from every widget. Client sees "Powered by [Agency]". The agency is the product.
3. **Plan segmentation** — Free/Starter/Pro max out at 2 or 8 bots. An agency serving 10+ clients cannot use Pro. The plans are different products.
4. **Agency value = setup + support + strategy**, not the $79 license. Even if a client finds OwFlex, they still need someone to build, integrate, and maintain their bot.

### Profitability at Scale

**Month 3 — 40 Starter + 15 Pro + 5 Agency (PKR):**
```
Subscriptions: (40 × ₨2,500) + (15 × ₨7,500) + (5 × ₨20,000) = ₨312,500 ≈ $1,120/mo
Addon credits: est. 20% of users top up → +₨30,000/mo
LLM cost:      Variable — depends on model mix:
               All Flash ($0.20/M avg): ~$43/mo (99% margin)
               30% Claude Sonnet ($9/M avg): ~$613/mo (84% margin)
Note:          Users on expensive models burn credits faster and buy more addons → MORE revenue, not less.
```

**Month 6 — 80 Starter + 40 Pro + 20 Agency (PKR):**
```
Subscriptions: (80 × ₨2,500) + (40 × ₨7,500) + (20 × ₨20,000) = ₨900,000 ≈ $3,226/mo
Addon credits: +₨80,000/mo
International USD (est. 10% of users): +$400-800/mo at premium USD pricing
```

### Credit Top-Up Pricing (Addon Packs)

| Plan | Per 1M tokens | Notes |
|------|-------------|-------|
| Starter | ₨550 / $2.00 | Standard |
| Pro | ₨500 / $1.80 | Slight discount |
| Agency | ₨400 / $1.43 | Better rate |
| Enterprise | ₨300 / $1.08 | Best rate |

Model credit cost rates are set per-model in the admin model prices table (Phase 2). Expensive models consume more credits per token — users see a clean credits table, never raw LLM pricing.

---

## 8a. SEO Strategy

### Target Audience for SEO

- **Primary:** Freelancers who add AI chatbots as a recurring service to client projects (web designers, digital marketers, consultants)
- **Secondary:** Small/mid digital agencies (2–20 people) managing chatbots for multiple SMB clients
- **Geography:** Pakistan-first for PKR traffic; English globally for USD traffic

### Competitive Positioning in Search

| Competitor | Price | SEO dominance | Our angle |
|-----------|-------|--------------|-----------|
| Stammer.ai | $197/mo | "white label AI agents for agencies" | Too expensive for freelancers/small agencies |
| ConvoCore | $220/mo | "white label AI chatbot platform agencies" | No free tier, USD-only |
| ChatLab | $360/mo | "white label client portal chatbot" | Expensive, no flexible model |
| Social Intents | $299/mo | "AI chatbot agency platform" | No free LLM, USD-only |
| BotPenguin | $1,200/yr | "developer-friendly white label" | Annual billing, limited AI quality |

**Our SEO angles where we can win:**
1. **Affordable** — only platform with a genuinely free tier and PKR pricing
2. **Client portal first-class** — each SMB client gets their own branded login; competitors treat this as an add-on
3. **Flat, affordable plans** — no per-seat fees; predictable cost as agencies add clients
4. **Freelancer-specific** — no competitor targets freelancers adding chatbots to client projects; this SERP is wide open

### Primary Keywords (one per page)

| Page | Primary Keyword | Competition |
|------|----------------|-------------|
| `/` | `white label AI chatbot platform` | High — differentiate on free tier + client portal |
| `/for-agencies` | `white label chatbot for agencies` | High — differentiate on affordability |
| `/for-freelancers` | `AI chatbot platform for freelancers` | Low — wide open SERP |
| `/guide` | `how to embed AI chatbot on website` | Medium — step-by-step content gap |
| `/pricing` | `affordable white label chatbot pricing` | Low — no one owns this angle |
| `/about` | `AI chatbot company for agencies` | Very low |

### Secondary Keywords (use in headings and body copy)

```
AI chatbot with client portal
white label chatbot with lead management
no-code AI chatbot builder for agencies
AI chatbot embed script for client websites
white label chatbot free plan
free tier AI chatbot agency platform
chatbot conversation history for clients
multi-client chatbot management platform
AI chatbot knowledge base
affordable chatbot platform for agencies
```

### High-Intent Long-Tail Keywords

```
affordable stammer.ai alternative
cheap white label chatbot for agencies
free white label chatbot platform
AI chatbot platform for small agencies
easy AI chatbot builder for agencies
chatbot platform no coding required
AI chatbot platform where clients can login
give clients their own chatbot dashboard
```

### Keywords to AVOID

```
❌ "chatbot" alone — too generic
❌ "AI agent platform" — dominated by Salesforce/Microsoft/Google
❌ "chatbot for customer service" — dominated by Intercom/Zendesk/Drift
❌ "GoHighLevel alternative" — completely different product
❌ "white label chatbot" alone — dominated by Stammer ($3M+ content budget)
```

### AI Search / GEO (Question-Format)

Landing pages should have 140–160 word self-contained answer blocks for:
- "What is a white label AI chatbot platform?"
- "What is the cheapest white label chatbot platform for agencies?"
- "What AI chatbot platforms have a free plan for agencies?"
- "What is the best AI chatbot tool for freelancers?"

### Phase 2 Blog Content Gaps

| URL | Target keyword | Priority |
|-----|---------------|----------|
| `/blog/stammer-alternative` | `stammer.ai alternative` | High |
| `/blog/affordable-white-label-chatbot` | `affordable white label chatbot` | High |
| `/blog/ai-chatbot-for-freelancers` | `AI chatbot for freelance web designers` | High |
| `/blog/free-white-label-chatbot` | `free white label AI chatbot` | Medium |
| `/blog/chatbot-client-portal` | `chatbot with client portal for clients` | Medium |

### Technical SEO Foundation (Phase 1)

- `metadataBase` in `app/layout.tsx` — critical, currently missing
- Twitter cards + per-page `openGraph` on all 6 marketing pages
- `public/llms.txt` — AI agent discovery index
- `components/shared/SchemaOrg.tsx` — JSON-LD renderer
- Schema types: `Organization`, `SoftwareApplication` (pricing page), `FAQPage` (guide page), `WebSite` with `SearchAction`

### Tools

- **Claude SEO plugin** — `/plugin marketplace add AgriciDaniel/claude-seo` → run after each deploy
- **Google API (free Tier 0)** — PageSpeed Insights + CrUX field data; no paid tools needed at this stage

---

## 9. Infrastructure — Zero to Scale

### Phase 1–2: Free Stack (€0/month)

| Service | Free Limit | Use |
|---------|-----------|-----|
| Netlify | 100GB BW, commercial OK | Frontend hosting |
| Hugging Face Spaces | 2 CPU, 16GB, 48hr idle | Backend API (Phase 2+) |
| Neon PostgreSQL | 500MB, pgvector included | Database |
| Upstash Redis | 500K commands/mo, 256MB | Credits + rate limiting |
| Cloudflare R2 | 10GB storage | File uploads |
| Resend | 3,000 emails/mo | Transactional email |
| Jina AI Embeddings API | 1M tokens/day (~40 docs) | Document embeddings |
| Sentry | 5K errors/mo | Error tracking |
| UptimeRobot | 50 monitors | Uptime alerts |

### Phase 3–4: Hetzner Migration (€4/month)

Triggered when: Redis overage > $3/month OR > 15 active paying developers OR Jina quota hit multiple times/week.

| Service | Cost | Notes |
|---------|------|-------|
| Hetzner CX33 | $8.59/mo | 4 vCPU, 8GB RAM, 80GB SSD |
| Backblaze B2 | $0.20/mo | 10GB automated backups |
| Cloudflare R2 | $0 | Stays on free tier |
| Resend | $0–$20 | Upgrade only if >3K emails/mo |
| **Total** | **~$9/mo** | ~₨2,500/month |

**Migration steps (automated):**
```bash
# 1. pg_dump from Neon
pg_dump $NEON_DATABASE_URL > backup_$(date +%Y%m%d).sql

# 2. Restore to Hetzner Postgres (via Dokploy Docker)
pg_restore -d $HETZNER_DATABASE_URL backup_$(date +%Y%m%d).sql

# 3. Switch env var — zero code change needed
DATABASE_URL=postgresql://user:pass@hetzner-ip:5432/owflex

# 4. Verify, then point DNS
```

### Portability (No Vendor Lock-in)

All config via environment variables. Entire stack is swappable:

```env
DATABASE_URL=           # Neon → Hetzner → any Postgres
REDIS_URL=              # Upstash → self-hosted Redis
STORAGE_URL=            # R2 → S3-compatible anything
BACKEND_URL=            # HF Spaces → Hetzner FastAPI
LITELLM_DEFAULT_MODEL=  # Change default LLM in one line
```

---

## 10. Database Schema (Complete — All Phases)

```sql
-- ============================================
-- PHASE 1: CORE TABLES
-- ============================================

CREATE TABLE users (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email       VARCHAR(255) UNIQUE NOT NULL,
  role        VARCHAR(20) NOT NULL CHECK (role IN ('admin','developer','client')),
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE organizations (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id        UUID REFERENCES users(id) ON DELETE CASCADE,
  name            VARCHAR(255) NOT NULL,
  plan            VARCHAR(20) DEFAULT 'free',
  plan_expires_at TIMESTAMPTZ,
  monthly_messages_used INT DEFAULT 0,
  monthly_reset_at TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE bots (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id          UUID REFERENCES organizations(id) ON DELETE CASCADE,
  client_user_id  UUID REFERENCES users(id),  -- the SMB client login
  name            VARCHAR(255) NOT NULL,
  system_prompt   TEXT,
  model           VARCHAR(100) DEFAULT 'deepseek/deepseek-v4-flash',
  widget_config   JSONB DEFAULT '{}',
  embed_key       VARCHAR(64) UNIQUE NOT NULL,
  is_active       BOOLEAN DEFAULT true,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE conversations (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bot_id      UUID REFERENCES bots(id) ON DELETE CASCADE,
  session_id  VARCHAR(100) NOT NULL,
  page_url    TEXT,
  started_at  TIMESTAMPTZ DEFAULT NOW(),
  ended_at    TIMESTAMPTZ
);

CREATE TABLE messages (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  role            VARCHAR(10) CHECK (role IN ('user','assistant')),
  content         TEXT NOT NULL,
  tokens_used     INT DEFAULT 0,
  model_used      VARCHAR(100),
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE leads (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bot_id          UUID REFERENCES bots(id) ON DELETE CASCADE,
  conversation_id UUID REFERENCES conversations(id),
  name            VARCHAR(255),
  email           VARCHAR(255),
  phone           VARCHAR(50),
  notes           TEXT,
  captured_at     TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- PHASE 2: CREDITS + BILLING TABLES
-- ============================================

CREATE TABLE credit_balances (
  org_id     UUID PRIMARY KEY REFERENCES organizations(id),
  balance    BIGINT NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE credit_ledger (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id     UUID REFERENCES organizations(id),
  amount     BIGINT NOT NULL,
  model      VARCHAR(100),
  reason     VARCHAR(50) CHECK (reason IN ('topup','message','refund','bonus')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE subscriptions (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id       UUID REFERENCES organizations(id),
  plan         VARCHAR(20) NOT NULL,
  status       VARCHAR(20) DEFAULT 'active',
  payment_ref  VARCHAR(255),
  starts_at    TIMESTAMPTZ,
  expires_at   TIMESTAMPTZ,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- PHASE 2: KNOWLEDGE BASE
-- ============================================

CREATE TABLE knowledge_entries (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bot_id     UUID REFERENCES bots(id) ON DELETE CASCADE,
  type       VARCHAR(20) CHECK (type IN ('faq','document','url')),
  question   TEXT,
  answer     TEXT,
  source_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- pgvector extension for semantic search
CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE document_chunks (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bot_id     UUID REFERENCES bots(id) ON DELETE CASCADE,
  content    TEXT NOT NULL,
  embedding  vector(768),
  source     VARCHAR(255),
  chunk_idx  INT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_chunks_embedding ON document_chunks
  USING ivfflat (embedding vector_cosine_ops);

-- ============================================
-- PHASE 3: AGENCY / MULTI-TENANT TABLES
-- ============================================

CREATE TABLE agency_clients (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id   UUID REFERENCES organizations(id),
  client_name VARCHAR(255) NOT NULL,
  client_email VARCHAR(255),
  plan_limits JSONB DEFAULT '{}',
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE audit_logs (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id     UUID REFERENCES organizations(id),
  user_id    UUID REFERENCES users(id),
  action     VARCHAR(100),
  target     JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Key indexes
CREATE INDEX idx_conversations_bot_id ON conversations(bot_id);
CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_leads_bot_id ON leads(bot_id);
CREATE INDEX idx_bots_embed_key ON bots(embed_key);
CREATE INDEX idx_credit_ledger_org_id ON credit_ledger(org_id);
```

---

## 11. Privacy & Data Security

**Core selling point for Pakistan:** "Your clients' data is under your control."

### Data Principles

1. **Tenant isolation:** Every query scoped to `bot_id` + `org_id`. Enforced at
   the ORM layer via Drizzle — no raw SQL that could miss the filter.

2. **No AI training on user data:** Messages go to LLM for response generation
   only. Never stored in any provider's training pipeline. Stated clearly in ToS.

3. **LLM data minimization:** Only the user's message + retrieved context chunks
   go to the model. No PII in system prompts unless explicitly written by the bot owner.

4. **Lead data protection:** Stored encrypted at rest. Exportable by client as
   CSV anytime. Deleted on plan cancellation after 30-day grace period.

5. **Conversation retention:** Configurable. Free: 7 days. Starter: 30 days.
   Pro/Agency: Unlimited. Auto-deleted via nightly cron after retention window.

6. **Credits audit trail:** Every credit debit is logged with model, timestamp,
   and tokens used. Clients can audit their spend at any time.

### Encryption

| Layer | Method |
|-------|--------|
| Database at rest | Neon/Postgres built-in encryption |
| File uploads | AES-256 via Cloudflare R2 |
| Passwords | bcrypt (cost factor 12) via BetterAuth |
| Embed API keys | Stored as SHA-256 hash, transmitted as JWT |
| Environment secrets | Dokploy secrets manager, never in code |
| Transit | TLS 1.3 enforced, Caddy on Hetzner |

### GDPR-Ready Hooks (Built from Day 1)

```typescript
// Even if not enforced yet — the endpoints exist
DELETE /api/v1/admin/data/purge?org_id=xxx   // Full tenant wipe
DELETE /api/v1/admin/data/conversation/:id   // Single conversation
GET    /api/v1/admin/data/export?org_id=xxx  // Full data export (JSON)
```

---

## 12. Disaster Recovery

### Backup Strategy (3-2-1)

- **3 copies:** Live DB, daily pg_dump to B2, weekly pg_dump to local drive
- **2 media:** Cloud (B2) + local
- **1 offsite:** B2 is always offsite

**Backup script (runs nightly via cron on Hetzner):**

```bash
#!/bin/bash
# /opt/scripts/backup.sh
DATE=$(date +%Y%m%d_%H%M)
BACKUP_FILE="owflex_${DATE}.sql.gz"

# Dump and compress
pg_dump $DATABASE_URL | gzip > /tmp/$BACKUP_FILE

# Upload to B2
b2 upload-file owflex-backups /tmp/$BACKUP_FILE backups/$BACKUP_FILE

# Alert if DB size > 400MB (approaching Neon limit)
DB_SIZE=$(psql $DATABASE_URL -t -c "SELECT pg_database_size(current_database())")
if [ $DB_SIZE -gt 419430400 ]; then
  curl -X POST $RESEND_ALERT_WEBHOOK \
    -d '{"subject":"OwFlex DB Alert","body":"DB approaching 400MB limit"}'
fi

rm /tmp/$BACKUP_FILE
```

### Recovery Scenarios

**Neon outage (Phase 1–2):** Neon auto-replicates. RTO: ~5 min, no action.

**Hetzner VPS down (Phase 3+):**
1. Spin new Hetzner VPS → 5 min
2. Install Dokploy, restore Docker stack → 15 min
3. Restore latest pg_dump from B2 → 10 min
4. Update Cloudflare DNS A record → 5 min propagation
Total RTO: < 40 minutes

**Accidental data deletion:**
B2 versioning enabled. Restore specific version. RTO: < 30 min.

**Corrupted data:**
1. Set maintenance_mode = true in Redis (all API routes return 503)
2. Restore previous day's B2 backup
3. Replay missing writes from application logs
Total RTO: < 2 hours

---

## 13. Implementation Roadmap — SDD Phases

### How We Build with Claude Code

Following the Panaversity SDD methodology exactly:

```
1. Write CLAUDE.md (Project Constitution) — governs every session
2. Write spec file for the phase — before any code
3. Feed spec to Claude Code: "Read /specs/phase-X.md, then implement"
4. Each task is atomic — one feature, one commit
5. No vibe coding — never say "build me X" without a spec first
```

**Key SDD prompt patterns for this project:**

| When | Prompt Pattern |
|------|---------------|
| Starting a phase | "Read CLAUDE.md and /specs/phase-X.md. Ask me any clarifying questions before writing code." |
| New feature | "Write the spec for [feature] in /specs/[name].md before implementing it." |
| Complex logic | "Spin up a subagent to research the best way to implement [credits/auth/etc] in our stack." |
| Review | "Review the current implementation against /specs/phase-X.md. List what's missing." |
| Stuck | "Read CLAUDE.md. What are we NOT supposed to build? Does this task violate that?" |

---

### CLAUDE.md — Project Constitution

```markdown
# OwFlex — CLAUDE.md (Project Constitution)
# READ THIS BEFORE EVERY SESSION. DO NOT SKIP.

## What We're Building
A white-label client dashboard layer for custom AI chatbots.
Developers add our embed script to their existing chatbot.
Their SMB clients get a login to view conversations and leads.
We are NOT a chatbot builder. We are the management layer.

## Subdomain Architecture (Critical)
Three subdomains. Three surfaces. Three layout components.

octively.com          → /app/(marketing)/layout.tsx  — marketing site
admin.octively.com    → /app/(dashboard)/layout.tsx  — developer dashboard
app.octively.com      → /app/(portal)/layout.tsx     — client portal

Before building ANY UI, confirm which subdomain you are building for.
Apply the correct layout and token set. Never mix surfaces.

## Current Phase
<!-- UPDATE THIS EACH PHASE -->
Phase 1: MVP Dashboard

## Stack (Non-Negotiable — Do Not Suggest Alternatives)
- Frontend: Next.js 15 App Router, TypeScript strict mode
- Styling: Tailwind CSS + shadcn/ui components
- Auth: BetterAuth (email/password + Google, two roles: developer / client)
- ORM: Drizzle ORM (never write raw SQL in application code)
- DB: Neon PostgreSQL (pgvector extension enabled)
- LLM Gateway: LiteLLM — default model: meta-llama/llama-3.3-70b-instruct:free (free via OpenRouter)
- Cache / Credits: Upstash Redis
- Email: Resend (transactional) + Brevo (marketing digests)
- Validation: Zod on ALL API routes, no exceptions
- Payments: PayFast (PKR) + Lemon Squeezy (USD)

## Design System (Non-Negotiable)
Primary accent: Sky-Teal #0EA5E9 — used on all three surfaces.
NOT indigo. NOT purple. Sky-Teal only.

Surface token prefixes:
  mkt-*  → octively.com (marketing, cream canvas #F5F1EC)
  adm-*  → admin.octively.com (dashboard, near-black canvas #0C0A09)
  prt-*  → app.octively.com (portal, off-white canvas #FAFAFA)

JetBrains Mono rule: admin.octively.com ONLY.
  - ALL metric numbers → JetBrains Mono
  - ALL embed keys, API keys → JetBrains Mono
  - ALL model name displays → JetBrains Mono
  - NEVER use JetBrains Mono on app.octively.com (portal)

Read DESIGN.md before building any UI component.
Read it fresh — do not rely on memory from previous sessions.

## File Structure
/app/(marketing)        octively.com pages and layout
/app/(dashboard)        admin.octively.com pages and layout
/app/(portal)           app.octively.com pages and layout
/app/api/v1             All API routes (versioned)
/components/marketing   Marketing-specific components (mkt-*)
/components/dashboard   Dashboard-specific components (adm-*)
/components/portal      Portal-specific components (prt-*)
/components/ui          shadcn/ui base components (unstyled base)
/components/shared      Components used across surfaces
/lib/db                 Drizzle schema, migrations, queries
/lib/ai                 LiteLLM wrapper, embeddings, routing
/lib/credits            Credits system logic (debit-first pattern)
/lib/auth               BetterAuth config
/specs                  Written specs per feature (READ BEFORE CODING)
/DESIGN.md              Visual identity — read before any UI work

## Patterns (Always Follow)
- Every API route: validate Zod → check auth → check org limits → execute
- Every DB query: MUST include org_id or bot_id filter (tenant isolation)
- Credits: debit BEFORE API call — refund on failure, never after
- Error format: { error: string, code: string, status: number }
- Never expose internal UUIDs to frontend — use embed_key for public bot ID
- Rate limit ALL public embed endpoints via Upstash Redis
- Skeleton loaders (not spinners) for all loading states
- Empty states always have a clear next-action CTA

## What NOT to Build (Read Twice)
- No visual drag-and-drop flow builder
- No social media channel integrations
- No voice or audio features
- No ONNX local embeddings until Phase 3 (use Gemini API free tier first)
- No RabbitMQ — use BullMQ on Redis when a queue is needed
- No React Query or SWR — Next.js server components + server actions only
- No custom CSS beyond Tailwind utility classes
- No shadcn/ui GUI configurator — write globals.css CSS vars directly
- No indigo (#6366F1) anywhere — Sky-Teal (#0EA5E9) is the only accent

## Default LLM Model
deepseek/deepseek-v4-flash via LiteLLM.
Change LITELLM_DEFAULT_MODEL env var to switch globally.
All model calls go through /lib/ai/litellm.ts — never call provider APIs directly.
```

---

### Phase 1: MVP — "The Talking Dashboard" ✅ SHIPPED

**Spec file:** `/specs/phase-1-mvp.md`

**Status: Complete.** Bot creation, embed script, client portal, knowledge base (documents + URL scraping + RAG), credits system, PayFast PKR billing, Lemon Squeezy USD billing, analytics, and white-label features are all live at octively.com.

**What shipped beyond original Phase 1 scope:**
- Knowledge base: document upload, URL scraping, pgvector RAG
- Credits system: Redis debit-first, credit ledger, top-up packs (PKR + USD)
- PayFast PKR subscriptions + Lemon Squeezy USD subscriptions
- Bot widget full customization (color, name, position, branding toggle)
- Admin analytics panel (MRR, plan distribution, usage stats)
- Blog powered by Sanity CMS — 8 published posts including 3 competitor comparisons
  (Stammer.ai alternative, ConvoCore alternative, ChatLab alternative)
- Full marketing site (octively.com) — 11 pages with SEO, FAQPage JSON-LD,
  llms.txt, Open Graph, Twitter cards, sitemap, robots.txt
- Changelog, Roadmap, Pricing, Guide, About, Contact, Privacy, Terms pages
- Google Analytics 4 + GTM + Google Search Console verification
- Plus Jakarta Sans + Source Serif 4 fonts via next/font (no FOUT)
- Auth pages (login, signup, forgot/reset password) with GSAP-animated product demo

```
Task 1.1 — Project scaffold + CLAUDE.md + DESIGN.md
  Files: package.json, tsconfig, tailwind.config, CLAUDE.md, DESIGN.md
  Set up subdomain routing: (marketing), (dashboard), (portal) route groups
  Commit: "chore: project scaffold with tri-surface architecture"

Task 1.2 — Database schema (Phase 1 tables)
  Files: /lib/db/schema.ts, /lib/db/migrate.ts
  Tables: users, organizations, bots, conversations, messages, leads
  Commit: "feat: Phase 1 database schema"

Task 1.3 — BetterAuth setup
  Files: /lib/auth/index.ts, /app/api/auth/[...all]/route.ts
  Roles: developer (admin.octively.com), client (app.octively.com)
  Commit: "feat: auth setup with BetterAuth"

Task 1.4 — Developer dashboard (admin.octively.com)
  Files: /app/(dashboard)/layout.tsx, /bots/page.tsx, /bots/new/page.tsx
  Design: adm-* tokens, near-black canvas, 220px sidebar, Sky-Teal CTA
  Features: org creation on signup, create/delete bots, view embed code
  Commit: "feat: developer dashboard"

Task 1.5 — Client portal (app.octively.com)
  Files: /app/(portal)/layout.tsx, /conversations/page.tsx, /leads/page.tsx
  Design: prt-* tokens, off-white canvas, top nav only, Inter Bold metrics
  Features: conversations list, leads table + CSV export, basic stats
  Commit: "feat: client portal"

Task 1.6 — Public embed API routes
  Files: /app/api/v1/chat/route.ts, /app/api/v1/leads/route.ts
         /app/api/v1/widget-config/route.ts
  Auth: embed_key validation (no user session needed)
  Commit: "feat: public embed API routes"

Task 1.7 — Embed script (widget)
  Files: /public/embed.js (< 2KB minified)
  Features: sends messages to API, logs session, captures lead form
  Commit: "feat: embed script v1"

Task 1.8 — LiteLLM wrapper
  Files: /lib/ai/litellm.ts
  Default: deepseek/deepseek-v4-flash
  Commit: "feat: LiteLLM wrapper"

Task 1.9 — Deploy
  Frontend: Netlify (connect GitHub repo, auto-deploy)
  DB: Neon project created, migrations run
  Env vars: Set in Netlify + HF Spaces
  Commit: "chore: deploy Phase 1"
```

---

### Phase 2: Smart Dashboard + Billing 🔄 ACTIVE

**Spec file:** `/specs/phase-2-billing-credits.md`

**Status:** Most Phase 2 features shipped in Phase 1+ (see above). Remaining work:

```
✅ Task 2.1 — Knowledge base (PDF upload + URL scraping + RAG) — SHIPPED
✅ Task 2.2 — Unanswered questions detection + list — SHIPPED
✅ Task 2.4 — Bot widget customization UI — SHIPPED
✅ Task 2.5 — Credits schema + Redis balance system — SHIPPED
✅ Task 2.6 — Credit debit flow in chat API (debit-first) — SHIPPED
✅ Task 2.7 — Model selector per bot — SHIPPED
✅ Task 2.8 — PayFast webhook integration (PKR) — SHIPPED
✅ Task 2.9 — Lemon Squeezy webhook integration (USD) — SHIPPED
✅ Task 2.10 — Plan limits enforcement — SHIPPED
✅ Task 2.11 — Credit top-up flow + purchase UI — SHIPPED
✅ Task 2.12 — "Out of credits" graceful fallback — SHIPPED

🔲 Task 2.3 — Weekly email digest (Resend cron) — PENDING
🔲 Task 2.13 — Conversation search + date filtering — PENDING
🔲 Task 2.14 — Analytics improvements (conversion rate, avg session) — PENDING
```

---

### Phase 3: Agency Layer + Hetzner (Months 2–3)

**Spec file:** `/specs/phase-3-agency.md`

```
Task 3.1 — Hetzner CX33 provision + Dokploy install
Task 3.2 — Self-hosted Postgres setup + pg_dump migration
Task 3.3 — FastAPI backend setup (replace Next.js API routes for AI)
Task 3.4 — BGE-M3 ONNX embeddings (replace Gemini embeddings API)
Task 3.5 — PDF upload pipeline (Cloudflare R2 → chunking → pgvector)
Task 3.6 — Website scraping (Firecrawl API integration)
Task 3.7 — Sub-tenant system (agency_clients table)
Task 3.8 — Agency dashboard (manage client bots under one login)
Task 3.9 — White-label: remove OwFlex branding per org setting
Task 3.10 — Custom subdomain for agency client portals
Task 3.11 — Smart auto-routing (classify → route to cheap/premium)
Task 3.12 — Human handoff: escalation email alert
Task 3.13 — Role-based access (agency admin, view-only)
Task 3.14 — BullMQ async document processing queue
Task 3.15 — Automated nightly backup script to B2
```

---

### Phase 4: Integrations + Polish (Months 3–5)

**Spec file:** `/specs/phase-4-integrations.md`

```
Task 4.1 — Webhook system (lead data → Zapier/n8n/Make)
Task 4.2 — API key management (BYOK — bring your own LLM key)
Task 4.3 — Urdu / Roman Urdu language detection + routing
Task 4.4 — WhatsApp Cloud API channel
Task 4.5 — Advanced analytics (top questions, resolution rate)
Task 4.6 — Audit log viewer for agencies
Task 4.7 — Google Analytics event emit on lead capture
Task 4.8 — Referral system (give ₨500, get ₨500)
Task 4.9 — Public-facing landing page (octively.com)
Task 4.10 — Help documentation site
```

---

## 14. Go-To-Market: First 10 Paid Clients

No paid ads. No SEO. No content grind. Community-only.

### Who You're Actually Selling To

Not the SMB. Not the end user. **You are selling to the developer who already
builds chatbots for clients.** They are your primary customer. Your product saves
them 10+ hours of dashboard work per client and lets them charge a monthly retainer.

### Your Only Marketing Asset: The Loom Video

Before any community post, do this:
1. Deploy OwFlex on Nasir Siddiqui's chatbot (Phase 1 done)
2. Record a 60-second Loom: show Nasir's client portal with real conversation
   data, real leads, real stats
3. No commentary needed — the product sells itself in 60 seconds

That one video is what you link in every community post.

### Week 1–2: Before Announcing

- Ship Phase 1 completely
- Use it live on at least one client site
- Screenshot the dashboard with real data (anonymized)
- Record the Loom video

### Week 3: Soft Launch (Community Posts)

Post this in each community — not as a promotion, as a story:

**Facebook Groups to post in:**
- Pakistan Freelancers Network
- Upwork Pakistan
- Software Engineers Pakistan
- AI & Automation Pakistan
- Digital Agencies Pakistan (Karachi/Lahore)

**Post template (adapt to each group's tone):**

> "Built something I wish existed 6 months ago.
>
> I've been building custom AI chatbots for clients in Pakistan —
> but the biggest problem wasn't the chatbot itself. It was that every
> client kept asking: 'How many people chatted? What leads did we get?'
> And I had no clean answer.
>
> So I built OwFlex — a lightweight dashboard my clients log into to
> see their conversations, leads, and stats. Took me 2 weeks with Claude Code.
>
> [Loom video link]
>
> If you build chatbots for clients and have the same problem — I'm
> looking for 5 people to try it for free. DM me."

**What this post does:**
- Leads with a relatable problem (not a product pitch)
- Shows proof (the Loom)
- Asks for 5 testers (low commitment, creates scarcity)
- Gets you DMs from exactly the right people

### Week 4–6: Convert Testers to Paying

After 5 testers have used it for 1–2 weeks:
- Follow up individually: "Has it been useful?"
- Show them the Starter plan: ₨2,000/month
- Offer 1 free month if they commit now (time pressure)
- Ask each one: "Do you know other developers with the same problem?"

**Target:** 3 paying users by end of Week 6. That's ₨6,000/month recurring.
Not life-changing — but proof the idea works and enough to fund Hetzner.

### Month 2: Scale the Same Playbook

- Post in Indie Hackers + X/Twitter (English): "How I got first 10 customers
  with zero marketing budget"
- Post in Pakistani WhatsApp groups (agency owners, tech communities)
- Ask every paying customer for one referral
- Add referral system in Phase 4: "Give ₨500 credit, get ₨500 credit"

### Pricing for First 10 Customers

| Customer # | Offer |
|-----------|-------|
| 1–5 (testers) | Free for 1 month, then Starter |
| 6–10 | Starter at ₨1,500/mo for life (founding member discount) |
| 11+ | Full ₨2,000/month |

Founding member pricing creates urgency and loyalty. They become your ambassadors.

---

## 15. SDD Quick Reference (Claude Code Prompts)

**Starting a new session:**
```
Read CLAUDE.md. Read /specs/phase-[X].md. 
Summarize what we're building in this phase and ask me 
any questions before writing any code.
```

**Starting a new task:**
```
We're working on Task [X.Y]: [description].
Read the spec, then implement this one task only.
Commit when done with message: "feat: [task description]"
Do not implement anything outside this task.
```

**Parallel research (complex decisions):**
```
Spin up 3 subagents to research in parallel:
1. Best approach for credits debit-first pattern in Next.js + Redis
2. How other SaaS products handle "out of credits" UX
3. PayFast webhook verification best practices
Compile findings into /specs/research/credits-research.md
```

**Spec refinement (before Phase 2+):**
```
Use ask_user_question to interview me about Phase 2 requirements.
Ask about credits UX, billing edge cases, and what "out of credits" 
should look like to the end user. Write the spec after the interview.
```

**Review against spec:**
```
Read /specs/phase-[X].md and review the current codebase.
List: (1) what's complete, (2) what's missing, (3) what's wrong.
Do not make changes — just report.
```

---

## 16. Summary: What Makes v7 Different from v6

| | v6 | v7 |
|--|----|----|
| Phase 1 blockers | 6+ components before Hello World | 1 working page in Day 3 |
| Infrastructure | Over-engineered from day 1 | Free stack, migrate when needed |
| Embeddings | ONNX from the start | Jina AI free tier first |
| Credits | Not planned | Built into schema from Phase 2 |
| Model strategy | Gemini Flash only | Full model tier + routing + credits |
| Stopped at | Planning | Ships Phase 1 in 2 weeks |
| First user | Never reached | Nasir Siddiqui — Phase 1 complete |
| Document | Master plan only | CLAUDE.md + DESIGN.md + per-phase specs |
| Build method | Vibe coding | Spec-Driven Development with Claude Code |
| Subdomains | Single app | octively.com / admin.octively.com / app.octively.com |
| Accent color | Indigo #6366F1 (AI default) | Sky-Teal #0EA5E9 (differentiated) |
| Design system | Generic shadcn + GUI configurator | Tri-surface DESIGN.md, CSS vars direct |
| Mono font | Dashboard only (vague) | JetBrains Mono admin ONLY, never portal |

**The only thing that matters now: Task 1.1. Open Claude Code. Initialize the
project. Write CLAUDE.md. The plan exists. The market is validated. Execute.**

---

## 17. Knowledge Base Strategy (No RAG for Small Bots)

### The Core Insight

Modern LLM context windows (Gemini 2.5 Flash: 1M tokens, DeepSeek V4 Flash: 1M
tokens) are large enough that most small business chatbots don't need RAG at all.
A full FAQ, company description, services list, pricing, and contact info for a
typical Pakistani SMB fits in under 20K tokens. Stuffing it directly into the
system prompt is simpler, faster, and more accurate than vector search.

**Rule:** Use context stuffing first. RAG only activates automatically when data
exceeds 50KB of text. Users never see this distinction — it just works.

### Three Data Input Methods

**Method 1 — Document Upload + RAG (Phase 2, default for all bots)**

Users upload PDFs or add URLs to the Knowledge Base tab. OwFlex extracts text,
chunks it (1,000 chars / ~250 tokens per chunk), embeds via Jina AI
(`jina-embeddings-v5-text-small`), and stores vectors in pgvector.

At chat time, the top-k most relevant chunks are retrieved and injected into the
system prompt automatically. The user never configures this — it just works.

Rule: context stuffing for < 50 KB of extracted text; vector RAG for > 50 KB.

**Method 2 — PDF/Document Upload (Phase 3)**

User uploads a PDF (menu, catalog, brochure, manual). OwFlex extracts text
server-side, runs it through the AI to structure it cleanly, stores it.
If extracted text < 50KB: context stuffing. If > 50KB: pgvector RAG kicks in.

**Method 3 — CSV Product Importer (Phase 2, for e-commerce bots)**

User uploads a CSV with columns: `name, description, price, image_url, link`.
OwFlex stores this in a `products` table. On each chat message, a lightweight
semantic search finds the 3–5 most relevant products and injects them into context.

Product cards render directly in the chat window:

```
┌─────────────────────────────┐
│ [Product Image]             │
│ Embroidered Kurta           │
│ ₨2,500                      │
│ [View Product] [Add to Cart]│
└─────────────────────────────┘
```

This is a genuine differentiator — no competitor does this for custom-code bots.

**Method 4 — Live Web Search (Phase 3, optional add-on)**

For bots that need real-time data (prices that change, news, live inventory),
the agent uses Tavily Search API. Costs ~$0.001 per search. Only triggered when
the bot's static knowledge doesn't have an answer. User enables this per bot.

```typescript
// lib/ai/search.ts
async function searchIfNeeded(query: string, botConfig: Bot) {
  if (!botConfig.enableWebSearch) return null;
  
  const result = await tavily.search(query, {
    searchDepth: "basic",
    includeAnswer: true,
    maxResults: 3
  });
  
  return result.answer; // Injected into context, not shown raw to user
}
```

### When RAG Activates (Automatic, Invisible to User)

```
Data size < 50KB  → Full context stuffing (no embeddings needed)
Data size 50–500KB → Hybrid: summary in context + RAG for specifics
Data size > 500KB  → Full RAG with pgvector (Phase 3+)
```

---

## 18. Email Strategy (Dual Provider)

Use two email providers. Free forever at OwFlex's scale.

| Provider | Use Case | Free Limit | Why |
|----------|----------|-----------|-----|
| **Resend** | Transactional (auth, alerts, lead notifications) | 3,000/mo, 100/day | Best Next.js DX, React Email templates |
| **Brevo** | Marketing (weekly digests, campaigns, announcements) | 9,000/mo, 300/day | Most generous free tier for bulk sends |

**When to upgrade:** Resend hits limits (~300 active daily users). Move to Resend
paid ($20/mo for 50K) before Brevo — transactional reliability matters more.

---

## 19. Data Privacy & Third-Party LLMs — Honest Positioning

### What You Can Say (And Back Up)

**"Your conversations are not used to train AI models."**

This is accurate for the providers in our stack:
- DeepSeek API: Zero data retention policy — requests not logged or stored
- Groq: API calls not used for training, data deleted after request
- OpenRouter: Acts as proxy, enforces provider zero-retention tiers
- Gemini API (not Gemini in Google products): Enterprise API has DPA with no
  training clause — free tier less clear, so default away from it in Phase 3

**What to add to ToS:**

> "OwFlex routes your chatbot conversations through AI providers under zero-data-
> retention agreements. Messages are processed to generate responses and are not
> stored, logged, or used for AI training by our providers. For our default model
> (DeepSeek V4 Flash via OpenRouter), data is processed in transit only and
> discarded immediately after response generation."

**What NOT to say:** "Your data never leaves Pakistan" — this isn't true since
the LLM APIs are foreign servers. Don't overstate it.

**The honest selling point:** "Your clients' conversation data is stored only in
OwFlex's database (on Hetzner servers you control), not in any AI provider's
system. AI providers see the message, generate a response, and that's it."

---

## 20. Security Hardening

### Application Layer

**Input validation — all surfaces:**
Every API route validates with Zod before touching the DB. Reject anything that
doesn't match the schema. No exceptions.

```typescript
// Pattern for every public route
const schema = z.object({
  message: z.string().min(1).max(2000),
  sessionId: z.string().uuid(),
  embedKey: z.string().length(64)
});

const result = schema.safeParse(await request.json());
if (!result.success) {
  return NextResponse.json({ error: "Invalid input", code: "VALIDATION_ERROR" }, { status: 400 });
}
```

**Rate limiting — all public endpoints:**
Upstash Redis rate limiting on every embed script endpoint. Prevents abuse and
cost overruns from a single bad actor.

```typescript
// Max 30 messages per IP per minute on chat endpoint
const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(30, "1 m"),
  prefix: "owflex:chat"
});

const { success, remaining } = await ratelimit.limit(ip);
if (!success) return new Response("Too many requests", { status: 429 });
```

**SQL injection — impossible by design:**
Drizzle ORM uses parameterized queries exclusively. No raw SQL in application
code except migrations. Enforced via ESLint rule banning `db.execute()` in
non-migration files.

**XSS prevention:**
- React escapes all dynamic content by default
- Chat widget content sanitized with DOMPurify before render
- CSP headers set via Next.js config
- No dangerouslySetInnerHTML anywhere

**CSRF:**
BetterAuth handles CSRF tokens automatically for all state-changing requests.
Embed script uses embed_key auth, not session cookies — no CSRF surface.

### Tenant Isolation (Critical)

Every single database query that touches user data must be scoped:

```typescript
// ✅ CORRECT — always scoped to org
const leads = await db.select().from(leadsTable)
  .where(and(
    eq(leadsTable.botId, botId),
    eq(botsTable.orgId, orgId)  // Join verifies ownership
  ));

// ❌ WRONG — never do this
const leads = await db.select().from(leadsTable)
  .where(eq(leadsTable.botId, botId));
  // botId alone is not enough — must verify orgId owns it
```

Add a Drizzle middleware that injects `orgId` from the session automatically.
Add integration tests that verify cross-tenant data leakage is impossible.

### Infrastructure Security (Hetzner Phase 3+)

**Firewall — only necessary ports open:**
```
Port 22  → SSH (restricted to your IP only, or use Hetzner Console)
Port 80  → HTTP (redirect to HTTPS only)
Port 443 → HTTPS (Caddy handles SSL termination)
All other ports: CLOSED
```

**Postgres — never exposed to internet:**
Postgres runs in Docker on localhost. Only the FastAPI container can reach it.
No direct Postgres port exposed outside the VPS.

**Secrets management:**
- All secrets in Dokploy secrets manager (never in `.env` committed to git)
- Rotate all API keys every 90 days (add to calendar)
- Different keys for dev/staging/production

**SSH hardening:**
```bash
# /etc/ssh/sshd_config
PasswordAuthentication no    # Key-only SSH
PermitRootLogin no           # No root login
MaxAuthTries 3
```

**Automatic security updates:**
```bash
apt install unattended-upgrades
dpkg-reconfigure unattended-upgrades  # Enable automatic security patches
```

**Fail2Ban — block brute force:**
```bash
apt install fail2ban
# Auto-bans IPs with 5 failed SSH attempts in 10 minutes
```

### Data Breach Response Plan

If a breach is detected or suspected:

1. **Immediate (0–30 min):** Enable maintenance mode (Redis flag). Stop all
   writes. Revoke all active API keys and sessions.
2. **Short-term (30 min–2 hrs):** Identify scope from audit logs. Restore clean
   backup if data was modified. Reset all user passwords (force on next login).
3. **Communication (2–24 hrs):** Email all affected users with what happened,
   what data was accessed, and what actions they should take. Honest and direct.
4. **Post-mortem:** Write a full incident report. Fix the root cause before
   re-enabling the platform.

**Pakistan data breach context:** There's currently no mandatory breach
notification law in Pakistan (PDPA is in draft), but notifying users immediately
is the right thing to do and protects your reputation.

---

## 21. Platform Plugins (Phase 4)

### WordPress Plugin

A proper WordPress plugin is 2–3 days of work and unlocks every WP agency.
43% of the internet runs WordPress. This is the single highest-leverage
distribution play after the initial launch.

**Plugin structure:**
```
owflex-chatbot/
├── owflex-chatbot.php      # Main plugin file + admin settings page
├── includes/
│   ├── class-settings.php  # API key storage (wp_options)
│   └── class-widget.php    # Widget injection
├── admin/
│   └── settings-page.php   # WP admin UI (enter bot embed key)
└── readme.txt
```

**Settings page in WP Admin:**
- Embed Key field (copy from OwFlex dashboard)
- Position (bottom-right / bottom-left / custom)
- Pages to show/hide on
- One-click "Test Connection" button

**Distribution:** Submit to wordpress.org/plugins (free listing, huge organic
reach). This is a permanent distribution channel that compounds.

### Shopify App (Phase 4)

Shopify has 4M+ stores. A Shopify app listing gives you access to their
merchant marketplace. The OwFlex Shopify app connects the store's product
catalog to OwFlex automatically — no CSV upload needed.

**Core features:**
- Auto-sync product catalog (name, description, price, image, variant)
- Install embed widget via Shopify theme API (no code needed)
- Lead capture connected to Shopify customer records

### Future: Webflow, Wix, Ghost, Framer

Each is a 1–2 day integration after WordPress and Shopify are done.
Prioritize by market size in Pakistan.

---

## 22. DESIGN.md — Tri-Surface Visual Identity

### What DESIGN.md Is

A plain-text design system file that Claude Code reads before building any UI.
Lives in each project root alongside CLAUDE.md. No Figma, no GUI configurator,
no JSON tokens — just markdown that agents parse and apply directly.

The full DESIGN.md is a separate deliverable (DESIGN.md file). This section
summarises the key decisions for reference within this plan.

### The Three-Subdomain Architecture

OwFlex ships on three subdomains with distinct surfaces. Each subdomain has its
own layout, its own theme, and its own emotional contract with the user.

| Subdomain | Surface | Inspired By | Canvas | Accent |
|-----------|---------|-------------|--------|--------|
| octively.com | Marketing | Intercom | Warm cream #F5F1EC | Sky-Teal CTA only |
| admin.octively.com | Developer Dashboard | Linear | Near-black #0C0A09 | Sky-Teal CTA + metrics |
| app.octively.com | Client Portal | Supabase (light) | Off-white #FAFAFA | Sky-Teal CTA |

This maps to three Next.js layout components:

```
/app/(marketing)/layout.tsx    → octively.com — mkt-* tokens, cream canvas
/app/(dashboard)/layout.tsx    → admin.octively.com — adm-* tokens, dark canvas
/app/(portal)/layout.tsx       → app.octively.com — prt-* tokens, light canvas
```

### Why Sky-Teal (#0EA5E9) — Not Indigo

Indigo (#6366F1) is the default Tailwind color used by v0, Bolt, Lovable, and
every AI-generated UI in 2025–2026. Pakistani developers and agency owners
will recognise it as "AI-built" immediately.

Sky-Teal (#0EA5E9) is clean, technically precise, and rare in the Pakistani
SaaS market. It appears on all three surfaces as the primary CTA — the single
brand thread connecting octively.com → admin → app.octively.com.

### The Single Most Important Design Rule

**JetBrains Mono on admin.octively.com only. Never on app.octively.com.**

The same number "589" reads as "technical data" in JetBrains Mono and as
"your customers this month" in Inter Bold 700. The font choice changes the
emotional meaning of the number. SMB clients on app.octively.com get Inter Bold.
Developers on admin.octively.com get JetBrains Mono for all metrics, keys, codes.

### Theme Modes Per Subdomain

| Subdomain | Default | Dark Mode | Toggle | System Preference |
|-----------|---------|-----------|--------|-------------------|
| octively.com | Light (cream) | ❌ Not supported | ❌ No toggle | ❌ Ignored |
| admin.octively.com | **Dark** | ✅ Full support | ✅ Yes | ✅ Respected |
| app.octively.com | Light | ✅ Full support | ✅ Yes | ✅ Respected |

**Why marketing is light-only:** The warm cream canvas (#F5F1EC) is the OwFlex
brand signal on the landing page. A dark version would be a different product
entirely, and dark mode on a marketing site gives zero conversion benefit.

**Why dashboard defaults dark:** Developers expect it. Linear, Supabase, VS Code,
Vercel — every daily-use dev tool defaults dark. Respecting that is basic UX.

**Why portal defaults light:** Trust and familiarity for non-technical SMB owners.
A bank app or WhatsApp Business — that's the mental model. Dark mode is supported
because Android system dark mode adoption is growing in Pakistan.

### Theme Implementation (Summary)

Theme is applied via CSS classes on `<html>`:

```
<html class="marketing">          → octively.com (always light, no toggle)
<html class="dashboard dark">     → admin.octively.com dark (default)
<html class="dashboard light">    → admin.octively.com light (toggled)
<html class="portal light">       → app.octively.com light (default)
<html class="portal dark">        → app.octively.com dark (toggled/system)
```

Theme state is managed by `useTheme(surface)` hook in `hooks/useTheme.ts`.
Persisted in `localStorage`. System preference respected on first visit.
Anti-flash inline script in `<head>` prevents white flash on dark-preference devices.

Full implementation (CSS variables, useTheme hook, ThemeToggleButton component,
anti-flash script, and Tailwind var() usage pattern) is in DESIGN.md under
"Theme Implementation."

### Key Color Tokens (Quick Reference)

```css
/* Shared brand */
--primary:        #0EA5E9;   /* Sky-Teal — all surfaces, primary CTA */
--primary-hover:  #0284C7;
--primary-soft:   #E0F2FE;   /* Active nav, soft badges */
--success:        #10B981;   /* Emerald — credits/money everywhere */
--warning:        #F59E0B;
--error:          #EF4444;

/* Marketing (octively.com) */
--mkt-canvas:     #F5F1EC;   /* Warm cream — the brand's anchor */
--mkt-surface-1:  #FFFFFF;   /* Floating cards on cream */
--mkt-ink:        #111111;   /* Charcoal type */

/* Dashboard (admin.octively.com) */
--adm-canvas:     #0C0A09;   /* Near-black, warm undertone */
--adm-surface-1:  #171512;   /* Cards, sidebar */
--adm-surface-2:  #211E1A;   /* Hover, raised */
--adm-ink:        #F5F0EB;   /* Warm light gray type */

/* Portal (app.octively.com) */
--prt-canvas:     #FAFAFA;   /* Off-white */
--prt-surface:    #FFFFFF;   /* Cards */
--prt-ink:        #171717;   /* Near-black type */
```

### shadcn/ui — Use as Component Library, Skip the GUI Configurator

shadcn/ui is the right component library — Button, Card, Table, Dialog,
Dropdown are pre-built accessible components you own. But the ui.shadcn.com/create
GUI configurator is a human tool, not an agent tool. Skip it entirely.

Instead: write CSS variables directly in `globals.css` based on the DESIGN.md
tokens above. Claude Code installs components with `npx shadcn@latest add button
card table dialog` and applies Tailwind + CSS vars as DESIGN.md dictates.
No manual GUI step anywhere in the workflow.

```css
/* globals.css — complete theme system (summary)
   Full token map is in DESIGN.md under "Theme Implementation" */

/* Shared brand tokens — always available */
:root {
  --of-primary:       #0EA5E9;   /* Sky-Teal — the only accent */
  --of-primary-hover: #0284C7;
  --of-primary-soft:  #E0F2FE;
  --of-success:       #10B981;
  --of-success-dark:  #34D399;
  --of-error:         #EF4444;
  --of-error-dark:    #F87171;
  --of-warning:       #F59E0B;
  --of-credit:        #10B981;
  --of-credit-dark:   #34D399;
}

/* octively.com — cream canvas, always light */
.marketing { --bg: #F5F1EC; --surface: #FFFFFF; --ink: #111111; }

/* admin.octively.com — dark default */
.dashboard  { --bg: #0C0A09; --surface: #171512; --ink: #F5F0EB; }

/* admin.octively.com — light toggle */
.dashboard.light { --bg: #FAFAFA; --surface: #FFFFFF; --ink: #171717; }

/* app.octively.com — light default */
.portal  { --bg: #FAFAFA; --surface: #FFFFFF; --ink: #171717; }

/* app.octively.com — dark toggle */
.portal.dark { --bg: #0F0F0F; --surface: #1A1A1A; --ink: #F5F5F5; }
```

Use `var(--bg)`, `var(--surface)`, `var(--ink)` everywhere in components.
Never hardcode hex colors in component files — always use CSS variables.
Full variable map (hairlines, ink-muted, semantic colors, etc.) is in DESIGN.md.

### Agent Prompt Guide (Quick Reference)

Full prompts are in DESIGN.md. Shorthand for daily use:

```
Marketing page:   "Read DESIGN.md. Build for octively.com (Surface 1: Marketing).
                   Light only — cream canvas #F5F1EC, no dark mode, no toggle.
                   Follow mkt-* tokens."

Dashboard page:   "Read DESIGN.md. Build for admin.octively.com (Surface 2: Dashboard).
                   Dark default + light toggle. Use var(--bg), var(--surface),
                   var(--ink) CSS vars everywhere — never hardcode hex colors.
                   JetBrains Mono on ALL metrics. Follow adm-* and adm-light-* tokens."

Portal page:      "Read DESIGN.md. Build for app.octively.com (Surface 3: Portal).
                   Light default + dark toggle. Use var(--bg), var(--surface),
                   var(--ink) CSS vars everywhere — never hardcode hex colors.
                   Inter Bold for stat numbers — NO mono. 44px touch targets.
                   Follow prt-* and prt-dark-* tokens."
```

---

## 23. Updated Phase 4 Task List

With plugins and design system added:

```
Task 4.1 — Webhook system (Zapier, n8n, Make)
Task 4.2 — API key management (BYOK)
Task 4.3 — Urdu / Roman Urdu language detection
Task 4.4 — WhatsApp Cloud API channel
Task 4.5 — Advanced analytics
Task 4.6 — Audit log viewer
Task 4.7 — WordPress plugin (submit to wordpress.org)
Task 4.8 — Shopify app (submit to Shopify App Store)
Task 4.9 — Referral system
Task 4.10 — Public landing page (octively.com)
Task 4.11 — Help documentation (Mintlify or Fumadocs)
Task 4.12 — Webflow / Framer embed integrations
```

---

## 24. Full Stack Summary (Final v7 Reference)

| Layer | Phase 1–2 (Free) | Phase 3–4 (Hetzner) |
|-------|-----------------|---------------------|
| Frontend | Next.js 15 on Netlify | Next.js 15 on Hetzner via Dokploy |
| Backend API | Next.js API Routes | FastAPI on Hetzner |
| Database | Neon PostgreSQL (free) | Self-hosted Postgres on Hetzner |
| Vector search | pgvector on Neon | pgvector on Hetzner Postgres |
| Embeddings | Jina AI jina-embeddings-v5-text-small (free 1M/day) | BGE-M3 ONNX local |
| LLM gateway | LiteLLM → LLaMA 3.3 70B (free via OpenRouter) | LiteLLM → multi-model |
| LLM fallback | DeepSeek V4 Flash (paid, when free quota hits) | Same + OpenRouter routing |
| Cache / credits | Upstash Redis (free) | Self-hosted Redis |
| Auth | BetterAuth | BetterAuth |
| ORM | Drizzle + Zod | Drizzle + Zod |
| Payments PKR | PayFast | PayFast |
| Payments USD | Lemon Squeezy | Lemon Squeezy |
| Email transactional | Resend (free 3K) | Resend paid ($20) |
| Email marketing | Brevo (free 9K) | Brevo paid |
| Object storage | Cloudflare R2 (free 10GB) | Cloudflare R2 |
| Backups | — | Backblaze B2 (€0.20/mo) |
| Monitoring | Sentry free | Sentry free |
| Uptime | UptimeRobot free | UptimeRobot free |
| Task queue | — | BullMQ on Redis |
| Web search | Tavily API (pay per call) | Same |
| Product search | PostgreSQL full-text | Same |
| Orchestration | — | Dokploy |
| **Total infra cost** | **$0/mo** | **~$9/mo** |

---

---

## 25. Widget Branding System, Channel Strategy & Resource Allocation

### Portal Domain Gap (Until Phase 3)

`app.octively.com` is a visible OwFlex domain. A client who goes to `octively.com` can find pricing. Two mitigations applied now; full fix in Phase 3/4:

1. **Pricing page copy** — targets developers explicitly ("Build chatbots for your clients"). SMBs reading it shouldn't identify themselves as the end buyer. No "per-client" framing anywhere.
2. **Portal login page** — zero billing UI, no pricing or plan links visible to clients. Just a conversation/leads viewer.
3. **Phase 3** — `{agency}.octively.com` subdomain (agency name in URL; OwFlex still visible but secondary).
4. **Phase 4** — Full custom domain (`portal.myagency.com`) — OwFlex completely invisible at the URL level.

### Pricing Transparency & Markup Conflict

An agency charging ₨5,000/bot/mo and a client who finds OwFlex Agency at ₨20,000/mo for unlimited bots could do math. Framing and contract positioning matter more than hiding the price:

- **The agency's product is service, not a license resale.** Setup, integration, support, content updates, strategy — these justify the margin. The software cost is irrelevant to what the agency charges.
- **SMBs don't self-serve.** Even if they find OwFlex, they cannot create bots — they need developer access. The agency remains the only path to the product.
- **Agencies should position this themselves** (their contract, their narrative). OwFlex cannot fully hide pricing and still grow via SEO/word-of-mouth. The responsibility sits with the agency.
- **Phase 3 full white-label** severs the brand association entirely — clients never see "owflex" in any URL or footer.

### Per-Bot Resource Allocation (Phase 3 Feature)

Agency plan's 75K conversations/mo is a shared pool. Without per-bot limits, one client's viral traffic can exhaust the pool for everyone. Agencies also need per-bot caps to match what they've sold to each client.

**Data model (to add in Phase 3):**
```sql
ALTER TABLE bots ADD COLUMN monthly_conv_limit  INT NULL;  -- null = draws from org pool
ALTER TABLE bots ADD COLUMN monthly_lead_limit   INT NULL;
```

**Enforcement logic (in `app/api/v1/chat/route.ts`):**
```typescript
// Check bot-level limit first, then fall back to org pool
if (bot.monthlyConvLimit !== null) {
  const botConvCount = await getBotConvCountThisMonth(bot.id)
  if (botConvCount >= bot.monthlyConvLimit) {
    return 402 PLAN_LIMIT  // bot hit its allocated cap
  }
}
// If no bot limit, check org-level limit as before
```

**Agency dashboard shows:**
- Total plan allocation: 75,000 conv/mo
- Allocated: 5,000 (Bot A) + 10,000 (Bot B) + ... = X
- Unallocated pool: 75,000 - X (shared by bots with no per-bot cap)

This lets agencies sell per-bot SLAs: "Your bot is guaranteed 5,000 conversations/mo." If Client A's bot hits its 5K cap mid-month, their bot stops — but the other 9 clients' bots keep running.

### Plan-Based Branding Rules

| Plan | Default State | Developer Can Change? | Custom Text/URL? |
|------|--------------|----------------------|-----------------|
| `free` | Forced ON — "Powered by OwFlex" | ❌ Never | ❌ No |
| `starter` | ON by default | ✅ Can toggle off | ❌ No (always OwFlex text) |
| `pro` | ON by default | ✅ Can toggle off | ❌ No (always OwFlex text) |
| `agency` | OFF by default | ✅ Full control | ✅ Custom text + URL |
| `enterprise` | OFF by default | ✅ Full control | ✅ Custom text + URL |

### widgetConfig JSONB Fields

```typescript
brandingEnabled: boolean  // true = show attribution footer in widget
brandingText:    string   // custom label (agency/enterprise only)
brandingUrl:     string   // custom link  (agency/enterprise only)
```

### Enforcement Layers

1. **`app/api/v1/widget-config/route.ts`** — server enforces branding based on `org.plan` regardless of `widgetConfig` stored value. Free plan is always `brandingEnabled: true`. Starter/Pro cannot set custom text/URL.
2. **`lib/db/queries/bots.ts` — `updateBot()`** — strips `brandingText`/`brandingUrl` on save if plan is not agency/enterprise.
3. **`embed/src/embed.js`** — renders `#oB` branding div only when `c.brandingEnabled === true`. No upgrade messaging in the widget — that lives in the developer dashboard only.

### Channel Conflict Strategy

Agency plan white-label means SMB clients never discover OwFlex pricing:
- Widget footer shows "Powered by [Agency Name]" not "Powered by OwFlex"
- Client portal login shows agency branding (Phase 3)
- SMBs cannot create bots — only view conversations and leads via `app.octively.com`
- Bot creation requires developer role → agencies are the intermediary, not a competitor

---

---

## 26. Agentic AI Strategy (Phase 4)

### Why This Matters Now

2026 is the production year for AI agents. Tavily research (May 2026):
- AI agents handle **40–60% of initial customer interactions** globally (SaaStr)
- SaaS products that add agents to existing features without rethinking the UX **will lose** to natively agentic products
- The shift: chatbots *respond*. Agents *act*.

**OwFlex is already partially agentic.** Current bots:
- Capture leads autonomously (action — writes to DB, triggers webhook)
- Display product cards and recommendations (retrieval + structured output)
- Escalate to human on uncertainty (decision + handoff)
- Run web search per message when enabled (Tavily integration)

These are agent behaviors. The missing piece is a **formal agent mode** with a configurable tool registry that bot owners control without writing code.

---

### The Two Bot Modes (Phase 4)

When creating a bot, the developer chooses:

```
┌─────────────────────────────────────────────┐
│  Bot Type                                   │
│                                             │
│  ◉ Chatbot (default)                        │
│    Responds to questions using your         │
│    knowledge base. No external actions.     │
│                                             │
│  ○ AI Agent                                 │
│    Answers AND takes actions. Configure     │
│    which tools the agent can use below.     │
└─────────────────────────────────────────────┘
```

In **Chatbot mode** (current): LiteLLM call → RAG context → response. No tool loop.

In **AI Agent mode**: OpenAI Agents SDK loop → tool selection → execution → response.
The agent decides which tools to call based on the user's message.

---

### Agent Tool Registry (Bot Owner Configures)

Bot owners toggle tools on/off per bot from the dashboard. No code required.

| Tool | What it does | Config needed |
|------|-------------|--------------|
| **Web search** | Searches Tavily for real-time answers (prices, news, availability) | Toggle on/off |
| **Lead capture** | Captures visitor info mid-conversation (already exists) | Already in all bots |
| **Appointment booking** | Redirects to Calendly/Cal.com link at the right moment | Paste booking URL |
| **Product lookup** | Searches product catalog and returns cards (already exists) | Already in all bots |
| **Custom webhook** | POSTs structured data to any URL when triggered | Paste endpoint URL |
| **Form submission** | Fills and submits a form on behalf of the visitor | Form URL + field map |
| **Human handoff** | Escalates conversation when confidence is low (already exists) | Already in all bots |

**Phase 4 adds:** web search toggle, appointment booking, custom webhook trigger (form + endpoint). The rest already exists in chatbot mode and carries over automatically.

---

### Technical Implementation

**SDK:** OpenAI Agents SDK (open-source, MIT, Python-first — March 2025). Already covered in `.claude/skills/openai-agents-sdk-gemini/skills.md`.

Key SDK primitives used:
- **Agents** — LiteLLM-backed agent with instructions + tool list
- **Handoffs** — Transfer to human-support agent on escalation
- **Guardrails** — Input/output validation (no harmful content, no off-topic actions)
- **Tracing** — Every tool call logged in Postgres for the developer's audit view

```typescript
// lib/ai/agent.ts — agent mode chat handler
import { Agent, Runner } from 'openai-agents'  // or equivalent JS port

const botAgent = new Agent({
  name: bot.name,
  instructions: buildSystemPrompt(bot, retrievedChunks),
  tools: buildToolList(bot.agentConfig),  // only enabled tools
  model: bot.model,  // routes through LiteLLM
})

const result = await Runner.run(botAgent, userMessage, { context: session })
```

The chat API route detects `bot.mode === 'agent'` and switches from the simple LiteLLM call to the agent runner. **Zero breaking changes to chatbot mode.**

---

### What "Agent" Means for OwFlex Positioning

| | Chatbot | AI Agent |
|--|---------|---------|
| Use case | FAQ, support, lead gen | Bookings, lookups, actions |
| Response type | Text answers | Text + actions + confirmations |
| Knowledge base | RAG retrieval | RAG + live tools |
| Pricing | Included in plan credits | Higher credit cost per turn (more tokens) |
| Plan availability | All plans | Pro+ (tool-calling requires higher credit budget) |

**Go-to-market angle:** "Your chatbot answers questions. Your AI agent books appointments, checks inventory, and submits forms — without you lifting a finger." This positions OwFlex ahead of every competitor still shipping chatbot-only products in 2026.

---

### Phase 4 Agent Tasks (additions to existing task list)

```
Task 4.13 — Agent mode toggle on bot creation (Chatbot / AI Agent)
Task 4.14 — Tool registry UI — per-bot tool enable/disable dashboard
Task 4.15 — Web search tool (Tavily) — toggle + credits debit per search
Task 4.16 — Appointment booking tool — Calendly/Cal.com URL config
Task 4.17 — Custom webhook tool — endpoint URL + trigger phrase config
Task 4.18 — Agent runner in chat API (OpenAI Agents SDK loop)
Task 4.19 — Agent trace viewer — developer can see every tool call per conversation
Task 4.20 — Agent mode analytics — tool usage counts, action completion rate
```

---

\*Octively Master Plan v1.0 — May 2026 (formerly OwFlex v7, rebranded)\*
*Next action: Task 1.1 — Initialize project, write CLAUDE.md and DESIGN.md, set up tri-surface route groups*
*Next review: After Phase 1 ships and first paying user is acquired.*
*Design system: See separate DESIGN.md file (tri-surface: octively.com / admin.octively.com / app.octively.com)*
