import { CLASSIFIER_MODEL, STRONG_MODEL } from '@/lib/ai/litellm'
import { getBalance, debit, refund } from '@/lib/credits'

export type RoutingClass = 'greeting' | 'faq' | 'knowledge' | 'complex'

export interface ClassifyResult {
  classification: RoutingClass
  classifierModel: string
  latencyMs: number
}

export interface RouteResult {
  modelToUse: string
  fallbackUsed: boolean
  classification: RoutingClass
  classifierLatencyMs: number
  classifierModel: string
  creditCost: number
}

const CLASSIFIER_PROMPT = `Classify the user message into exactly one of:
- "greeting": hi, hello, thanks, bye, social pleasantries, very short small-talk
- "faq": short factual question with a single right answer ("what are your hours?", "where is your office?")
- "knowledge": question that needs document context to answer well ("does your contract include support?")
- "complex": multi-step reasoning, comparisons, calculations, or coding

Respond with JSON ONLY: {"label": "<one of the four>"}`

const STRONG_MODEL_BASE_ESTIMATE = 500
const CLASSIFIER_TIMEOUT_MS = 1500

async function classifyWithTimeout(text: string): Promise<RoutingClass> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), CLASSIFIER_TIMEOUT_MS)

  try {
    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'HTTP-Referer': 'https://octively.com',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: CLASSIFIER_MODEL,
        messages: [
          { role: 'system', content: CLASSIFIER_PROMPT },
          { role: 'user', content: text },
        ],
        max_tokens: 20,
      }),
      signal: controller.signal,
    })

    if (!res.ok) return 'knowledge'

    const data = await res.json() as { choices?: Array<{ message?: { content?: string } }> }
    const content = data.choices?.[0]?.message?.content ?? ''
    const parsed = JSON.parse(content) as { label?: string }
    const label = parsed.label

    if (label === 'greeting' || label === 'faq' || label === 'knowledge' || label === 'complex') {
      return label
    }
    return 'knowledge'
  } catch {
    return 'knowledge'
  } finally {
    clearTimeout(timer)
  }
}

export async function classifyMessage(text: string): Promise<ClassifyResult> {
  const start = Date.now()
  const classification = await classifyWithTimeout(text)
  return {
    classification,
    classifierModel: CLASSIFIER_MODEL,
    latencyMs: Date.now() - start,
  }
}

export async function routeMessage(params: {
  text: string
  botDefaultModel: string
  orgId: string
  baseEstimate: number
  lightModel?: string | null
  strongModel?: string | null
}): Promise<RouteResult> {
  const lightModelResolved  = params.lightModel  ?? params.botDefaultModel
  const strongModelResolved = params.strongModel ?? STRONG_MODEL

  if (process.env.SMART_ROUTING_FORCE_OFF === 'true') {
    return {
      modelToUse: params.botDefaultModel,
      fallbackUsed: false,
      classification: 'knowledge',
      classifierLatencyMs: 0,
      classifierModel: CLASSIFIER_MODEL,
      creditCost: params.baseEstimate,
    }
  }

  const classifyResult = await classifyMessage(params.text)

  // greeting / faq → light model; knowledge → bot default model
  if (classifyResult.classification === 'greeting' || classifyResult.classification === 'faq') {
    return {
      modelToUse: lightModelResolved,
      fallbackUsed: false,
      classification: classifyResult.classification,
      classifierLatencyMs: classifyResult.latencyMs,
      classifierModel: classifyResult.classifierModel,
      creditCost: params.baseEstimate,
    }
  }

  if (classifyResult.classification === 'knowledge') {
    return {
      modelToUse: params.botDefaultModel,
      fallbackUsed: false,
      classification: classifyResult.classification,
      classifierLatencyMs: classifyResult.latencyMs,
      classifierModel: classifyResult.classifierModel,
      creditCost: params.baseEstimate,
    }
  }

  // complex → try strong model
  const strongEstimate = params.baseEstimate * 5
  const balance = await getBalance(params.orgId)

  if (balance < strongEstimate) {
    return {
      modelToUse: params.botDefaultModel,
      fallbackUsed: true,
      classification: 'complex',
      classifierLatencyMs: classifyResult.latencyMs,
      classifierModel: classifyResult.classifierModel,
      creditCost: params.baseEstimate,
    }
  }

  const { ok } = await debit(params.orgId, strongEstimate)
  if (!ok) {
    return {
      modelToUse: params.botDefaultModel,
      fallbackUsed: true,
      classification: 'complex',
      classifierLatencyMs: classifyResult.latencyMs,
      classifierModel: classifyResult.classifierModel,
      creditCost: params.baseEstimate,
    }
  }

  await refund(params.orgId, params.baseEstimate)

  return {
    modelToUse: strongModelResolved,
    fallbackUsed: false,
    classification: 'complex',
    classifierLatencyMs: classifyResult.latencyMs,
    classifierModel: classifyResult.classifierModel,
    creditCost: strongEstimate,
  }
}
