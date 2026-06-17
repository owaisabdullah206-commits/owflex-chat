import type { Metadata } from 'next'
import { JsonLd, breadcrumbSchema, SITE_URL } from '@/components/shared/JsonLd'
import { ToolPage } from '@/components/marketing/tools/ToolPage'
import { ChatbotPricingCalculator } from '@/components/marketing/tools/ChatbotPricingCalculator'

export const metadata: Metadata = {
  title: 'AI Chatbot Pricing Calculator: What to Charge Clients',
  description:
    'Free AI chatbot pricing calculator for freelancers and agencies. Work out what to charge a client for a managed chatbot, and which Octively plan covers it. No signup needed.',
  alternates: { canonical: '/tools/chatbot-pricing-calculator' },
  openGraph: {
    title: 'AI Chatbot Pricing Calculator | Octively',
    description: 'Work out what to charge clients for a managed AI chatbot, and your monthly margin.',
    url: '/tools/chatbot-pricing-calculator',
  },
}

const appSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'AI Chatbot Pricing Calculator',
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web',
  url: `${SITE_URL}/tools/chatbot-pricing-calculator`,
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  description:
    'Estimate what to charge a client for a managed AI chatbot retainer and which Octively plan covers the usage.',
}

export default function Page() {
  return (
    <>
      <JsonLd schema={appSchema} />
      <JsonLd schema={breadcrumbSchema('AI Chatbot Pricing Calculator', '/tools/chatbot-pricing-calculator')} />
      <ToolPage
        eyebrow="Free tool"
        title="AI Chatbot Pricing Calculator"
        intro="Not sure what to charge a client for an AI chatbot? Enter a few details and get a recommended monthly retainer, the Octively plan you need, and your margin."
        source="chatbot-pricing-calculator"
      >
        <ChatbotPricingCalculator />
      </ToolPage>
    </>
  )
}
