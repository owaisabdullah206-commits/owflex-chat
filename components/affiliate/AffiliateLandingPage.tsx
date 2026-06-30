'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { Handshake, Users, TrendingUp, DollarSign, CheckCircle2, ArrowRight, Sparkles } from 'lucide-react'
import { useDarkMode } from '@/components/marketing/useDarkMode'
import MarketingFooter from '@/components/marketing/MarketingFooter'

function Reveal({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect() } },
      { threshold: 0.15 },
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(24px)',
        transition: 'opacity 0.5s ease, transform 0.5s ease',
        ...style,
      }}
    >
      {children}
    </div>
  )
}

export default function AffiliateLandingPage() {
  const { dark, toggleDark } = useDarkMode()

  return (
    <div
      className={`marketing${dark ? ' dark' : ''}`}
      style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--ink)' }}
    >
      {/* Nav */}
      <nav
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 50,
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          background: dark ? 'rgba(10,10,10,0.85)' : 'rgba(250,250,249,0.85)',
          borderBottom: '1px solid var(--hairline)',
        }}
      >
        <div
          style={{
            maxWidth: 1200,
            margin: '0 auto',
            padding: '0 24px',
            height: 56,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
            <Handshake size={20} style={{ color: 'var(--of-primary)' }} />
            <span style={{ fontWeight: 700, fontSize: 15, color: 'var(--ink)' }}>Octively Affiliates</span>
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button
              onClick={toggleDark}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--ink-muted)',
                fontSize: 18,
                padding: 6,
              }}
              aria-label="Toggle dark mode"
            >
              {dark ? '☀️' : '🌙'}
            </button>
            <Link
              href="/login"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '8px 16px',
                background: 'var(--of-primary)',
                color: '#fff',
                borderRadius: 'var(--r-md)',
                fontSize: 13,
                fontWeight: 600,
                textDecoration: 'none',
                transition: 'background 0.15s',
              }}
            >
              Login
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ paddingBlock: '80px 60px', textAlign: 'center' }}>
        <div style={{ maxWidth: 720, margin: '0 auto', padding: '0 24px' }}>
          <Reveal>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '6px 14px',
                borderRadius: 'var(--r-lg)',
                background: 'var(--of-primary-soft)',
                color: 'var(--of-primary)',
                fontSize: 12,
                fontWeight: 600,
                fontFamily: 'var(--font-mono)',
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
                marginBottom: 20,
              }}
            >
              <Sparkles size={14} />
              Affiliate Program
            </div>
            <h1
              style={{
                fontSize: 'clamp(32px, 5vw, 52px)',
                fontWeight: 800,
                letterSpacing: '-0.03em',
                lineHeight: 1.1,
                margin: 0,
              }}
            >
              Earn by referring{' '}
              <span style={{ color: 'var(--of-primary)' }}>Octively</span>
            </h1>
            <p
              style={{
                marginTop: 16,
                fontSize: 18,
                color: 'var(--ink-muted)',
                lineHeight: 1.6,
                maxWidth: 540,
                marginInline: 'auto',
              }}
            >
              Share your unique coupon code. When someone signs up and pays, you earn a commission.
              First month only. Monthly payouts.
            </p>
            <div style={{ marginTop: 28, display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link
                href="/login"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '12px 24px',
                  background: 'var(--of-primary)',
                  color: '#fff',
                  borderRadius: 'var(--r-md)',
                  fontSize: 15,
                  fontWeight: 600,
                  textDecoration: 'none',
                  transition: 'background 0.15s',
                }}
              >
                Become an Affiliate
                <ArrowRight size={16} />
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* How It Works */}
      <section style={{ paddingBlock: 72, borderTop: '1px solid var(--hairline)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
          <Reveal style={{ textAlign: 'center', marginBottom: 40 }}>
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 11,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: 'var(--of-primary)',
                fontWeight: 500,
              }}
            >
              How It Works
            </span>
            <h2
              style={{
                marginTop: 10,
                fontSize: 'clamp(24px, 2.8vw, 34px)',
                fontWeight: 700,
                letterSpacing: '-0.02em',
                lineHeight: 1.2,
              }}
            >
              Three steps to start earning
            </h2>
          </Reveal>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
            {[
              {
                step: '01',
                icon: Handshake,
                title: 'Get your coupon',
                desc: 'We create your unique affiliate coupon code with a custom discount.',
              },
              {
                step: '02',
                icon: Users,
                title: 'Share it',
                desc: 'Share your code with your audience, clients, or on social media.',
              },
              {
                step: '03',
                icon: DollarSign,
                title: 'Earn commission',
                desc: 'When someone uses your code at checkout, you earn a percentage of their first payment.',
              },
            ].map((item) => (
              <Reveal key={item.step}>
                <div
                  style={{
                    border: '1px solid var(--hairline)',
                    borderRadius: 'var(--r-lg)',
                    padding: 28,
                    background: 'var(--surface)',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    cursor: 'default',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-3px)'
                    e.currentTarget.style.boxShadow = 'var(--shadow-md)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.boxShadow = 'none'
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      marginBottom: 16,
                    }}
                  >
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 'var(--r-md)',
                        background: 'var(--of-primary-soft)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <item.icon size={18} style={{ color: 'var(--of-primary)' }} />
                    </div>
                    <span
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: 11,
                        color: 'var(--ink-subtle)',
                        letterSpacing: '0.05em',
                      }}
                    >
                      STEP {item.step}
                    </span>
                  </div>
                  <h3 style={{ fontSize: 17, fontWeight: 700, margin: '0 0 8px' }}>{item.title}</h3>
                  <p style={{ fontSize: 14, color: 'var(--ink-muted)', lineHeight: 1.6, margin: 0 }}>
                    {item.desc}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Commission Details */}
      <section style={{ paddingBlock: 72, borderTop: '1px solid var(--hairline)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
          <Reveal style={{ textAlign: 'center', marginBottom: 40 }}>
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 11,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: 'var(--of-primary)',
                fontWeight: 500,
              }}
            >
              Commission Model
            </span>
            <h2
              style={{
                marginTop: 10,
                fontSize: 'clamp(24px, 2.8vw, 34px)',
                fontWeight: 700,
                letterSpacing: '-0.02em',
                lineHeight: 1.2,
              }}
            >
              Simple, transparent earnings
            </h2>
          </Reveal>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
            <Reveal>
              <div
                style={{
                  border: '1px solid var(--hairline)',
                  borderRadius: 'var(--r-lg)',
                  padding: 32,
                  background: 'var(--surface)',
                }}
              >
                <TrendingUp size={24} style={{ color: 'var(--of-primary)', marginBottom: 16 }} />
                <h3 style={{ fontSize: 20, fontWeight: 700, margin: '0 0 12px' }}>First Month Commission</h3>
                <p style={{ fontSize: 14, color: 'var(--ink-muted)', lineHeight: 1.7, margin: 0 }}>
                  You earn a percentage of the customer&apos;s <strong>first payment only</strong>.
                  Whether they buy a plan upgrade or credit pack — if they use your coupon, you earn.
                </p>
              </div>
            </Reveal>

            <Reveal>
              <div
                style={{
                  border: '1px solid var(--hairline)',
                  borderRadius: 'var(--r-lg)',
                  padding: 32,
                  background: 'var(--surface)',
                }}
              >
                <DollarSign size={24} style={{ color: 'var(--of-primary)', marginBottom: 16 }} />
                <h3 style={{ fontSize: 20, fontWeight: 700, margin: '0 0 12px' }}>Monthly Payouts</h3>
                <p style={{ fontSize: 14, color: 'var(--ink-muted)', lineHeight: 1.7, margin: 0 }}>
                  Commission accumulates in your balance. Request a payout once per month.
                  We process payments via bank transfer or PayPal.
                </p>
              </div>
            </Reveal>

            <Reveal>
              <div
                style={{
                  border: '1px solid var(--hairline)',
                  borderRadius: 'var(--r-lg)',
                  padding: 32,
                  background: 'var(--surface)',
                }}
              >
                <CheckCircle2 size={24} style={{ color: 'var(--of-primary)', marginBottom: 16 }} />
                <h3 style={{ fontSize: 20, fontWeight: 700, margin: '0 0 12px' }}>No Limits</h3>
                <p style={{ fontSize: 14, color: 'var(--ink-muted)', lineHeight: 1.7, margin: 0 }}>
                  Refer as many customers as you want. No cap on earnings.
                  The more you refer, the more you earn.
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Rules */}
      <section style={{ paddingBlock: 72, borderTop: '1px solid var(--hairline)' }}>
        <div style={{ maxWidth: 720, margin: '0 auto', padding: '0 24px' }}>
          <Reveal style={{ textAlign: 'center', marginBottom: 40 }}>
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 11,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: 'var(--of-primary)',
                fontWeight: 500,
              }}
            >
              Rules &amp; Terms
            </span>
            <h2
              style={{
                marginTop: 10,
                fontSize: 'clamp(24px, 2.8vw, 34px)',
                fontWeight: 700,
                letterSpacing: '-0.02em',
                lineHeight: 1.2,
              }}
            >
              What you need to know
            </h2>
          </Reveal>

          <Reveal>
            <div
              style={{
                border: '1px solid var(--hairline)',
                borderRadius: 'var(--r-lg)',
                padding: 32,
                background: 'var(--surface)',
              }}
            >
              <ul
                style={{
                  listStyle: 'none',
                  padding: 0,
                  margin: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 16,
                }}
              >
                {[
                  'Commission is earned on the first payment only — not recurring monthly.',
                  'The customer must use your coupon code at checkout for you to earn.',
                  'Commission is calculated on the discounted amount (what the customer actually pays).',
                  'Self-referral is not allowed — you cannot use your own coupon.',
                  'Payouts are processed monthly, on request.',
                  'We reserve the right to adjust commission rates with 30 days notice.',
                  'Fraudulent activity (fake signups, etc.) will result in account termination.',
                ].map((rule, i) => (
                  <li
                    key={i}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 10,
                      fontSize: 14,
                      color: 'var(--ink-muted)',
                      lineHeight: 1.6,
                    }}
                  >
                    <CheckCircle2
                      size={16}
                      style={{ color: 'var(--of-primary)', marginTop: 3, flexShrink: 0 }}
                    />
                    {rule}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>
      </section>

      {/* CTA */}
      <section
        style={{
          paddingBlock: 72,
          borderTop: '1px solid var(--hairline)',
          background: dark ? 'var(--dark-surface)' : 'var(--surface-2)',
        }}
      >
        <div style={{ maxWidth: 600, margin: '0 auto', padding: '0 24px', textAlign: 'center' }}>
          <Reveal>
            <h2
              style={{
                fontSize: 'clamp(24px, 3vw, 34px)',
                fontWeight: 700,
                letterSpacing: '-0.02em',
                lineHeight: 1.2,
                margin: '0 0 12px',
              }}
            >
              Ready to start earning?
            </h2>
            <p style={{ fontSize: 16, color: 'var(--ink-muted)', lineHeight: 1.6, margin: '0 0 28px' }}>
              Join the Octively affiliate program today. It&apos;s free to join, and you can start referring in minutes.
            </p>
            <Link
              href="/login"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '14px 28px',
                background: 'var(--of-primary)',
                color: '#fff',
                borderRadius: 'var(--r-md)',
                fontSize: 16,
                fontWeight: 600,
                textDecoration: 'none',
                transition: 'background 0.15s',
              }}
            >
              Become an Affiliate
              <ArrowRight size={16} />
            </Link>
          </Reveal>
        </div>
      </section>

      <MarketingFooter />
    </div>
  )
}
