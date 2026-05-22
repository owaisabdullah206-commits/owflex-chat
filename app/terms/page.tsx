import type { Metadata } from 'next'
import TermsPage from '@/components/marketing/TermsPage'

export const metadata: Metadata = {
  title: 'Terms of Service — Octively',
  description: 'Terms and conditions governing use of the Octively platform.',
}

export default function Page() {
  return <TermsPage />
}
