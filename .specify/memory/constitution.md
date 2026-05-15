<!--
  SYNC IMPACT REPORT
  ==================
  Version change:     (template) → 1.0.0
  Added principles:   I through IX (all new — first fill of template)
  Added sections:     Stack Constraints, Data & Privacy Standards, Design System
  Removed sections:   n/a (template placeholders cleared)
  Templates updated:
    ✅ plan-template.md    — Constitution Check gates align with principles below
    ✅ spec-template.md    — Acceptance criteria and FR patterns align
    ✅ tasks-template.md   — Phase structure aligns with SDD + TDD discipline
    ✅ CLAUDE.md           — DESIGN.md reference + session startup updated
  Deferred TODOs:     none
-->

# OwFlex Constitution

> This constitution governs ALL development on the OwFlex SaaS project.
> Every session MUST read this file AND `DESIGN.md` before writing any code or UI.
> Constitution supersedes all other guidance. No exceptions.

---

## Core Principles

### I. Spec-Driven Development — NON-NEGOTIABLE

Every feature begins with a written spec. No spec → no code. No exceptions.

- MUST write `/specs/<feature>/spec.md` before any implementation begins.
- MUST generate `/specs/<feature>/plan.md` before writing tasks.
- MUST generate `/specs/<feature>/tasks.md` before writing implementation code.
- Each task MUST be atomic: one concern, one commit, independently testable.
- Prompt History Records (PHRs) MUST be created after every significant session.
- Never "vibe code." If you cannot point to a spec line, stop and write the spec first.

**Rationale**: v6 died because code grew before understanding was established.
SDD ensures the plan is the product and the code follows — not the reverse.

---

### II. SOLID Engineering Principles

All application code MUST follow SOLID. These are non-negotiable at the class,
module, and API-route level.

**S — Single Responsibility**
Each module, component, API route, and service does exactly one thing.
`/app/api/v1/chat/route.ts` handles chat. It does not handle billing.
`/lib/credits/index.ts` handles credits. It does not call LLMs.

**O — Open/Closed**
Extend behavior via configuration and environment variables.
Do NOT modify existing validated flows to add new behavior — add to them.
Example: new LLM model → add to LiteLLM config, not to chat handler switch.

**L — Liskov Substitution**
Any service dependency MUST be swappable without breaking callers.
LiteLLM enforces this for LLMs. Drizzle enforces this for DB.
If swapping Neon for Hetzner Postgres breaks a single line of app code, that
is an L-violation. Config via env vars (`DATABASE_URL`) is the enforcement mechanism.

**I — Interface Segregation**
API clients MUST NOT be forced to depend on methods they do not use.
Public embed endpoints expose only what the widget needs.
Developer dashboard API and client portal API are separate route groups.
Never create a "god endpoint" that handles multiple unrelated operations.

**D — Dependency Inversion**
High-level modules MUST NOT depend on low-level implementations.
`/lib/ai/litellm.ts` is the abstraction. Chat routes depend on it, not on
`openai` or `anthropic` SDKs directly. `/lib/db` is the abstraction for
data access — no raw SQL in application code outside migrations.

---

### III. DRY, KISS, and YAGNI

**DRY — Don't Repeat Yourself**
- Business logic lives in `/lib`. It is called by routes, never duplicated in them.
- Shared UI patterns live in `/components/shared`. Never copy-paste across surfaces.
- Validation schemas live in `/lib/validators`. One schema per entity, imported everywhere.
- A piece of knowledge MUST have a single, authoritative representation.

**KISS — Keep It Simple, Stupid**
- The simplest solution that satisfies the spec is always the correct solution.
- Context stuffing before RAG. Direct DB query before cache. Synchronous before async.
- Add complexity only when a specific, measured problem demands it.
- Three similar lines of code are better than a premature abstraction.

**YAGNI — You Aren't Gonna Need It**
- Build only what the current phase spec requires. Nothing more.
- No "future-proofing" abstractions that the spec does not mention.
- Phase 1 does not scaffold Phase 3 infrastructure.
- If it is not in `tasks.md`, it does not get built this phase.

---

### IV. Tri-Surface Architecture — NON-NEGOTIABLE

OwFlex ships on three subdomains. Every artifact belongs to exactly one surface.

