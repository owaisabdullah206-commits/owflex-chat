import {
  pgTable,
  text,
  varchar,
  boolean,
  integer,
  timestamp,
  jsonb,
  index,
  uniqueIndex,
} from 'drizzle-orm/pg-core'

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
  // OwFlex extension: 'developer' | 'client'
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
  isActive:     boolean('is_active').notNull().default(true),
  createdAt:    tsz('created_at').defaultNow().notNull(),
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
  id:           varchar('id', { length: 20 }).primaryKey(), // always 'default'
  systemPrompt: text('system_prompt').notNull().default(''),
  updatedAt:    tsz('updated_at').defaultNow().notNull(),
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
