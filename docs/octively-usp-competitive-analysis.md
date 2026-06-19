# Octively USP & Competitive Analysis Report

> Research date: June 2026. Competitor data sourced via live Tavily web research.
> Internal feature data sourced from RoadmapPage.tsx, ChangelogPage.tsx, and memory.
> For internal/sales use only -- do not publish verbatim.

---

## 1. Competitor Pricing at a Glance

| Platform | Free | Starter | Agency / White-Label | Notes |
|---|---|---|---|---|
| **Octively** | **Forever** | **₨2,500 / $15/mo** | **₨20,000 / $79/mo** | Flat; no per-message fees |
| Stammer.ai | 14-day trial only | $49/mo (5 agents, no WL) | $197/mo (20 agents) or **$497/mo** (full WL) | + $0.001–$0.03 per message on top |
| ChatLab | Free tier | $15/mo | **$360/mo** (25 bots, full WL + client portal) | + $7/mo each extra bot/user |
| ConvoCore | 50 credits | $49/mo (partial WL) | $197/mo (most WL) / **$497/mo** (complete WL) | + per-message usage fees |
| Chatbase | 50 msg/mo; **14-day inactivity deletion** | $40/mo | $150–$500/mo + **$199/mo branding removal** | GPT-5.2 = 2x credit cost |
| Tidio | 50 convos/mo | $29/mo (no AI) | $749/mo (WL) + $39–700/mo Lyro AI | Per-conversation billing adds up fast |
| Botsonic | 7-day trial | $16/mo (annual) | $299/mo | Limited white-label |
| SiteGPT | 7-day trial | $39/mo | Limited WL | No client portal |

---

## 2. Octively's Core USPs

### USP 1 -- Permanent Free Plan (No Credit Card, No Timer)

**What competitors do:** Every direct competitor uses a 14-day trial or an extremely limited free tier (Chatbase deletes bots after 14 days of inactivity; Stammer requires a paid plan to test white-label).

**What Octively does:** Free plan is real and permanent. 1 bot, 200 conversations/month, lead capture, embed widget -- all live. No credit card required. No countdown.

**Why it matters for freelancers:** A Pakistani freelancer cannot easily pay $49/month to "evaluate" a tool before they have a client. The free plan lets them build their first bot for their own site, learn the product, then pitch it to clients -- all before spending a rupee.

---

### USP 2 -- Price: 60-95% Cheaper Than Comparable White-Label Plans

**The direct comparison:**

| What you get | Octively | Stammer.ai | ChatLab | ConvoCore |
|---|---|---|---|---|
| Full white-label + client portal | ₨20,000 / $79/mo | $497/mo | $360/mo | $497/mo |
| No per-message fees | Yes | No | No | No |
| Permanent free tier | Yes | No | No | No |

At the agency level:
- Stammer.ai Full SaaS: $497/mo = Octively Agency at **6.3x the price**
- ChatLab Agency: $360/mo = Octively Agency at **4.6x the price**
- ConvoCore Full SaaS: $497/mo = Octively Agency at **6.3x the price**

**The freelancer margin math:**
- Octively Agency: ₨20,000/month flat
- Charge 5 clients at ₨15,000/month each = ₨75,000 revenue
- Net margin: 73% (₨55,000/month profit from the tool cost alone)
- At Stammer $497 (~₨138,000/mo): you need 10+ clients just to break even on the platform.

---

### USP 3 -- PKR Pricing + PayFast (The Only Platform in the Market)

No competitor supports Pakistani rupees or PayFast as a payment method. Every competitor prices in USD and requires an international credit card or Stripe.

For a Pakistani freelancer:
- International card not always available
- Currency conversion adds 10-15% forex markup
- USD pricing feels expensive and arbitrary

**Octively is the only AI chatbot builder priced in PKR and accepting PayFast.** This alone eliminates the primary purchase barrier for the Pakistan market.

*International customers: Lemon Squeezy in USD is also available.*

---

### USP 4 -- No Per-Message or Per-Seat Fees

