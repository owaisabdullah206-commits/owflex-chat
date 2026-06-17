// Sanity Studio mounted inside the Next.js app. Gated by Sanity's own login.
import type { Metadata, Viewport } from 'next'
import { NextStudio } from 'next-sanity/studio'
import config from '@/sanity.config'
import { isSanityConfigured } from '@/sanity/env'

export const dynamic = 'force-static'

export const metadata: Metadata = {
  title: 'Content Studio',
  robots: { index: false, follow: false },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  interactiveWidget: 'resizes-content',
}

export default function StudioPage() {
  if (!isSanityConfigured) {
    return (
      <div style={{ padding: 48, fontFamily: 'system-ui, sans-serif' }}>
        <h1 style={{ fontSize: 20, fontWeight: 600 }}>Content Studio not configured</h1>
        <p style={{ color: '#666', marginTop: 8 }}>
          Set <code>NEXT_PUBLIC_SANITY_PROJECT_ID</code> (and dataset) in the environment to enable the studio.
        </p>
      </div>
    )
  }
  return <NextStudio config={config} />
}
