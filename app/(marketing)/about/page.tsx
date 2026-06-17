import type { Metadata } from 'next'
import AboutPage from '@/components/marketing/AboutPage'
import { JsonLd, breadcrumbSchema } from '@/components/shared/JsonLd'

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
  return (
    <>
      <JsonLd schema={breadcrumbSchema('About', '/about')} />
      <AboutPage />
    </>
  )
}