**Stammer.ai** charges $0.001–$0.03 per AI message on top of the subscription. An active agency with 10 clients running chatbots can easily add $200-500+/month in unexpected usage costs.

**Tidio** bills per conversation. Once you pass your quota you're pushed to a higher tier. Their own users report real-world costs 2-3x the advertised price once AI add-ons are factored in.

**Chatbase** uses a credit system where GPT-5.2 consumes 2x credits -- your $150 plan may only cover 300-750 real responses.

**Octively** uses a flat credits allocation per plan with no per-message overage surprises. Heavy usage flows through the existing credits ledger; credit packs are available if needed. The base chatbot service cost is predictable.

---

### USP 5 -- RAG Knowledge Base Included at Every Tier

Competitors either don't have true RAG, gate it behind expensive tiers, or offer only basic FAQ matching:

- **Tidio's Lyro AI**: learns from FAQ articles only; does not ingest arbitrary documents or perform semantic retrieval. The $39/mo Lyro add-on is required on top of the base plan.
- **Chatbase**: basic retrieval, not full semantic RAG. Credit system makes heavy retrieval expensive.
- **Tidio/SiteGPT**: no deep semantic search over uploaded product catalogs.

**Octively includes in every plan:**
- PDF + DOCX document upload with real-time status indicators (Queued → Parsing → Embedding → Finalizing)
- Website URL scraping with selective page crawling (include/exclude glob filters)
- CSV/Excel product catalog import with Shopify and WooCommerce auto-detection
- Product catalog overwrite without duplicates (unique identifier column picker)
- pgvector semantic search (Google Gemini text-embedding-004)
- Deterministic RAG text cleaning -- nav menus, cookie banners, footer boilerplate stripped before embedding
- Unanswered questions list -- every query the bot could not answer, so you know exactly what to add

---

### USP 6 -- White-Label Client Portal (Each Client Gets Their Own Branded Login)

This is the feature that justifies the retainer. Instead of the freelancer sending screenshots or being asked "how many people chatted?", each client has their own branded portal at `app.yourdomain.com` where they independently view:
- Conversation history
- Lead captures (with pipeline stages: New / Contacted / Won / Lost)
- Analytics (conversations, messages, resolution rate, per-page breakdown)
- Unanswered questions
- Their chatbot's settings (limited or full access, freelancer controls the level)

**ChatLab** offers a client portal at $360/mo. **Stammer.ai** offers client portal access but only on the $497/mo Full SaaS tier. **Most competitors** (Chatbase, Botsonic, SiteGPT, Tidio) do not offer a branded client portal at all.

Octively's client portal is included in the Agency plan at $79/mo -- the lowest price in the market for this feature.

---

### USP 7 -- Lead Management Built for Agencies

Competitors focus on lead *capture* (a form before the chat). Octively goes further:

| Feature | Octively | Typical competitor |
|---|---|---|
| Pre-chat lead form | Yes | Most have this |
| Leads saved past plan limit (shown with upgrade prompt) | Yes | Silently dropped |
| Lead pipeline (New / Contacted / Won / Lost) | Yes | Not available |
| CSV lead export | Yes | Often gated |
| Slack lead alerts | Yes | Rare |
| Lead webhook with HMAC-SHA256 signing | Yes | Rare |
| Instant lead notification email | Yes | Rare |
| WhatsApp continue button | Yes | Not available |
| Embed key rotation (security if key leaks) | Yes | Not available |

The lead pipeline turns the chatbot from a "lead capture" tool into a lightweight CRM. The freelancer and their client can track every lead from first contact to closed deal without leaving the platform.

---

### USP 8 -- Streaming Responses + Zero Perceived Latency

Octively serves token-by-token SSE output with a typing indicator from the first token. This is not trivial -- most chatbot SaaS platforms serve single-shot JSON responses that feel slow on any mobile connection.

The `Content-Encoding: none` header fix (shipped v1.0.0) prevents Next.js from gzip-buffering the stream, so responses appear token-by-token on all providers and connection types including Pakistani 4G networks.

