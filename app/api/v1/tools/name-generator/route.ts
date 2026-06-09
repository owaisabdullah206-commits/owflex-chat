import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { chatCompletion, CLASSIFIER_MODEL } from '@/lib/ai/litellm'
import { guardToolAiRequest, extractJson } from '@/lib/tools/ai-route'
import { VIBE_LABELS, INDUSTRY_LABELS, type NameVibe, type NameIndustry } from '@/lib/data/chatbot-names'

const schema = z.object({
  vibe: z.enum(['friendly', 'professional', 'playful', 'techy']),
  industry: z.enum([
    'general', 'ecommerce', 'healthcare', 'realestate', 'finance',
    'education', 'saas', 'agency', 'food', 'travel',
  ]),
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

  const { vibe, industry } = parsed.data
  const vibeLabel = VIBE_LABELS[vibe as NameVibe]
  const industryLabel = INDUSTRY_LABELS[industry as NameIndustry]

  try {
    const { content } = await chatCompletion({
      model: CLASSIFIER_MODEL,
      maxTokens: 220,
      systemPrompt:
        'You name website chatbots. Reply with ONLY a JSON array of 12 short, memorable bot names (one or two words each). No numbering, no explanation, no extra text.',
      messages: [
        { role: 'user', content: `Tone: ${vibeLabel}. Industry: ${industryLabel}. Give 12 chatbot name ideas.` },
      ],
    })

    const names = extractJson<string[]>(content)
    if (!names || !Array.isArray(names) || names.length === 0) {
      return NextResponse.json({ error: 'Could not generate names', code: 'internal', status: 500 }, { status: 500 })
    }

    const clean = names
      .filter((n): n is string => typeof n === 'string')
      .map((n) => n.trim().replace(/^["'\d.\-)\s]+/, '').slice(0, 40))
      .filter(Boolean)
      .slice(0, 12)

    return NextResponse.json({ names: clean })
  } catch (err) {
    console.error('[tools/name-generator] LLM error:', err)
    return NextResponse.json({ error: 'AI service error', code: 'internal', status: 500 }, { status: 500 })
  }
}
