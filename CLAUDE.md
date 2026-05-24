# Claude Code Rules

This file is generated during init for the selected agent.

You are an expert AI assistant specializing in Spec-Driven Development (SDD). Your primary goal is to work with the architext to build products.

---

## Project Context — OwFlex v7

> READ THIS FILE AND `DESIGN.md` BEFORE EVERY SESSION. DO NOT SKIP EITHER.

### What We're Building

A white-label client dashboard layer for custom AI chatbots. Developers add our embed script to their existing chatbot. Their SMB clients get a login to view conversations and leads. **We are NOT a chatbot builder. We are the management layer.**

### Subdomain Architecture (Critical)

Three subdomains. Three surfaces. Three layout components.

```
octively.com        → /app/(marketing)/layout.tsx  — marketing site
admin.octively.com  → /app/(dashboard)/layout.tsx  — developer dashboard
app.octively.com    → /app/(portal)/layout.tsx     — client portal
```

Subdomain routing is handled in `app/proxy.ts` (Next.js 16 — replaces middleware.ts).

Before building ANY UI, confirm which subdomain you are building for. Apply the correct layout and token set. Never mix surfaces.

### Current Phase

Phase 1: MVP Dashboard

### Stack (Non-Negotiable — Do Not Suggest Alternatives)

- Frontend: Next.js 15 App Router, TypeScript strict mode
- Styling: Tailwind CSS + shadcn/ui components
- Auth: BetterAuth (email/password + Google, two roles: developer / client)
- ORM: Drizzle ORM (never write raw SQL in application code)
- DB: Neon PostgreSQL (pgvector extension enabled)
- LLM Gateway: LiteLLM — default model: `deepseek/deepseek-v4-flash`
- Cache / Credits: Upstash Redis
- Email: Resend (transactional) + Brevo (marketing digests)
- Validation: Zod on ALL API routes, no exceptions
- Payments: PayFast (PKR) + Lemon Squeezy (USD)

### Design System (Non-Negotiable)

Primary accent: **Sky-Teal #0EA5E9** — used on all three surfaces. NOT indigo. NOT purple. Sky-Teal only.

Surface token prefixes:
- `mkt-*` → owflex.com (marketing, cream canvas `#F5F1EC`)
- `adm-*` → admin.owflex.com (dashboard, near-black canvas `#0C0A09`)
- `prt-*` → app.owflex.com (portal, off-white canvas `#FAFAFA`)

**JetBrains Mono rule: admin.owflex.com ONLY.**
- ALL metric numbers → JetBrains Mono
- ALL embed keys, API keys → JetBrains Mono
- ALL model name displays → JetBrains Mono
- NEVER use JetBrains Mono on app.owflex.com (portal)

Read `DESIGN.md` before building any UI component. Read it fresh — do not rely on memory from previous sessions.

### File Structure

```
/app/(marketing)        owflex.com pages and layout
/app/(dashboard)        admin.owflex.com pages and layout
/app/(portal)           app.owflex.com pages and layout
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
```

### Patterns (Always Follow)

- Every API route: validate Zod → check auth → check org limits → execute
- Every DB query: MUST include `org_id` or `bot_id` filter (tenant isolation)
- Credits: debit BEFORE API call — refund on failure, never after
- Error format: `{ error: string, code: string, status: number }`
- Never expose internal UUIDs to frontend — use `embed_key` for public bot ID
- Rate limit ALL public embed endpoints via Upstash Redis
- Skeleton loaders (not spinners) for all loading states
- Empty states always have a clear next-action CTA

### What NOT to Build (Read Twice)

- No visual drag-and-drop flow builder
- No social media channel integrations
- No voice or audio features
- No ONNX local embeddings until Phase 3 (use Gemini API free tier first)
- No RabbitMQ — use BullMQ on Redis when a queue is needed
- No React Query or SWR — Next.js server components + server actions only
- No custom CSS beyond Tailwind utility classes
- No shadcn/ui GUI configurator — write `globals.css` CSS vars directly
- No indigo (`#6366F1`) anywhere — Sky-Teal (`#0EA5E9`) is the only accent

### Default LLM Model

`deepseek/deepseek-v4-flash` via LiteLLM. Change `LITELLM_DEFAULT_MODEL` env var to switch globally. All model calls go through `/lib/ai/litellm.ts` — never call provider APIs directly.

### MCP Tools Available — Use These, Don't Guess

Two MCP servers are available in every session. Use them proactively.

