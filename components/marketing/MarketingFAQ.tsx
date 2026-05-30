'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

export interface FAQItem {
  question: string
  answer: string
}

function FAQRow({ item, index }: { item: FAQItem; index: number }) {
  const [open, setOpen] = useState(false)
  return (
    <div style={{ borderBottom: '1px solid var(--hairline)' }}>
      <button
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
          padding: '20px 0',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          textAlign: 'left',
        }}
      >
        <span style={{
          fontSize: 16,
          fontWeight: 600,
          color: 'var(--ink)',
          lineHeight: 1.4,
          letterSpacing: '-0.01em',
        }}>
          {item.question}
        </span>
        <ChevronDown
          size={18}
          style={{
            flexShrink: 0,
            color: 'var(--of-primary)',
            transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s ease',
          }}
        />
      </button>

      <div style={{
        overflow: 'hidden',
        maxHeight: open ? 400 : 0,
        transition: 'max-height 0.3s ease',
      }}>
        <p style={{
          fontSize: 15.5,
          color: 'var(--ink-muted)',
          lineHeight: 1.75,
          paddingBottom: 20,
          margin: 0,
        }}>
          {item.answer}
        </p>
      </div>
    </div>
  )
}

export function MarketingFAQ({ items }: { items: FAQItem[] }) {
  return (
    <section style={{ paddingBlock: 80, borderTop: '1px solid var(--hairline)' }}>
      <div style={{ maxWidth: 760, margin: '0 auto', padding: '0 24px' }}>
        <p style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          color: 'var(--of-primary)',
          marginBottom: 12,
        }}>
          FAQ
        </p>
        <h2 style={{
          fontSize: 'clamp(24px, 3vw, 32px)',
          fontWeight: 700,
          letterSpacing: '-0.02em',
          lineHeight: 1.15,
          marginBottom: 40,
          color: 'var(--ink)',
        }}>
          Questions we get a lot
        </h2>

        <div style={{ borderTop: '1px solid var(--hairline)' }}>
          {items.map((item, i) => (
            <FAQRow key={i} item={item} index={i} />
          ))}
        </div>
      </div>
    </section>
  )
}
