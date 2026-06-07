import type { Metadata } from 'next'
import { JsonLd, breadcrumbSchema, SITE_URL } from '@/components/shared/JsonLd'
import { ToolPage } from '@/components/marketing/tools/ToolPage'
import { ChatbotRoiCalculator } from '@/components/marketing/tools/ChatbotRoiCalculator'

export const metadata: Metadata = {
  title: 'AI Chatbot ROI Calculator: Leads, Revenue, Hours Saved',
  description:
    'Free AI chatbot ROI calculator. Estimate the leads, new revenue, and support hours an AI chatbot can add to a website each month. Built for freelancers and agencies.',
  alternates: { canonical: '/tools/chatbot-roi-calculator' },
  openGraph: {
    title: 'AI Chatbot ROI Calculator | Octively',
    description: 'Estimate the leads, revenue, and support hours an AI chatbot adds each month.',
    url: '/tools/chatbot-roi-calculator',
  },
}

const appSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'AI Chatbot ROI Calculator',
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web',
  url: `${SITE_URL}/tools/chatbot-roi-calculator`,
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  description: 'Estimate the monthly leads, revenue, and support time an AI chatbot can add to a website.',
}

export default function Page() {
  return (
    <>
      <JsonLd schema={appSchema} />
      <JsonLd schema={breadcrumbSchema('AI Chatbot ROI Calculator', '/tools/chatbot-roi-calculator')} />
      <ToolPage
        eyebrow="Free tool"
        title="AI Chatbot ROI Calculator"
        intro="See what an AI chatbot is worth to a client each month: leads captured, new revenue, and support hours saved. Use it to justify the retainer."
        source="chatbot-roi-calculator"
      >
        <ChatbotRoiCalculator />
      </ToolPage>
    </>
  )
}
