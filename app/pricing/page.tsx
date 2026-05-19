import type { Metadata } from 'next'
import PricingGrid from '@/components/marketing/PricingGrid'

export const metadata: Metadata = {
  title: 'Pricing — octively',
  description: 'Simple, transparent pricing for developer chatbot portals. Free plan available. Pay in PKR or USD.',
}

export default function PricingPage() {
  return <PricingGrid />
}
