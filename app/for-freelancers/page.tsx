import type { Metadata } from 'next'
import ForFreelancersPage from '@/components/marketing/ForFreelancersPage'

export const metadata: Metadata = {
  title: 'AI Chatbot Platform for Freelancers',
  description:
    'Add an AI chatbot to any client project without coding. Each client gets their own branded portal to see conversations and leads — and you earn a recurring monthly retainer. Free plan to start.',
  alternates: { canonical: '/for-freelancers' },
  openGraph: {
    title: 'AI Chatbot Platform for Freelancers — Octively',
    description:
      'Add an AI chatbot to any client project — no coding. Clients get their own portal. Earn recurring revenue.',
    url: '/for-freelancers',
  },
}

export default function Page() {
  return <ForFreelancersPage />
}
