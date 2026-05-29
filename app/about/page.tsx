import type { Metadata } from 'next'
import AboutPage from '@/components/marketing/AboutPage'

export const metadata: Metadata = {
  title: { absolute: 'About Octively — AI Chatbot Platform for Agencies & Freelancers' },
  description:
    'The story behind Octively — the affordable white-label AI chatbot platform for freelancers and agencies. Built in Karachi, deployed worldwide.',
  alternates: { canonical: '/about' },
  openGraph: {
    title: 'About Octively',
    description:
      'The affordable white-label AI chatbot platform for freelancers and agencies. Built in Karachi, deployed worldwide.',
    url: '/about',
  },
}

export default function Page() {
  return <AboutPage />
}
