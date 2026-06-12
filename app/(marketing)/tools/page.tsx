import type { Metadata } from 'next'
import { JsonLd, breadcrumbSchema, SITE_URL } from '@/components/shared/JsonLd'
import { ToolsIndexPage } from '@/components/marketing/tools/ToolsIndexPage'
import { FREE_TOOLS } from '@/lib/data/free-tools'

export const metadata: Metadata = {
  title: 'Free AI Chatbot Tools for Freelancers and Agencies',
  description:
    'Free calculators and generators for selling and building AI chatbots: pricing, ROI, retainer, chatbot names, welcome messages, FAQ generator, and a website readiness checker. No signup.',
  alternates: { canonical: '/tools' },
  openGraph: {
    title: 'Free AI Chatbot Tools | Octively',
    description: 'Calculators and generators for selling and building AI chatbots. Free, no signup.',
    url: '/tools',
  },
}

const itemListSchema = {
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  name: 'Free AI chatbot tools',
  itemListElement: FREE_TOOLS.map((tool, i) => ({
    '@type': 'ListItem',
    position: i + 1,
    name: tool.title,
    url: `${SITE_URL}${tool.slug}`,
  })),
}

export default function Page() {
  return (
    <>
      <JsonLd schema={itemListSchema} />
      <JsonLd schema={breadcrumbSchema('Free Tools', '/tools')} />
      <ToolsIndexPage />
    </>
  )
}
