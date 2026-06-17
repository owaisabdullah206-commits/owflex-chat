import type { Metadata } from 'next'
import ForFreelancersPage from '@/components/marketing/ForFreelancersPage'
import { JsonLd, breadcrumbSchema, faqSchema } from '@/components/shared/JsonLd'

export const metadata: Metadata = {
  title: 'AI Chatbot Platform for Freelancers',
  description:
    'Add an AI chatbot to any client project without coding. Each client gets their own branded portal to see conversations and leads, and you earn a recurring monthly retainer. Free plan to start.',
  alternates: { canonical: '/for-freelancers' },
  openGraph: {
    title: 'AI Chatbot Platform for Freelancers | Octively',
    description:
      'Add an AI chatbot to any client project, no coding. Clients get their own portal. Earn recurring revenue.',
    url: '/for-freelancers',
  },
}

const FREELANCER_FAQ_SCHEMA = faqSchema([
  {
    question: 'What is the best AI chatbot platform for freelancers?',
    answer:
      'For a freelancer, the best platform is the cheapest one that does not require code and still gives the client something to log into. Octively fills that gap. You build the bot in a visual dashboard, paste one script tag on the client\'s site, and they get their own branded portal with conversations and leads. There is a permanent free plan to start.',
  },
  {
    question: 'Can I use Octively for free on my first client project?',
    answer:
      'Yes. The free plan is permanent with no trial period or expiry. It covers one bot and up to 200 conversations a month. You can deploy a real chatbot on a real client site at no cost and bill a retainer on top.',
  },
  {
    question: 'Does setting up a chatbot require coding skills?',
    answer:
      'No. You train the bot from a visual dashboard by adding your client\'s website URL, uploading documents, or typing knowledge directly. The only technical step is pasting one script tag on the client\'s site.',
  },
  {
    question: 'How much should I charge clients for a managed chatbot?',
    answer:
      'Most freelancers charge ₨10,000–₨20,000/month in Pakistan ($40–$80 internationally) for a managed chatbot retainer. Octively\'s paid plans start at ₨2,500/month ($15), which leaves significant margin.',
  },
  {
    question: 'Will clients see Octively branding in their portal?',
    answer:
      'No. The client portal shows your branding: your name, your colours, your domain. Octively is invisible to your clients.',
  },
])

export default function Page() {
  return (
    <>
      <JsonLd schema={breadcrumbSchema('For Freelancers', '/for-freelancers')} />
      <JsonLd schema={FREELANCER_FAQ_SCHEMA} />
      <ForFreelancersPage />
    </>
  )
}