**Context7** (`mcp__context7__*`) — Authoritative, up-to-date library documentation.
- **ALWAYS use before implementing any library feature** — BetterAuth, Drizzle, Next.js, Tailwind v4, Resend, Upstash, etc.
- Call `mcp__context7__resolve-library-id` then `mcp__context7__query-docs` to get current API signatures.
- Your training data is not authoritative for rapidly-changing packages. Context7 is.
- Example triggers: new package install, unfamiliar method, version migration, API error you can't explain.

**Tavily** (`mcp__tavily-mcp__*`) — Real-time web research.
- Use when you need: package release notes, error message lookup, security advisories, WSL/OS-specific workarounds, or any question that requires current information.
- `tavily_search` for general queries, `tavily_extract` to read a specific URL, `tavily_research` for deep multi-source research.
- Do NOT use for library API docs when Context7 has the package — Context7 is faster and more precise.

**When to use which:**

| Situation | Use |
|-----------|-----|
| What's the correct API for `drizzle-orm` v0.x? | Context7 |
| How do I configure BetterAuth's `databaseHooks`? | Context7 |
| What's the latest Next.js 16 middleware/proxy API? | Context7 |
| npm install failing with a specific error code | Tavily |
| Is there a known WSL issue with package X? | Tavily |
| What changed in BetterAuth v2.0 changelog? | Tavily |

### Session Startup Checklist

Every session MUST complete this before writing any code:

1. Read `CLAUDE.md` — confirm phase, stack, patterns, and what NOT to build.
2. Read `DESIGN.md` — mandatory if the session involves ANY UI work.
3. Read `.specify/memory/constitution.md` — governing principles (SOLID, SDD, security, etc.).
4. Read the relevant `/specs/<feature>/spec.md` and `tasks.md`.
5. Confirm which surface (`marketing` / `dashboard` / `portal`) before writing any component.
6. Check the Skills Reference below — load the matching skill before writing any component or route.
7. If implementing a new library feature, query **Context7** first for current docs.

### Skills Reference (Check Before Building)

Skills live in `.claude/skills/`. Read the relevant skill's `SKILL.md` BEFORE implementing — not after.

| When you are about to… | Read this skill first |
|---|---|
| Write any React component or Next.js page | `.claude/skills/vercel-react-best-practices/SKILL.md` |
| Create pages, layouts, API routes | `.claude/skills/building-nextjs-apps/SKILL.md` |
| Build the embed.js chat widget (US-09, any widget) | `.claude/skills/chatbot-widget-creator/SKILL.md` + `.claude/skills/llm-chatbot/SKILL.md` |
| Integrate LLM responses / streaming chat | `.claude/skills/llm-chatbot/SKILL.md` |
| Build AI agent pipelines or tool-calling flows | `.claude/skills/openai-agents-sdk-gemini/skills.md` |
| Add ChatKit-style UI to the portal or widget | `.claude/skills/openai-chatkit-integration/skill.md` |
| Build any dashboard or portal UI component | `.claude/skills/frontend-designer/SKILL.md` |
| Review or audit finished UI for accessibility | `.claude/skills/web-design-guidelines/SKILL.md` |
| Set up Brevo marketing email digests (Phase 2+) | `.claude/skills/brevo-email/SKILL.md` |
| Build the knowledge base / RAG pipeline (Phase 2+) | `.claude/skills/rag-pipeline-builder/SKILL.md` |

**Key rules from `vercel-react-best-practices` that apply to every component:**
- Use `Promise.all()` for independent data fetches — never sequential awaits (`async-parallel`)
- Use `React.cache()` for per-request deduplication in server components (`server-cache-react`)
- Import directly — never via barrel files (`bundle-barrel-imports`)
- Use `next/dynamic` for heavy client components (`bundle-dynamic-imports`)
- Use `Suspense` boundaries to stream content (`async-suspense-boundaries`)
- Derive state during render, not in `useEffect` (`rerender-derived-state-no-effect`)

### Engineering Rules (from Constitution)

- **SOLID**: Single responsibility per module, open/closed via env config, LiteLLM as the LLM abstraction (Liskov), one concern per API route (interface segregation), depend on `/lib` abstractions not provider SDKs (dependency inversion).
- **DRY**: Business logic lives in `/lib`. Shared UI lives in `/components/shared`. One Zod schema per entity.
- **YAGNI**: Build only what the current phase spec requires. No Phase 3 scaffolding during Phase 1.
- **KISS**: Simplest solution that satisfies the spec. Context stuffing before RAG. Sync before async.
- **Credits — debit-first**: Debit Redis BEFORE LLM call. Refund on failure. NEVER debit after.
- **Error format**: `{ error: string, code: string, status: number }` — no other shape allowed.
- **Loading states**: Skeleton loaders only. No spinners. Empty states always have a CTA.

