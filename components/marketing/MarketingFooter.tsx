import Link from 'next/link'
import { OctivelyMark } from '@/components/brand/OctivelyMark'

const COLS = [
  {
    title: 'Product',
    items: [
      { label: 'Features', href: '/#features' },
      { label: 'Pricing', href: '/pricing' },
      { label: 'Embed guide', href: '/guide#embed-guide' },
      { label: 'WordPress plugin', href: '#' },
    ],
  },
  {
    title: 'Developers',
    items: [
      { label: 'Guide', href: '/guide' },
      { label: 'API reference', href: '/guide#api' },
      { label: 'Status', href: '#' },
      { label: 'Changelog', href: '/changelog' },
    ],
  },
  {
    title: 'Company',
    items: [
      { label: 'About', href: '/about' },
      { label: 'Contact', href: '/contact' },
      { label: 'Privacy', href: '/privacy' },
      { label: 'Terms', href: '/terms' },
    ],
  },
  {
    title: 'Resources',
    items: [
      { label: 'Loom demo', href: '#' },
      { label: 'For agencies', href: '/for-agencies' },
      { label: 'For freelancers', href: '/for-freelancers' },
      { label: 'Roadmap', href: '/roadmap' },
      { label: 'Compare', href: '/pricing#compare' },
    ],
  },
]

const SOCIALS = [
  {
    label: 'X / Twitter',
    href: '#',
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.748l7.73-8.835L1.254 2.25H8.08l4.261 5.636zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
  {
    label: 'GitHub',
    href: '#',
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0 0 22 12.017C22 6.484 17.522 2 12 2z" />
      </svg>
    ),
  },
  {
    label: 'LinkedIn',
    href: '#',
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    ),
  },
]

export default function MarketingFooter() {
  return (
    <footer
      style={{
        background: 'var(--bg)',
        borderTop: '1px solid var(--hairline)',
        paddingBlock: 56,
        marginTop: 24,
      }}
    >
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
        {/* Grid */}
        <div
          className="mkt-footer-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: '1.4fr repeat(4, 1fr)',
            gap: 32,
            alignItems: 'start',
          }}
        >
          {/* Brand column */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
              <OctivelyMark size={24} color="var(--of-primary)" />
              <span
                style={{
                  fontWeight: 600,
                  fontSize: 16,
                  letterSpacing: '-0.02em',
                  color: 'var(--ink)',
                }}
              >
                Octively
              </span>
            </div>
            <p
              style={{
                color: 'var(--ink-muted)',
                fontSize: 13.5,
                margin: '12px 0 18px',
                maxWidth: 280,
                lineHeight: 1.6,
              }}
            >
              The client dashboard layer for custom AI chatbots. Built in Karachi · Made for agencies worldwide.
            </p>
            <div style={{ display: 'flex', gap: 8 }}>
              {SOCIALS.map(({ label, href, icon }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  style={{
                    width: 32,
                    height: 32,
                    display: 'grid',
                    placeItems: 'center',
                    borderRadius: 8,
                    border: '1px solid var(--hairline)',
                    color: 'var(--ink-muted)',
                    textDecoration: 'none',
                    transition: 'color .15s, border-color .15s',
                  }}
                  className="mkt-footer-link"
                >
                  {icon}
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {COLS.map((col) => (
            <div key={col.title}>
              <div
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 11,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: 'var(--ink)',
                  marginBottom: 14,
                  fontWeight: 600,
                }}
              >
                {col.title}
              </div>
              <ul
                style={{
                  listStyle: 'none',
                  padding: 0,
                  margin: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 9,
                }}
              >
                {col.items.map((item) => (
                  <li key={item.label}>
                    <Link
                      href={item.href}
                      style={{
                        fontSize: 13.5,
                        color: 'var(--ink-muted)',
                        textDecoration: 'none',
                        transition: 'color .15s',
                      }}
                      className="mkt-footer-link"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div
          style={{
            borderTop: '1px solid var(--hairline)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: 40,
            paddingTop: 24,
            fontSize: 12.5,
            color: 'var(--ink-muted)',
            flexWrap: 'wrap',
            gap: 12,
          }}
        >
          <div style={{ fontFamily: 'var(--font-mono)' }}>
            © {new Date().getFullYear()} Octively — v1.1.0
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  background: 'var(--of-success)',
                }}
              />
              All systems operational
            </span>
            <span style={{ color: 'var(--hairline-strong)' }}>·</span>
            <span style={{ fontFamily: 'var(--font-mono)' }}>PKR / USD</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
