import type { Metadata } from 'next'
import ForAgenciesPage from '@/components/marketing/ForAgenciesPage'

export const metadata: Metadata = {
  title: 'For Agencies — octively',
  description: 'Manage every client chatbot from one dashboard. White-label portal, your brand.',
}

export default function Page() {
  return <ForAgenciesPage />
}
