# Free SEO Tools: Keyword Research and Batch Plan

Last updated: 2026-06-09

## Why this doc exists

Octively grows the top of the funnel with free, useful tools that rank for buyer-adjacent searches and end in
a "Start free" CTA. We already ship 3 calculators and 1 directory. This doc ranks the next set of tool ideas by
demand and product fit, so each batch is a deliberate bet, not a guess.

A note on the numbers: we do not have a paid keyword API (DataForSEO, Ahrefs) wired in, so the demand column is
an **estimate** from SERP and competitor signals, not a precise monthly volume. The strongest signal we have is
simple: if several chatbot SaaS competitors already publish a given free tool, the demand and commercial intent
are real. That signal drove this ranking.

## How demand was checked

- Tavily web research on each tool idea and the broader "free tools for freelancers / chatbots" space.
- Competitor tool-page audit: SiteGPT, ChatMaxima, WhisperChat, BuiltABot, Jotform, Thryv, Plutio all run free
  tools as an SEO channel. The tools they repeat are the ones with proven pull.
- Intent read per idea (informational vs commercial) and a rough difficulty/effort estimate.

Method references: `claude-seo` skill suite (SERP clustering, planning) plus Tavily/WebSearch.

## Ranked tool ideas

Demand: relative estimate (High / Medium / Low). Intent: who searches and why. Effort: build cost for us.
Engine: how it runs (static bank = no LLM cost; AI = LLM call; heuristic = scrape + rules).

| # | Tool | Keyword cluster | Demand | Intent | Difficulty to rank | Effort | Engine | Product tie-in (CTA) | Batch |
|---|------|-----------------|--------|--------|--------------------|--------|--------|----------------------|-------|
| 1 | Chatbot name generator | "chatbot name generator", "ai chatbot names", "bot name ideas" | High | Setting up a bot, needs a name | Medium (many incumbents) | Low | Static bank + optional AI | "Name it, then build it free in Octively" | 1 |
| 2 | Chatbot welcome message generator | "chatbot welcome message", "chatbot greeting examples", "welcome message generator" | High | Configuring a live bot now | Medium | Low | Static bank + optional AI | "Use this greeting in your Octively bot" | 1 |
| 3 | AI FAQ / knowledge generator | "ai faq generator", "faq generator from website", "chatbot knowledge base" | High | Building bot content / RAG | Medium-High | Medium | AI-first + static fallback | "Paste these straight into Octively's knowledge base" | 1 |
| 4 | Website chatbot readiness checker | "is my website ready for a chatbot", "chatbot for my website", "add chatbot to website" | Medium | Evaluating, pre-purchase | Low (novel angle) | Medium | Heuristic (Firecrawl scrape) | "Your site scored X. Octively can fix the gaps" | 1 |
| 5 | AI service proposal / scope generator | "ai chatbot proposal", "how to sell ai chatbot service", "chatbot service proposal" | Medium | Freelancer selling the retainer | Low | Medium | AI-first | "Win the client, deliver with Octively" | 2 |
| 6 | Cost-per-lead / lead value calculator | "cost per lead calculator", "lead value calculator" | Medium | Pricing a lead-gen service | High (generic) | Low | Static | Feeds the ROI story | 2 |
| 7 | Support deflection savings calculator | "support cost savings chatbot", "support deflection calculator" | Low-Med | Justifying a bot to a client | Medium | Low | Static | Strengthens ROI pitch | 2 |
| 8 | System prompt / persona generator | "chatbot system prompt", "ai persona generator" | Medium | Builders tuning a bot | Medium | Low | Static bank + optional AI | Maps to bot persona settings | 2 |
| 9 | Chatbot ROI calculator | existing | - | - | - | - | - | Already shipped | done |
| 10 | Chatbot pricing calculator | existing | - | - | - | - | - | Already shipped | done |

## Batch 1 (approved, building now)

The four highest-fit tools. Two are static-first (near-zero cost, high traffic), one is AI-first because the
output must be business-specific, one is a novel heuristic checker that doubles as a soft audit / lead-in.

1. **Chatbot name generator** — `/tools/ai-chatbot-name-generator`. Static bank of 100+ names tagged by
   industry and vibe; optional "Generate with AI" for more variety.
2. **Chatbot welcome message generator** — `/tools/chatbot-welcome-message-generator`. Static bank of 100+
   templates tagged by tone and goal, with token substitution; optional AI.
3. **AI FAQ / knowledge generator** — `/tools/chatbot-faq-generator`. AI-first (gated), with a static
   industry starter set as fallback. Strongest product tie-in: output is formatted to paste into the RAG
   knowledge base.
4. **Website chatbot readiness checker** — `/tools/website-chatbot-readiness-checker`. One Firecrawl scrape,
   heuristic score and checklist, CTA to fix the gaps with Octively.

## Batch 2 (backlog, from the table above)

Proposal/scope generator (#5), cost-per-lead and support-deflection calculators (#6, #7), system prompt /
persona generator (#8). Revisit after Batch 1 ships and we see which pages attract traffic.

## Notes for future batches

- Competitors cluster their free tools and cross-link them. We should do the same: link the calculators, the
  generators, and the directory to each other so link equity stays in the tools cluster.
- Every tool keeps the email capture + "Start free" CTA. SEO is a 6 to 12 month bet; the CTA is what makes the
  traffic worth something before rankings mature.
- Re-evaluate demand once GA4 + Search Console have a few months of query data. Real query data beats these
  estimates.
