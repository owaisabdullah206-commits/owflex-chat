'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, Moon, Sun, Menu, X } from 'lucide-react'
import { OctivelyMark } from '@/components/brand/OctivelyMark'

const NAV_LINKS = [
  { label: 'Product', href: '/' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'Guide', href: '/guide' },
  { label: 'Blog', href: '/blog' },
  { label: 'Changelog', href: '/changelog' },
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
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
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
      <nav
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 50,
          height: 64,
          background: scrolled ? 'color-mix(in srgb, var(--bg) 82%, transparent)' : 'var(--bg)',
          backdropFilter: scrolled ? 'saturate(180%) blur(14px)' : 'none',
          WebkitBackdropFilter: scrolled ? 'saturate(180%) blur(14px)' : 'none',
          borderBottom: scrolled ? '1px solid var(--hairline)' : '1px solid transparent',
          transition: 'background-color .2s, border-color .2s',
        }}
      >
        <div
          style={{
            maxWidth: 1200,
            margin: '0 auto',
            padding: '0 24px',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          {/* Logo */}
          <a
            href="/"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 9,
              textDecoration: 'none',
              fontWeight: 600,
              fontSize: 16,
              letterSpacing: '-0.01em',
              color: 'var(--ink)',
            }}
          >
            <OctivelyMark size={24} color="var(--of-primary)" />
            <span style={{ fontWeight: 600, letterSpacing: '-0.02em' }}>Octively</span>
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 11,
                color: 'var(--ink-muted)',
                padding: '2px 6px',
                border: '1px solid var(--hairline)',
                borderRadius: 4,
              }}
            >
              BETA
            </span>
          </a>

          {/* Right side */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            {/* Desktop nav links — hidden on mobile */}
            <div className="mkt-nav-links" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              {NAV_LINKS.map(({ label, href }) => (
                <Link
                  key={label}
                  href={href}
                  style={{
                    padding: '8px 12px',
                    fontSize: 14,
                    color: 'var(--ink-muted)',
                    textDecoration: 'none',
                    borderRadius: 8,
                    transition: 'color .15s',
                  }}
                >
                  {label}
                </Link>
              ))}

              {slot && (
                <>
                  <div style={{ width: 1, height: 18, background: 'var(--hairline)', margin: '0 4px' }} />
                  {slot}
                </>
              )}

              <div style={{ width: 1, height: 18, background: 'var(--hairline)', margin: '0 8px' }} />
            </div>

            <button
              onClick={onToggleDark}
              aria-label="Toggle theme"
              style={{
                width: 34,
                height: 34,
                display: 'grid',
                placeItems: 'center',
                background: 'transparent',
                border: '1px solid var(--hairline-strong)',
                borderRadius: 8,
                color: 'var(--ink-subtle)',
                cursor: 'pointer',
                transition: 'color .15s, background-color .15s',
              }}
            >
              {dark ? <Sun size={15} /> : <Moon size={15} />}
            </button>

            <Link
              href="/dashboard/login"
              className="mkt-nav-sign-in"
              style={{
                height: 36,
                padding: '0 12px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                fontSize: 14,
                color: 'var(--ink-muted)',
                border: '1px solid var(--hairline)',
                borderRadius: 8,
                textDecoration: 'none',
                transition: 'color .15s, border-color .15s',
              }}
            >
              Sign in
            </Link>

            <Link
              href="/dashboard/signup"
              className="mkt-nav-start-free"
              style={{
                height: 36,
                padding: '0 14px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                fontSize: 14,
                fontWeight: 500,
                color: 'white',
                background: 'var(--of-primary)',
                borderRadius: 8,
                textDecoration: 'none',
                transition: 'background-color .15s',
                border: '1px solid transparent',
              }}
            >
              Start free <ArrowRight size={13} />
            </Link>

            {/* Hamburger — shown only on mobile */}
            <button
              className="mkt-hamburger"
              onClick={() => setMenuOpen(true)}
              aria-label="Open menu"
              style={{
                width: 36,
                height: 36,
                display: 'none',
                placeItems: 'center',
                background: 'transparent',
                border: '1px solid var(--hairline-strong)',
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

      {/* Mobile drawer */}
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
            {/* Drawer header */}
            <div
              style={{
                padding: '0 20px',
                height: 64,
                borderBottom: '1px solid var(--hairline)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexShrink: 0,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <OctivelyMark size={22} color="var(--of-primary)" />
                <span style={{ fontWeight: 600, fontSize: 15, letterSpacing: '-0.02em', color: 'var(--ink)' }}>Octively</span>
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

            {/* Nav links */}
            <nav style={{ flex: 1, padding: '12px 12px' }}>
              {NAV_LINKS.map(({ label, href }) => (
                <Link
                  key={label}
                  href={href}
                  onClick={() => setMenuOpen(false)}
                  style={{
                    display: 'block', padding: '12px 12px',
                    fontSize: 16, fontWeight: 500, color: 'var(--ink)',
                    textDecoration: 'none', borderRadius: 8,
                    transition: 'background-color .15s',
                  }}
                >
                  {label}
                </Link>
              ))}
            </nav>

            {/* CTAs */}
            <div
              style={{
                padding: '20px',
                borderTop: '1px solid var(--hairline)',
                display: 'flex',
                flexDirection: 'column',
                gap: 10,
                flexShrink: 0,
              }}
            >
              <Link
                href="/dashboard/login"
                onClick={() => setMenuOpen(false)}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  height: 42, borderRadius: 8,
                  border: '1px solid var(--hairline)', background: 'transparent',
                  fontSize: 15, fontWeight: 500, color: 'var(--ink)', textDecoration: 'none',
                }}
              >
                Sign in
              </Link>
              <Link
                href="/dashboard/signup"
                onClick={() => setMenuOpen(false)}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                  height: 42, borderRadius: 8,
                  background: 'var(--of-primary)', border: '1px solid transparent',
                  fontSize: 15, fontWeight: 500, color: 'white', textDecoration: 'none',
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
