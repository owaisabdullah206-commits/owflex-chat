'use client'

import Link from 'next/link'
import { ArrowRight, Code2, Globe, Shield } from 'lucide-react'
import { MarketingNav } from './MarketingNav'
import MarketingFooter from './MarketingFooter'
import { useDarkMode } from './useDarkMode'
import { OctivelyButton } from '@/components/brand/OctivelyButton'

const VALUES = [
  {
    Icon: Code2,
    title: 'Developer-first',
    body: 'Every API, every embed hook, every error message is written for the person who has to integrate it at 11pm on a deadline.',
  },
  {
    Icon: Globe,
    title: 'Zero vendor lock-in',
    body: "Your embed key works on any stack. Switch LLM providers without touching client code. We're infrastructure, not a platform you're trapped in.",
  },
  {
    Icon: Shield,
    title: 'Client simplicity',
    body: "Your clients shouldn't need to understand AI to benefit from it. A clean portal, plain-English insights, nothing more.",
  },
]

export default function AboutPage() {
  const { dark, toggleDark } = useDarkMode()
  return (
    <div className={`marketing${dark ? ' dark' : ''}`} style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--ink)' }}>
      <MarketingNav dark={dark} onToggleDark={toggleDark} />

      {/* Hero */}
      <section style={{ paddingBlock: '72px 56px', borderBottom: '1px solid var(--hairline)' }}>
        <div style={{ maxWidth: 800, margin: '0 auto', padding: '0 24px', textAlign: 'center' }}>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--of-primary)', marginBottom: 16 }}>About Octively</p>
          <h1 style={{ fontSize: 48, fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 1.1, marginBottom: 20 }}>
            Made by a developer.<br />Used by agencies.
          </h1>
          <p style={{ fontSize: 18, color: 'var(--ink-muted)', lineHeight: 1.6, maxWidth: 560, margin: '0 auto' }}>
            We make AI chatbot management invisible to your clients, so you look professional without the extra work.
          </p>
        </div>
      </section>

      {/* Origin story */}
      <section style={{ paddingBlock: 72 }}>
        <div className="mkt-grid-2" style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 72, alignItems: 'start' }}>
          <div>
            <h2 style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 20 }}>The problem we kept running into</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, fontSize: 15, color: 'var(--ink-muted)', lineHeight: 1.7 }}>
              <p>Every time we built a chatbot for a client, the same pattern repeated: the bot was live, the client was happy, and then the emails started.</p>
              <p>&ldquo;Can you check what the bot said on Tuesday?&rdquo; &ldquo;A lead came in last week but I can&apos;t find the email.&rdquo; &ldquo;Can you change the bot greeting?&rdquo;</p>
              <p>None of these should require a developer. Clients just needed a place to log in and see their data — without exposing the underlying infrastructure to them.</p>
              <p>So we built that place. And then we made it white-label, so your agency brand is the only brand your clients see.</p>
            </div>
          </div>

          {/* Team card */}
          <div style={{ border: '1px solid var(--hairline)', borderRadius: 16, background: 'var(--surface)', overflow: 'hidden' }}>
            <div style={{ height: 4, background: 'linear-gradient(90deg, var(--of-primary), var(--of-primary-hover))' }} />
            <div style={{ padding: 32 }}>
              <p style={{ fontSize: 14, color: 'var(--ink-muted)', lineHeight: 1.7, margin: 0 }}>
                Octively is built by a team who spent years building client-facing tools. We started Octively after spending too many evenings responding to &ldquo;what did the chatbot say?&rdquo; emails for clients who just needed a portal.
              </p>
              <div style={{ marginTop: 20, paddingTop: 20, borderTop: '1px solid var(--hairline)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 18, flexWrap: 'wrap' }}>
                  <Link href="/contact" style={{ fontSize: 13, color: 'var(--of-primary)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
                    Get in touch <ArrowRight size={12} />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section style={{ paddingBlock: 72, borderTop: '1px solid var(--hairline)', background: 'var(--surface-2)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
          <h2 style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 48, textAlign: 'center' }}>How we build</h2>
          <div className="mkt-grid-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
            {VALUES.map(({ Icon, title, body }) => (
              <div key={title} style={{ border: '1px solid var(--hairline)', borderRadius: 14, background: 'var(--bg)', padding: '28px 24px' }}>
                <div style={{ width: 42, height: 42, background: 'var(--of-primary-soft)', borderRadius: 10, display: 'grid', placeItems: 'center', marginBottom: 16, color: 'var(--of-primary)' }}>
                  <Icon size={18} />
                </div>
                <h3 style={{ fontWeight: 600, fontSize: 16, marginBottom: 10 }}>{title}</h3>
                <p style={{ fontSize: 14, color: 'var(--ink-muted)', lineHeight: 1.65, margin: 0 }}>{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ paddingBlock: 80, textAlign: 'center' }}>
        <div style={{ maxWidth: 520, margin: '0 auto', padding: '0 24px' }}>
          <h2 style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 14 }}>Try it free</h2>
          <p style={{ fontSize: 15, color: 'var(--ink-muted)', marginBottom: 28 }}>No card required. One bot, 200 conversations per month, free forever.</p>
          <OctivelyButton href="/dashboard/signup" size="lg">
            Get started free
          </OctivelyButton>
        </div>
      </section>

      <MarketingFooter />
    </div>
  )
}
