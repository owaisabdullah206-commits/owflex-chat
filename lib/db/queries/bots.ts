'use server'

import { redirect } from 'next/navigation'
import { revalidatePath, updateTag } from 'next/cache'
import { z } from 'zod'
import { and, desc, eq, exists, gte, lte, sql } from 'drizzle-orm'
import { db, schema } from '@/lib/db'
import { requireDeveloper } from '@/lib/auth/session'
import { SUPPORTED_MODELS } from '@/lib/ai/litellm'
import { createAuditLog } from '@/lib/db/queries/audit'

const updateBotSchema = z.object({
  name:                z.string().min(1).max(255).optional(),
  systemPrompt:        z.string().min(1).max(4000).optional(),
  model:               z.enum(SUPPORTED_MODELS).optional(),
  smartRoutingEnabled: z.boolean().optional(),
  routingLightModel:   z.enum(SUPPORTED_MODELS).nullable().optional(),
  routingStrongModel:  z.enum(SUPPORTED_MODELS).nullable().optional(),
  webhookUrl: z.string().url().max(500).or(z.literal('')).optional(),
  slackWebhookUrl: z
    .string()
    .url()
    .max(500)
    .refine((v) => {
      try { return new URL(v).hostname === 'hooks.slack.com' } catch { return false }
    }, { message: 'Must be a Slack Incoming Webhook URL (hooks.slack.com)' })
    .or(z.literal(''))
    .optional(),
  // Per-bot resource controls (agency/pro only). null = remove the cap.
  monthlyConvLimit:    z.number().int().min(1).nullable().optional(),
  monthlyLeadLimit:    z.number().int().min(1).nullable().optional(),
  monthlyCreditBudget: z.number().int().min(1).nullable().optional(),
  allowedModels:       z.array(z.enum(SUPPORTED_MODELS)).nullable().optional(),
  widgetConfig: z.object({
    primaryColor:       z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
    position:           z.enum(['bottom-right', 'bottom-left']).optional(),
    bottomOffset:       z.number().min(0).max(200).optional(),
    welcomeMessage:     z.string().max(200).optional(),
    leadCaptureEnabled:  z.boolean().optional(),
    collectLeadBefore:   z.boolean().optional(),
    strictMode:          z.boolean().optional(),
    triggerIcon:        z.string().max(50).optional(),
    borderRadius:       z.number().min(0).max(24).optional(),
    tooltipEnabled:     z.boolean().optional(),
    tooltipMessages:    z.array(z.string().max(120)).max(5).optional(),
    brandingEnabled:    z.boolean().optional(),
    brandingText:       z.string().max(60).optional(),
    brandingUrl:        z.string().url().max(255).optional(),
    handoffEnabled:        z.boolean().optional(),
    handoffNotifyTarget:   z.enum(['developer', 'client']).optional(),
    // 'email' = notify + reply by email (Pro+). 'live' = real-time in-widget takeover (Agency+).
    handoffMode:           z.enum(['email', 'live']).optional(),
    storeUrl:      z.string().url().max(255).or(z.literal('')).optional(),
    storeCurrency: z.enum(['', 'PKR', 'USD', 'AED', 'GBP', 'EUR', 'SAR', 'INR', 'BDT', 'LKR', 'NGN', 'KES', 'ZAR']).optional(),
    theme:                        z.enum(['light', 'dark']).optional(),
    productRecommendationsEnabled: z.boolean().optional(),
    language:                     z.enum(['auto', 'english', 'urdu', 'roman-urdu']).optional(),
    whatsappNumber:               z.string().regex(/^[0-9]{6,15}$/).or(z.literal('')).optional(),
  }).optional(),
})

