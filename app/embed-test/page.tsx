import { Suspense } from 'react'
import EmbedTestClient from './EmbedTestClient'

export const metadata = { title: 'Bot Preview' }

export default function EmbedTestPage() {
  return (
    <Suspense fallback={<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', fontFamily: 'monospace', color: '#94a3b8', fontSize: 13 }}>loading…</div>}>
      <EmbedTestClient />
    </Suspense>
  )
}
