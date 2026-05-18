import Link from 'next/link'

const COLS = [
  {
    title: 'Product',
    items: [
      { label: 'Features', href: '/#features' },
      { label: 'Pricing', href: '/pricing' },
      { label: 'Embed guide', href: '#' },
      { label: 'WordPress plugin', href: '#' },
    ],
  },
  {
    title: 'Developers',
    items: [
      { label: 'Docs', href: '#' },
      { label: 'API reference', href: '#' },
      { label: 'Status', href: '#' },
      { label: 'Changelog', href: '#' },
    ],
  },
  {
    title: 'Company',
    items: [
      { label: 'About', href: '#' },
      { label: 'Contact', href: '#' },
      { label: 'Privacy', href: '#' },
      { label: 'Terms', href: '#' },
    ],
  },
  {
    title: 'Resources',
    items: [
      { label: 'Loom demo', href: '#' },
      { label: 'For agencies', href: '#' },
      { label: 'For freelancers', href: '#' },
      { label: 'Compare', href: '#' },
    ],
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
              <span
                style={{
                  width: 9,
                  height: 9,
                  borderRadius: '50%',
                  background: 'var(--of-primary)',
                  display: 'inline-block',
                }}
              />
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 600,
                  fontSize: 16,
                  color: 'var(--ink)',
                }}
              >
                owflex
              </span>
            </div>
            <p
              style={{
                color: 'var(--ink-subtle)',
                fontSize: 13.5,
                margin: '12px 0 18px',
                maxWidth: 280,
                lineHeight: 1.55,
              }}
            >
              The client dashboard layer for custom AI chatbots. Built in Karachi · Made for agencies worldwide.
            </p>
            <div style={{ display: 'flex', gap: 8 }}>
              {['X', 'G', 'in'].map((l, i) => (
                <a
                  key={i}
                  href="#"
                  aria-label={['X / Twitter', 'GitHub', 'LinkedIn'][i]}
                  style={{
                    width: 32,
                    height: 32,
                    display: 'grid',
                    placeItems: 'center',
                    borderRadius: 8,
                    border: '1px solid var(--hairline)',
                    color: 'var(--ink-subtle)',
                    textDecoration: 'none',
                    fontFamily: 'var(--font-mono)',
                    fontSize: 11,
                    fontWeight: 600,
                    transition: 'color .15s, border-color .15s',
                  }}
                >
                  {l}
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
                  color: 'var(--ink-muted)',
                  marginBottom: 14,
                  fontWeight: 500,
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
                        color: 'var(--ink-subtle)',
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
            © {new Date().getFullYear()} OwFlex — v0.7.0
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
