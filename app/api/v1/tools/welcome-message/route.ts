import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { chatCompletion, CLASSIFIER_MODEL } from '@/lib/ai/litellm'
import { guardToolAiRequest, extractJson } from '@/lib/tools/ai-route'
import { TONE_LABELS, GOAL_LABELS, type MsgTone, type MsgGoal } from '@/lib/data/welcome-messages'

const schema = z.object({
  business: z.string().max(80).optional().default(''),
  tone: z.enum(['friendly', 'professional', 'playful']),
  goal: z.enum(['support', 'leads', 'sales', 'bookings']),
})

export async function POST(req: NextRequest) {
  const limited = await guardToolAiRequest(req)
  if (limited) return limited

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON', code: 'bad_request', status: 400 }, { status: 400 })
  }

  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message, code: 'validation_error', status: 400 }, { status: 400 })
  }

  const { business, tone, goal } = parsed.data
  const brand = business.trim() || 'the business'

  try {
    const { content } = await chatCompletion({
      model: CLASSIFIER_MODEL,
      maxTokens: 320,
      systemPrompt:
        'You write website chatbot welcome messages. Each message is one or two short sentences, says what the bot can do, and sets one clear next step. Reply with ONLY a JSON array of 6 message strings. No numbering, no explanation.',
      messages: [
        {
          role: 'user',
          content: `Business: ${brand}. Tone: ${TONE_LABELS[tone as MsgTone]}. Main goal: ${GOAL_LABELS[goal as MsgGoal]}. Write 6 welcome messages. Do not use em dashes.`,
        },
      ],
    })

    const messages = extractJson<string[]>(content)
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: 'Could not generate messages', code: 'internal', status: 500 }, { status: 500 })
    }

    const clean = messages
      .filter((m): m is string => typeof m === 'string')
      .map((m) => m.trim().replace(/^["'\d.\-)\s]+/, '').replace(/\s*—\s*/g, ', ').slice(0, 280))
      .filter(Boolean)
      .slice(0, 6)

    return NextResponse.json({ messages: clean })
  } catch (err) {
    console.error('[tools/welcome-message] LLM error:', err)
    return NextResponse.json({ error: 'AI service error', code: 'internal', status: 500 }, { status: 500 })
  }
}
