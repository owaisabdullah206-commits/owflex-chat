import type { Metadata } from 'next'
import GuidePage from '@/components/marketing/GuidePage'
import { JsonLd, breadcrumbSchema } from '@/components/shared/JsonLd'

export const metadata: Metadata = {
  title: 'How to Embed an AI Chatbot on Any Website',
  description:
    'Step-by-step guide to embedding an AI chatbot on any website. Copy one script tag — works on WordPress, Webflow, Shopify, and any HTML site. No coding required. Setup takes under 5 minutes.',
  alternates: { canonical: '/guide' },
  openGraph: {
    title: 'How to Embed an AI Chatbot on Any Website — Octively',
    description:
      'Copy one script tag. Works on WordPress, Webflow, Shopify, and any site. No coding required.',
    url: '/guide',
  },
}

export default function Page() {
  return (
    <>
      <JsonLd schema={breadcrumbSchema('Guide', '/guide')} />
      <GuidePage />
    </>
  )
}
