import type { Metadata } from 'next'
import AboutPage from '@/components/marketing/AboutPage'

export const metadata: Metadata = {
  title: 'About — Octively',
  description: 'Built in Karachi. Deployed worldwide. The story behind Octively.',
}

export default function Page() {
  return <AboutPage />
}
