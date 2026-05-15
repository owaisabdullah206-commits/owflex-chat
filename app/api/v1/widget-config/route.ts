import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { and, eq } from 'drizzle-orm'
import { db, schema } from '@/lib/db'

const querySchema = z.object({
  key: z.string().min(1),
})

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
      name: schema.bots.name,
      widgetConfig: schema.bots.widgetConfig,
    })
    .from(schema.bots)
    .where(and(eq(schema.bots.embedKey, parsed.data.key), eq(schema.bots.isActive, true)))
    .limit(1)

  if (!bot) {
    return NextResponse.json(
      { error: 'Bot not found', code: 'NOT_FOUND', status: 404 },
      { status: 404 },
    )
  }

  const config = (bot.widgetConfig ?? {}) as { primaryColor?: string; position?: string }

  return NextResponse.json(
    {
      botName: bot.name,
      primaryColor: config.primaryColor ?? '#0EA5E9',
      welcomeMessage: 'Hi! How can I help you?',
      position: config.position ?? 'bottom-right',
    },
    {
      headers: { 'Cache-Control': 'public, max-age=300' },
    },
  )
}