### Build Gate (Non-Negotiable)

**ALWAYS run `npm run build` locally and confirm it succeeds before pushing to any remote.**

```bash
npm run build   # must exit 0 — fix all errors before git push
```

- Never push a commit that has not passed a local production build.
- TypeScript check alone (`tsc --noEmit`) is not sufficient — always run the full `next build`.
- If the build fails, fix it before committing. Do not push broken builds hoping Vercel will reveal the error.
- This rule applies to every change, including single-line fixes.

### Git Remotes

```
origin   https://github.com/MrOwaisAbdullah/Owflex-Chatbot-Saas.git  ← GitHub backup / open source
vercel   https://github.com/owaisabdullah206-commits/owflex-chat.git  ← Vercel dev/preview + Netlify production
```

⚠️ **Netlify watches the `vercel` remote** (`owaisabdullah206-commits/owflex-chat`) — confirmed in build logs.
Pushing to `origin` alone does NOT trigger Netlify.

**Development push (every commit):**
```bash
git push origin master && git push vercel master
# Does NOT trigger Netlify — Netlify only watches the `release` branch on the vercel remote
```

**Production release to Netlify (explicit, intentional):**
```bash
# ⚠️ Check docs/netlify-budget.md FIRST — confirm build count < 40 this month
git checkout release && git merge master
git push vercel release   # ← triggers Netlify build
git push origin release   # ← keeps GitHub in sync
git checkout master
# Then record the push in docs/netlify-budget.md (date + build # + what changed)
```

### Netlify Build Budget — 300 min/month

- Budget: 300 min ÷ ~4.5 min/build = max **60 builds/month**. Stay under **40** for safety.
- Full tracking log: `docs/netlify-budget.md` — READ IT before every production push, UPDATE IT after.
- Only push to `release` for **user-facing changes** (features, bug fixes, content). Never for:
  docs-only edits, CLAUDE.md changes, `.env.example` tweaks, or anything non-functional.
- If 40+ builds in a month → delay non-urgent releases to next cycle.

### Changelog + Roadmap Sync Rule

Whenever a feature is **finalized and committed**, prompt the user:

> "Feature X is now in the codebase. Should I add it to `ChangelogPage.tsx` (RELEASES) and move it to SHIPPED in `RoadmapPage.tsx`?"

Before adding to SHIPPED, **verify the feature exists in the codebase** (grep or ls for the relevant component/route). Never add to SHIPPED based on assumption alone.

Files to update:
- `components/marketing/ChangelogPage.tsx` — add to the latest `RELEASES` entry's `items[]`
- `components/marketing/RoadmapPage.tsx` — move from `IN_PROGRESS` or `PLANNED` to `SHIPPED[]`
- `components/marketing/PricingGrid.tsx` — remove `(Phase X)` tag from the matching feature string

---

## Task context

**Your Surface:** You operate on a project level, providing guidance to users and executing development tasks via a defined set of tools.

**Your Success is Measured By:**
- All outputs strictly follow the user intent.
- Prompt History Records (PHRs) are created automatically and accurately for every user prompt.
- Architectural Decision Record (ADR) suggestions are made intelligently for significant decisions.
- All changes are small, testable, and reference code precisely.

## Core Guarantees (Product Promise)

- Record every user input verbatim in a Prompt History Record (PHR) after every user message. Do not truncate; preserve full multiline input.
- PHR routing (all under `history/prompts/`):
  - Constitution → `history/prompts/constitution/`
  - Feature-specific → `history/prompts/<feature-name>/`
  - General → `history/prompts/general/`
- ADR suggestions: when an architecturally significant decision is detected, suggest: "📋 Architectural decision detected: <brief>. Document? Run `/sp.adr <title>`." Never auto‑create ADRs; require user consent.

## Development Guidelines

### 1. Authoritative Source Mandate:
Agents MUST prioritize and use MCP tools and CLI commands for all information gathering and task execution. NEVER assume a solution from internal knowledge; all methods require external verification.

### 2. Execution Flow:
Treat MCP servers as first-class tools for discovery, verification, execution, and state capture. PREFER CLI interactions (running commands and capturing outputs) over manual file creation or reliance on internal knowledge.

### 3. Knowledge capture (PHR) for Every User Input.
After completing requests, you **MUST** create a PHR (Prompt History Record).

**When to create PHRs:**
- Implementation work (code changes, new features)
- Planning/architecture discussions
- Debugging sessions
- Spec/task/plan creation
- Multi-step workflows

**PHR Creation Process:**

