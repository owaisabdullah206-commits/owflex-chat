'use client'

import type { ReactNode } from 'react'

// Styled "quick answer" card used on landing pages for AI-search citability.
// Renders as a visually distinct section so AI crawlers (and humans) can
// identify a standalone, self-contained answer.
export function AiAnswerBlock({
  question,
  children,
}: {
  question: string
  children: ReactNode
}) {
  return (
    <section aria-label="Quick answer" style={{ paddingBlock: 72, borderTop: '1px solid var(--hairline)' }}>
      <div style={{ maxWidth: 760, margin: '0 auto', padding: '0 24px' }}>

        {/* Card */}
        <div
          style={{
            borderRadius: 16,
            border: '1px solid rgba(14,165,233,0.22)',
            overflow: 'hidden',
          }}
        >
          {/* Header strip */}
          <div
            style={{
              background: 'var(--of-primary)',
              padding: '10px 20px',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: 'white',
              }}
            >
              Quick answer
            </span>
          </div>

          {/* Body */}
          <div style={{ padding: '24px 24px 28px', background: 'var(--of-primary-soft)' }}>
            <p
              style={{
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                color: 'var(--of-primary)',
                marginBottom: 10,
              }}
            >
              Question
            </p>
            <h2
              style={{
                fontSize: 'clamp(19px, 2.4vw, 23px)',
                fontWeight: 700,
                letterSpacing: '-0.02em',
                lineHeight: 1.3,
                color: 'var(--ink)',
                marginBottom: 18,
              }}
            >
              {question}
            </h2>

            <div
              style={{
                height: 1,
                background: 'rgba(14,165,233,0.2)',
                marginBottom: 18,
              }}
            />

            <p
              style={{
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                color: 'var(--of-primary)',
                marginBottom: 10,
              }}
            >
              Answer
            </p>
            <div
              style={{
                fontSize: 16,
                color: 'var(--ink)',
                lineHeight: 1.8,
              }}
            >
              {children}
            </div>
          </div>
        </div>

      </div>
    </section>
  )
}
