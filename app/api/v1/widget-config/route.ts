import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { and, eq } from 'drizzle-orm'
import { db, schema } from '@/lib/db'
import { embedKeyMatch } from '@/lib/bots/embed-key'

const querySchema = z.object({
  key: z.string().min(1),
})

type WidgetConfig = {
  primaryColor?: string
  gradientEnabled?: boolean
  gradientColor?: string
  position?: string
  bottomOffset?: number
  welcomeMessage?: string
  leadCaptureEnabled?: boolean
  collectLeadBefore?: boolean
  triggerIcon?: string
  borderRadius?: number
  tooltipEnabled?: boolean
  tooltipMessages?: string[]
  brandingEnabled?: boolean
  brandingText?: string
  brandingUrl?: string
  theme?: 'light' | 'dark'
  productRecommendationsEnabled?: boolean
  whatsappNumber?: string
}

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const parsed = querySchema.safeParse({ key: searchParams.get('key') })

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Missing embed key', code: 'MISSING_KEY', status: 400 },
      { status: 400 },
    )
  }

  const [bot] = await db
    .select({
      name:    schema.bots.name,
      widgetConfig: schema.bots.widgetConfig,
      orgPlan: schema.organizations.plan,
    })
    .from(schema.bots)
    .innerJoin(schema.organizations, eq(schema.bots.orgId, schema.organizations.id))
    .where(and(embedKeyMatch(parsed.data.key), eq(schema.bots.isActive, true)))
    .limit(1)

  if (!bot) {
    return NextResponse.json(
      { error: 'Bot not found', code: 'NOT_FOUND', status: 404 },
      { status: 404 },
    )
  }

  const config = (bot.widgetConfig ?? {}) as WidgetConfig

  // Enforce branding based on plan — plan overrides developer config
  const plan = bot.orgPlan
  let brandingEnabled = false
  let brandingText    = 'Powered by octively'
  let brandingUrl     = 'https://octively.com'

  if (plan === 'free') {
    brandingEnabled = true  // forced on; developer cannot disable
  } else if (plan === 'starter' || plan === 'pro') {
    brandingEnabled = config.brandingEnabled !== false  // default on, can opt out
    // text/URL always octively — no custom branding at these tiers
  } else {
    // agency / enterprise — full control
    brandingEnabled = config.brandingEnabled === true  // default off
    brandingText    = config.brandingText?.trim() || 'Powered by octively'
    brandingUrl     = config.brandingUrl?.trim()  || 'https://octively.com'
  }

  return NextResponse.json(
    {
      botName: bot.name,
      primaryColor: config.primaryColor ?? '#0EA5E9',
      gradientEnabled: config.gradientEnabled === true,
      gradientColor: config.gradientColor ?? '#0EA5E9',
      welcomeMessage: config.welcomeMessage ?? 'Hi! How can I help you today?',
      position: config.position ?? 'bottom-right',
      bottomOffset: typeof config.bottomOffset === 'number' ? config.bottomOffset : 24,
      leadCaptureEnabled: config.leadCaptureEnabled !== false,
      collectLeadBefore: config.collectLeadBefore === true,
      triggerIcon: config.triggerIcon ?? 'message-circle',
      borderRadius: typeof config.borderRadius === 'number' ? config.borderRadius : 16,
      tooltipEnabled: config.tooltipEnabled !== false,
      tooltipMessages: Array.isArray(config.tooltipMessages) && config.tooltipMessages.length
        ? config.tooltipMessages
        : ['👋 Hi! Need any help?', 'Have a question? Ask me', 'Looking for something?'],
      brandingEnabled,
      brandingText,
      brandingUrl,
      theme: config.theme ?? 'light',
      productRecommendationsEnabled: config.productRecommendationsEnabled === true,
      whatsappNumber: typeof config.whatsappNumber === 'string' ? config.whatsappNumber : '',
    },
    {
      headers: { 'Cache-Control': 'no-cache, must-revalidate' },
    },
  )
}