---

### USP 9 -- Urdu and Roman Urdu Reply Language Control

Octively is the only AI chatbot builder with a per-bot setting for:
- Auto (mirror the visitor's language)
- English
- Urdu
- Roman Urdu

For Pakistani e-commerce and SMB clients, this is significant. A bot that replies in Roman Urdu ("Aap ka order ready hai") converts better than one that replies in formal English or broken Urdu script.

No competitor has this feature because no competitor targets the Pakistan market.

---

### USP 10 -- Smart Model Routing Per Bot

Each bot can be set to "Auto" routing, where the system selects the optimal LLM model per query by complexity. Simpler greetings and FAQ queries use faster/cheaper models; complex product or multi-step queries use more capable models. This is a developer tool that most clients never need to touch, but it means the freelancer gets the best cost-to-quality ratio automatically.

Model speed badges (Ultra Fast / Fast / Balanced / Smart / Experimental) are visible in bot settings so the freelancer can make an informed choice per client use case.

---

### USP 11 -- BYOK (Bring Your Own LLM Key), Encrypted at Rest

Agency and Pro customers can connect their own OpenAI, Anthropic, or other provider API key, stored encrypted with AES-GCM. This means:
- Freelancers with existing OpenAI credits can use them directly
- Clients with enterprise AI contracts can plug in their own keys
- The platform never sees plaintext keys

No competitor below $200/mo offers this with AES-GCM encryption at rest.

---

### USP 12 -- Per-Bot Analytics and Conversation Intelligence

Most competitors show aggregate dashboard metrics. Octively surfaces:
- **Per-bot usage tab**: conversations, messages, tokens, credits, model breakdown at a glance
- **Per-page analytics**: which URLs on the client's site drive the most conversations and which have the highest escalation rate
- **Resolution rate tracking**: what percentage of conversations were resolved vs escalated
- **Message ratings**: thumbs up/down on each reply; satisfaction % in the Analytics tab
- **Human handoff detection**: bot flags conversations for human review when it expresses uncertainty
- **Routing intelligence page**: per-bot model routing decisions with latency metrics

This gives the freelancer a real story to tell the client in their monthly report, not just "the bot answered X conversations."

---

### USP 13 -- Unanswered Questions List

Every chatbot has a blind spot -- questions it cannot answer because the knowledge base doesn't cover them. Octively surfaces the full pair: the visitor's question plus the bot's uncertain reply, with a link to the conversation.

This is actionable: the freelancer reviews the list, adds the missing content to the knowledge base, and the bot improves. No competitor makes this workflow this simple.

---

### USP 14 -- Security by Default

- **Domain lock**: every bot is tied to its configured store URL. A copied embed key cannot be deployed to another website -- it will not work. Competitors let any website use a copied embed key.
- **Embed key rotation**: a compromised key can be rotated in one click. The old key continues to work for a 24-hour grace window so live widgets stay operational while the new key is deployed.
- **HMAC-SHA256 signing** on lead webhooks -- payload authenticity is verifiable.

---

## 3. Feature Matrix vs Top Competitors

| Feature | Octively Free | Octively Agency ($79) | Stammer Full SaaS ($497) | ChatLab Agency ($360) | Chatbase Pro ($500) |
|---|---|---|---|---|---|
| Permanent free plan | Yes | -- | No | No | No (inactivity delete) |
| PKR pricing | Yes | Yes | No | No | No |
| PayFast | Yes | Yes | No | No | No |
| Per-message fees | None | None | Yes ($0.001-0.03) | Yes ($7/1K credits) | Yes (credit system) |
| White-label client portal | No | Yes | Yes | Yes | No |
| RAG (document + URL) | Yes | Yes | Basic | Limited | Basic |
| Urdu/Roman Urdu | Yes | Yes | No | No | No |
| Lead pipeline (CRM stages) | Yes | Yes | No | No | No |
| Slack lead alerts | Yes | Yes | No | No | No |
| Lead webhook (HMAC signed) | Yes | Yes | No | No | No |
| Streaming SSE responses | Yes | Yes | Unknown | Unknown | No (single-shot) |
| Per-page analytics | Yes | Yes | No | No | No |
| BYOK (encrypted) | No | Yes | Yes (unconfirmed) | No | No |
| Embed key rotation | Yes | Yes | No | No | No |
| Domain lock (default) | Yes | Yes | No | No | No |
| CSV product catalog import | Yes | Yes | No | No | No |
| Selective page crawling | Yes | Yes | No | No | No |
| Unanswered questions list | Yes | Yes | No | No | No |
| Bot preview (in-dashboard) | Yes | Yes | No | Limited | No |
| Model speed badges | Yes | Yes | No | No | No |
| Smart auto-routing | Yes | Yes | No | No | No |

---

## 4. Positioning Matrix

| Dimension | Octively | Nearest competitor |
|---|---|---|
| Cheapest white-label agency plan | $79/mo | ChatLab: $360/mo (4.6x) |
| Only PKR + PayFast pricing | Yes | None |
| Permanent free plan | Yes | None |
| Flat pricing (no per-message surprises) | Yes | None below $300/mo |
| Urdu / Roman Urdu support | Yes | None |
| Lead pipeline (CRM stages) | Yes | None in chatbot SaaS |
| Unanswered questions workflow | Yes | None in same price range |
| Domain lock by default | Yes | None |

---

## 5. Where Octively Is Not Yet the Best

Be honest in internal planning about current gaps:

| Area | Gap | In-progress / planned |
|---|---|---|
| WordPress plugin | Manual script paste required | In progress |
| Team seats (multi-member workspace) | Single user per workspace | Planned |
| WhatsApp Business API channel | Website-only today | Planned (Phase 6) |
| Mobile app | Web only | Planned |
| Voice input | Not available | Planned (demand-gated) |
| Full REST API | Webhooks only today | Planned |
| Custom portal subdomain | app.octively.com only | Planned |
| Weekly email digest | Manual checks only | In progress |

---

## 6. Sales Messaging Map

### For a Pakistani freelancer considering sign-up:

> "The only AI chatbot builder priced in Pakistani rupees, with PayFast support, and a permanent free plan. No credit card. No trial timer. Build your first bot free, then pitch it to a client."

### For an agency owner evaluating scale:

> "Unlimited clients at ₨20,000/month flat. No per-seat fees. No per-message surprises. Each client logs into their own branded portal to see conversations, leads, and analytics -- you stop getting support calls and start collecting retainers."

### Against Stammer.ai ($497/mo):

> "Stammer costs $497/month for full white-label plus $0.001-$0.03 per message on top. Octively Agency is $79/month with no per-message fees. For 10 active clients, the difference is $400-800+/month every month."

### Against ChatLab ($360/mo):

> "ChatLab charges $360/month for 25 bots and then $7/month for each additional bot and user. Octively is $79/month with no per-bot add-on fees, plus Urdu language support, lead pipeline, and Slack alerts that ChatLab doesn't have."

### Against Chatbase (white-label branding at $199 add-on):

> "Chatbase charges $199/month extra just to remove their branding. Your entire Octively Agency plan costs $79/month and includes a full white-label client portal."

---

## 7. Competitive Moat Summary

Octively's defensible advantages are **not** features any competitor can copy next sprint. They are structural:

1. **PKR + PayFast integration** -- requires local entity, local payment relationships, local support. No global competitor is building this.
2. **Permanent free plan economics** -- works because the platform uses LiteLLM with free-tier model routing (Llama 3.3 70B via OpenRouter free tier). Competitors using GPT-4 cannot offer a genuine free tier.
3. **Price point** -- $79/month is only sustainable with the same free-model routing. Any competitor entering this price point would have to restructure their LLM cost model.
4. **Pakistan-specific UX** (Urdu/Roman Urdu, WhatsApp continue button, local support) -- requires product commitment, not just a feature flag.

---

*Report compiled June 2026. Re-run competitor pricing checks quarterly as the market is volatile.*
