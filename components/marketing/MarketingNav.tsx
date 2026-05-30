'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, Moon, Sun, Menu, X } from 'lucide-react'
import { OctivelyMark } from '@/components/brand/OctivelyMark'

const NAV_LINKS = [
  { label: 'Product',   href: '/'          },
  { label: 'Pricing',   href: '/pricing'    },
  { label: 'Guide',     href: '/guide'      },
  { label: 'Blog',      href: '/blog'       },
  { label: 'Changelog', href: '/changelog'  },
]

export function MarketingNav({
  dark,
  onToggleDark,
  slot,
}: {
  dark: boolean
  onToggleDark: () => void
  slot?: React.ReactNode
}) {
  const [scrolled,  setScrolled]  = useState(false)
  const [menuOpen,  setMenuOpen]  = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [menuOpen])

  return (
    <>
      {/* ── Nav ────────────────────────────────────────────────────────────────
          Non-scrolled: full-width flush bar (height 60)
          Scrolled:     transparent wrapper + floating pill (height 76 with 8px
                        padding top/bottom so pill height = 60)
      ──────────────────────────────────────────────────────────────────────── */}
      <nav
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 50,
          height: scrolled ? 76 : 60,
          padding: scrolled ? '8px 20px' : '0',
          // Non-scrolled bg on the nav itself; pill handles its own bg
          background: scrolled ? 'transparent' : 'var(--bg)',
          transition: 'height .3s ease, padding .3s ease, background .25s ease',
        }}
      >
        <div
          style={{
            // Pill container
            maxWidth: scrolled ? 880 : 1200,
            margin: '0 auto',
            padding: '0 20px',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',

            // Pill appearance on scroll
            background: scrolled
              ? 'color-mix(in srgb, var(--bg) 90%, transparent)'
              : 'transparent',
            backdropFilter:       scrolled ? 'saturate(180%) blur(18px)' : 'none',
            WebkitBackdropFilter: scrolled ? 'saturate(180%) blur(18px)' : 'none',
            borderRadius: scrolled ? 999 : 0,
            // Always 1px border — only color transitions (transparent ↔ hairline)
            // so CSS never adds/removes border existence (prevents flash)
            border: scrolled ? '1px solid var(--hairline)' : '1px solid transparent',
            boxShadow: scrolled
              ? '0 4px 24px rgba(0,0,0,0.09), 0 1px 4px rgba(0,0,0,0.05)'
              : 'none',

            transition: 'max-width .3s ease, background .25s ease, border-radius .3s ease, border-color .3s ease, box-shadow .3s ease',
          }}
        >
          {/* ── Logo ────────────────────────────────────────────────────── */}
          <a
            href="/"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 9,
              textDecoration: 'none',
              color: 'var(--ink)',
              flexShrink: 0,
            }}
          >
            <OctivelyMark size={24} color="var(--of-primary)" />
            <span style={{
              fontWeight: 700,
              fontSize: 17,
              letterSpacing: '-0.03em',
              color: 'var(--ink)',
            }}>
              Octively
            </span>
            <span style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 10,
              fontWeight: 600,
              letterSpacing: '0.06em',
              color: 'var(--of-primary)',
              padding: '2px 6px',
              border: '1px solid rgba(14,165,233,0.35)',
              borderRadius: 4,
              background: 'var(--of-primary-soft)',
            }}>
              BETA
            </span>
          </a>

          {/* ── Right side ────────────────────────────────────────────── */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>

            {/* Desktop nav links */}
            <div className="mkt-nav-links" style={{ display: 'flex', alignItems: 'center', gap: 0, marginRight: 8 }}>
              {NAV_LINKS.map(({ label, href }) => (
                <Link
                  key={label}
                  href={href}
                  style={{
                    padding: '7px 13px',
                    fontSize: 14,
                    fontWeight: 450,
                    color: 'var(--ink-muted)',
                    textDecoration: 'none',
                    borderRadius: 8,
                    transition: 'color .15s',
                    letterSpacing: '-0.01em',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.color = 'var(--ink)')}
                  onMouseLeave={e => (e.currentTarget.style.color = 'var(--ink-muted)')}
                >
                  {label}
                </Link>
              ))}

              {slot && (
                <>
                  <div style={{ width: 1, height: 16, background: 'var(--hairline)', margin: '0 6px' }} />
                  {slot}
                </>
              )}
            </div>

            {/* Divider */}
            <div className="mkt-nav-links" style={{ width: 1, height: 18, background: 'var(--hairline)', margin: '0 6px' }} />

            {/* Theme toggle */}
            <button
              onClick={onToggleDark}
              aria-label="Toggle theme"
              style={{
                width: 34, height: 34,
                display: 'grid', placeItems: 'center',
                background: 'transparent',
                border: 'none',
                borderRadius: 8,
                color: 'var(--ink-subtle)',
                cursor: 'pointer',
                transition: 'color .15s, background-color .15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'var(--surface-2)'; e.currentTarget.style.color = 'var(--ink)' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--ink-subtle)' }}
            >
              {dark ? <Sun size={15} /> : <Moon size={15} />}
            </button>

            {/* Sign in */}
            <Link
              href="/dashboard/login"
              className="mkt-nav-sign-in"
              style={{
                height: 34, padding: '0 14px',
                display: 'inline-flex', alignItems: 'center',
                fontSize: 14, fontWeight: 500,
                color: 'var(--ink)',
                textDecoration: 'none',
                borderRadius: 8,
                transition: 'background-color .15s',
                letterSpacing: '-0.01em',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface-2)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >
              Sign in
            </Link>

            {/* Start free CTA */}
            <Link
              href="/dashboard/signup"
              className="mkt-nav-start-free"
              style={{
                height: 36, padding: '0 16px',
                display: 'inline-flex', alignItems: 'center', gap: 6,
                fontSize: 14, fontWeight: 600,
                color: 'white',
                background: 'var(--of-primary)',
                borderRadius: 999,
                textDecoration: 'none',
                letterSpacing: '-0.01em',
                border: '1px solid transparent',
                boxShadow: '0 1px 4px rgba(14,165,233,0.35), inset 0 1px 0 rgba(255,255,255,0.15)',
                transition: 'background-color .15s, box-shadow .15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'var(--of-primary-hover)'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(14,165,233,0.45), inset 0 1px 0 rgba(255,255,255,0.15)' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'var(--of-primary)'; e.currentTarget.style.boxShadow = '0 1px 4px rgba(14,165,233,0.35), inset 0 1px 0 rgba(255,255,255,0.15)' }}
            >
              Start free <ArrowRight size={14} />
            </Link>

            {/* Hamburger — mobile only */}
            <button
              className="mkt-hamburger"
              onClick={() => setMenuOpen(true)}
              aria-label="Open menu"
              style={{
                width: 36, height: 36,
                display: 'none', placeItems: 'center',
                background: 'transparent',
                border: '1px solid var(--hairline)',
                borderRadius: 8,
                color: 'var(--ink)',
                cursor: 'pointer',
              }}
            >
              <Menu size={18} />
            </button>
          </div>
        </div>
      </nav>

      {/* ── Mobile drawer ──────────────────────────────────────────────────── */}
      {menuOpen && (
        <>
          <div
            style={{
              position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)',
              zIndex: 98, backdropFilter: 'blur(2px)', WebkitBackdropFilter: 'blur(2px)',
            }}
            onClick={() => setMenuOpen(false)}
          />
          <div
            style={{
              position: 'fixed', top: 0, right: 0, bottom: 0, width: 280,
              background: 'var(--bg)', zIndex: 99,
              display: 'flex', flexDirection: 'column',
              boxShadow: '-8px 0 32px rgba(0,0,0,0.12)',
              overflowY: 'auto',
            }}
          >
            <div style={{
              padding: '0 20px', height: 60,
              borderBottom: '1px solid var(--hairline)',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              flexShrink: 0,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <OctivelyMark size={22} color="var(--of-primary)" />
                <span style={{ fontWeight: 700, fontSize: 16, letterSpacing: '-0.03em', color: 'var(--ink)' }}>Octively</span>
              </div>
              <button
                onClick={() => setMenuOpen(false)}
                aria-label="Close menu"
                style={{
                  width: 32, height: 32, display: 'grid', placeItems: 'center',
                  background: 'transparent', border: '1px solid var(--hairline)',
                  borderRadius: 8, color: 'var(--ink-muted)', cursor: 'pointer',
                }}
              >
                <X size={16} />
              </button>
            </div>

            <nav style={{ flex: 1, padding: '12px 12px' }}>
              {NAV_LINKS.map(({ label, href }) => (
                <Link
                  key={label}
                  href={href}
                  onClick={() => setMenuOpen(false)}
                  style={{
                    display: 'block', padding: '12px 12px',
                    fontSize: 16, fontWeight: 500,
                    color: 'var(--ink)', letterSpacing: '-0.01em',
                    textDecoration: 'none', borderRadius: 8,
                    transition: 'background-color .15s',
                  }}
                >
                  {label}
                </Link>
              ))}
            </nav>

            <div style={{
              padding: '20px', borderTop: '1px solid var(--hairline)',
              display: 'flex', flexDirection: 'column', gap: 10, flexShrink: 0,
            }}>
              <Link
                href="/dashboard/login"
                onClick={() => setMenuOpen(false)}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  height: 42, borderRadius: 8,
                  border: '1px solid var(--hairline)', background: 'transparent',
                  fontSize: 15, fontWeight: 500, color: 'var(--ink)',
                  textDecoration: 'none', letterSpacing: '-0.01em',
                }}
              >
                Sign in
              </Link>
              <Link
                href="/dashboard/signup"
                onClick={() => setMenuOpen(false)}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                  height: 42, borderRadius: 999,
                  background: 'var(--of-primary)', border: '1px solid transparent',
                  fontSize: 15, fontWeight: 600, color: 'white',
                  textDecoration: 'none', letterSpacing: '-0.01em',
                  boxShadow: '0 1px 4px rgba(14,165,233,0.35)',
                }}
              >
                Start free <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </>
      )}
    </>
  )
}
