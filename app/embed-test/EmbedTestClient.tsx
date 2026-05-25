'use client'

import { useSearchParams } from 'next/navigation'
import Script from 'next/script'

export default function EmbedTestClient() {
  const params = useSearchParams()
  const embedKey = params.get('key') ?? ''

  return (
    <>
      <div style={{
        minHeight: '100vh',
        background: '#f1f5f9',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: 8,
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}>
        <p style={{ color: '#94a3b8', fontSize: 13, margin: 0 }}>
          Click the chat bubble to test your bot
        </p>
        <span style={{
          fontFamily: 'monospace',
          fontSize: 11,
          color: '#64748b',
          background: '#e2e8f0',
          padding: '2px 8px',
          borderRadius: 4,
        }}>
          {embedKey ? `${embedKey.slice(0, 16)}…` : 'No key provided'}
        </span>
      </div>

      {embedKey && (
        <Script
          src="/embed.js"
          data-key={embedKey}
          strategy="afterInteractive"
        />
      )}
    </>
  )
}
