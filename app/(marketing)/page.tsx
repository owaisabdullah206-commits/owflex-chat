import type { Metadata } from 'next'
import MarketingHome from '@/components/marketing/MarketingHome'
import { LandingPreloader } from '@/components/marketing/LandingPreloader'
import { JsonLd, faqSchema } from '@/components/shared/JsonLd'
import { getPosts } from '@/sanity/lib/queries'

export const revalidate = 3600

export const metadata: Metadata = {
  description:
    'The easiest white-label AI chatbot platform for freelancers and agencies. Build AI chatbots for your SMB clients in minutes. Each client gets their own branded portal to view conversations, leads, and analytics. Free plan available.',
  alternates: { canonical: '/' },
  openGraph: {
    title: 'White Label AI Chatbot Platform for Agencies & Freelancers',
    description:
      'Build AI chatbots for your clients in minutes. Each client gets a branded portal for conversations, leads, and analytics. Free plan available.',
    url: '/',
  },
}

const HOME_FAQ_SCHEMA = faqSchema([
  {
    question: 'What is a white-label AI chatbot platform?',
    answer:
      'A white-label AI chatbot platform lets you build AI chatbots for other businesses and brand them as your own. Octively is built for freelancers and agencies. You create the bot in a visual dashboard, paste one script tag on the client\'s site, and each client gets a login to their own portal to read conversations, view leads, and check analytics.',
  },
  {
    question: 'Do I need to know how to code to use Octively?',
    answer:
      'No. You build and train the bot from a visual dashboard with no code required. The only technical step is pasting a single script tag on your client\'s website, and Octively provides step-by-step guides for WordPress, Webflow, Shopify, and other platforms.',
  },
  {
    question: 'How do my clients access their chatbot data?',
    answer:
      'Each client gets an invite to their own branded portal. They log in and see only their conversations, leads, and analytics. You control access levels. They never see other clients\' data or Octively branding.',
  },
  {
    question: 'What does Octively cost?',
    answer:
      'There is a permanent free plan with one bot and 200 conversations a month. Paid plans start at ₨2,500/month in Pakistan or $15/month internationally. The Agency plan at ₨20,000/month ($79) covers unlimited client portals with no per-seat fees.',
  },
  {
    question: 'Is there a per-message or per-conversation fee?',
    answer:
      'No. All plans include a conversation allowance. You pay the flat monthly rate with no surprise usage bills.',
  },
])

export default async function Home() {
  const posts = (await getPosts()).slice(0, 3)
  return (
    <>
      <JsonLd schema={HOME_FAQ_SCHEMA} />
      <LandingPreloader />
      <MarketingHome posts={posts} />
    </>
  )
}
