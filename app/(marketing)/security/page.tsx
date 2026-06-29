import type { Metadata } from 'next'
import SecurityPage from '@/components/marketing/SecurityPage'

export const metadata: Metadata = {
  title: 'Security',
  description:
    'How Octively protects your clients\' data. Encryption, tenant isolation, and infrastructure hardening.',
  alternates: { canonical: '/security' },
  openGraph: {
    title: 'Security — Octively',
    description:
      'How Octively protects your clients\' data. Encryption, tenant isolation, and infrastructure hardening.',
    url: '/security',
  },
}

export default function Page() {
  return <SecurityPage />
}
