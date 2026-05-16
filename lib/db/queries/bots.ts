'use server'

import { redirect } from 'next/navigation'
import { revalidatePath, updateTag } from 'next/cache'
import { z } from 'zod'
import { and, eq, sql } from 'drizzle-orm'
import { db, schema } from '@/lib/db'
import { requireDeveloper } from '@/lib/auth/session'
import { SUPPORTED_MODELS } from '@/lib/ai/litellm'

const updateBotSchema = z.object({
  name:         z.string().min(1).max(255).optional(),
  systemPrompt: z.string().min(1).optional(),
  model:        z.enum(SUPPORTED_MODELS).optional(),
  widgetConfig: z.object({
    primaryColor:       z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
    position:           z.enum(['bottom-right', 'bottom-left']).optional(),
    welcomeMessage:     z.string().max(200).optional(),
    leadCaptureEnabled: z.boolean().optional(),
    strictMode:         z.boolean().optional(),
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

  if (parsed.data.widgetConfig !== undefined) {
    // Atomic JSONB merge — preserves existing keys not in the patch
    update.widgetConfig = sql`${schema.bots.widgetConfig} || ${JSON.stringify(parsed.data.widgetConfig)}::jsonb`
  }

  if (Object.keys(update).length === 0) return {}

  await db.update(schema.bots).set(update).where(eq(schema.bots.id, botId))

  updateTag(`widget-config-${botRow.embedKey}`)
  revalidatePath(`/dashboard/bots/${botId}`)
  return {}
}

export async function deleteBot(botId: string): Promise<{ error?: string; ok?: boolean }> {
  const user = await requireDeveloper()

  const [botRow] = await db
    .select({ id: schema.bots.id })
    .from(schema.bots)
    .innerJoin(schema.organizations, eq(schema.bots.orgId, schema.organizations.id))
    .where(and(eq(schema.bots.id, botId), eq(schema.organizations.ownerId, user.id)))
    .limit(1)

  if (!botRow) return { error: 'Bot not found or access denied' }

  // Cascade deletes: conversations, messages, leads, bot_faqs, invitations
  await db.delete(schema.bots).where(eq(schema.bots.id, botId))

  revalidatePath('/dashboard/bots')
  return { ok: true }
}

export async function toggleBotActive(botId: string): Promise<{ error?: string; isActive?: boolean }> {
  const user = await requireDeveloper()

  const [botRow] = await db
    .select({ isActive: schema.bots.isActive })
    .from(schema.bots)
    .innerJoin(schema.organizations, eq(schema.bots.orgId, schema.organizations.id))
    .where(and(eq(schema.bots.id, botId), eq(schema.organizations.ownerId, user.id)))
    .limit(1)

  if (!botRow) return { error: 'Bot not found or access denied' }

  const newActive = !botRow.isActive
  await db.update(schema.bots).set({ isActive: newActive }).where(eq(schema.bots.id, botId))

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
})

export async function createBot(
  _prevState: { error?: string } | null,
  formData: FormData,
): Promise<{ error: string }> {
  const user = await requireDeveloper()

  const parsed = createBotSchema.safeParse({
    name: formData.get('name'),
    systemPrompt: formData.get('systemPrompt'),
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
    })
    .returning({ id: schema.bots.id })

  revalidatePath('/dashboard/bots')
  redirect(`/dashboard/bots/${newBot.id}?onboarding=1`)
}
