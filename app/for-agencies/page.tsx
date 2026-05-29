import type { Metadata } from 'next'
import ForAgenciesPage from '@/components/marketing/ForAgenciesPage'

export const metadata: Metadata = {
  title: 'White Label Chatbot for Agencies',
  description:
    'Manage every client chatbot from one dashboard. Each client logs into their own branded portal to see conversations and leads. From ₨2,500/month — far cheaper than Stammer or ConvoCore.',
  alternates: { canonical: '/for-agencies' },
  openGraph: {
    title: 'White Label Chatbot for Agencies — Octively',
    description:
      'One dashboard for every client bot. Clients log into their own branded portal. Keep 100% of client revenue.',
    url: '/for-agencies',
  },
}

export default function Page() {
  return <ForAgenciesPage />
}