export async function updateBot(
  botId: string,
  data: z.infer<typeof updateBotSchema>,
): Promise<{ error?: string }> {
  const user = await requireDeveloper()

  const parsed = updateBotSchema.safeParse(data)
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message }
  }

  // Load org to check plan and verify ownership
  const [botRow] = await db
    .select({
      embedKey: schema.bots.embedKey,
      orgPlan: schema.organizations.plan,
      orgId:   schema.organizations.id,
      botName: schema.bots.name,
    })
    .from(schema.bots)
    .innerJoin(schema.organizations, eq(schema.bots.orgId, schema.organizations.id))
    .where(and(eq(schema.bots.id, botId), eq(schema.organizations.ownerId, user.id)))
    .limit(1)

  if (!botRow) return { error: 'Bot not found or access denied' }

  const update: Record<string, unknown> = {}

  if (parsed.data.name !== undefined) update.name = parsed.data.name
  if (parsed.data.systemPrompt !== undefined) update.systemPrompt = parsed.data.systemPrompt

  // Free-plan orgs cannot change model
  if (parsed.data.model !== undefined && botRow.orgPlan !== 'free') {
    update.model = parsed.data.model
  }

  // Smart routing is Pro+ only
  if (parsed.data.smartRoutingEnabled !== undefined) {
    if (['pro', 'agency', 'enterprise'].includes(botRow.orgPlan)) {
      update.smartRoutingEnabled = parsed.data.smartRoutingEnabled
      if (parsed.data.routingLightModel !== undefined) update.routingLightModel = parsed.data.routingLightModel
      if (parsed.data.routingStrongModel !== undefined) update.routingStrongModel = parsed.data.routingStrongModel
    }
  }

  if (parsed.data.webhookUrl !== undefined) {
    // Empty string → clear the webhook
    update.webhookUrl = parsed.data.webhookUrl === '' ? null : parsed.data.webhookUrl
  }

  if (parsed.data.slackWebhookUrl !== undefined) {
    // Empty string → clear the Slack connector
    update.slackWebhookUrl = parsed.data.slackWebhookUrl === '' ? null : parsed.data.slackWebhookUrl
  }

  // Per-bot resource controls — agency and pro plans only
  const canSetLimits = ['pro', 'agency', 'enterprise'].includes(botRow.orgPlan)
  if (canSetLimits) {
    if (parsed.data.monthlyConvLimit !== undefined)
      update.monthlyConvLimit    = parsed.data.monthlyConvLimit
    if (parsed.data.monthlyLeadLimit !== undefined)
      update.monthlyLeadLimit    = parsed.data.monthlyLeadLimit
    if (parsed.data.monthlyCreditBudget !== undefined)
      update.monthlyCreditBudget = parsed.data.monthlyCreditBudget
    if (parsed.data.allowedModels !== undefined)
      update.allowedModels       = parsed.data.allowedModels
  }

  if (parsed.data.widgetConfig !== undefined) {
    const wc = { ...parsed.data.widgetConfig }
    // Strip custom branding text/URL for plans without white-label rights
    const canCustomBrand = botRow.orgPlan === 'agency' || botRow.orgPlan === 'enterprise'
    if (!canCustomBrand) {
      delete wc.brandingText
      delete wc.brandingUrl
    }
    // Free plan: strip lead capture, behavior toggles, and handoff
    if (botRow.orgPlan === 'free') {
      delete wc.leadCaptureEnabled
      delete wc.collectLeadBefore
      delete wc.strictMode
      delete wc.handoffEnabled
      delete wc.handoffNotifyTarget
      delete wc.handoffMode
    }
    // Starter plan: strip handoff (Pro+ only)
    if (botRow.orgPlan === 'starter') {
      delete wc.handoffEnabled
      delete wc.handoffNotifyTarget
      delete wc.handoffMode
    }
    // Live handoff mode is Agency+ only — downgrade Pro to email reply
    const canLiveHandoff = botRow.orgPlan === 'agency' || botRow.orgPlan === 'enterprise'
    if (!canLiveHandoff && wc.handoffMode === 'live') {
      wc.handoffMode = 'email'
    }
    // Atomic JSONB merge — preserves existing keys not in the patch
    update.widgetConfig = sql`${schema.bots.widgetConfig} || ${JSON.stringify(wc)}::jsonb`
  }

  if (Object.keys(update).length === 0) return {}

  await db.update(schema.bots).set(update).where(eq(schema.bots.id, botId))

  void createAuditLog({
    orgId:      botRow.orgId,
    userId:     user.id,
    action:     'bot.updated',
    entityType: 'bot',
    entityId:   botId,
    meta:       { botName: botRow.botName, updatedFields: Object.keys(update) },
  })

  updateTag(`widget-config-${botRow.embedKey}`)
  revalidatePath(`/dashboard/bots/${botId}`)
  return {}
}

export async function deleteBot(botId: string): Promise<{ error?: string; ok?: boolean }> {
  const user = await requireDeveloper()

  const [botRow] = await db
    .select({ id: schema.bots.id, orgId: schema.organizations.id, botName: schema.bots.name })
    .from(schema.bots)
    .innerJoin(schema.organizations, eq(schema.bots.orgId, schema.organizations.id))
    .where(and(eq(schema.bots.id, botId), eq(schema.organizations.ownerId, user.id)))
    .limit(1)

  if (!botRow) return { error: 'Bot not found or access denied' }

  // Cascade deletes: conversations, messages, leads, bot_faqs, invitations
  await db.delete(schema.bots).where(eq(schema.bots.id, botId))

  void createAuditLog({
    orgId:      botRow.orgId,
    userId:     user.id,
    action:     'bot.deleted',
    entityType: 'bot',
    entityId:   botId,
    meta:       { botName: botRow.botName },
  })

  revalidatePath('/dashboard/bots')
  return { ok: true }
}

