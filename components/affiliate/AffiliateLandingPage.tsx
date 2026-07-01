'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { Handshake, Users, TrendingUp, DollarSign, CheckCircle2, ArrowRight, Sparkles, BarChart3 } from 'lucide-react'
import { OctivelyLogo } from '@/components/brand/OctivelyLogo'
import MarketingFooter from '@/components/marketing/MarketingFooter'

function Reveal({ children, className = '', delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect() } },
      { threshold: 0.1 },
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(20px)',
        transition: `opacity 0.5s ease ${delay}ms, transform 0.5s ease ${delay}ms`,
      }}
    >
      {children}
    </div>
  )
}

export default function AffiliateLandingPage() {
  const [hasSession, setHasSession] = useState(false)

  useEffect(() => {
    setHasSession(document.cookie.includes('aff_session='))
  }, [])

  const loginHref = hasSession ? '/dashboard' : '/affiliate/login'

  return (
    <div
      className="marketing"
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
          background: 'rgba(250,250,249,0.85)',
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
          <Link href="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
            <OctivelyLogo size={22} showWordmark />
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Link
              href={loginHref}
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
              {hasSession ? 'Dashboard' : 'Become an Affiliate'}
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ paddingBlock: '72px 56px', textAlign: 'center' }}>
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
          </Reveal>
          <Reveal delay={50}>
            <h1
              style={{
                fontSize: 'clamp(32px, 5vw, 48px)',
                fontWeight: 800,
                letterSpacing: '-0.03em',
                lineHeight: 1.1,
                margin: 0,
              }}
            >
              Earn by referring{' '}
              <span style={{ color: 'var(--of-primary)' }}>Octively</span>
            </h1>
          </Reveal>
          <Reveal delay={100}>
            <p
              style={{
                marginTop: 16,
                fontSize: 17,
                color: 'var(--ink-muted)',
                lineHeight: 1.65,
                maxWidth: 520,
                marginInline: 'auto',
              }}
            >
              Share your unique coupon code. When someone signs up and pays, you earn a commission.
              First payment only. Monthly payouts.
            </p>
          </Reveal>
          <Reveal delay={150}>
            <div style={{ marginTop: 28, display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link
                href={loginHref}
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
                  transition: 'background 0.15s, transform 0.15s',
                }}
              >
                {hasSession ? 'Go to Dashboard' : 'Start Earning'}
                <ArrowRight size={16} />
              </Link>
              <a
                href="https://octively.com/pricing"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '12px 24px',
                  background: 'var(--surface)',
                  border: '1px solid var(--hairline)',
                  color: 'var(--ink)',
                  borderRadius: 'var(--r-md)',
                  fontSize: 15,
                  fontWeight: 600,
                  textDecoration: 'none',
                  transition: 'background 0.15s',
                }}
              >
                View Pricing
              </a>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Stats strip */}
      <section style={{ borderTop: '1px solid var(--hairline)', borderBottom: '1px solid var(--hairline)' }}>
        <div
          style={{
            maxWidth: 1200,
            margin: '0 auto',
            padding: '32px 24px',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: 24,
            textAlign: 'center',
          }}
        >
          {[
            { value: '20%', label: 'Commission rate' },
            { value: 'Monthly', label: 'Payout cycle' },
            { value: 'Unlimited', label: 'No earnings cap' },
            { value: 'Free', label: 'To join' },
          ].map((stat) => (
            <div key={stat.label}>
              <p
                style={{
                  fontSize: 24,
                  fontWeight: 700,
                  color: 'var(--of-primary)',
                  letterSpacing: '-0.02em',
                  margin: 0,
                }}
              >
                {stat.value}
              </p>
              <p style={{ fontSize: 13, color: 'var(--ink-muted)', margin: '4px 0 0' }}>{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section style={{ paddingBlock: 72 }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <Reveal>
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
            </Reveal>
            <Reveal delay={50}>
              <h2
                style={{
                  marginTop: 10,
                  fontSize: 'clamp(24px, 2.8vw, 32px)',
                  fontWeight: 700,
                  letterSpacing: '-0.02em',
                  lineHeight: 1.2,
                }}
              >
                Three steps to start earning
              </h2>
            </Reveal>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
            {[
              {
                step: '01',
                icon: Handshake,
                title: 'Get your coupon',
                desc: 'We set up a unique coupon code for you with a set discount rate. You share it — we handle the rest.',
              },
              {
                step: '02',
                icon: Users,
                title: 'Share it',
                desc: 'Share your code with your audience, clients, or on social media. Anyone can use it.',
              },
              {
                step: '03',
                icon: DollarSign,
                title: 'Earn commission',
                desc: 'When someone uses your code at checkout, you earn a percentage of their first payment.',
              },
            ].map((item, i) => (
              <Reveal key={item.step} delay={i * 80}>
                <div
                  style={{
                    border: '1px solid var(--hairline)',
                    borderRadius: 'var(--r-lg)',
                    padding: 28,
                    background: 'var(--surface)',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    height: '100%',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)'
                    e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.06)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.boxShadow = 'none'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 'var(--r-md)',
                        background: 'var(--of-primary-soft)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
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
      <section style={{ paddingBlock: 72, borderTop: '1px solid var(--hairline)', background: 'var(--surface-2)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <Reveal>
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
            </Reveal>
            <Reveal delay={50}>
              <h2
                style={{
                  marginTop: 10,
                  fontSize: 'clamp(24px, 2.8vw, 32px)',
                  fontWeight: 700,
                  letterSpacing: '-0.02em',
                  lineHeight: 1.2,
                }}
              >
                Simple, transparent earnings
              </h2>
            </Reveal>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
            {[
              {
                icon: TrendingUp,
                title: 'First Payment Commission',
                desc: 'You earn a percentage of the customer\'s first payment only. Whether they buy a plan upgrade or credit pack — if they use your coupon, you earn.',
              },
              {
                icon: BarChart3,
                title: 'Monthly Payouts',
                desc: 'Commission accumulates in your balance. Request a payout once per month. We process payments via bank transfer or JazzCash/EasyPaisa.',
              },
              {
                icon: CheckCircle2,
                title: 'No Limits',
                desc: 'Refer as many customers as you want. No cap. No tiers. Your commission rate stays the same.',
              },
            ].map((item, i) => (
              <Reveal key={item.title} delay={i * 80}>
                <div
                  style={{
                    border: '1px solid var(--hairline)',
                    borderRadius: 'var(--r-lg)',
                    padding: 28,
                    background: 'var(--surface)',
                    height: '100%',
                  }}
                >
                  <item.icon size={22} style={{ color: 'var(--of-primary)', marginBottom: 14 }} />
                  <h3 style={{ fontSize: 17, fontWeight: 700, margin: '0 0 8px' }}>{item.title}</h3>
                  <p style={{ fontSize: 14, color: 'var(--ink-muted)', lineHeight: 1.65, margin: 0 }}>
                    {item.desc}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Rules */}
      <section style={{ paddingBlock: 72, borderTop: '1px solid var(--hairline)' }}>
        <div style={{ maxWidth: 720, margin: '0 auto', padding: '0 24px' }}>
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <Reveal>
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
            </Reveal>
            <Reveal delay={50}>
              <h2
                style={{
                  marginTop: 10,
                  fontSize: 'clamp(24px, 2.8vw, 32px)',
                  fontWeight: 700,
                  letterSpacing: '-0.02em',
                  lineHeight: 1.2,
                }}
              >
                What you need to know
              </h2>
            </Reveal>
          </div>

          <Reveal>
            <div
              style={{
                border: '1px solid var(--hairline)',
                borderRadius: 'var(--r-lg)',
                padding: 28,
                background: 'var(--surface)',
              }}
            >
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 14 }}>
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
          paddingBlock: 64,
          borderTop: '1px solid var(--hairline)',
          textAlign: 'center',
        }}
      >
        <div style={{ maxWidth: 600, margin: '0 auto', padding: '0 24px' }}>
          <Reveal>
            <h2
              style={{
                fontSize: 'clamp(22px, 3vw, 32px)',
                fontWeight: 700,
                letterSpacing: '-0.02em',
                lineHeight: 1.2,
                margin: '0 0 12px',
              }}
            >
              Ready to start?
            </h2>
            <p style={{ fontSize: 16, color: 'var(--ink-muted)', lineHeight: 1.6, margin: '0 0 28px' }}>
              Free to join. Share your code and earn from your first referral.
            </p>
            <Link
              href={loginHref}
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
              {hasSession ? 'Go to Dashboard' : 'Become an Affiliate'}
              <ArrowRight size={16} />
            </Link>
          </Reveal>
        </div>
      </section>

      <MarketingFooter isAffiliate />
    </div>
  )
}
