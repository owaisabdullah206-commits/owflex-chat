import type { Metadata } from 'next'
import ContactPage from '@/components/marketing/ContactPage'

export const metadata: Metadata = {
  title: 'Contact — Octively',
  description: 'Talk to the Octively team. We reply within 24 hours.',
}

export default function Page() {
  return <ContactPage />
}
