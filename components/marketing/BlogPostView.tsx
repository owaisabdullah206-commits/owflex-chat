'use client'

import Link from 'next/link'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { ArrowLeft } from 'lucide-react'
import { MarketingNav } from './MarketingNav'
import MarketingFooter from './MarketingFooter'
import { useDarkMode } from './useDarkMode'
import { OctivelyButton } from '@/components/brand/OctivelyButton'
import type { SanityPost } from '@/sanity/lib/queries'

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
}

export default function BlogPostView({ post }: { post: SanityPost }) {
  const { dark, toggleDark } = useDarkMode()

  return (
    <div className={`marketing${dark ? ' dark' : ''}`} style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--ink)' }}>
      <MarketingNav dark={dark} onToggleDark={toggleDark} />

      <article style={{ maxWidth: 720, margin: '0 auto', padding: '48px 24px 72px' }}>
        <Link
          href="/blog"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--ink-muted)', textDecoration: 'none', marginBottom: 28 }}
        >
          <ArrowLeft size={14} /> All articles
        </Link>

        <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--of-primary)', marginBottom: 12 }}>
          {formatDate(post.publishedAt)}{post.readingMinutes ? ` · ${post.readingMinutes} min read` : ''}
        </p>
        <h1 style={{ fontSize: 'clamp(30px, 4vw, 42px)', fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.12, marginBottom: 16 }}>
          {post.title}
        </h1>
        <p style={{ fontSize: 18, color: 'var(--ink-muted)', lineHeight: 1.6, marginBottom: 40 }}>
          {post.description}
        </p>

        <div className="mkt-article">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              h2: ({ children }) => <h2 style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-0.01em', marginTop: 40, marginBottom: 14, lineHeight: 1.25 }}>{children}</h2>,
              h3: ({ children }) => <h3 style={{ fontSize: 19, fontWeight: 600, marginTop: 28, marginBottom: 10 }}>{children}</h3>,
              p: ({ children }) => <p style={{ fontSize: 16.5, color: 'var(--ink-muted)', lineHeight: 1.75, marginBottom: 18 }}>{children}</p>,
              ul: ({ children }) => <ul style={{ margin: '0 0 18px', paddingLeft: 22, display: 'flex', flexDirection: 'column', gap: 8 }}>{children}</ul>,
              ol: ({ children }) => <ol style={{ margin: '0 0 18px', paddingLeft: 22, display: 'flex', flexDirection: 'column', gap: 8 }}>{children}</ol>,
              li: ({ children }) => <li style={{ fontSize: 16.5, color: 'var(--ink-muted)', lineHeight: 1.7 }}>{children}</li>,
              strong: ({ children }) => <strong style={{ color: 'var(--ink)', fontWeight: 600 }}>{children}</strong>,
              a: ({ href, children }) => <Link href={href ?? '#'} style={{ color: 'var(--of-primary)', textDecoration: 'underline', textUnderlineOffset: 2 }}>{children}</Link>,
              table: ({ children }) => (
                <div style={{ overflowX: 'auto', border: '1px solid var(--hairline)', borderRadius: 12, margin: '0 0 24px' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14.5, minWidth: 440 }}>{children}</table>
                </div>
              ),
              th: ({ children }) => <th style={{ textAlign: 'left', padding: '11px 16px', fontWeight: 600, fontSize: 13, borderBottom: '1px solid var(--hairline)', background: 'var(--surface-2)' }}>{children}</th>,
              td: ({ children }) => <td style={{ padding: '11px 16px', color: 'var(--ink-muted)', borderBottom: '1px solid var(--hairline)' }}>{children}</td>,
            }}
          >
            {post.body}
          </ReactMarkdown>
        </div>

        {/* CTA */}
        <div style={{ marginTop: 48, padding: '28px', border: '1px solid var(--of-primary)', borderRadius: 14, background: 'var(--of-primary-soft)', display: 'flex', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'space-between', gap: 16 }}>
          <div>
            <p style={{ fontWeight: 600, fontSize: 16, marginBottom: 4 }}>Try it on your next client project</p>
            <p style={{ fontSize: 14, color: 'var(--ink-muted)', margin: 0 }}>Free plan, no card required.</p>
          </div>
          <OctivelyButton href="/dashboard/signup" size="md">Start free</OctivelyButton>
        </div>
      </article>

      <MarketingFooter />
    </div>
  )
}