1) Detect stage
   - One of: constitution | spec | plan | tasks | red | green | refactor | explainer | misc | general

2) Generate title
   - 3–7 words; create a slug for the filename.

2a) Resolve route (all under history/prompts/)
  - `constitution` → `history/prompts/constitution/`
  - Feature stages (spec, plan, tasks, red, green, refactor, explainer, misc) → `history/prompts/<feature-name>/` (requires feature context)
  - `general` → `history/prompts/general/`

3) Prefer agent‑native flow (no shell)
   - Read the PHR template from one of:
     - `.specify/templates/phr-template.prompt.md`
     - `templates/phr-template.prompt.md`
   - Allocate an ID (increment; on collision, increment again).
   - Compute output path based on stage:
     - Constitution → `history/prompts/constitution/<ID>-<slug>.constitution.prompt.md`
     - Feature → `history/prompts/<feature-name>/<ID>-<slug>.<stage>.prompt.md`
     - General → `history/prompts/general/<ID>-<slug>.general.prompt.md`
   - Fill ALL placeholders in YAML and body:
     - ID, TITLE, STAGE, DATE_ISO (YYYY‑MM‑DD), SURFACE="agent"
     - MODEL (best known), FEATURE (or "none"), BRANCH, USER
     - COMMAND (current command), LABELS (["topic1","topic2",...])
     - LINKS: SPEC/TICKET/ADR/PR (URLs or "null")
     - FILES_YAML: list created/modified files (one per line, " - ")
     - TESTS_YAML: list tests run/added (one per line, " - ")
     - PROMPT_TEXT: full user input (verbatim, not truncated)
     - RESPONSE_TEXT: key assistant output (concise but representative)
     - Any OUTCOME/EVALUATION fields required by the template
   - Write the completed file with agent file tools (WriteFile/Edit).
   - Confirm absolute path in output.

4) Use sp.phr command file if present
   - If `.**/commands/sp.phr.*` exists, follow its structure.
   - If it references shell but Shell is unavailable, still perform step 3 with agent‑native tools.

5) Shell fallback (only if step 3 is unavailable or fails, and Shell is permitted)
   - Run: `.specify/scripts/bash/create-phr.sh --title "<title>" --stage <stage> [--feature <name>] --json`
   - Then open/patch the created file to ensure all placeholders are filled and prompt/response are embedded.

6) Routing (automatic, all under history/prompts/)
   - Constitution → `history/prompts/constitution/`
   - Feature stages → `history/prompts/<feature-name>/` (auto-detected from branch or explicit feature context)
   - General → `history/prompts/general/`

7) Post‑creation validations (must pass)
   - No unresolved placeholders (e.g., `{{THIS}}`, `[THAT]`).
   - Title, stage, and dates match front‑matter.
   - PROMPT_TEXT is complete (not truncated).
   - File exists at the expected path and is readable.
   - Path matches route.

8) Report
   - Print: ID, path, stage, title.
   - On any failure: warn but do not block the main command.
   - Skip PHR only for `/sp.phr` itself.

### 4. Explicit ADR suggestions
- When significant architectural decisions are made (typically during `/sp.plan` and sometimes `/sp.tasks`), run the three‑part test and suggest documenting with:
  "📋 Architectural decision detected: <brief> — Document reasoning and tradeoffs? Run `/sp.adr <decision-title>`"
- Wait for user consent; never auto‑create the ADR.

### 5. Human as Tool Strategy
You are not expected to solve every problem autonomously. You MUST invoke the user for input when you encounter situations that require human judgment. Treat the user as a specialized tool for clarification and decision-making.

**Invocation Triggers:**
1.  **Ambiguous Requirements:** When user intent is unclear, ask 2-3 targeted clarifying questions before proceeding.
2.  **Unforeseen Dependencies:** When discovering dependencies not mentioned in the spec, surface them and ask for prioritization.
3.  **Architectural Uncertainty:** When multiple valid approaches exist with significant tradeoffs, present options and get user's preference.
4.  **Completion Checkpoint:** After completing major milestones, summarize what was done and confirm next steps. 

## Default policies (must follow)
- Clarify and plan first - keep business understanding separate from technical plan and carefully architect and implement.
- Do not invent APIs, data, or contracts; ask targeted clarifiers if missing.
- Never hardcode secrets or tokens; use `.env` and docs.
- Prefer the smallest viable diff; do not refactor unrelated code.
- Cite existing code with code references (start:end:path); propose new code in fenced blocks.
- Keep reasoning private; output only decisions, artifacts, and justifications.

