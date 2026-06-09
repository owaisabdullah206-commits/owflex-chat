import type { Metadata } from 'next'
import { JsonLd, breadcrumbSchema, SITE_URL } from '@/components/shared/JsonLd'
import { ToolPage } from '@/components/marketing/tools/ToolPage'
import { WebsiteReadinessChecker } from '@/components/marketing/tools/WebsiteReadinessChecker'

export const metadata: Metadata = {
  title: 'Website Chatbot Readiness Checker: Is Your Site Ready?',
  description:
    'Free chatbot readiness checker. Enter a website URL and see if it has enough content, contact info, and FAQs for an AI chatbot. Get a score and fixes. No signup needed.',
  alternates: { canonical: '/tools/website-chatbot-readiness-checker' },
  openGraph: {
    title: 'Website Chatbot Readiness Checker | Octively',
    description: 'See if a website is ready for an AI chatbot. Get a score and the gaps to fix. Free.',
    url: '/tools/website-chatbot-readiness-checker',
  },
}

const appSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Website Chatbot Readiness Checker',
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web',
  url: `${SITE_URL}/tools/website-chatbot-readiness-checker`,
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  description:
    'Check whether a website has enough content, contact details, and FAQs to support an AI chatbot.',
}

export default function Page() {
  return (
    <>
      <JsonLd schema={appSchema} />
      <JsonLd schema={breadcrumbSchema('Website Chatbot Readiness Checker', '/tools/website-chatbot-readiness-checker')} />
      <ToolPage
        eyebrow="Free tool"
        title="Website Chatbot Readiness Checker"
        intro="Thinking about adding an AI chatbot to a client's site? Enter the URL to see if the page has enough for a bot to work with, and exactly what to fix first."
        source="website-chatbot-readiness-checker"
      >
        <WebsiteReadinessChecker />
      </ToolPage>
    </>
  )
}
