import type { Metadata } from 'next'
import { JsonLd, breadcrumbSchema, SITE_URL } from '@/components/shared/JsonLd'
import { ToolPage } from '@/components/marketing/tools/ToolPage'
import { WelcomeMessageGenerator } from '@/components/marketing/tools/WelcomeMessageGenerator'

export const metadata: Metadata = {
  title: 'Chatbot Welcome Message Generator: Free Greeting Templates',
  description:
    'Free chatbot welcome message generator. Get ready-to-use greeting templates by tone and goal for support, leads, sales, or bookings. No signup. Paste straight into your bot.',
  alternates: { canonical: '/tools/chatbot-welcome-message-generator' },
  openGraph: {
    title: 'Chatbot Welcome Message Generator | Octively',
    description: 'Ready-to-use chatbot greeting templates by tone and goal. Free, no signup.',
    url: '/tools/chatbot-welcome-message-generator',
  },
}

const appSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Chatbot Welcome Message Generator',
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web',
  url: `${SITE_URL}/tools/chatbot-welcome-message-generator`,
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  description:
    'Generate chatbot welcome message templates by tone and goal for a website chatbot.',
}

export default function Page() {
  return (
    <>
      <JsonLd schema={appSchema} />
      <JsonLd schema={breadcrumbSchema('Chatbot Welcome Message Generator', '/tools/chatbot-welcome-message-generator')} />
      <ToolPage
        eyebrow="Free tool"
        title="Chatbot Welcome Message Generator"
        intro="Your chatbot's first line decides whether people engage. Pick a tone and goal to get greeting templates you can use right away. Then drop your favorite into your Octively bot."
        source="chatbot-welcome-message-generator"
      >
        <WelcomeMessageGenerator />
      </ToolPage>
    </>
  )
}