| Surface | Subdomain | Layout File | Canvas | Tokens |
|---------|-----------|-------------|--------|--------|
| Marketing | owflex.com | `(marketing)/layout.tsx` | Cream `#F5F1EC` | `mkt-*` |
| Dashboard | admin.owflex.com | `(dashboard)/layout.tsx` | Near-black `#0C0A09` | `adm-*` |
| Portal | app.owflex.com | `(portal)/layout.tsx` | Off-white `#FAFAFA` | `prt-*` |

Rules:
- MUST identify the target surface before writing any UI component.
- MUST apply that surface's layout and CSS variable tokens.
- MUST NEVER use `mkt-*` tokens on the dashboard or portal, and vice versa.
- MUST read `DESIGN.md` before implementing any UI. Read it fresh every session.
- JetBrains Mono: `admin.owflex.com` ONLY. NEVER on `app.owflex.com`.
- Sky-Teal `#0EA5E9`: the ONLY accent color across all surfaces.
- Indigo `#6366F1` is BANNED. It signals "AI default UI" — never use it.

**Design System source of truth:** `DESIGN.md` at project root.
Constitution describes the rule. DESIGN.md provides the full token map and
component specifications. Both MUST be read before UI work begins.

---

### V. Security & Tenant Isolation — NON-NEGOTIABLE

**Tenant isolation is a hard correctness requirement, not a best practice.**

- EVERY database query that touches user data MUST be scoped to `org_id` AND verified
  via a join that confirms the requesting session owns that `org_id`.
- Querying by `bot_id` alone is INSUFFICIENT — always join to confirm `org_id` ownership.
- NEVER expose internal UUIDs to the frontend. Use `embed_key` for public bot identity.
- ALL public embed endpoints MUST be rate-limited via Upstash Redis before any processing.
- ALL API routes MUST: validate with Zod → check auth session → check org limits → execute.
  Skipping any step is a defect, not a shortcut.

**Input validation:**
- Zod schema on EVERY API route, no exceptions.
- Reject any input that does not match the schema with `400 VALIDATION_ERROR`.
- Schema is the contract. No ad-hoc `if` checks in route bodies.

**Secrets:**
- NEVER hardcode API keys, database URLs, or tokens. Use `.env` and Dokploy secrets.
- Different keys for dev, staging, and production.
- No secrets committed to git. `.env` is always in `.gitignore`.

**XSS / injection prevention:**
- DOMPurify on all widget-rendered chat content.
- Drizzle ORM parameterized queries — no raw SQL in application code.
- CSP headers via Next.js config.

---

### VI. Design System Compliance — DESIGN.md is the Authority

`DESIGN.md` at the project root is the authoritative visual specification.

- MUST be read at the start of every session that involves UI work.
- Do NOT rely on memory of DESIGN.md from a previous session — read it fresh.
- CSS variables MUST be used everywhere: `var(--bg)`, `var(--surface)`, `var(--ink)`.
- NEVER hardcode hex colors in component files. Token names or `var()` only.
- shadcn/ui is installed and used as a component library — but NEVER use the
  GUI configurator at ui.shadcn.com. Write CSS vars in `globals.css` directly.
- Dark/light mode is applied via surface class on `<html>`:
  `.marketing` | `.dashboard` | `.dashboard.light` | `.portal` | `.portal.dark`

**Enforcement:**
- Any PR that hardcodes a hex color in a component file fails review.
- Any PR that uses indigo (`#6366F1`) anywhere fails review.
- Any PR that uses JetBrains Mono on `app.owflex.com` fails review.

---

### VII. Credits System — Debit-First Pattern

The credits system enforces a specific order that MUST NOT be violated.

```
1. Debit credits atomically from Redis BEFORE making the LLM API call.
2. Make the LLM API call.
3. On success: log usage to Postgres asynchronously (non-blocking).
4. On failure: refund the debited credits atomically (INCRBY rollback).
```

- NEVER debit after the API call. NEVER skip the rollback on failure.
- Redis is the source of truth for current balance. Postgres is the audit ledger.
- When credits are exhausted: fall back to plan's default model silently.
  NEVER show an error to the end-user of the chatbot.
- Credit operations MUST be atomic (Redis DECRBY / INCRBY — not two separate commands).

---

### VIII. Observability & Quality Gates

