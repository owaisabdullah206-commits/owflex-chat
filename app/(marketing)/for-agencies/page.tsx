import type { Metadata } from 'next'
import ForAgenciesPage from '@/components/marketing/ForAgenciesPage'
import { JsonLd, breadcrumbSchema, faqSchema } from '@/components/shared/JsonLd'

export const metadata: Metadata = {
  title: 'White Label Chatbot for Agencies',
  description:
    'Manage every client chatbot from one dashboard. Each client logs into their own branded portal to see conversations and leads. White-label, flat pricing from ₨2,500/month, no per-seat fees.',
  alternates: { canonical: '/for-agencies' },
  openGraph: {
    title: 'White Label Chatbot for Agencies | Octively',
    description:
      'One dashboard for every client bot. Clients log into their own branded portal. Keep 100% of client revenue.',
    url: '/for-agencies',
  },
}

const AGENCY_FAQ_SCHEMA = faqSchema([
  {
    question: 'How do agencies manage AI chatbots for multiple clients?',
    answer:
      'Most agencies use a white-label platform rather than building something custom for every client. On Octively each client gets their own workspace with their own bot, branding, and login. You build and train from one dashboard, drop a script tag on their site, and they access a portal showing only their conversations and leads.',
  },
  {
    question: 'Is there a per-client or per-seat fee on Octively?',
    answer:
      'No. The Agency plan is flat-rate at ₨20,000/month in Pakistan or $79 internationally, regardless of how many clients you manage. Signing your tenth client costs the same as signing your first.',
  },
  {
    question: 'Can each client see only their own data?',
    answer:
      'Yes. Tenant isolation is enforced at the database level. Each client portal shows only that client\'s conversations, leads, and analytics. No client can see another client\'s data, and they never see Octively branding.',
  },
  {
    question: 'How long does it take to onboard a new client?',
    answer:
      'Most agencies onboard a new client in under an hour. You create their workspace, train the bot on their content, and paste the embed script on their site. Their portal is live the moment you send them an invite.',
  },
  {
    question: 'What happens if a client wants to cancel?',
    answer:
      'You can archive or delete a client workspace at any time. The client\'s portal access is immediately removed. There is no per-seat reduction on cancellation and no minimum contract on monthly plans.',
  },
])

export default function Page() {
  return (
    <>
      <JsonLd schema={breadcrumbSchema('For Agencies', '/for-agencies')} />
      <JsonLd schema={AGENCY_FAQ_SCHEMA} />
      <ForAgenciesPage />
    </>
  )
}
