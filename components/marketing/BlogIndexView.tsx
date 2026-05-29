'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { MarketingNav } from './MarketingNav'
import MarketingFooter from './MarketingFooter'
import { useDarkMode } from './useDarkMode'
import type { SanityPost } from '@/sanity/lib/queries'

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
}

export default function BlogIndexView({ posts }: { posts: SanityPost[] }) {
  const { dark, toggleDark } = useDarkMode()

  return (
    <div className={`marketing${dark ? ' dark' : ''}`} style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--ink)' }}>
      <MarketingNav dark={dark} onToggleDark={toggleDark} />

      <div style={{ maxWidth: 760, margin: '0 auto', padding: '56px 24px 72px' }}>
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--of-primary)', marginBottom: 12 }}>
          Blog
        </p>
        <h1 style={{ fontSize: 'clamp(32px, 4.5vw, 44px)', fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.1, marginBottom: 14 }}>
          Guides for freelancers and agencies
        </h1>
        <p style={{ fontSize: 17, color: 'var(--ink-muted)', lineHeight: 1.6, marginBottom: 44, maxWidth: 560 }}>
          Practical writing on building AI chatbots for clients, pricing them, and running the work without the busywork.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {posts.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              style={{ display: 'block', padding: '24px', border: '1px solid var(--hairline)', borderRadius: 14, background: 'var(--surface)', textDecoration: 'none', color: 'inherit' }}
            >
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--ink-subtle)', marginBottom: 10 }}>
                {formatDate(post.publishedAt)}{post.readingMinutes ? ` · ${post.readingMinutes} min read` : ''}
              </p>
              <h2 style={{ fontSize: 20, fontWeight: 600, letterSpacing: '-0.01em', marginBottom: 8, lineHeight: 1.3 }}>{post.title}</h2>
              <p style={{ fontSize: 15, color: 'var(--ink-muted)', lineHeight: 1.6, marginBottom: 14 }}>{post.description}</p>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 14, color: 'var(--of-primary)', fontWeight: 500 }}>
                Read article <ArrowRight size={14} />
              </span>
            </Link>
          ))}
        </div>
      </div>

      <MarketingFooter />
    </div>
  )
}