**Error format (enforced across all API routes):**
```typescript
{ error: string, code: string, status: number }
```
No other error shape is acceptable. Clients depend on this contract.

**Loading states:**
- MUST use skeleton loaders — NOT spinners — for all async loading states.
- Empty states MUST include a clear next-action CTA. Never a blank screen.

**Logging:**
- Sentry captures all unhandled errors (free 5K/mo tier).
- Structured error objects only — no bare `console.error("something failed")`.
- Rate limit violations, auth failures, and credit exhaustion MUST be logged.

**Testing discipline:**
- Integration tests for all credit debit/refund flows (Redis + Postgres consistency).
- Integration tests for tenant isolation (cross-org data leakage MUST be impossible).
- No mock databases for tests that exercise data integrity paths.

**Build gate — NON-NEGOTIABLE:**
- MUST run `npm run build` locally and confirm exit code 0 before every `git push`.
- `tsc --noEmit` alone is insufficient — always run the full `next build`.
- Never push a commit that has not passed a local production build.
- This applies to every change, including single-line fixes and config edits.
- Broken builds waste Vercel build minutes and break staging for the team.

---

### IX. Portability & Zero Lock-in

All infrastructure MUST be configurable via environment variables.
Swapping any service requires changing env vars only — zero application code changes.

```env
DATABASE_URL=           # Neon → Hetzner → any Postgres
REDIS_URL=              # Upstash → self-hosted Redis
STORAGE_URL=            # R2 → S3-compatible
BACKEND_URL=            # HF Spaces → Hetzner FastAPI
LITELLM_DEFAULT_MODEL=  # Change default LLM in one line
```

- All LLM calls go through `/lib/ai/litellm.ts` ONLY.
  Direct imports of `openai`, `anthropic`, or `groq` SDK in application code
  are a lock-in violation.
- Phase migration triggers: Neon > 400MB storage OR > 80 active users → Hetzner.

---

## Stack Constraints

These are final. Do not suggest alternatives. Do not debate during implementation.

| Layer | Choice | Why Fixed |
|-------|--------|-----------|
| Frontend | Next.js 15 App Router + TypeScript strict | App Router server components eliminate React Query/SWR need |
| Styling | Tailwind CSS + shadcn/ui + CSS vars | No GUI configurator; vars written directly in globals.css |
| Auth | BetterAuth | Multi-tenant, two roles (developer/client), no per-seat cost |
| ORM | Drizzle ORM | Lightweight, TypeScript-native, parameterized queries by default |
| Database | Neon PostgreSQL → Hetzner | pgvector included; free tier covers Phase 1–2 |
| LLM Gateway | LiteLLM | One interface, all providers, one env var to swap |
| Default Model | deepseek/deepseek-v4-flash | Best cost/quality at MVP; ~$0.05/M effective with cache |
| Cache/Credits | Upstash Redis | Atomic DECRBY/INCRBY; free 500K commands/mo |
| Email | Resend (transactional) + Brevo (marketing) | Combined free limits cover Phase 1–2 |
| Payments PKR | PayFast | Only reliable PKR payment gateway for Pakistani developers |
| Payments USD | Lemon Squeezy | No LLC required; handles VAT globally |
| Frontend Host | Netlify | Commercial use on free tier; no sleep issues |
| Validation | Zod | TypeScript-native, tree-shakeable, composable schemas |

---

## Data & Privacy Standards

1. **Tenant isolation at ORM layer:** Drizzle middleware injects `org_id` from session.
   Application code MUST NOT filter by `bot_id` alone without confirming `org_id` ownership.

2. **No AI training on user data:** Messages are sent to LLM for response generation only.
   All providers in the stack (DeepSeek via OpenRouter, Groq, Gemini API) operate under
   zero-data-retention tiers. This MUST be stated in the ToS.

3. **LLM data minimization:** Only the user message + retrieved context chunks go to the model.
   No PII in system prompts unless explicitly written by the bot owner.

4. **Lead data protection:** Stored encrypted at rest. Exportable as CSV by the client.
   Deleted 30 days after plan cancellation.

5. **Conversation retention policy:**
   - Free: 7 days | Starter: 30 days | Pro/Agency: Unlimited
   - Auto-deleted by nightly cron after retention window.

6. **Secrets hygiene:** Dokploy secrets manager for all production secrets.
   `.env` files are development-only and ALWAYS in `.gitignore`.
   Rotate all API keys every 90 days.

