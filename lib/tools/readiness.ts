// Heuristic scoring for the Website Chatbot Readiness Checker.
// Pure functions over extracted page text, so this needs no network and is
// easy to reason about. The route fetches the page (Tavily) and calls this.

export interface ReadinessCheck {
  id: string
  label: string
  passed: boolean
  tip: string
}

export interface ReadinessResult {
  score: number // 0..5
  verdict: 'ready' | 'almost' | 'needs-work'
  headline: string
  checks: ReadinessCheck[]
  wordCount: number
}

const has = (text: string, patterns: RegExp[]) => patterns.some((p) => p.test(text))

export function scoreReadiness(rawContent: string): ReadinessResult {
  const text = rawContent.toLowerCase()
  const wordCount = (rawContent.match(/\b\w+\b/g) ?? []).length

  const checks: ReadinessCheck[] = [
    {
      id: 'content',
      label: 'Enough content to answer questions',
      passed: wordCount >= 300,
      tip: 'Add more text about what you do. A chatbot can only answer from what your site says.',
    },
    {
      id: 'offering',
      label: 'Clearly states what you offer',
      passed: has(text, [/\b(service|services|product|products|we offer|we provide|solutions?)\b/]),
      tip: 'Spell out your products or services in plain words so the bot can describe them.',
    },
    {
      id: 'contact',
      label: 'Shows a way to reach you',
      passed: has(text, [
        /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/,
        /\b(contact|whatsapp|call us|phone|email us)\b/,
        /(\+?\d[\d\s-]{7,}\d)/,
      ]),
      tip: 'Add an email, phone, or WhatsApp so the bot can hand people off when needed.',
    },
    {
      id: 'faq',
      label: 'Has FAQ or help content',
      passed: has(text, [/\b(faq|frequently asked|q&a|help center|support|how do i|how to)\b/]),
      tip: 'A short FAQ gives the bot ready answers to common questions. Try our FAQ generator.',
    },
    {
      id: 'leadcapture',
      label: 'Gives visitors a next step to convert',
      passed: has(text, [/\b(get a quote|sign up|book|subscribe|free trial|get started|request|enquir|inquir|order now|buy now)\b/]),
      tip: 'Add a clear action like "get a quote" or "book a call" so the bot can capture leads.',
    },
  ]

  const score = checks.filter((c) => c.passed).length
  const verdict: ReadinessResult['verdict'] = score >= 4 ? 'ready' : score >= 2 ? 'almost' : 'needs-work'
  const headline =
    verdict === 'ready'
      ? 'This site is ready for a chatbot.'
      : verdict === 'almost'
        ? 'Almost ready. A few fixes will make the bot much better.'
        : 'Needs some work before a chatbot will be useful.'

  return { score, verdict, headline, checks, wordCount }
}
