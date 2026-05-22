import type { Metadata } from 'next'
import PrivacyPage from '@/components/marketing/PrivacyPage'

export const metadata: Metadata = {
  title: 'Privacy Policy — Octively',
  description: 'How Octively collects, uses, and protects your data.',
}

export default function Page() {
  return <PrivacyPage />
}
