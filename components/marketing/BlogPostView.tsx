'use client'

import { useState, useEffect, useCallback, useMemo, createContext, useContext } from 'react'
import type { PropsWithChildren } from 'react'
import Link from 'next/link'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { ArrowLeft, ArrowRight, Link2, ChevronDown, ChevronUp, BookOpen, Clock, ExternalLink, Sparkles } from 'lucide-react'

// ─── List rendering helpers ───────────────────────────────────────────────────
// Must be module-level so useContext works inside them.

const ListTypeCtx = createContext<'ul' | 'ol'>('ul')

function MdUl({ children }: PropsWithChildren) {
  return (
    <ListTypeCtx.Provider value="ul">
      <ul style={{ listStyle: 'none', margin: '8px 0 24px', padding: 0 }}>
        {children}
      </ul>
    </ListTypeCtx.Provider>
  )
}

function MdOl({ children }: PropsWithChildren) {
  return (
    <ListTypeCtx.Provider value="ol">
      <ol style={{ listStyleType: 'decimal', margin: '8px 0 24px', paddingLeft: 28 }}>
        {children}
      </ol>
    </ListTypeCtx.Provider>
  )
}

function MdLi({ children }: PropsWithChildren) {
  const type = useContext(ListTypeCtx)

  if (type === 'ol') {
    return (
      <li style={{ color: 'var(--of-primary)', marginBottom: 12, paddingLeft: 4, lineHeight: 1.8 }}>
        <span style={{ fontSize: 18, color: 'var(--ink)', lineHeight: 1.85 }}>
          {children}
        </span>
      </li>
    )
  }

  // ul → custom sky-teal dot, text in --ink (prose serif via parent div)
  return (
    <li style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 12, paddingLeft: 0 }}>
      <span
        aria-hidden
        style={{
          width: 7,
          height: 7,
          borderRadius: '50%',
          background: 'var(--of-primary)',
          flexShrink: 0,
          marginTop: '0.65em',
        }}
      />
      <span style={{ fontSize: 18, color: 'var(--ink)', lineHeight: 1.85, flex: 1 }}>
        {children}
      </span>
    </li>
  )
}

function XIcon({ size = 13 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.713 6.231 5.45-6.231Zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77Z" />
    </svg>
  )
}

function LinkedInIcon({ size = 13 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  )
}
import { MarketingNav } from './MarketingNav'
import MarketingFooter from './MarketingFooter'
import { useDarkMode } from './useDarkMode'
import { OctivelyButton } from '@/components/brand/OctivelyButton'
import { urlForImage } from '@/sanity/lib/image'
import type { SanityPost } from '@/sanity/lib/queries'

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
}

