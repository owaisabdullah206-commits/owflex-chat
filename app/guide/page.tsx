import type { Metadata } from 'next'
import GuidePage from '@/components/marketing/GuidePage'

export const metadata: Metadata = {
  title: 'Guide — Octively',
  description: 'Get started with Octively. Embed guide, API reference, and integration examples.',
}

export default function Page() {
  return <GuidePage />
}
