import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { chatCompletion, CLASSIFIER_MODEL } from '@/lib/ai/litellm'
import { guardToolAiRequest, extractJson } from '@/lib/tools/ai-route'

const schema = z.object({
  business: z.string().max(120).optional().default(''),
  details: z.string().min(10, 'Add a few details about your business first.').max(2000),
})

interface Faq {
  question: string
  answer: string
}

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

  const { business, details } = parsed.data
  const brand = business.trim() ? `Business name: ${business.trim()}. ` : ''

  try {
    const { content } = await chatCompletion({
      model: CLASSIFIER_MODEL,
      maxTokens: 900,
      systemPrompt:
        'You write customer-facing FAQ entries for a website chatbot knowledge base. Write 8 to 12 clear question and answer pairs based only on the business details given. Answers are one to three short sentences in plain English. Do not invent specific prices or facts that were not provided; keep those answers general. Reply with ONLY a JSON array of objects shaped {"question": string, "answer": string}. No extra text. Do not use em dashes.',
      messages: [
        { role: 'user', content: `${brand}Details: ${details}` },
      ],
    })

    const faqs = extractJson<Faq[]>(content)
    if (!faqs || !Array.isArray(faqs) || faqs.length === 0) {
      return NextResponse.json({ error: 'Could not generate FAQs', code: 'internal', status: 500 }, { status: 500 })
    }

    const clean = faqs
      .filter((f): f is Faq => !!f && typeof f.question === 'string' && typeof f.answer === 'string')
      .map((f) => ({
        question: f.question.trim().replace(/\s*—\s*/g, ', ').slice(0, 200),
        answer: f.answer.trim().replace(/\s*—\s*/g, ', ').slice(0, 600),
      }))
      .filter((f) => f.question && f.answer)
      .slice(0, 12)

    if (clean.length === 0) {
      return NextResponse.json({ error: 'Could not generate FAQs', code: 'internal', status: 500 }, { status: 500 })
    }

    return NextResponse.json({ faqs: clean })
  } catch (err) {
    console.error('[tools/faq-generator] LLM error:', err)
    return NextResponse.json({ error: 'AI service error', code: 'internal', status: 500 }, { status: 500 })
  }
}
