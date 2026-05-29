'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { ArrowRight, BookOpen, Clock } from 'lucide-react'
import { MarketingNav } from './MarketingNav'
import MarketingFooter from './MarketingFooter'
import { useDarkMode } from './useDarkMode'
import { urlForImage } from '@/sanity/lib/image'
import type { SanityPost } from '@/sanity/lib/queries'

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
}

function PostCard({ post }: { post: SanityPost }) {
  const coverUrl = post.coverImage ? urlForImage(post.coverImage, 600) : null
  return (
    <Link
      href={`/blog/${post.slug}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        border: '1px solid var(--hairline)',
        borderRadius: 14,
        background: 'var(--surface)',
        textDecoration: 'none',
        color: 'inherit',
        overflow: 'hidden',
        transition: 'border-color 0.15s, box-shadow 0.15s',
      }}
    >
      {/* Cover image thumbnail */}
      {coverUrl && (
        <div style={{ borderBottom: '1px solid var(--hairline)', overflow: 'hidden', flexShrink: 0 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={coverUrl}
            alt={post.title}
            style={{ width: '100%', display: 'block', aspectRatio: '16 / 9', objectFit: 'cover' }}
            loading="lazy"
          />
        </div>
      )}

      <div style={{ padding: '20px 22px', display: 'flex', flexDirection: 'column', flex: 1 }}>
      {/* Tags */}
      {(post.tags && post.tags.length > 0) ? (
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
          {post.tags.slice(0, 2).map((tag) => (
            <span
              key={tag}
              style={{
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                padding: '3px 8px',
                background: 'var(--of-primary-soft)',
                color: 'var(--of-primary)',
                borderRadius: 5,
              }}
            >
              {tag}
            </span>
          ))}
        </div>
      ) : post.keyword ? (
        <div style={{ marginBottom: 12 }}>
          <span
            style={{
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              padding: '3px 8px',
              background: 'var(--of-primary-soft)',
              color: 'var(--of-primary)',
              borderRadius: 5,
            }}
          >
            {post.keyword}
          </span>
        </div>
      ) : null}

      <h2 style={{ fontSize: 18, fontWeight: 600, letterSpacing: '-0.01em', marginBottom: 8, lineHeight: 1.35, color: 'var(--ink)', flex: 1 }}>
        {post.title}
      </h2>
      <p style={{ fontSize: 14.5, color: 'var(--ink-muted)', lineHeight: 1.65, marginBottom: 16 }}>
        {post.description}
      </p>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 12, color: 'var(--ink-subtle)' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <BookOpen size={11} /> {formatDate(post.publishedAt)}
          </span>
          {post.readingMinutes && (
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <Clock size={11} /> {post.readingMinutes} min
            </span>
          )}
        </div>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 13, color: 'var(--of-primary)', fontWeight: 500 }}>
          Read <ArrowRight size={13} />
        </span>
      </div>
      </div>
    </Link>
  )
}

export default function BlogIndexView({ posts }: { posts: SanityPost[] }) {
  const { dark, toggleDark } = useDarkMode()
  const [activeTag, setActiveTag] = useState('All')

  // Collect unique tags from all posts (tags field + keyword fallback)
  const allTags = useMemo(() => {
    const tagSet = new Set<string>()
    posts.forEach((p) => {
      if (p.tags && p.tags.length > 0) {
        p.tags.forEach((t) => tagSet.add(t))
      } else if (p.keyword) {
        tagSet.add(p.keyword)
      }
    })
    return ['All', ...Array.from(tagSet)]
  }, [posts])

  const filtered = useMemo(() => {
    if (activeTag === 'All') return posts
    return posts.filter((p) => p.tags?.includes(activeTag) || p.keyword === activeTag)
  }, [posts, activeTag])

  const [featured, ...rest] = filtered

  return (
    <div className={`marketing${dark ? ' dark' : ''}`} style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--ink)' }}>
      <MarketingNav dark={dark} onToggleDark={toggleDark} />

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '56px 24px 80px' }}>
        {/* Header */}
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--of-primary)', marginBottom: 12 }}>
          Blog
        </p>
        <h1 style={{ fontSize: 'clamp(32px, 4.5vw, 44px)', fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.1, marginBottom: 14 }}>
          Guides for freelancers and agencies
        </h1>
        <p style={{ fontSize: 17, color: 'var(--ink-muted)', lineHeight: 1.6, marginBottom: 36, maxWidth: 560 }}>
          Practical writing on building AI chatbots for clients, pricing them, and running the work without the busywork.
        </p>

        {/* Tag filter pills */}
        {allTags.length > 1 && (
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 36 }}>
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setActiveTag(tag)}
                style={{
                  fontSize: 13,
                  fontWeight: 500,
                  padding: '6px 14px',
                  borderRadius: 999,
                  border: activeTag === tag ? '1px solid var(--of-primary)' : '1px solid var(--hairline)',
                  background: activeTag === tag ? 'var(--of-primary-soft)' : 'transparent',
                  color: activeTag === tag ? 'var(--of-primary)' : 'var(--ink-muted)',
                  cursor: 'pointer',
                  transition: 'all 0.12s',
                }}
              >
                {tag}
              </button>
            ))}
          </div>
        )}

        {posts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '64px 0', color: 'var(--ink-muted)' }}>
            <p style={{ fontSize: 16 }}>No articles yet — check back soon.</p>
          </div>
        ) : (
          <>
            {/* Featured post (first in filtered list) */}
            {featured && (() => {
              const featuredCoverUrl = featured.coverImage ? urlForImage(featured.coverImage, 900) : null
              return (
              <Link
                href={`/blog/${featured.slug}`}
                style={{
                  display: 'block',
                  border: '1px solid var(--hairline)',
                  borderRadius: 18,
                  background: 'var(--surface)',
                  textDecoration: 'none',
                  color: 'inherit',
                  marginBottom: 24,
                  overflow: 'hidden',
                }}
              >
                {/* Cover image */}
                {featuredCoverUrl && (
                  <div style={{ borderBottom: '1px solid var(--hairline)' }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={featuredCoverUrl}
                      alt={featured.title}
                      style={{ width: '100%', display: 'block', aspectRatio: '21 / 9', objectFit: 'cover' }}
                      loading="eager"
                    />
                  </div>
                )}
                <div style={{ padding: '28px 32px' }}>
                {/* Featured badge + tags */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', padding: '3px 9px', border: '1px solid var(--hairline)', borderRadius: 5, color: 'var(--ink-subtle)' }}>
                    Featured
                  </span>
                  {featured.tags && featured.tags.slice(0, 2).map((tag) => (
                    <span
                      key={tag}
                      style={{
                        fontSize: 10,
                        fontWeight: 700,
                        letterSpacing: '0.08em',
                        textTransform: 'uppercase',
                        padding: '3px 9px',
                        background: 'var(--of-primary-soft)',
                        color: 'var(--of-primary)',
                        borderRadius: 5,
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                  {(!featured.tags || !featured.tags.length) && featured.keyword && (
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 700,
                        letterSpacing: '0.08em',
                        textTransform: 'uppercase',
                        padding: '3px 9px',
                        background: 'var(--of-primary-soft)',
                        color: 'var(--of-primary)',
                        borderRadius: 5,
                      }}
                    >
                      {featured.keyword}
                    </span>
                  )}
                </div>

                <h2 style={{ fontSize: 'clamp(22px, 3vw, 30px)', fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.2, marginBottom: 14, color: 'var(--ink)' }}>
                  {featured.title}
                </h2>
                <p style={{ fontSize: 16, color: 'var(--ink-muted)', lineHeight: 1.7, marginBottom: 20, maxWidth: 640 }}>
                  {featured.description}
                </p>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: 13, color: 'var(--ink-subtle)' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                      <BookOpen size={12} /> {formatDate(featured.publishedAt)}
                    </span>
                    {featured.readingMinutes && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                        <Clock size={12} /> {featured.readingMinutes} min read
                      </span>
                    )}
                  </div>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 14, color: 'var(--of-primary)', fontWeight: 600 }}>
                    Read article <ArrowRight size={14} />
                  </span>
                </div>
                </div>{/* end padding div */}
              </Link>
              )
            })()}

            {/* Remaining posts grid */}
            {rest.length > 0 && (
              <div className="grid sm:grid-cols-2 gap-4">
                {rest.map((post) => (
                  <PostCard key={post.slug} post={post} />
                ))}
              </div>
            )}
          </>
        )}
      </div>

      <MarketingFooter />
    </div>
  )
}
