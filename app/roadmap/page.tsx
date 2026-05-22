import type { Metadata } from 'next'
import RoadmapPage from '@/components/marketing/RoadmapPage'

export const metadata: Metadata = {
  title: 'Roadmap — Octively',
  description: "What's shipped, what's in progress, and what's coming next on Octively.",
}

export default function Page() {
  return <RoadmapPage />
}
