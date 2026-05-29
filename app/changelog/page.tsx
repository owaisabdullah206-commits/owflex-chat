import type { Metadata } from 'next'
import ChangelogPage from '@/components/marketing/ChangelogPage'

export const metadata: Metadata = {
  title: 'Changelog',
  description: 'What shipped in every version of Octively. Shipping every week.',
  alternates: { canonical: '/changelog' },
}

export default function Page() {
  return <ChangelogPage />
}