function slugify(text: string): string {
  return String(text)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

function extractHeadings(markdown: string): { id: string; text: string; level: 2 | 3 }[] {
  return markdown
    .split('\n')
    .filter((line) => /^#{2,3}\s/.test(line))
    .map((line) => {
      const level = line.startsWith('### ') ? 3 : 2
      const text = line.replace(/^#{2,3}\s+/, '').trim()
      return { id: slugify(text), text, level }
    })
}

function FaqAccordion({ faqs }: { faqs: Array<{ question: string; answer: string }> }) {
  const [openIdx, setOpenIdx] = useState<number | null>(null)

  return (
    <section style={{ marginTop: 52 }}>
      <h2 style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-0.01em', marginBottom: 20, lineHeight: 1.25, color: 'var(--ink)' }}>
        Frequently Asked Questions
      </h2>
      <div style={{ border: '1px solid var(--hairline)', borderRadius: 14, overflow: 'hidden' }}>
        {faqs.map((faq, i) => (
          <div key={i} style={{ borderBottom: i < faqs.length - 1 ? '1px solid var(--hairline)' : undefined }}>
            <button
              onClick={() => setOpenIdx(openIdx === i ? null : i)}
              style={{
                width: '100%',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                padding: '18px 22px',
                background: openIdx === i ? 'var(--surface-2)' : 'transparent',
                border: 'none',
                cursor: 'pointer',
                textAlign: 'left',
                gap: 12,
                transition: 'background 0.12s',
              }}
            >
              <span style={{ fontSize: 15.5, fontWeight: 600, color: 'var(--ink)', lineHeight: 1.45 }}>
                {faq.question}
              </span>
              {openIdx === i
                ? <ChevronUp size={16} style={{ flexShrink: 0, marginTop: 2, color: 'var(--of-primary)' }} />
                : <ChevronDown size={16} style={{ flexShrink: 0, marginTop: 2, color: 'var(--ink-subtle)' }} />
              }
            </button>
            {openIdx === i && (
              <div style={{ padding: '0 22px 20px', fontSize: 15, color: 'var(--ink-muted)', lineHeight: 1.75 }}>
                {faq.answer}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}

export default function BlogPostView({
  post,
  relatedPosts = [],
}: {
  post: SanityPost
  relatedPosts?: SanityPost[]
}) {
  const { dark, toggleDark } = useDarkMode()
  const [progress, setProgress] = useState(0)
  const [activeId, setActiveId] = useState('')
  const [copied, setCopied] = useState(false)

  const headings = useMemo(() => extractHeadings(post.body), [post.body])
  const hasSidebar = headings.length > 1

  // Reading progress bar tracks article element scroll
  useEffect(() => {
    const handleScroll = () => {
      const el = document.getElementById('article-body')
      if (!el) return
      const { top, height } = el.getBoundingClientRect()
      const scrollable = height - window.innerHeight
      if (scrollable <= 0) { setProgress(100); return }
      setProgress(Math.min(100, Math.max(0, (-top / scrollable) * 100)))
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // TOC active section via IntersectionObserver
  useEffect(() => {
    if (!headings.length) return
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting)
        if (visible.length > 0) setActiveId(visible[0].target.id)
      },
      { rootMargin: '-10% 0px -75% 0px' },
    )
    headings.forEach(({ id }) => {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    })
    return () => observer.disconnect()
  }, [headings])

  const handleCopy = useCallback(() => {
    if (typeof window === 'undefined') return
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }, [])

  const postUrl = `https://octively.com/blog/${post.slug}`
  const shareTwitter = `https://twitter.com/intent/tweet?url=${encodeURIComponent(postUrl)}&text=${encodeURIComponent(post.title)}`
  const shareLinkedIn = `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(postUrl)}&title=${encodeURIComponent(post.title)}`

  return (
    <div className={`marketing${dark ? ' dark' : ''}`} style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--ink)' }}>
      {/* Sticky reading progress */}
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, height: 3, zIndex: 200, background: 'var(--hairline)' }}>
        <div
          style={{
            height: '100%',
            width: `${progress}%`,
            background: 'var(--of-primary)',
            transition: 'width 0.08s linear',
          }}
        />
      </div>

      <MarketingNav dark={dark} onToggleDark={toggleDark} />

      <div style={{ maxWidth: 1140, margin: '0 auto', padding: '48px 24px 80px' }}>
        {/* Breadcrumb */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 32, fontSize: 13, color: 'var(--ink-muted)' }}>
          <Link href="/blog" style={{ display: 'inline-flex', alignItems: 'center', gap: 5, color: 'var(--ink-muted)', textDecoration: 'none' }}>
            <ArrowLeft size={13} /> All articles
          </Link>
          <span style={{ color: 'var(--hairline-strong)' }}>/</span>
          <span style={{ color: 'var(--ink-subtle)', maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {post.title}
          </span>
        </nav>

        {/* Post header */}
        <header style={{ maxWidth: hasSidebar ? 760 : 720, marginBottom: 44 }}>
          {/* Tags */}
          {post.tags && post.tags.length > 0 ? (
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    padding: '4px 10px',
                    background: 'var(--of-primary-soft)',
                    color: 'var(--of-primary)',
                    borderRadius: 6,
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
          ) : post.keyword ? (
            <div style={{ marginBottom: 16 }}>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  padding: '4px 10px',
                  background: 'var(--of-primary-soft)',
                  color: 'var(--of-primary)',
                  borderRadius: 6,
                }}
              >
                {post.keyword}
              </span>
            </div>
          ) : null}

          <h1 style={{ fontSize: 'clamp(30px, 4vw, 44px)', fontWeight: 700, letterSpacing: '-0.025em', lineHeight: 1.1, marginBottom: 18, color: 'var(--ink)' }}>
            {post.title}
          </h1>
          <p style={{ fontSize: 18, color: 'var(--ink-muted)', lineHeight: 1.65, marginBottom: 24 }}>
            {post.description}
          </p>

          {/* Meta: date + reading time */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 18, fontSize: 13, color: 'var(--ink-subtle)', paddingBottom: 24, borderBottom: '1px solid var(--hairline)' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <BookOpen size={13} /> {formatDate(post.publishedAt)}
            </span>
            {post.readingMinutes && (
              <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <Clock size={13} /> {post.readingMinutes} min read
              </span>
            )}
          </div>
        </header>

        {/* Cover image — full width, shown above the two-column body */}
        {post.coverImage && urlForImage(post.coverImage, 1400) && (
          <div style={{ maxWidth: hasSidebar ? 760 : 720, marginBottom: 44, borderRadius: 16, overflow: 'hidden', border: '1px solid var(--hairline)' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={urlForImage(post.coverImage, 1400)!}
              alt={post.title}
              style={{ width: '100%', display: 'block', aspectRatio: '16 / 9', objectFit: 'cover' }}
              loading="eager"
            />
          </div>
        )}

        {/* Two-column layout: article + sticky sidebar */}
        <div className={hasSidebar ? 'grid lg:grid-cols-[1fr_260px] lg:gap-x-14' : undefined} style={{ alignItems: 'start' }}>

          {/* Article body */}
          <div id="article-body">
            {/* Source Serif 4 for prose; headings override back to --font-sans */}
            <div style={{ fontFamily: 'var(--font-prose)' }}>
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  // ── Headings ────────────────────────────────────────────
                  h2: ({ children }) => {
                    const id = slugify(String(children))
                    return (
                      <h2
                        id={id}
                        style={{
                          fontFamily: 'var(--font-sans)',
                          fontSize: 24,
                          fontWeight: 700,
                          letterSpacing: '-0.02em',
                          marginTop: 52,
                          marginBottom: 16,
                          lineHeight: 1.25,
                          color: 'var(--ink)',
                          borderLeft: '3px solid var(--of-primary)',
                          paddingLeft: 14,
                        }}
                      >
                        {children}
                      </h2>
                    )
                  },
                  h3: ({ children }) => {
                    const id = slugify(String(children))
                    return (
                      <h3
                        id={id}
                        style={{
                          fontFamily: 'var(--font-sans)',
                          fontSize: 19,
                          fontWeight: 700,
                          letterSpacing: '-0.01em',
                          marginTop: 36,
                          marginBottom: 10,
                          lineHeight: 1.3,
                          color: 'var(--ink)',
                        }}
                      >
                        {children}
                      </h3>
                    )
                  },
                  h4: ({ children }) => (
                    <h4 style={{ fontFamily: 'var(--font-sans)', fontSize: 17, fontWeight: 600, marginTop: 28, marginBottom: 8, color: 'var(--ink)' }}>
                      {children}
                    </h4>
                  ),

                  // ── Body text ───────────────────────────────────────────
                  p: ({ children }) => (
                    <p style={{ fontSize: 18, color: 'var(--ink)', lineHeight: 1.9, marginBottom: 24 }}>
                      {children}
                    </p>
                  ),
                  strong: ({ children }) => (
                    <strong style={{ color: 'var(--ink)', fontWeight: 700 }}>{children}</strong>
                  ),
                  em: ({ children }) => (
                    <em style={{ fontStyle: 'italic', color: 'var(--ink)' }}>{children}</em>
                  ),
                  del: ({ children }) => (
                    <del style={{ textDecoration: 'line-through', color: 'var(--ink-subtle)', opacity: 0.75 }}>{children}</del>
                  ),
                  a: ({ href, children }) => {
                    const url = href ?? '#'
                    const isExternal = /^https?:\/\//.test(url) && !url.includes('octively.com')
                    if (isExternal) {
                      return (
                        <a
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ color: 'var(--of-primary)', textDecoration: 'underline', textUnderlineOffset: 3, textDecorationThickness: 1, display: 'inline-flex', alignItems: 'center', gap: 3 }}
                        >
                          {children}
                          <ExternalLink size={11} style={{ flexShrink: 0, opacity: 0.7, display: 'inline' }} aria-label="opens in new tab" />
                        </a>
                      )
                    }
                    return (
                      <Link
                        href={url}
                        style={{ color: 'var(--of-primary)', textDecoration: 'underline', textUnderlineOffset: 3, textDecorationThickness: 1 }}
                      >
                        {children}
                      </Link>
                    )
                  },

                  // ── Lists (MdUl/MdOl/MdLi defined at module level) ─────
                  ul: MdUl,
                  ol: MdOl,
                  li: MdLi,

                  // ── Blockquote ──────────────────────────────────────────
                  blockquote: ({ children }) => (
                    <blockquote
                      style={{
                        borderLeft: '3px solid var(--of-primary)',
                        paddingLeft: 20,
                        paddingTop: 12,
                        paddingBottom: 12,
                        paddingRight: 16,
                        margin: '28px 0',
                        background: 'var(--of-primary-soft)',
                        borderRadius: '0 12px 12px 0',
                        fontSize: 17,
                        fontStyle: 'italic',
                        lineHeight: 1.75,
                        color: 'var(--ink)',
                      }}
                    >
                      {children}
                    </blockquote>
                  ),

                  // ── Code ────────────────────────────────────────────────
                  // Inline code has no className; fenced blocks have "language-*"
                  code: ({ className, children }) => {
                    if (className?.startsWith('language-') || String(children).includes('\n')) {
                      // Fenced code block (rendered inside <pre>)
                      return (
                        <code className={className} style={{ fontFamily: 'var(--font-mono)', fontSize: 13.5, lineHeight: 1.7 }}>
                          {children}
                        </code>
                      )
                    }
                    // Inline code
                    return (
                      <code
                        style={{
                          fontSize: '0.875em',
                          fontFamily: 'var(--font-mono)',
                          background: 'var(--surface-2)',
                          padding: '2px 7px',
                          borderRadius: 5,
                          color: 'var(--of-primary)',
                          border: '1px solid var(--hairline)',
                          fontWeight: 500,
                          letterSpacing: '-0.01em',
                        }}
                      >
                        {children}
                      </code>
                    )
                  },
                  pre: ({ children }) => (
                    <pre
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: 13.5,
                        background: 'var(--surface-2)',
                        padding: '18px 22px',
                        borderRadius: 12,
                        margin: '4px 0 28px',
                        overflowX: 'auto',
                        border: '1px solid var(--hairline)',
                        lineHeight: 1.7,
                      }}
                    >
                      {children}
                    </pre>
                  ),

                  // ── Image ───────────────────────────────────────────────
                  img: ({ src, alt }) => (
                    <span style={{ display: 'block', margin: '28px 0' }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={src ?? ''}
                        alt={alt ?? ''}
                        style={{ maxWidth: '100%', height: 'auto', borderRadius: 12, border: '1px solid var(--hairline)', display: 'block' }}
                        loading="lazy"
                      />
                      {alt && (
                        <span style={{ display: 'block', fontSize: 13, color: 'var(--ink-subtle)', textAlign: 'center', marginTop: 8, fontStyle: 'italic' }}>
                          {alt}
                        </span>
                      )}
                    </span>
                  ),

                  // ── Table ───────────────────────────────────────────────
                  table: ({ children }) => (
                    <div style={{ overflowX: 'auto', border: '1px solid var(--hairline)', borderRadius: 12, margin: '4px 0 28px' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14.5, minWidth: 380 }}>
                        {children}
                      </table>
                    </div>
                  ),
                  thead: ({ children }) => (
                    <thead style={{ background: 'var(--surface-2)' }}>{children}</thead>
                  ),
                  tbody: ({ children }) => <tbody>{children}</tbody>,
                  tr: ({ children }) => (
                    <tr style={{ borderBottom: '1px solid var(--hairline)' }}>{children}</tr>
                  ),
                  th: ({ children }) => (
                    <th style={{ textAlign: 'left', padding: '11px 16px', fontWeight: 600, fontSize: 13, color: 'var(--ink)', letterSpacing: '0.01em', whiteSpace: 'nowrap' }}>
                      {children}
                    </th>
                  ),
                  td: ({ children }) => (
                    <td style={{ padding: '12px 16px', color: 'var(--ink)', verticalAlign: 'top', lineHeight: 1.6, fontSize: 14.5 }}>
                      {children}
                    </td>
                  ),

                  // ── Misc ────────────────────────────────────────────────
                  hr: () => (
                    <hr style={{ border: 'none', borderTop: '1px solid var(--hairline)', margin: '44px 0' }} />
                  ),
                }}
              >
                {post.body}
              </ReactMarkdown>
            </div>

            {/* FAQ accordion */}
            {post.faq && post.faq.length > 0 && <FaqAccordion faqs={post.faq} />}

            {/* End CTA */}
            <div
              style={{
                marginTop: 56,
                padding: '28px 32px',
                border: '1px solid var(--of-primary)',
                borderRadius: 16,
                background: 'var(--of-primary-soft)',
                display: 'flex',
                alignItems: 'center',
                flexWrap: 'wrap',
                justifyContent: 'space-between',
                gap: 16,
              }}
            >
              <div>
                <p style={{ fontWeight: 700, fontSize: 17, marginBottom: 5, color: 'var(--ink)' }}>
                  Try it on your next client project
                </p>
                <p style={{ fontSize: 14, color: 'var(--ink-muted)', margin: 0 }}>
                  Free plan, no credit card required.
                </p>
              </div>
              <OctivelyButton href="/dashboard/signup" size="md">Start free</OctivelyButton>
            </div>
          </div>

          {/* Sticky sidebar — CTA + TOC + share (desktop only) */}
          {hasSidebar && (
            <aside className="hidden lg:block" style={{ position: 'sticky', top: 96 }}>
              {/* Conversion CTA — sticky at the top of the sidebar, above the table of contents */}
              <div
                style={{
                  background: 'var(--of-primary-soft)',
                  border: '1px solid color-mix(in srgb, var(--of-primary) 22%, transparent)',
                  borderRadius: 14,
                  padding: '16px 16px 15px',
                  marginBottom: 28,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 10 }}>
                  <span
                    style={{
                      display: 'inline-flex',
                      width: 24,
                      height: 24,
                      borderRadius: 7,
                      background: 'var(--of-primary)',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <Sparkles size={13} color="#fff" />
                  </span>
                  <span style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: 'var(--of-primary)' }}>
                    Free to try
                  </span>
                </div>
                <p style={{ fontSize: 15, fontWeight: 700, lineHeight: 1.3, color: 'var(--ink)', margin: '0 0 6px' }}>
                  Build your own AI chatbot
                </p>
                <p style={{ fontSize: 12.5, lineHeight: 1.5, color: 'var(--ink-muted)', margin: '0 0 14px' }}>
                  Free plan, no credit card, live on your site in minutes.
                </p>
                <a
                  href="/dashboard/signup"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                    background: 'var(--of-primary)',
                    color: '#fff',
                    fontSize: 13,
                    fontWeight: 600,
                    padding: '9px 14px',
                    borderRadius: 9,
                    textDecoration: 'none',
                  }}
                >
                  Start free <ArrowRight size={14} />
                </a>
              </div>

              {/* Table of contents */}
              <div style={{ marginBottom: 28 }}>
                <p
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    color: 'var(--ink-subtle)',
                    marginBottom: 14,
                  }}
                >
                  In this article
                </p>
                <nav>
                  {headings.map(({ id, text, level }) => (
                    <a
                      key={id}
                      href={`#${id}`}
                      style={{
                        display: 'block',
                        fontSize: 13,
                        lineHeight: 1.5,
                        padding: '5px 0',
                        paddingLeft: level === 3 ? 14 : 0,
                        borderLeft: level === 3 ? '1px solid var(--hairline)' : 'none',
                        color: activeId === id ? 'var(--of-primary)' : 'var(--ink-subtle)',
                        fontWeight: activeId === id ? 500 : 400,
                        textDecoration: 'none',
                        transition: 'color 0.12s',
                      }}
                    >
                      {text}
                    </a>
                  ))}
                </nav>
              </div>

              <div style={{ height: 1, background: 'var(--hairline)', marginBottom: 24 }} />

              {/* Share */}
              <div>
                <p
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    color: 'var(--ink-subtle)',
                    marginBottom: 14,
                  }}
                >
                  Share
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <button
                    onClick={handleCopy}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      fontSize: 13,
                      color: copied ? 'var(--of-primary)' : 'var(--ink-muted)',
                      background: 'none',
                      border: '1px solid var(--hairline)',
                      borderRadius: 8,
                      padding: '8px 12px',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'color 0.15s, border-color 0.15s',
                    }}
                  >
                    <Link2 size={13} />
                    {copied ? 'Copied!' : 'Copy link'}
                  </button>
                  <a
                    href={shareTwitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      fontSize: 13,
                      color: 'var(--ink-muted)',
                      border: '1px solid var(--hairline)',
                      borderRadius: 8,
                      padding: '8px 12px',
                      textDecoration: 'none',
                    }}
                  >
                    <XIcon size={13} />
                    Share on X
                  </a>
                  <a
                    href={shareLinkedIn}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      fontSize: 13,
                      color: 'var(--ink-muted)',
                      border: '1px solid var(--hairline)',
                      borderRadius: 8,
                      padding: '8px 12px',
                      textDecoration: 'none',
                    }}
                  >
                    <LinkedInIcon size={13} />
                    Share on LinkedIn
                  </a>
                </div>
              </div>
            </aside>
          )}
        </div>

        {/* Related posts */}
        {relatedPosts.length > 0 && (
          <section style={{ marginTop: 64, paddingTop: 48, borderTop: '1px solid var(--hairline)' }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-0.01em', marginBottom: 20, color: 'var(--ink)' }}>
              More articles
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {relatedPosts.map((rp) => (
                <Link
                  key={rp.slug}
                  href={`/blog/${rp.slug}`}
                  style={{
                    display: 'block',
                    padding: '20px 22px',
                    border: '1px solid var(--hairline)',
                    borderRadius: 12,
                    background: 'var(--surface)',
                    textDecoration: 'none',
                    color: 'inherit',
                  }}
                >
                  <p style={{ fontSize: 11, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--ink-subtle)', marginBottom: 8 }}>
                    {formatDate(rp.publishedAt)}
                  </p>
                  <h3 style={{ fontSize: 16, fontWeight: 600, letterSpacing: '-0.01em', marginBottom: 8, lineHeight: 1.35, color: 'var(--ink)' }}>
                    {rp.title}
                  </h3>
                  <p style={{ fontSize: 14, color: 'var(--ink-muted)', lineHeight: 1.65, margin: 0 }}>
                    {rp.description}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>

      <MarketingFooter />
    </div>
  )
}