---

## Development Workflow

**Per-feature flow (mandatory):**
```
/sp.specify  → write spec.md
/sp.plan     → write plan.md + research.md
/sp.tasks    → write tasks.md
/sp.implement → execute tasks one at a time
              → commit per task: "feat: <task description>"
```

**Per-session startup checklist:**
1. Read `CLAUDE.md` — project context, phase, stack.
2. Read `DESIGN.md` — if the session involves any UI work.
3. Read the relevant `/specs/<feature>/spec.md` and `tasks.md`.
4. Confirm which phase and surface you are working on before writing a single line.
5. Load the relevant skill from `.claude/skills/` before writing any component or route (see Skills Reference in `CLAUDE.md`).
6. Query **Context7** (`mcp__context7__*`) before implementing any library feature.

**MCP Tools — Use Proactively (NON-NEGOTIABLE)**

Two MCP servers MUST be used instead of relying on training-data assumptions:

- **Context7** (`mcp__context7__resolve-library-id` + `mcp__context7__query-docs`):
  - Query before using ANY package API — BetterAuth, Drizzle, Next.js, Tailwind v4, Resend, Upstash, etc.
  - Your training data is stale for rapidly-changing packages. Context7 is authoritative.
  - Mandatory when: new package installed, API call throws an error, version upgrade, unfamiliar method signature.

- **Tavily** (`mcp__tavily-mcp__tavily_search` / `tavily_extract` / `tavily_research`):
  - Use for: npm errors, WSL/OS workarounds, changelog lookups, security advisories, anything requiring current web knowledge.
  - Do NOT use for library API docs when Context7 has the package.

A session that calls a library method without checking Context7 when the behavior is unclear is non-compliant with this constitution.

**Skills-First Development (MANDATORY)**

Skills in `.claude/skills/` encode production patterns. Consulting them is not optional.

| Task type | Skill to read first |
|-----------|-------------------|
| Any React component / Next.js page | `vercel-react-best-practices` |
| Pages, layouts, API routes | `building-nextjs-apps` |
| Embed chat widget (embed.js) | `chatbot-widget-creator` |
| Dashboard or portal UI | `frontend-designer` |
| UI accessibility review | `web-design-guidelines` |
| Brevo marketing emails (Phase 2+) | `brevo-email` |
| RAG / knowledge base (Phase 2+) | `rag-pipeline-builder` |

A session that builds UI components without reading `vercel-react-best-practices` first is non-compliant with this constitution.

**SDD prompt patterns:**
| Situation | Pattern |
|-----------|---------|
| Starting a phase | "Read CLAUDE.md and /specs/phase-X.md. Ask me any clarifying questions before writing code." |
| New feature | "Write the spec for [feature] in /specs/[name]/spec.md before implementing." |
| Any UI work | "Read DESIGN.md. Build for [surface]. Follow [mkt-/adm-/prt-] tokens." |
| Review | "Read /specs/phase-X.md. List what is complete, missing, and wrong." |
| Scope check | "Read CLAUDE.md. Does this task violate 'What NOT to Build'?" |

---

## Governance

- This constitution supersedes all other guidance, including inline code comments
  and chat-session instructions that contradict it.
- Amendments require: (1) a written rationale, (2) a version bump per semantic
  versioning rules below, (3) propagation to `CLAUDE.md` and affected templates.
- **Version policy:**
  - MAJOR: Backward-incompatible removal or redefinition of a principle.
  - MINOR: New principle or section added.
  - PATCH: Clarification, wording fix, non-semantic refinement.
- **Compliance review:** Every PR description MUST include a "Constitution Check"
  confirming no principles were violated. If a violation was necessary, it MUST be
  justified in the PR body and an ADR MUST be filed.
- **ADR threshold:** Any decision with long-term architectural consequences that
  required choosing between two or more valid options MUST be documented with
  `/sp.adr <title>` before the PR is merged.
- **DESIGN.md** is co-equal with this constitution for all UI decisions.
  Constitution defines the rule; DESIGN.md defines the implementation.
  Both are non-negotiable and neither can override the other — they govern
  different domains (engineering vs. visual identity).

**Version**: 1.0.0 | **Ratified**: 2026-05-14 | **Last Amended**: 2026-05-14
