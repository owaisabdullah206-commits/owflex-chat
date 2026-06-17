import type { Metadata } from 'next'
import { JsonLd, breadcrumbSchema, SITE_URL } from '@/components/shared/JsonLd'
import { ToolPage } from '@/components/marketing/tools/ToolPage'
import { AiServicesDirectory } from '@/components/marketing/tools/AiServicesDirectory'
import { AI_SERVICES } from '@/lib/data/ai-services'

export const metadata: Metadata = {
  title: 'AI Services You Can Sell to Clients: Pakistan Freelancer Directory',
  description:
    'A directory of AI-powered services Pakistani freelancers and agencies can sell to their SMB clients today. Real pricing in PKR and USD, how to deliver each service, and where to find clients.',
  alternates: { canonical: '/directory/ai-services-to-sell' },
  openGraph: {
    title: 'AI Services to Sell to Clients | Octively',
    description:
      'A directory of AI services Pakistani freelancers can sell: chatbots, content, SEO, automation, and more. Real PKR pricing and delivery guides.',
    url: '/directory/ai-services-to-sell',
  },
}

const itemListSchema = {
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  name: 'AI Services Pakistani Freelancers Can Sell',
  description: 'Directory of AI-powered services for freelancers and agencies to offer to SMB clients.',
  url: `${SITE_URL}/directory/ai-services-to-sell`,
  numberOfItems: AI_SERVICES.length,
  itemListElement: AI_SERVICES.map((s, i) => ({
    '@type': 'ListItem',
    position: i + 1,
    name: s.name,
    description: s.tagline,
    url: `${SITE_URL}/directory/ai-services-to-sell#${s.slug}`,
  })),
}

export default function Page() {
  return (
    <>
      <JsonLd schema={itemListSchema} />
      <JsonLd schema={breadcrumbSchema('AI Services to Sell', '/directory/ai-services-to-sell')} />
      <ToolPage
        eyebrow="Freelancer directory"
        title="AI services you can sell to clients today"
        intro="A practical directory for Pakistani freelancers and agencies. Each entry includes what the service is, how to deliver it, what to charge (in PKR or USD), your likely margin, and where to find clients in Pakistan."
        source="ai-services-directory"
      >
        <AiServicesDirectory />
      </ToolPage>
    </>
  )
}
