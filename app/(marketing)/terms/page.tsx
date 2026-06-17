import type { Metadata } from 'next'
import TermsPage from '@/components/marketing/TermsPage'

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'Terms and conditions governing use of the Octively platform.',
  alternates: { canonical: '/terms' },
}

export default function Page() {
  return <TermsPage />
}
