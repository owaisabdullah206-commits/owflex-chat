import type { Metadata } from 'next'
import { JsonLd, breadcrumbSchema, SITE_URL } from '@/components/shared/JsonLd'
import { ToolPage } from '@/components/marketing/tools/ToolPage'
import { ChatbotNameGenerator } from '@/components/marketing/tools/ChatbotNameGenerator'

export const metadata: Metadata = {
  title: 'AI Chatbot Name Generator: Free Bot Name Ideas',
  description:
    'Free AI chatbot name generator. Get memorable, brand-aligned chatbot names by tone and industry. No signup needed. Pick a name, then build the bot free in Octively.',
  alternates: { canonical: '/tools/ai-chatbot-name-generator' },
  openGraph: {
    title: 'AI Chatbot Name Generator | Octively',
    description: 'Generate memorable chatbot names by tone and industry. Free, no signup.',
    url: '/tools/ai-chatbot-name-generator',
  },
}

const appSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'AI Chatbot Name Generator',
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web',
  url: `${SITE_URL}/tools/ai-chatbot-name-generator`,
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  description:
    'Generate memorable, brand-aligned chatbot names by tone and industry for your website chatbot.',
}

export default function Page() {
  return (
    <>
      <JsonLd schema={appSchema} />
      <JsonLd schema={breadcrumbSchema('AI Chatbot Name Generator', '/tools/ai-chatbot-name-generator')} />
      <ToolPage
        eyebrow="Free tool"
        title="AI Chatbot Name Generator"
        intro="Need a name for your website chatbot? Pick a tone and industry to get instant, brand-aligned ideas. Generate as many as you like, then build the bot free in Octively."
        source="ai-chatbot-name-generator"
      >
        <ChatbotNameGenerator />
      </ToolPage>
    </>
  )
}
