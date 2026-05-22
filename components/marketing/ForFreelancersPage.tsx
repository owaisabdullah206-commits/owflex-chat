'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowRight, Check, Clock, DollarSign, Code2, Mail } from 'lucide-react'
import { MarketingNav } from './MarketingNav'
import MarketingFooter from './MarketingFooter'

const STEPS = [
  { n: '01', title: 'Sign up free', body: 'No card. No trial timer. The free plan works indefinitely for a single bot.' },
  { n: '02', title: 'Add the embed script', body: 'One <script> tag. Works on any site — WordPress, Webflow, plain HTML. Two minutes, start to finish.' },
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

export default function ForFreelancersPage() {
  const [dark, setDark] = useState(false)

  return (
    <div className={`marketing${dark ? ' dark' : ''}`} style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--ink)' }}>
      <MarketingNav dark={dark} onToggleDark={() => setDark((d) => !d)} />

      {/* Hero */}
      <section style={{ paddingBlock: '80px 72px', borderBottom: '1px solid var(--hairline)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
          <div style={{ maxWidth: 640 }}>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--of-primary)', marginBottom: 18 }}>For freelancers</p>
            <h1 style={{ fontSize: 52, fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 1.07, marginBottom: 20 }}>
              Look like a pro.<br />Charge like one.
            </h1>
            <p style={{ fontSize: 18, color: 'var(--ink-muted)', lineHeight: 1.65, maxWidth: 520, marginBottom: 36 }}>
              Stop answering &ldquo;what did the bot say?&rdquo; emails. Give your client a portal and move on to the next project.
            </p>
            <Link
              href="/dashboard/signup"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                height: 46, padding: '0 24px',
                background: 'var(--of-primary)', color: 'white',
                fontSize: 15, fontWeight: 500, borderRadius: 8, textDecoration: 'none',
              }}
            >
              Start free — no card required <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </section>

      {/* Pain points */}
      <section style={{ paddingBlock: 64, background: 'var(--surface-2)', borderBottom: '1px solid var(--hairline)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
          {[
            { Icon: Mail, title: 'Client emails you weekly', body: '"What conversations came in this week?" — now they just log in and check.' },
            { Icon: Clock, title: 'Manual lead forwarding', body: 'Copying lead data from logs to emails. Every. Single. Week. That time is yours.' },
            { Icon: DollarSign, title: 'Underselling the work', body: 'A raw chatbot is worth one fee. A chatbot with a client portal is worth another.' },
          ].map(({ Icon, title, body }) => (
            <div key={title} style={{ padding: '24px', border: '1px solid var(--hairline)', background: 'var(--bg)' }}>
              <div style={{ width: 36, height: 36, background: 'var(--surface-2)', display: 'grid', placeItems: 'center', marginBottom: 14, color: 'var(--ink-subtle)' }}>
                <Icon size={16} />
              </div>
              <h3 style={{ fontWeight: 600, fontSize: 15, marginBottom: 8 }}>{title}</h3>
              <p style={{ fontSize: 14, color: 'var(--ink-muted)', lineHeight: 1.6, margin: 0 }}>{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section style={{ paddingBlock: 72 }}>
        <div style={{ maxWidth: 760, margin: '0 auto', padding: '0 24px' }}>
          <h2 style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 40, textAlign: 'center' }}>Live in under an hour</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {STEPS.map(({ n, title, body }) => (
              <div key={n} style={{ display: 'flex', gap: 20, padding: '22px 20px', border: '1px solid var(--hairline)', background: 'var(--surface)', alignItems: 'flex-start' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 700, color: 'var(--of-primary)', flexShrink: 0, paddingTop: 1 }}>{n}</span>
                <div>
                  <p style={{ fontWeight: 600, fontSize: 15, marginBottom: 6 }}>{title}</p>
                  <p style={{ fontSize: 14, color: 'var(--ink-muted)', margin: 0, lineHeight: 1.6 }}>{body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonial */}
      <section style={{ paddingBlock: 64, background: 'var(--surface-2)', borderTop: '1px solid var(--hairline)' }}>
        <div style={{ maxWidth: 600, margin: '0 auto', padding: '0 24px', textAlign: 'center' }}>
          <blockquote style={{ fontSize: 20, fontStyle: 'italic', lineHeight: 1.55, color: 'var(--ink)', marginBottom: 24 }}>
            &ldquo;My clients used to email me every week. Now they just log in. I&apos;ve reclaimed at least 3 hours a month per client.&rdquo;
          </blockquote>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--of-primary)', display: 'grid', placeItems: 'center', color: 'white', fontWeight: 700, fontFamily: 'var(--font-mono)', fontSize: 13 }}>OA</div>
            <div style={{ textAlign: 'left' }}>
              <p style={{ fontWeight: 600, fontSize: 14, margin: 0 }}>Owais A.</p>
              <p style={{ fontSize: 12, color: 'var(--ink-muted)', margin: 0 }}>Freelance developer</p>
            </div>
          </div>
        </div>
      </section>

      {/* Free plan card */}
      <section style={{ paddingBlock: 72 }}>
        <div style={{ maxWidth: 440, margin: '0 auto', padding: '0 24px' }}>
          <h2 style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 32, textAlign: 'center' }}>Start with the free plan</h2>
          <div style={{ border: '1px solid var(--hairline)', padding: '32px 28px', background: 'var(--surface)' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 8 }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 40, fontWeight: 700, letterSpacing: '-0.02em' }}>₨0</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--ink-muted)' }}>forever</span>
            </div>
            <p style={{ fontSize: 13, color: 'var(--ink-muted)', marginBottom: 24 }}>No trial. No expiry. Upgrade when you need to.</p>
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
                height: 44, width: '100%',
                background: 'var(--of-primary)', color: 'white',
                fontSize: 15, fontWeight: 500, borderRadius: 8, textDecoration: 'none',
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

      <MarketingFooter />
    </div>
  )
}
