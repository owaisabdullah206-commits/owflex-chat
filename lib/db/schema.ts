import {
  pgTable,
  text,
  varchar,
  boolean,
  integer,
  numeric,
  timestamp,
  jsonb,
  index,
  uniqueIndex,
} from 'drizzle-orm/pg-core'
import { vector } from 'drizzle-orm/pg-core'

// Shorthand: all timestamps are stored with timezone
const tsz = (name: string) => timestamp(name, { withTimezone: true })

// ── BETTERAUTH TABLES ────────────────────────────────────────────────────────
// BetterAuth requires these exact fields. We extend `user` with `role`.
// drizzleAdapter maps: { user: users, session: sessions, ... }

export const users = pgTable('users', {
  id:            text('id').primaryKey(),
  name:          text('name').notNull(),
  email:         varchar('email', { length: 255 }).notNull().unique(),
  emailVerified: boolean('email_verified').notNull().default(false),
  image:         text('image'),
  // Octively extension: 'developer' | 'client'
  role:          varchar('role', { length: 20 }).notNull().default('developer'),
  createdAt:     timestamp('created_at').notNull(),
  updatedAt:     timestamp('updated_at').notNull(),
})

export const sessions = pgTable('sessions', {
  id:        text('id').primaryKey(),
  expiresAt: timestamp('expires_at').notNull(),
  token:     text('token').notNull().unique(),
  createdAt: timestamp('created_at').notNull(),
  updatedAt: timestamp('updated_at').notNull(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  userId:    text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
})

export const accounts = pgTable('accounts', {
  id:                    text('id').primaryKey(),
  accountId:             text('account_id').notNull(),
  providerId:            text('provider_id').notNull(),
  userId:                text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  accessToken:           text('access_token'),
  refreshToken:          text('refresh_token'),
  idToken:               text('id_token'),
  accessTokenExpiresAt:  timestamp('access_token_expires_at'),
  refreshTokenExpiresAt: timestamp('refresh_token_expires_at'),
  scope:                 text('scope'),
  password:              text('password'),
  createdAt:             timestamp('created_at').notNull(),
  updatedAt:             timestamp('updated_at').notNull(),
})

export const verifications = pgTable('verifications', {
  id:         text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value:      text('value').notNull(),
  expiresAt:  timestamp('expires_at').notNull(),
  createdAt:  timestamp('created_at'),
  updatedAt:  timestamp('updated_at'),
})

// ── ORGANIZATIONS ────────────────────────────────────────────────────────────
export const organizations = pgTable('organizations', {
  id:                     text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  ownerId:                text('owner_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  name:                   varchar('name', { length: 255 }).notNull(),
  plan:                   varchar('plan', { length: 20 }).notNull().default('free'),
  conversationsThisMonth: integer('conversations_this_month').notNull().default(0),
  leadsThisMonth:         integer('leads_this_month').notNull().default(0),
  bannedAt:               tsz('banned_at'),
  banReason:              text('ban_reason'),
  createdAt:              tsz('created_at').defaultNow().notNull(),
})

// ── BOTS ─────────────────────────────────────────────────────────────────────
export const bots = pgTable('bots', {
  id:           text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  orgId:        text('org_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  clientUserId: text('client_user_id').references(() => users.id, { onDelete: 'set null' }),
  name:         varchar('name', { length: 255 }).notNull(),
  systemPrompt: text('system_prompt').notNull().default('You are a helpful assistant.'),
  model:        varchar('model', { length: 100 }).notNull().default('deepseek/deepseek-v4-flash'),
  // pk_ + 29 hex chars = 32 chars. NEVER expose internal id publicly.
  embedKey:     varchar('embed_key', { length: 64 }).notNull().unique(),
  widgetConfig: jsonb('widget_config').notNull().default({}),
  portalConfig: jsonb('portal_config').notNull().default({}),
  isActive:            boolean('is_active').notNull().default(true),
  smartRoutingEnabled: boolean('smart_routing_enabled').notNull().default(false),
  // Per-bot resource caps (null = draws from org pool with no bot-level cap)
  monthlyConvLimit:    integer('monthly_conv_limit'),
  monthlyLeadLimit:    integer('monthly_lead_limit'),
  createdAt:           tsz('created_at').defaultNow().notNull(),
}, (t) => [
  index('bots_embed_key_idx').on(t.embedKey),
  index('bots_org_id_idx').on(t.orgId),
])

// ── CONVERSATIONS ────────────────────────────────────────────────────────────
export const conversations = pgTable('conversations', {
  id:           text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  botId:        text('bot_id').notNull().references(() => bots.id, { onDelete: 'cascade' }),
  sessionId:    varchar('session_id', { length: 100 }).notNull(),
  pageUrl:      text('page_url'),
  startedAt:    tsz('started_at').defaultNow().notNull(),
  endedAt:      tsz('ended_at'),
  messageCount: integer('message_count').notNull().default(0),
}, (t) => [
  index('conversations_bot_id_idx').on(t.botId),
  index('conversations_session_id_idx').on(t.sessionId),
])

// ── MESSAGES ─────────────────────────────────────────────────────────────────
export const messages = pgTable('messages', {
  id:               text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  conversationId:   text('conversation_id').notNull().references(() => conversations.id, { onDelete: 'cascade' }),
  role:             varchar('role', { length: 10 }).notNull(), // 'user' | 'assistant'
  content:          text('content').notNull(),
  tokensUsed:       integer('tokens_used').notNull().default(0),
  inputTokens:      integer('input_tokens').notNull().default(0),
  outputTokens:     integer('output_tokens').notNull().default(0),
  costUsd:          numeric('cost_usd', { precision: 14, scale: 8 }).notNull().default('0'),
  modelUsed:        varchar('model_used', { length: 100 }),
  flaggedUnanswered: boolean('flagged_unanswered').notNull().default(false),
  createdAt:        tsz('created_at').defaultNow().notNull(),
}, (t) => [
  index('messages_conversation_id_idx').on(t.conversationId),
])

// ── LEADS ─────────────────────────────────────────────────────────────────────
export const leads = pgTable('leads', {
  id:             text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  botId:          text('bot_id').notNull().references(() => bots.id, { onDelete: 'cascade' }),
  conversationId: text('conversation_id').references(() => conversations.id, { onDelete: 'set null' }),
  name:           varchar('name', { length: 255 }),
  email:          varchar('email', { length: 255 }),
  phone:          varchar('phone', { length: 50 }),
  notes:          text('notes'),
  capturedAt:     tsz('captured_at').defaultNow().notNull(),
}, (t) => [
  index('leads_bot_id_idx').on(t.botId),
])

// ── PLATFORM CONFIG ───────────────────────────────────────────────────────────
// Single-row table. Always accessed via id = 'default'.
export const platformConfig = pgTable('platform_config', {
  id:                  varchar('id', { length: 20 }).primaryKey(), // always 'default'
  systemPrompt:        text('system_prompt').notNull().default(''),
  // JSON map: { [modelId]: 'manual' | 'openrouter-api' }
  // Default per model: 'manual' (manual takes priority when both exist)
  modelPricePriority:  jsonb('model_price_priority').notNull().default({}),
  updatedAt:           tsz('updated_at').defaultNow().notNull(),
})

// ── BOT FAQS ──────────────────────────────────────────────────────────────────
export const botFaqs = pgTable('bot_faqs', {
  id:        text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  botId:     text('bot_id').notNull().references(() => bots.id, { onDelete: 'cascade' }),
  question:  text('question').notNull(),
  answer:    text('answer').notNull(),
  isActive:  boolean('is_active').notNull().default(true),
  createdAt: tsz('created_at').defaultNow().notNull(),
}, (t) => [
  index('bot_faqs_bot_id_idx').on(t.botId),
])

// ── CREDIT TRANSACTIONS ───────────────────────────────────────────────────────
// Append-only audit ledger. Never delete rows.
export const creditTransactions = pgTable('credit_transactions', {
  id:        text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  orgId:     text('org_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  delta:     integer('delta').notNull(), // positive = credit, negative = debit
  reason:    varchar('reason', { length: 50 }).notNull(), // 'chat_debit' | 'chat_refund' | 'purchase' | 'monthly_reset'
  refId:     varchar('ref_id', { length: 255 }),           // idempotency key (message_id or payment_id)
  createdAt: tsz('created_at').defaultNow().notNull(),
}, (t) => [
  index('credit_transactions_org_id_idx').on(t.orgId),
  uniqueIndex('credit_transactions_ref_id_idx').on(t.refId),
])

// ── INVITATIONS ───────────────────────────────────────────────────────────────
export const invitations = pgTable('invitations', {
  id:        text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  botId:     text('bot_id').notNull().references(() => bots.id, { onDelete: 'cascade' }),
  email:     varchar('email', { length: 255 }).notNull(),
  // crypto.randomUUID().replace(/-/g, '') = 32 hex chars
  token:     varchar('token', { length: 64 }).notNull().unique(),
  expiresAt: tsz('expires_at').notNull(),
  usedAt:    tsz('used_at'),
  createdAt: tsz('created_at').defaultNow().notNull(),
})

// ── DOCUMENTS (Phase 3) ───────────────────────────────────────────────────────
export const documents = pgTable('documents', {
  id:          text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  botId:       text('bot_id').notNull().references(() => bots.id, { onDelete: 'cascade' }),
  orgId:       text('org_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),

  sourceType:  varchar('source_type', { length: 10 }).notNull(),  // 'file' | 'url'
  sourceUrl:   text('source_url'),
  storageKey:  text('storage_key'),
  displayName: varchar('display_name', { length: 255 }).notNull(),
  mimeType:    varchar('mime_type', { length: 100 }),
  byteSize:    integer('byte_size').notNull().default(0),

  status:      varchar('status', { length: 20 }).notNull().default('queued'),
  errorCode:   varchar('error_code', { length: 50 }),
  errorMsg:    text('error_msg'),
  pageCount:   integer('page_count').notNull().default(1),
  chunkCount:  integer('chunk_count').notNull().default(0),
  version:     integer('version').notNull().default(1),

  createdAt:   tsz('created_at').defaultNow().notNull(),
  updatedAt:   tsz('updated_at').defaultNow().notNull(),
  readyAt:     tsz('ready_at'),
}, (t) => [
  index('documents_bot_id_idx').on(t.botId),
  index('documents_org_id_idx').on(t.orgId),
  index('documents_status_idx').on(t.status),
])

// ── DOCUMENT CHUNKS (Phase 3) ─────────────────────────────────────────────────
// HNSW index is added via raw SQL in the migration (Drizzle doesn't support HNSW DDL yet)
export const documentChunks = pgTable('document_chunks', {
  id:         text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  documentId: text('document_id').notNull().references(() => documents.id, { onDelete: 'cascade' }),
  botId:      text('bot_id').notNull().references(() => bots.id, { onDelete: 'cascade' }),
  pageIdx:    integer('page_idx').notNull().default(0),
  chunkIdx:   integer('chunk_idx').notNull(),
  version:    integer('version').notNull().default(1),
  text:       text('text').notNull(),
  tokenCount: integer('token_count').notNull(),
  embedding:  vector('embedding', { dimensions: 768 }).notNull(),
  createdAt:  tsz('created_at').defaultNow().notNull(),
}, (t) => [
  index('document_chunks_document_id_idx').on(t.documentId),
  index('document_chunks_bot_id_idx').on(t.botId),
])

// ── MODEL PRICES ──────────────────────────────────────────────────────────────
// Append-only price history. Priority: manual > openrouter-api (most recent of each).
export const modelPrices = pgTable('model_prices', {
  id:                   text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  modelId:              varchar('model_id', { length: 150 }).notNull(),
  // USD per 1M tokens (stored as string due to Drizzle numeric type)
  promptPricePer1M:     numeric('prompt_price_per_1m', { precision: 14, scale: 8 }).notNull(),
  completionPricePer1M: numeric('completion_price_per_1m', { precision: 14, scale: 8 }).notNull(),
  effectiveFrom:        tsz('effective_from').defaultNow().notNull(),
  // 'openrouter-api' | 'manual'
  source:               varchar('source', { length: 20 }).notNull().default('openrouter-api'),
  createdAt:            tsz('created_at').defaultNow().notNull(),
}, (t) => [
  index('model_prices_model_id_idx').on(t.modelId),
  index('model_prices_model_source_idx').on(t.modelId, t.source),
])

// ── ROUTING DECISIONS (Phase 3) ───────────────────────────────────────────────
export const routingDecisions = pgTable('routing_decisions', {
  id:                   text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  messageId:            text('message_id').notNull().references(() => messages.id, { onDelete: 'cascade' }),
  botId:                text('bot_id').notNull().references(() => bots.id, { onDelete: 'cascade' }),

  classification:       varchar('classification', { length: 20 }).notNull(),
  classifierModel:      varchar('classifier_model', { length: 100 }).notNull(),
  classifierLatencyMs:  integer('classifier_latency_ms').notNull(),

  chosenModel:          varchar('chosen_model', { length: 100 }).notNull(),
  fallbackUsed:         boolean('fallback_used').notNull().default(false),
  creditCost:           integer('credit_cost').notNull(),

  createdAt:            tsz('created_at').defaultNow().notNull(),
}, (t) => [
  index('routing_decisions_bot_id_idx').on(t.botId),
  index('routing_decisions_message_id_idx').on(t.messageId),
])
