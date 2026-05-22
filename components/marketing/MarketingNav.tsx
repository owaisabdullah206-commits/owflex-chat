'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, Moon, Sun } from 'lucide-react'

const NAV_LINKS = [
  { label: 'Product', href: '/' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'Guide', href: '/guide' },
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
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
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
          <span
            style={{
              width: 9,
              height: 9,
              borderRadius: '50%',
              background: 'var(--of-primary)',
              display: 'inline-block',
            }}
          />
          <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>Octively</span>
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

        {/* Links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
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
        </div>
      </div>
    </nav>
  )
}
