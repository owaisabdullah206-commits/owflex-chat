import type { Metadata } from 'next'
import PricingGrid from '@/components/marketing/PricingGrid'
import { JsonLd, softwareApplicationSchema, breadcrumbSchema } from '@/components/shared/JsonLd'

export const metadata: Metadata = {
  title: 'Affordable White Label Chatbot Pricing',
  description:
    'Simple, affordable white-label AI chatbot pricing for freelancers and agencies. Free plan available. Starter from ₨2,500/month. Pay in PKR or USD — keep 100% of client revenue.',
  alternates: { canonical: '/pricing' },
  openGraph: {
    title: 'Affordable White Label Chatbot Pricing — Octively',
    description:
      'Free plan available. Starter from ₨2,500/month. Much cheaper than Stammer or ConvoCore. Keep 100% of client revenue.',
    url: '/pricing',
  },
}

export default function PricingPage() {
  return (
    <>
      <JsonLd schema={softwareApplicationSchema} />
      <JsonLd schema={breadcrumbSchema('Pricing', '/pricing')} />
      <PricingGrid />
    </>
  )
}
