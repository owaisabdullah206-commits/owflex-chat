import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import MarketingHome from '@/components/marketing/MarketingHome'
import { LandingPreloader } from '@/components/marketing/LandingPreloader'

export const dynamic = 'force-dynamic'

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

export default async function Home() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (session) redirect('/dashboard')
  return (
    <>
      <LandingPreloader />
      <MarketingHome />
    </>
  )
}
