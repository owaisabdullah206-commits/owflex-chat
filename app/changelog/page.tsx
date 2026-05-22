import type { Metadata } from 'next'
import ChangelogPage from '@/components/marketing/ChangelogPage'

export const metadata: Metadata = {
  title: 'Changelog — Octively',
  description: 'What shipped in every version of Octively. Shipping every week.',
}

export default function Page() {
  return <ChangelogPage />
}