export async function toggleBotActive(botId: string): Promise<{ error?: string; isActive?: boolean }> {
  const user = await requireDeveloper()

  const [botRow] = await db
    .select({ isActive: schema.bots.isActive, orgId: schema.organizations.id })
    .from(schema.bots)
    .innerJoin(schema.organizations, eq(schema.bots.orgId, schema.organizations.id))
    .where(and(eq(schema.bots.id, botId), eq(schema.organizations.ownerId, user.id)))
    .limit(1)

  if (!botRow) return { error: 'Bot not found or access denied' }

  const newActive = !botRow.isActive
  await db.update(schema.bots).set({ isActive: newActive }).where(eq(schema.bots.id, botId))

  void createAuditLog({
    orgId:      botRow.orgId,
    userId:     user.id,
    action:     'bot.toggled',
    entityType: 'bot',
    entityId:   botId,
    meta:       { isActive: newActive },
  })

  revalidatePath(`/dashboard/bots/${botId}`)
  revalidatePath('/dashboard/bots')
  return { isActive: newActive }
}

export async function updateSmartRouting(
  botId: string,
  enabled: boolean,
): Promise<{ error?: string }> {
  const user = await requireDeveloper()

  const [botRow] = await db
    .select({ id: schema.bots.id })
    .from(schema.bots)
    .innerJoin(schema.organizations, eq(schema.bots.orgId, schema.organizations.id))
    .where(and(eq(schema.bots.id, botId), eq(schema.organizations.ownerId, user.id)))
    .limit(1)

  if (!botRow) return { error: 'Bot not found or access denied' }

  await db.update(schema.bots).set({ smartRoutingEnabled: enabled }).where(eq(schema.bots.id, botId))
  revalidatePath(`/dashboard/bots/${botId}`)
  return {}
}

const createBotSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255),
  systemPrompt: z.string().min(1, 'System prompt is required'),
  storeUrl: z.string().url('Enter a valid store URL (e.g. https://yourstore.com)').max(255),
  storeCurrency: z.enum(['', 'PKR', 'USD', 'AED', 'GBP', 'EUR', 'SAR', 'INR', 'BDT', 'LKR', 'NGN', 'KES', 'ZAR']).optional(),
})

export async function createBot(
  _prevState: { error?: string } | null,
  formData: FormData,
): Promise<{ error: string }> {
  const user = await requireDeveloper()

  const parsed = createBotSchema.safeParse({
    name: formData.get('name'),
    systemPrompt: formData.get('systemPrompt'),
    storeUrl: formData.get('storeUrl'),
    storeCurrency: formData.get('storeCurrency') || undefined,
  })

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message }
  }

  const [org] = await db
    .select({ id: schema.organizations.id })
    .from(schema.organizations)
    .where(eq(schema.organizations.ownerId, user.id))
    .limit(1)

  if (!org) {
    return { error: 'No organization found. Please sign out and sign in again.' }
  }

  // pk_ prefix + 29 hex chars = 32 chars total
  const embedKey = 'pk_' + crypto.randomUUID().replace(/-/g, '').slice(0, 29)

  const [newBot] = await db
    .insert(schema.bots)
    .values({
      orgId: org.id,
      name: parsed.data.name,
      systemPrompt: parsed.data.systemPrompt,
      embedKey,
      widgetConfig: {
        storeUrl: parsed.data.storeUrl,
        ...(parsed.data.storeCurrency ? { storeCurrency: parsed.data.storeCurrency } : {}),
      },
    })
    .returning({ id: schema.bots.id })

  void createAuditLog({
    orgId:      org.id,
    userId:     user.id,
    action:     'bot.created',
    entityType: 'bot',
    entityId:   newBot.id,
    meta:       { name: parsed.data.name },
  })

  revalidatePath('/dashboard/bots')
  redirect(`/dashboard/bots/${newBot.id}?onboarding=1`)
}

export async function searchConversations(
  botId: string,
  filters: { q?: string; from?: Date; to?: Date },
  limit = 100,
) {
  const conditions = [eq(schema.conversations.botId, botId)]

  if (filters.q) {
    const term = `%${filters.q}%`
    conditions.push(
      exists(
        db
          .select({ _: sql<number>`1` })
          .from(schema.messages)
          .where(
            and(
              eq(schema.messages.conversationId, schema.conversations.id),
              sql`${schema.messages.content} ILIKE ${term}`,
            ),
          ),
      ),
    )
  }

  if (filters.from) conditions.push(gte(schema.conversations.startedAt, filters.from))
  if (filters.to) conditions.push(lte(schema.conversations.startedAt, filters.to))

  return db
    .select({
      id:           schema.conversations.id,
      pageUrl:      schema.conversations.pageUrl,
      startedAt:    schema.conversations.startedAt,
      messageCount: schema.conversations.messageCount,
      needsHuman:   sql<boolean>`COALESCE(${schema.conversations.needsHuman}, false)`,
    })
    .from(schema.conversations)
    .where(and(...conditions))
    .orderBy(desc(schema.conversations.startedAt))
    .limit(limit)
}
