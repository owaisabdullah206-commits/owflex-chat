import type { Metadata } from 'next'
import ContactPage from '@/components/marketing/ContactPage'

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Talk to the Octively team. We reply within 24 hours.',
  alternates: { canonical: '/contact' },
}

export default function Page() {
  return <ContactPage />
}
