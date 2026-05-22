'use client'

import Link from 'next/link'
import { ArrowRight, Check, Clock, DollarSign, Mail, MessageCircle } from 'lucide-react'
import { MarketingNav } from './MarketingNav'
import MarketingFooter from './MarketingFooter'
import { useDarkMode } from './useDarkMode'

const STEPS = [
  { n: '01', title: 'Sign up free', body: 'No card. No trial timer. The free plan works indefinitely for a single bot.' },
  { n: '02', title: 'Add the embed script', body: 'One script tag. Works on any site — WordPress, Webflow, plain HTML. Two minutes, start to finish.' },
  { n: '03', title: 'Invite your client', body: "Enter their email. They set a password and land on a portal with their bot's conversations and leads. Done." },
  { n: '04', title: 'Bill for the value', body: 'Your client has a professional dashboard. You look like you built it. Charge accordingly.' },
]

const FREE_PLAN = [
  '1 bot',
  '200 conversations / month',
  '2M AI credits / month',
  '15 leads / month',
  '7-day conversation history',
  'Client portal invite',
  'No credit card required',
]

function PortalPreview() {
  return (
    <div style={{
      background: 'var(--surface)',
      borderRadius: 16,
      border: '1px solid var(--hairline)',
      overflow: 'hidden',
      boxShadow: '0 24px 60px -12px rgba(12,10,9,.14), 0 8px 24px -8px rgba(12,10,9,.08)',
    }}>
      {/* Browser chrome */}
      <div style={{ padding: '10px 14px', background: 'var(--surface-2)', borderBottom: '1px solid var(--hairline)', display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ display: 'flex', gap: 5 }}>
          {['#FF5F57', '#FEBC2E', '#28C840'].map((c, i) => (
            <span key={i} style={{ width: 10, height: 10, borderRadius: '50%', background: c, opacity: 0.85 }} />
          ))}
        </div>
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '3px 12px', background: 'var(--surface)', borderRadius: 6, border: '1px solid var(--hairline)', fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--ink-muted)' }}>
            app.octively.com/portal
          </div>
        </div>
        <div style={{ width: 52 }} />
      </div>

      {/* Portal header */}
      <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--hairline)', display: 'flex', alignItems: 'center', gap: 10, background: 'var(--surface)' }}>
        <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--of-primary)', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700, color: 'white' }}>KK</span>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontWeight: 600, fontSize: 13.5, margin: 0, color: 'var(--ink)' }}>Karachi Kurta Co.</p>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--ink-muted)', margin: 0 }}>support-bot · Last active 2m ago</p>
        </div>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--of-success)', background: 'var(--of-success-soft)', border: '1px solid rgba(16,185,129,.2)', borderRadius: 999, padding: '2px 8px' }}>● Live</span>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', borderBottom: '1px solid var(--hairline)' }}>
        {[
          { value: '47', label: 'Conversations', color: 'var(--ink)' },
          { value: '12', label: 'Leads', color: 'var(--of-primary)' },
          { value: '98%', label: 'Uptime', color: 'var(--of-success)' },
        ].map(({ value, label, color }, i) => (
          <div key={label} style={{ textAlign: 'center', padding: '14px 8px', borderRight: i < 2 ? '1px solid var(--hairline)' : 'none' }}>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: 20, fontWeight: 700, color, margin: 0 }}>{value}</p>
            <p style={{ fontSize: 10.5, color: 'var(--ink-muted)', margin: 0 }}>{label}</p>
          </div>
        ))}
      </div>

      {/* Conversation thread */}
      <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--hairline)' }}>
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--ink-subtle)', marginBottom: 10 }}>Latest conversation</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
            <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'var(--surface-2)', border: '1px solid var(--hairline)', display: 'grid', placeItems: 'center', flexShrink: 0, marginTop: 2 }}>
              <span style={{ fontSize: 9, color: 'var(--ink-muted)', fontWeight: 600 }}>U</span>
            </div>
            <p style={{ fontSize: 12, color: 'var(--ink-muted)', margin: 0, lineHeight: 1.5, background: 'var(--surface-2)', padding: '7px 11px', borderRadius: '0 10px 10px 10px', flex: 1 }}>What are your delivery times to Lahore?</p>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start', flexDirection: 'row-reverse' }}>
            <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'var(--of-primary)', display: 'grid', placeItems: 'center', flexShrink: 0, marginTop: 2 }}>
              <span style={{ fontSize: 9, color: 'white', fontWeight: 700 }}>B</span>
            </div>
            <p style={{ fontSize: 12, color: 'white', margin: 0, lineHeight: 1.5, background: 'var(--of-primary)', padding: '7px 11px', borderRadius: '10px 0 10px 10px', flex: 1 }}>We deliver to Lahore in 2–3 business days. Express delivery (next day) is available for ₨299 extra.</p>
          </div>
        </div>
      </div>

      {/* Leads */}
      <div style={{ padding: '12px 18px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--ink-subtle)', margin: 0 }}>Leads captured</p>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--of-primary)' }}>12 this month</span>
        </div>
        {[
          { name: 'Ahmed Khan', email: 'ahmed@gmail.com', time: '2m ago' },
          { name: 'Sara Malik', email: 'sara@…', time: '1h ago' },
        ].map(({ name, email, time }) => (
          <div key={name} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 0', borderTop: '1px solid var(--hairline)' }}>
            <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--of-primary-soft)', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, fontWeight: 700, color: 'var(--of-primary)' }}>{name.charAt(0)}</span>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 12, fontWeight: 500, margin: 0, color: 'var(--ink)' }}>{name}</p>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--ink-muted)', margin: 0 }}>{email}</p>
            </div>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--ink-subtle)', flexShrink: 0 }}>{time}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function ForFreelancersPage() {
  const { dark, toggleDark } = useDarkMode()

  return (
    <div className={`marketing${dark ? ' dark' : ''}`} style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--ink)' }}>
      <MarketingNav dark={dark} onToggleDark={toggleDark} />

      {/* Hero */}
      <section style={{ paddingBlock: '72px 64px', borderBottom: '1px solid var(--hairline)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
          <div className="mkt-hero-grid" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 520px)', gap: 40, alignItems: 'center' }}>
            {/* Left — copy */}
            <div>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--of-primary)', marginBottom: 18 }}>For freelancers</p>
              <h1 style={{ fontSize: 'clamp(36px, 4.5vw, 54px)', fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 1.07, marginBottom: 20 }}>
                Look like a pro.<br />Charge like one.
              </h1>
              <p style={{ fontSize: 18, color: 'var(--ink-muted)', lineHeight: 1.65, maxWidth: 500, marginBottom: 36 }}>
                Stop answering &ldquo;what did the bot say?&rdquo; emails. Give your client a portal and move on to the next project.
              </p>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <Link
                  href="/dashboard/signup"
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 8,
                    height: 46, padding: '0 24px',
                    background: 'var(--of-primary)', color: 'white',
                    fontSize: 15, fontWeight: 500, borderRadius: 10, textDecoration: 'none',
                  }}
                >
                  Start free — no card required <ArrowRight size={15} />
                </Link>
                <Link
                  href="/pricing"
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    height: 46, padding: '0 20px',
                    border: '1px solid var(--hairline)', borderRadius: 10,
                    color: 'var(--ink)', fontSize: 15, textDecoration: 'none',
                  }}
                >
                  See plans
                </Link>
              </div>
              {/* Trust badges */}
              <div style={{ display: 'flex', gap: 20, marginTop: 28, flexWrap: 'wrap' }}>
                {['Free forever plan', 'No credit card', 'Live in 2 min'].map((t) => (
                  <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--ink-muted)' }}>
                    <Check size={13} style={{ color: 'var(--of-primary)', flexShrink: 0 }} />
                    {t}
                  </div>
                ))}
              </div>
            </div>
            {/* Right — portal preview */}
            <div className="mkt-hero-mockup">
              <PortalPreview />
            </div>
          </div>
        </div>
      </section>

      {/* Pain points */}
      <section style={{ paddingBlock: 64, background: 'var(--surface-2)', borderBottom: '1px solid var(--hairline)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--ink-subtle)', marginBottom: 32, textAlign: 'center' }}>Sound familiar?</p>
          <div className="mkt-grid-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
            {[
              { Icon: Mail, title: 'Client emails you weekly', body: '"What conversations came in this week?" — now they just log in and check themselves.' },
              { Icon: Clock, title: 'Manual lead forwarding', body: 'Copying lead data from logs to emails. Every. Single. Week. That time is yours.' },
              { Icon: DollarSign, title: 'Underselling the work', body: 'A raw chatbot is worth one fee. A chatbot with a client portal commands a retainer.' },
            ].map(({ Icon, title, body }) => (
              <div key={title} style={{ padding: '24px', border: '1px solid var(--hairline)', borderRadius: 12, background: 'var(--bg)' }}>
                <div style={{ width: 40, height: 40, background: 'var(--surface-2)', borderRadius: 10, display: 'grid', placeItems: 'center', marginBottom: 16, color: 'var(--of-primary)' }}>
                  <Icon size={18} />
                </div>
                <h3 style={{ fontWeight: 600, fontSize: 15, marginBottom: 8 }}>{title}</h3>
                <p style={{ fontSize: 14, color: 'var(--ink-muted)', lineHeight: 1.6, margin: 0 }}>{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section style={{ paddingBlock: 72 }}>
        <div style={{ maxWidth: 720, margin: '0 auto', padding: '0 24px' }}>
          <h2 style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 8, textAlign: 'center' }}>Live in under an hour</h2>
          <p style={{ fontSize: 16, color: 'var(--ink-muted)', textAlign: 'center', marginBottom: 40 }}>Four steps from zero to a client portal your clients will actually use.</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {STEPS.map(({ n, title, body }) => (
              <div key={n} style={{ display: 'flex', gap: 20, padding: '22px 22px', border: '1px solid var(--hairline)', borderRadius: 12, background: 'var(--surface)', alignItems: 'flex-start' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 700, color: 'var(--of-primary)', flexShrink: 0, paddingTop: 2, background: 'var(--of-primary-soft)', padding: '4px 8px', borderRadius: 6 }}>{n}</span>
                <div>
                  <p style={{ fontWeight: 600, fontSize: 15, marginBottom: 5 }}>{title}</p>
                  <p style={{ fontSize: 14, color: 'var(--ink-muted)', margin: 0, lineHeight: 1.6 }}>{body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonial */}
      <section style={{ paddingBlock: 64, background: 'var(--surface-2)', borderTop: '1px solid var(--hairline)', borderBottom: '1px solid var(--hairline)' }}>
        <div style={{ maxWidth: 600, margin: '0 auto', padding: '0 24px', textAlign: 'center' }}>
          <div style={{ fontSize: 56, color: 'var(--of-primary)', lineHeight: 1, marginBottom: 8, opacity: 0.3, fontFamily: 'Georgia, serif' }}>&ldquo;</div>
          <blockquote style={{ fontSize: 19, fontStyle: 'italic', lineHeight: 1.6, color: 'var(--ink)', marginBottom: 28, marginTop: 0 }}>
            My clients used to email me every week. Now they just log in. I&apos;ve reclaimed at least 3 hours a month per client — and raised my retainer by 30%.
          </blockquote>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--of-primary)', display: 'grid', placeItems: 'center', color: 'white', fontWeight: 700, fontFamily: 'var(--font-mono)', fontSize: 13 }}>OA</div>
            <div style={{ textAlign: 'left' }}>
              <p style={{ fontWeight: 600, fontSize: 14, margin: 0 }}>Owais A.</p>
              <p style={{ fontSize: 12, color: 'var(--ink-muted)', margin: 0 }}>Freelance developer · Karachi</p>
            </div>
          </div>
        </div>
      </section>

      {/* Free plan card */}
      <section style={{ paddingBlock: 72 }}>
        <div style={{ maxWidth: 440, margin: '0 auto', padding: '0 24px' }}>
          <h2 style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 8, textAlign: 'center' }}>Start with the free plan</h2>
          <p style={{ fontSize: 15, color: 'var(--ink-muted)', textAlign: 'center', marginBottom: 32 }}>No trial period. No expiry date. Upgrade only when you need to.</p>
          <div style={{ border: '1px solid var(--hairline)', borderRadius: 16, padding: '32px 28px', background: 'var(--surface)', boxShadow: '0 4px 24px rgba(12,10,9,.06)' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 6 }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 40, fontWeight: 700, letterSpacing: '-0.02em' }}>₨0</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--ink-muted)' }}>forever</span>
            </div>
            <p style={{ fontSize: 13, color: 'var(--ink-muted)', marginBottom: 24 }}>Perfect for your first client project.</p>
            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 28px', display: 'flex', flexDirection: 'column', gap: 10 }}>
              {FREE_PLAN.map((f) => (
                <li key={f} style={{ display: 'flex', gap: 10, alignItems: 'center', fontSize: 14 }}>
                  <Check size={14} style={{ color: 'var(--of-primary)', flexShrink: 0 }} />
                  <span style={{ color: 'var(--ink-muted)' }}>{f}</span>
                </li>
              ))}
            </ul>
            <Link
              href="/dashboard/signup"
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                height: 46, width: '100%',
                background: 'var(--of-primary)', color: 'white',
                fontSize: 15, fontWeight: 500, borderRadius: 10, textDecoration: 'none',
              }}
            >
              Get started free <ArrowRight size={15} />
            </Link>
            <p style={{ fontSize: 12, color: 'var(--ink-subtle)', textAlign: 'center', marginTop: 12 }}>
              Need more?{' '}
              <Link href="/pricing" style={{ color: 'var(--of-primary)' }}>See all plans →</Link>
            </p>
          </div>
        </div>
      </section>

      {/* CTA strip */}
      <section style={{ paddingBlock: 64, background: 'var(--surface-2)', borderTop: '1px solid var(--hairline)' }}>
        <div style={{ maxWidth: 600, margin: '0 auto', padding: '0 24px', textAlign: 'center' }}>
          <MessageCircle size={28} style={{ color: 'var(--of-primary)', marginBottom: 16 }} />
          <h2 style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 12 }}>Your client has a question — again</h2>
          <p style={{ fontSize: 16, color: 'var(--ink-muted)', lineHeight: 1.65, marginBottom: 28 }}>Or you could send them a link and let the portal answer it.</p>
          <Link
            href="/dashboard/signup"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              height: 46, padding: '0 28px',
              background: 'var(--of-primary)', color: 'white',
              fontSize: 15, fontWeight: 500, borderRadius: 10, textDecoration: 'none',
            }}
          >
            Start free <ArrowRight size={15} />
          </Link>
        </div>
      </section>

      <MarketingFooter />
    </div>
  )
}
