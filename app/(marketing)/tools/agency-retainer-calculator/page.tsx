import type { Metadata } from 'next'
import { JsonLd, breadcrumbSchema, SITE_URL } from '@/components/shared/JsonLd'
import { ToolPage } from '@/components/marketing/tools/ToolPage'
import { AgencyRetainerCalculator } from '@/components/marketing/tools/AgencyRetainerCalculator'

export const metadata: Metadata = {
  title: 'Agency AI Retainer Calculator: Monthly Profit from Chatbot Services',
  description:
    'Free calculator for agencies. Work out your monthly recurring revenue, profit, and margin when you add managed AI chatbot retainers across your client base. Toggle between PKR and USD.',
  alternates: { canonical: '/tools/agency-retainer-calculator' },
  openGraph: {
    title: 'Agency AI Retainer Calculator | Octively',
    description: 'Work out your monthly profit from adding AI chatbot retainers across your client base.',
    url: '/tools/agency-retainer-calculator',
  },
}

const appSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Agency AI Retainer Calculator',
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web',
  url: `${SITE_URL}/tools/agency-retainer-calculator`,
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  description:
    'Calculate monthly recurring revenue, profit margin, and annual income from adding AI chatbot retainers across an agency client base.',
}

export default function Page() {
  return (
    <>
      <JsonLd schema={appSchema} />
      <JsonLd schema={breadcrumbSchema('Agency AI Retainer Calculator', '/tools/agency-retainer-calculator')} />
      <ToolPage
        eyebrow="Free tool"
        title="Agency AI Retainer Calculator"
        intro="How much could your agency make by adding a managed chatbot to every client? Enter your client count and retainer fee to see your monthly recurring revenue, profit margin, and yearly income."
        source="agency-retainer-calculator"
      >
        <AgencyRetainerCalculator />
      </ToolPage>
    </>
  )
}