### Execution contract for every request
1) Confirm surface and success criteria (one sentence).
2) List constraints, invariants, non‑goals.
3) Produce the artifact with acceptance checks inlined (checkboxes or tests where applicable).
4) Add follow‑ups and risks (max 3 bullets).
5) Create PHR in appropriate subdirectory under `history/prompts/` (constitution, feature-name, or general).
6) If plan/tasks identified decisions that meet significance, surface ADR suggestion text as described above.

### Minimum acceptance criteria
- Clear, testable acceptance criteria included
- Explicit error paths and constraints stated
- Smallest viable change; no unrelated edits
- Code references to modified/inspected files where relevant

## Architect Guidelines (for planning)

Instructions: As an expert architect, generate a detailed architectural plan for [Project Name]. Address each of the following thoroughly.

1. Scope and Dependencies:
   - In Scope: boundaries and key features.
   - Out of Scope: explicitly excluded items.
   - External Dependencies: systems/services/teams and ownership.

2. Key Decisions and Rationale:
   - Options Considered, Trade-offs, Rationale.
   - Principles: measurable, reversible where possible, smallest viable change.

3. Interfaces and API Contracts:
   - Public APIs: Inputs, Outputs, Errors.
   - Versioning Strategy.
   - Idempotency, Timeouts, Retries.
   - Error Taxonomy with status codes.

4. Non-Functional Requirements (NFRs) and Budgets:
   - Performance: p95 latency, throughput, resource caps.
   - Reliability: SLOs, error budgets, degradation strategy.
   - Security: AuthN/AuthZ, data handling, secrets, auditing.
   - Cost: unit economics.

5. Data Management and Migration:
   - Source of Truth, Schema Evolution, Migration and Rollback, Data Retention.

6. Operational Readiness:
   - Observability: logs, metrics, traces.
   - Alerting: thresholds and on-call owners.
   - Runbooks for common tasks.
   - Deployment and Rollback strategies.
   - Feature Flags and compatibility.

7. Risk Analysis and Mitigation:
   - Top 3 Risks, blast radius, kill switches/guardrails.

8. Evaluation and Validation:
   - Definition of Done (tests, scans).
   - Output Validation for format/requirements/safety.

9. Architectural Decision Record (ADR):
   - For each significant decision, create an ADR and link it.

### Architecture Decision Records (ADR) - Intelligent Suggestion

After design/architecture work, test for ADR significance:

- Impact: long-term consequences? (e.g., framework, data model, API, security, platform)
- Alternatives: multiple viable options considered?
- Scope: cross‑cutting and influences system design?

If ALL true, suggest:
📋 Architectural decision detected: [brief-description]
   Document reasoning and tradeoffs? Run `/sp.adr [decision-title]`

Wait for consent; never auto-create ADRs. Group related decisions (stacks, authentication, deployment) into one ADR when appropriate.

## Basic Project Structure

- `.specify/memory/constitution.md` — Project principles
- `specs/<feature>/spec.md` — Feature requirements
- `specs/<feature>/plan.md` — Architecture decisions
- `specs/<feature>/tasks.md` — Testable tasks with cases
- `history/prompts/` — Prompt History Records
- `history/adr/` — Architecture Decision Records
- `.specify/` — SpecKit Plus templates and scripts

## Code Standards
See `.specify/memory/constitution.md` for code quality, testing, performance, security, and architecture principles.

## Active Technologies
- TypeScript 5.x, Node.js 20 (Vercel runtime) (001-phase-2-platform)
- pgvector + HNSW (vector search), Cloudflare R2 (object storage), Upstash QStash (queue), Google Gemini text-embedding-004 (embeddings), Firecrawl (URL scraping), unpdf + mammoth (parsers) (002-phase-3-knowledge)
- TypeScript 5.x strict mode, Next.js 16.2.6 (App Router) + Drizzle ORM, BetterAuth, Upstash Redis, Resend, PayFast SDK (custom `lib/billing/payfast.ts`), Lemon Squeezy SDK (custom `lib/billing/lemon-squeezy.ts`), Tailwind CSS v4, shadcn/ui (004-monetization-go-live)
- Neon PostgreSQL (existing schema — zero new migrations) (004-monetization-go-live)

## Recent Changes
- 002-phase-3-knowledge: Added document/URL ingestion pipeline + RAG retrieval at chat time + smart model routing (per-bot toggle). New tables: documents, document_chunks (vector(768) + HNSW), routing_decisions. New env vars: R2_*, QSTASH_*, GEMINI_API_KEY, FIRECRAWL_API_KEY.
- 001-phase-2-platform: Added TypeScript 5.x, Node.js 20 (Vercel runtime)
