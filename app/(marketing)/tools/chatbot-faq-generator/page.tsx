import type { Metadata } from 'next'
import { JsonLd, breadcrumbSchema, SITE_URL } from '@/components/shared/JsonLd'
import { ToolPage } from '@/components/marketing/tools/ToolPage'
import { ChatbotFaqGenerator } from '@/components/marketing/tools/ChatbotFaqGenerator'

export const metadata: Metadata = {
  title: 'AI Chatbot FAQ Generator: Build Your Knowledge Base Free',
  description:
    'Free AI FAQ generator for chatbots. Describe your business and get ready-to-use question and answer pairs to train your chatbot knowledge base. No signup. Paste straight into Octively.',
  alternates: { canonical: '/tools/chatbot-faq-generator' },
  openGraph: {
    title: 'AI Chatbot FAQ Generator | Octively',
    description: 'Turn a short business description into a ready-to-use chatbot FAQ. Free, no signup.',
    url: '/tools/chatbot-faq-generator',
  },
}

const appSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'AI Chatbot FAQ Generator',
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web',
  url: `${SITE_URL}/tools/chatbot-faq-generator`,
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  description:
    'Generate a question and answer FAQ for a chatbot knowledge base from a short business description.',
}

export default function Page() {
  return (
    <>
      <JsonLd schema={appSchema} />
      <JsonLd schema={breadcrumbSchema('AI Chatbot FAQ Generator', '/tools/chatbot-faq-generator')} />
      <ToolPage
        eyebrow="Free tool"
        title="AI Chatbot FAQ Generator"
        intro="A chatbot is only as good as what it knows. Describe your business and get a ready-to-use FAQ you can paste straight into your bot's knowledge base. Built for Octively, works anywhere."
        source="chatbot-faq-generator"
      >
        <ChatbotFaqGenerator />
      </ToolPage>
    </>
  )
}
