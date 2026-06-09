// Static fallback for the free Chatbot FAQ Generator.
// The tool is AI-first because good FAQs must be specific to a business. When
// the AI path is unavailable (rate limit, error, or before the user generates),
// we show this universal starter set: the questions almost every business
// should answer in its chatbot knowledge base, with prompts for the answers.

export interface FaqStarter {
  question: string
  answerHint: string
}

export const FAQ_STARTERS: FaqStarter[] = [
  { question: 'What do you offer?', answerHint: 'List your main products or services in one or two sentences.' },
  { question: 'How much does it cost?', answerHint: 'Give starting prices or a range, plus what affects the price.' },
  { question: 'Where are you located and what areas do you serve?', answerHint: 'Address, service areas, or "online only".' },
  { question: 'What are your hours?', answerHint: 'Opening hours and time zone. Note if the chatbot answers 24/7.' },
  { question: 'How do I get started or place an order?', answerHint: 'The exact first step a new customer should take.' },
  { question: 'How can I contact a person?', answerHint: 'Phone, email, WhatsApp, or how to reach the team.' },
  { question: 'Do you offer refunds or guarantees?', answerHint: 'Your refund, return, or satisfaction policy in plain terms.' },
  { question: 'How long does delivery or turnaround take?', answerHint: 'Typical timelines for delivery, booking, or project completion.' },
  { question: 'What payment methods do you accept?', answerHint: 'Cards, bank transfer, cash on delivery, PayFast, etc.' },
  { question: 'Do you have any current offers?', answerHint: 'Any discount, free trial, or first-time customer deal.' },
]

/** Formats the starter set as plain Q/A text ready to paste into a knowledge base. */
export function formatStarterText(): string {
  return FAQ_STARTERS.map((f) => `Q: ${f.question}\nA: [${f.answerHint}]`).join('\n\n')
}
