'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import {
  MessageSquare, Zap, Monitor, Palette, Cpu, Globe,
  Code2, UserPlus, BarChart3, Check, ArrowRight, ArrowUpRight,
  MessageSquareX, Clock, PackageX, Shield, Sparkles,
} from 'lucide-react'
import MarketingFooter from './MarketingFooter'
import { MarketingNav } from './MarketingNav'
import { useDarkMode } from './useDarkMode'
// ─── Reveal helper ────────────────────────────────────────────────────────────

function Reveal({
  children,
  style,
  delay = 0,
}: {
  children: React.ReactNode
  style?: React.CSSProperties
  delay?: number
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          io.unobserve(el)
        }
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(20px)',
        transition: `opacity 0.55s ease ${delay}ms, transform 0.55s ease ${delay}ms`,
        ...style,
      }}
    >
      {children}
    </div>
  )
}

// ─── Dashboard Chrome Mockup ──────────────────────────────────────────────────

function DashboardSidebar({ small = false }: { small?: boolean }) {
  const items = [
    { label: 'Bots', Icon: MessageSquare, active: true },
    { label: 'Leads', Icon: UserPlus },
    { label: 'Clients', Icon: Globe },
    { label: 'Billing', Icon: Cpu },
    { label: 'Settings', Icon: Palette },
  ]
  return (
    <aside
      style={{
        borderRight: '1px solid var(--hairline)',
        padding: small ? '10px 6px' : '16px 12px',
        background: 'var(--surface-2, #EBE7E1)',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: 'var(--font-mono)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 7, padding: small ? '4px 4px 12px' : '4px 6px 22px' }}>
        <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--of-primary)' }} />
        <span style={{ fontSize: small ? 10 : 13, fontWeight: 600, letterSpacing: '-0.01em', color: 'var(--ink)' }}>
          Octively
        </span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        {items.map(({ label, Icon, active }, i) => (
          <div
            key={i}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: small ? 6 : 8,
              padding: small ? '4px 6px' : '7px 10px',
              borderRadius: 4,
              background: active ? 'var(--of-primary-soft)' : 'transparent',
              color: active ? 'var(--of-primary-deep)' : 'var(--ink-subtle)',
              fontSize: small ? 9.5 : 12,
              fontWeight: active ? 500 : 400,
              letterSpacing: '0.01em',
            }}
          >
            <Icon size={small ? 10 : 13} />
            <span style={{ fontSize: small ? 8.5 : 12 }}>{label}</span>
          </div>
        ))}
      </div>
      <div
        style={{
          marginTop: 'auto',
          padding: small ? '8px 6px 2px' : '16px 6px 0',
          display: 'flex',
          alignItems: 'center',
          gap: small ? 6 : 8,
          color: 'var(--ink-muted)',
          fontSize: small ? 9 : 11,
        }}
      >
        <ArrowUpRight size={small ? 10 : 12} />
        <span>Sign out</span>
      </div>
    </aside>
  )
}

function StatBlock({ label, value, small, accent }: { label: string; value: string; small?: boolean; accent?: boolean }) {
  return (
    <div
      style={{
        border: '1px solid var(--hairline)',
        borderRadius: 6,
        padding: small ? '8px 10px' : '14px 16px',
        background: 'var(--surface)',
      }}
    >
      <div
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: small ? 8 : 10,
          letterSpacing: '0.06em',
          color: 'var(--ink-muted)',
          marginBottom: small ? 4 : 8,
          fontWeight: 500,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: small ? 22 : 38,
          fontWeight: 500,
          lineHeight: 1,
          letterSpacing: '-0.02em',
          color: accent ? 'var(--of-primary)' : 'var(--ink)',
        }}
      >
        {value}
      </div>
    </div>
  )
}

function DashboardMain({ small = false }: { small?: boolean }) {
  const tabs = ['Overview', 'Conversations', 'Leads', 'Settings']
  return (
    <main
      style={{
        padding: small ? '12px 14px' : '22px 26px',
        display: 'flex',
        flexDirection: 'column',
        gap: small ? 10 : 16,
        overflow: 'hidden',
      }}
    >
      {/* Breadcrumb */}
      <div>
        <div
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: small ? 8.5 : 10,
            letterSpacing: '0.08em',
            color: 'var(--ink-muted)',
            marginBottom: small ? 4 : 6,
          }}
        >
          BOTS / AI AGENT
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: small ? 8 : 12 }}>
            <h3 style={{ fontSize: small ? 14 : 22, fontWeight: 600, letterSpacing: '-0.02em', margin: 0 }}>
              AI Agent
            </h3>
            <span
              style={{
                background: 'var(--of-success-soft)',
                border: '1px solid rgba(16,185,129,.25)',
                color: 'var(--of-success)',
                fontSize: small ? 8.5 : 10,
                padding: small ? '2px 6px' : '3px 8px',
                borderRadius: 999,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                fontFamily: 'var(--font-mono)',
              }}
            >
              <span style={{ width: small ? 4 : 5, height: small ? 4 : 5, borderRadius: '50%', background: 'currentColor' }} />
              Active
            </span>
          </div>
        </div>
        {!small && (
          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 10.5,
              color: 'var(--ink-muted)',
              marginTop: 4,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            embed_key=pk_97f8271585094…
          </div>
        )}
      </div>

      {/* Tabs */}
      {!small && (
        <div style={{ display: 'flex', gap: 4, borderBottom: '1px solid var(--hairline)' }}>
          {tabs.map((tab, i) => (
            <div
              key={i}
              style={{
                fontFamily: 'var(--font-mono)',
                padding: '6px 10px',
                fontSize: 11,
                color: i === 0 ? 'var(--of-primary-deep)' : 'var(--ink-subtle)',
                background: i === 0 ? 'var(--of-primary-soft)' : 'transparent',
                borderRadius: '4px 4px 0 0',
                fontWeight: i === 0 ? 500 : 400,
                borderBottom: i === 0 ? '2px solid var(--of-primary)' : '2px solid transparent',
                marginBottom: -1,
                whiteSpace: 'nowrap',
              }}
            >
              {tab}
            </div>
          ))}
        </div>
      )}

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: small ? 6 : 10 }}>
        <StatBlock label="CONVERSATIONS.MONTH" value="14" small={small} />
        <StatBlock label="LEADS.MONTH" value="3" small={small} accent />
      </div>

      {/* Recent Leads */}
      {!small && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 10,
              letterSpacing: '0.08em',
              color: 'var(--ink-muted)',
            }}
          >
            RECENT_LEADS
          </div>
          <div style={{ border: '1px solid var(--hairline)', borderRadius: 6, overflow: 'hidden' }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '7px 12px',
                background: 'var(--surface-2)',
                borderBottom: '1px solid var(--hairline)',
              }}
            >
              <span style={{ fontSize: 11, fontWeight: 500 }}>Leads</span>
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 10,
                  color: 'var(--of-success)',
                  padding: '2px 8px',
                  border: '1px solid rgba(16,185,129,.25)',
                  borderRadius: 4,
                  background: 'var(--of-success-soft)',
                }}
              >
                3 new
              </span>
            </div>
            {[
              { name: 'Ahmed Khan', email: 'ahmed@…', time: '2m ago' },
              { name: 'Sara Malik', email: 'sara@…', time: '18m ago' },
              { name: 'Usman Ali', email: 'usman@…', time: '1h ago' },
            ].map(({ name, email, time }, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px 12px',
                  borderBottom: i < 2 ? '1px solid var(--hairline)' : 'none',
                  fontSize: 11,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: '50%',
                      background: 'var(--of-primary-soft)',
                      color: 'var(--of-primary-deep)',
                      display: 'grid',
                      placeItems: 'center',
                      fontSize: 9,
                      fontWeight: 600,
                      flexShrink: 0,
                    }}
                  >
                    {name[0]}
                  </div>
                  <div>
                    <div style={{ fontWeight: 500, fontSize: 11 }}>{name}</div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9.5, color: 'var(--ink-muted)' }}>{email}</div>
                  </div>
                </div>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9.5, color: 'var(--ink-muted)' }}>{time}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </main>
  )
}

function FloatingEmbedChip() {
  return (
    <div
      style={{
        position: 'absolute',
        left: -28,
        bottom: -22,
        background: 'var(--dark-bg)',
        color: 'var(--dark-ink)',
        borderRadius: 10,
        padding: '12px 14px',
        boxShadow: 'var(--shadow-lg)',
        fontFamily: 'var(--font-mono)',
        fontSize: 12.5,
        border: '1px solid var(--dark-hairline-strong)',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        transform: 'rotate(-2deg)',
        zIndex: 10,
      }}
    >
      <span style={{ display: 'flex', gap: 4 }}>
        {['#FF5F57', '#FEBC2E', '#28C840'].map((c, i) => (
          <span key={i} style={{ width: 8, height: 8, borderRadius: '50%', background: c }} />
        ))}
      </span>
      <span>
        <span style={{ color: '#94a3b8' }}>&lt;script src=&quot;</span>
        octively.com/embed.js
        <span style={{ color: '#94a3b8' }}>&quot; /&gt;</span>
      </span>
    </div>
  )
}

function PortalMockup() {
  return (
    <div
      style={{
        background: 'var(--surface)',
        borderRadius: 14,
        border: '1px solid var(--hairline-strong)',
        boxShadow: 'var(--shadow-lg)',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      {/* Browser chrome */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '10px 14px',
          borderBottom: '1px solid var(--hairline)',
          background: 'var(--surface-2)',
        }}
      >
        <div style={{ display: 'flex', gap: 6 }}>
          {['#FF5F57', '#FEBC2E', '#28C840'].map((c, i) => (
            <span key={i} style={{ width: 11, height: 11, borderRadius: '50%', background: c, opacity: 0.9 }} />
          ))}
        </div>
        <div
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 11,
            color: 'var(--ink-muted)',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '3px 10px',
            background: 'var(--surface)',
            borderRadius: 6,
            border: '1px solid var(--hairline)',
          }}
        >
          <Globe size={11} /> admin.octively.com/bots/ai-agent
        </div>
        <div style={{ width: 60 }} />
      </div>
      {/* Inner dashboard */}
      <div
        className="mkt-mockup-inner"
        style={{
          display: 'grid',
          gridTemplateColumns: '168px 1fr',
          minHeight: 310,
          background: 'var(--surface)',
        }}
      >
        <div className="mkt-mockup-sidebar">
          <DashboardSidebar />
        </div>
        <DashboardMain />
      </div>
    </div>
  )
}

// ─── Logo Bar ─────────────────────────────────────────────────────────────────

function LogoBar() {
  const logos = [
    'Nasir Electronics', 'Karachi Kurta Co.', 'Pak Travels', 'Lahore Auto',
    'Dawn Studio', 'Bolt Couriers', 'MediCare Clinic', 'Falcon Freight',
  ]
  const track = [...logos, ...logos]

  return (
    <section
      style={{
        paddingBlock: 28,
        borderTop: '1px solid var(--hairline)',
        borderBottom: '1px solid var(--hairline)',
        background: 'var(--surface-2)',
        overflow: 'hidden',
      }}
    >
      {/* Desktop: label left, marquee fills the rest. Mobile: label stacked above */}
      <div
        className="mkt-logobar-wrap"
        style={{ display: 'flex', alignItems: 'center', gap: 0 }}
      >
        <div
          className="mkt-logobar-label"
          style={{
            flexShrink: 0,
            padding: '0 28px',
            fontFamily: 'var(--font-mono)',
            fontSize: 10,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: 'var(--ink-subtle)',
            whiteSpace: 'nowrap',
            borderRight: '1px solid var(--hairline)',
            alignSelf: 'stretch',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          Trusted by Pakistani developers building for —
        </div>

      <div style={{ position: 'relative', overflow: 'hidden', flex: 1 }}>
        {/* fade edges */}
        <div style={{ position: 'absolute', inset: '0 auto 0 0', width: 80, background: 'linear-gradient(to right, var(--surface-2), transparent)', zIndex: 1, pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', inset: '0 0 0 auto', width: 80, background: 'linear-gradient(to left, var(--surface-2), transparent)', zIndex: 1, pointerEvents: 'none' }} />

        <div
          style={{
            display: 'flex',
            width: 'max-content',
            animation: 'marqueeL 24s linear infinite',
          }}
        >
          {track.map((name, i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 18,
                padding: '0 36px',
                borderRight: '1px solid var(--hairline)',
              }}
            >
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 11,
                  fontWeight: 600,
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                  color: 'var(--ink-muted)',
                  whiteSpace: 'nowrap',
                  opacity: 0.75,
                }}
              >
                {name}
              </span>
            </div>
          ))}
        </div>
      </div>
      </div>
    </section>
  )
}

// ─── Problem Strip ────────────────────────────────────────────────────────────

function ProblemStrip() {
  const items = [
    {
      Icon: MessageSquareX,
      h: 'Clients have no visibility',
      p: 'Every check-in becomes: "how many conversations did the bot have?" You\'re the bottleneck for a dashboard you never planned to build.',
    },
    {
      Icon: Clock,
      h: 'Custom portals take weeks',
      p: 'Auth, RBAC, billing, analytics, lead export — six weeks of work nobody pays you extra for. And it never feels finished.',
    },
    {
      Icon: PackageX,
      h: 'Every client = a rebuild',
      p: 'By the eighth chatbot, you\'re maintaining eight bespoke admin panels. Switching the underlying LLM means eight migrations.',
    },
  ]
  return (
    <section
      style={{
        background: 'var(--surface-2)',
        paddingBlock: 80,
        borderBottom: '1px solid var(--hairline)',
      }}
    >
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
        <Reveal style={{ marginBottom: 36 }}>
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
            The problem
          </span>
          <h2
            style={{
              marginTop: 10,
              fontSize: 'clamp(26px, 3vw, 36px)',
              fontWeight: 700,
              letterSpacing: '-0.02em',
              lineHeight: 1.2,
              maxWidth: 720,
            }}
          >
            You ship the bot. Then you ship the dashboard. Then the auth. Then the billing.
          </h2>
        </Reveal>
        <div className="mkt-grid-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          {items.map(({ Icon, h, p }, i) => (
            <Reveal key={i} delay={i * 80}>
              <div
                style={{
                  background: 'var(--surface)',
                  border: '1px solid var(--hairline)',
                  borderRadius: 12,
                  padding: 24,
                  height: '100%',
                  transition: 'border-color .2s, box-shadow .2s',
                }}
              >
                <div
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 10,
                    background: 'var(--surface)',
                    border: '1px solid var(--hairline)',
                    display: 'grid',
                    placeItems: 'center',
                    color: 'var(--of-primary)',
                    marginBottom: 16,
                  }}
                >
                  <Icon size={18} />
                </div>
                <h3 style={{ fontSize: 17, marginBottom: 6, marginTop: 0, fontWeight: 600 }}>{h}</h3>
                <p style={{ color: 'var(--ink-subtle)', fontSize: 14, margin: 0, lineHeight: 1.6 }}>{p}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── How It Works ─────────────────────────────────────────────────────────────

function HowItWorks() {
  const steps = [
    {
      Icon: Code2,
      n: '01',
      h: 'Drop in the embed script',
      p: 'One <script> tag on any client website — WordPress, Shopify, Wix, or plain HTML. Your Octively bot goes live instantly.',
    },
    {
      Icon: UserPlus,
      n: '02',
      h: 'Invite your client to their portal',
      p: 'They get a magic link to app.octively.com. White-labelled on Agency plan — they see your branding, not ours.',
    },
    {
      Icon: BarChart3,
      n: '03',
      h: 'They track conversations live',
      p: 'Conversations, captured leads, model usage, weekly digest. Export leads to CSV. You stop being the dashboard.',
    },
  ]
  return (
    <section style={{ paddingBlock: 80 }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
        <Reveal
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            marginBottom: 48,
            gap: 24,
            flexWrap: 'wrap',
          }}
        >
          <div style={{ maxWidth: 620 }}>
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
              How it works
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
              Three steps. About four minutes. Then you charge a monthly retainer.
            </h2>
          </div>
          <a
            href="#"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              fontSize: 14,
              color: 'var(--of-primary)',
              textDecoration: 'none',
              fontWeight: 500,
            }}
          >
            Read embed guide <ArrowUpRight size={14} />
          </a>
        </Reveal>
        <div className="mkt-grid-3 mkt-steps-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 0, position: 'relative' }}>
          {steps.map(({ Icon, n, h, p }, i) => (
            <Reveal key={i} delay={i * 100}>
              <div style={{ position: 'relative', padding: '0 24px' }}>
                {i > 0 && (
                  <div
                    className="mkt-step-connector-v"
                    style={{
                      position: 'absolute',
                      left: -1,
                      top: 38,
                      bottom: 0,
                      width: 1,
                      background: 'var(--hairline)',
                    }}
                  />
                )}
                {i < steps.length - 1 && (
                  <div
                    className="mkt-step-connector-h"
                    style={{
                      position: 'absolute',
                      right: -8,
                      top: 28,
                      color: 'var(--ink-muted)',
                      opacity: 0.4,
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                      <path d="M5 12h14" />
                      <path d="m13 5 7 7-7 7" />
                    </svg>
                  </div>
                )}
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 12,
                    background: 'var(--of-primary-soft)',
                    color: 'var(--of-primary-deep)',
                    display: 'grid',
                    placeItems: 'center',
                    marginBottom: 18,
                    border: '1px solid rgba(14,165,233,.2)',
                  }}
                >
                  <Icon size={20} />
                </div>
                <div
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 11,
                    color: 'var(--ink-muted)',
                    marginBottom: 6,
                    letterSpacing: '0.06em',
                  }}
                >
                  STEP {n}
                </div>
                <h3 style={{ fontSize: 19, marginBottom: 8, marginTop: 0, fontWeight: 600 }}>{h}</h3>
                <p style={{ color: 'var(--ink-subtle)', fontSize: 14, margin: 0, lineHeight: 1.6 }}>{p}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Bento Feature Grid ───────────────────────────────────────────────────────

function ConvoRow({ name, snippet, time, lead }: { name: string; snippet: string; time: string; lead?: boolean }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 0', borderTop: '1px solid var(--hairline)' }}>
      <div
        style={{
          width: 22,
          height: 22,
          borderRadius: '50%',
          background: 'var(--surface-2, #EBE7E1)',
          display: 'grid',
          placeItems: 'center',
          fontSize: 10,
          fontWeight: 600,
          color: 'var(--ink-subtle)',
          flexShrink: 0,
        }}
      >
        {name[0]}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 11.5, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{name}</div>
        <div style={{ fontSize: 11, color: 'var(--ink-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{snippet}</div>
      </div>
      {lead && (
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            background: 'var(--of-primary-soft)',
            border: '1px solid rgba(14,165,233,.25)',
            color: 'var(--of-primary-deep)',
            padding: '2px 6px',
            borderRadius: 999,
            fontSize: 9,
            flexShrink: 0,
          }}
        >
          LEAD
        </span>
      )}
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--ink-muted)', flexShrink: 0 }}>{time}</div>
    </div>
  )
}

function BentoConvoList() {
  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ display: 'flex', gap: 6, fontSize: 11, color: 'var(--ink-muted)', fontFamily: 'var(--font-mono)' }}>
        <span style={{ padding: '3px 7px', border: '1px solid var(--hairline-strong)', borderRadius: 6, background: 'var(--surface-2)', color: 'var(--ink)' }}>
          all 1,284
        </span>
        <span style={{ padding: '3px 7px', border: '1px solid var(--hairline)', borderRadius: 6 }}>leads 47</span>
        <span style={{ padding: '3px 7px', border: '1px solid var(--hairline)', borderRadius: 6 }}>this week</span>
      </div>
      <div style={{ background: 'var(--surface-2)', border: '1px solid var(--hairline)', borderRadius: 10, padding: 10 }}>
        <ConvoRow name="Ali R." snippet="What's your delivery to Lahore?" time="2m" lead />
        <ConvoRow name="Sara K." snippet="Do you have iPhone 16 Pro Max in stock?" time="8m" />
        <ConvoRow name="Anonymous" snippet="Aap k store ka address kya hai?" time="14m" />
        <ConvoRow name="Hamza A." snippet="Can I get free pickup in DHA?" time="22m" lead />
      </div>
    </div>
  )
}

function BentoLeadCount() {
  return (
    <div style={{ width: '100%', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 14 }}>
      <div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 38, fontWeight: 600, letterSpacing: '-0.03em', lineHeight: 1 }}>47</div>
        <div style={{ fontSize: 11, color: 'var(--ink-muted)', marginTop: 6 }}>
          leads this month · <span style={{ color: 'var(--of-success)' }}>+22%</span>
        </div>
      </div>
      <svg width="160" height="60" viewBox="0 0 160 60" style={{ overflow: 'visible' }}>
        <defs>
          <linearGradient id="leadGrad" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#0EA5E9" stopOpacity=".35" />
            <stop offset="100%" stopColor="#0EA5E9" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d="M0 45 L20 38 L40 42 L60 30 L80 26 L100 18 L120 22 L140 10 L160 6 L160 60 L0 60 Z" fill="url(#leadGrad)" />
        <path d="M0 45 L20 38 L40 42 L60 30 L80 26 L100 18 L120 22 L140 10 L160 6" fill="none" stroke="#0EA5E9" strokeWidth="1.6" />
      </svg>
    </div>
  )
}

function BentoWhiteLabel() {
  return (
    <div style={{ width: '100%', display: 'flex', gap: 8 }}>
      <div
        style={{
          flex: 1,
          padding: 10,
          borderRadius: 8,
          background: 'var(--surface-2)',
          border: '1px solid var(--hairline)',
          textAlign: 'center',
          fontSize: 11,
          fontFamily: 'var(--font-mono)',
        }}
      >
        chat.youragency.com
      </div>
      <div
        style={{
          flex: 1,
          padding: 10,
          borderRadius: 8,
          background: 'var(--dark-bg)',
          color: 'var(--dark-ink)',
          textAlign: 'center',
          fontSize: 11,
          fontFamily: 'var(--font-mono)',
        }}
      >
        powered by you
      </div>
    </div>
  )
}

function BentoModels() {
  const providers = [
    { name: 'Anthropic', model: 'claude-3.5-sonnet', active: true },
    { name: 'OpenAI', model: 'gpt-4o', active: false },
    { name: 'Google', model: 'gemini-2.0-flash', active: false },
    { name: 'Mistral', model: 'mistral-large', active: false },
  ]
  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 5 }}>
      {providers.map(({ name, model, active }, i) => (
        <div
          key={i}
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '7px 10px',
            borderRadius: 6,
            border: `1px solid ${active ? 'rgba(14,165,233,.35)' : 'var(--hairline)'}`,
            background: active ? 'var(--of-primary-soft)' : 'var(--surface-2)',
            fontFamily: 'var(--font-mono)',
          }}
        >
          <span style={{ color: active ? 'var(--of-primary-deep)' : 'var(--ink)', fontSize: 12, fontWeight: active ? 500 : 400 }}>
            {name}
          </span>
          <span style={{ color: 'var(--ink-muted)', fontSize: 10.5 }}>{model}</span>
        </div>
      ))}
    </div>
  )
}

function BentoIsolation() {
  const cells = [
    { name: 'agency_1', you: false },
    { name: 'client_a', you: true },
    { name: 'agency_2', you: false },
    { name: 'freelance', you: false },
    { name: 'client_b', you: false },
    { name: 'client_c', you: false },
  ]
  return (
    <div style={{ width: '100%', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
      {cells.map((c, i) => (
        <div
          key={i}
          style={{
            aspectRatio: '1.7 / 1',
            background: c.you ? 'var(--of-primary-soft)' : 'var(--surface-2)',
            border: `1px solid ${c.you ? 'rgba(14,165,233,.35)' : 'var(--hairline)'}`,
            borderRadius: 6,
            padding: '6px 8px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 11,
              fontWeight: c.you ? 500 : 400,
              color: c.you ? 'var(--of-primary-deep)' : 'var(--ink-subtle)',
              letterSpacing: '-0.01em',
            }}
          >
            {c.name}
          </span>
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 9,
              color: c.you ? 'var(--of-primary-deep)' : 'var(--ink-muted)',
              opacity: c.you ? 1 : 0.6,
            }}
          >
            ● isolated
          </span>
        </div>
      ))}
    </div>
  )
}

function BentoBotStack() {
  const stacks = ['WordPress', 'Shopify', 'Wix', 'Webflow', 'Squarespace', 'React / Vue', 'HTML', 'Static Sites']
  return (
    <div style={{ width: '100%', display: 'flex', flexWrap: 'wrap', gap: 5 }}>
      {stacks.map((s, i) => (
        <span
          key={i}
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 10.5,
            padding: '4px 8px',
            borderRadius: 6,
            background: 'var(--surface-2)',
            border: '1px solid var(--hairline)',
            color: 'var(--ink-subtle)',
          }}
        >
          {s}
        </span>
      ))}
    </div>
  )
}

function BentoTile({
  span,
  rows,
  Icon: IconComp,
  title,
  sub,
  children,
}: {
  span: number
  rows?: number
  Icon: React.ComponentType<{ size: number }>
  title: string
  sub: string
  children?: React.ReactNode
}) {
  return (
    <div
      style={{
        gridColumn: `span ${span}`,
        gridRow: rows ? `span ${rows}` : undefined,
        display: 'flex',
        flexDirection: 'column',
        gap: 14,
        padding: 22,
        background: 'var(--surface)',
        border: '1px solid var(--hairline)',
        borderRadius: 12,
        overflow: 'hidden',
        position: 'relative',
        transition: 'border-color .2s',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div
          style={{
            width: 34,
            height: 34,
            borderRadius: 9,
            background: 'var(--of-primary-soft)',
            color: 'var(--of-primary-deep)',
            display: 'grid',
            placeItems: 'center',
            border: '1px solid rgba(14,165,233,.2)',
          }}
        >
          <IconComp size={17} />
        </div>
        <h3 style={{ fontSize: 15.5, fontWeight: 600, margin: 0 }}>{title}</h3>
      </div>
      <p style={{ color: 'var(--ink-subtle)', fontSize: 13.5, margin: 0, lineHeight: 1.5 }}>{sub}</p>
      {children && (
        <div style={{ flex: 1, display: 'flex', alignItems: 'flex-end' }}>{children}</div>
      )}
    </div>
  )
}

function FeatureBento() {
  return (
    <section id="features" style={{ paddingBlock: 80, borderTop: '1px solid var(--hairline)', background: 'var(--surface-2)' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
        <Reveal style={{ marginBottom: 36, maxWidth: 720 }}>
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
            Features
          </span>
          <h2 style={{ marginTop: 10, fontSize: 'clamp(24px, 2.8vw, 34px)', fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.2 }}>
            Everything an SMB client wants. Nothing you'd have to build.
          </h2>
          <p style={{ marginTop: 14, color: 'var(--ink-subtle)', fontSize: 16, lineHeight: 1.6 }}>
            Conversations, leads, a knowledge base, AI model control, and white-label branding. All wired to your existing bot.
          </p>
        </Reveal>
        <Reveal>
          <div
            className="mkt-bento"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(6, 1fr)',
              gap: 14,
              gridAutoRows: 'minmax(180px, auto)',
            }}
          >
            <BentoTile span={3} rows={2} Icon={MessageSquare} title="Conversation management" sub="Every conversation, fully searchable. Filter by date, lead status, or how long the chat ran.">
              <BentoConvoList />
            </BentoTile>
            <BentoTile span={3} Icon={Zap} title="Lead capture & export" sub="The bot catches leads automatically. Your client exports them to CSV when they want them.">
              <BentoLeadCount />
            </BentoTile>
            <BentoTile span={3} Icon={Palette} title="White-label branding" sub="Strip every trace of Octively on Agency plan. Custom subdomains. Your widget, your logo, your portal.">
              <BentoWhiteLabel />
            </BentoTile>
            <BentoTile span={2} Icon={Cpu} title="Multi-provider AI" sub="OpenAI, Anthropic, Google, DeepSeek, Mistral & more. Switch per bot. Never locked in.">
              <BentoModels />
            </BentoTile>
            <BentoTile span={2} Icon={Shield} title="Tenant isolation" sub="Every query scoped to bot_id. No cross-leaks. Audited by design.">
              <BentoIsolation />
            </BentoTile>
            <BentoTile span={2} Icon={Globe} title="Embeds anywhere" sub="One script tag. Drop it on WordPress, Shopify, Wix, or any HTML site. Live in minutes.">
              <BentoBotStack />
            </BentoTile>
          </div>
        </Reveal>
      </div>
    </section>
  )
}

// ─── Pricing Teaser ───────────────────────────────────────────────────────────

function PricingTeaser() {
  const [currency, setCurrency] = useState<'PKR' | 'USD'>('PKR')
  const plans = [
    { key: 'free', name: 'Free', pkr: 0, usd: 0, blurb: '1 bot · 200 convos · 2M credits/mo', feats: ['15 leads/month · 5 FAQs per bot', '7-day conversation history', 'Color-only widget customization', 'WordPress plugin · community support'] },
    { key: 'starter', name: 'Starter', pkr: 2500, usd: 15, blurb: '2 bots · 3K convos · 30M credits/mo', feats: ['Unlimited leads · 20 FAQs per bot', '25 MB storage · 30-day history', 'Full widget · budget AI models', 'Lead capture · strict mode · email support'] },
    { key: 'pro', name: 'Pro', pkr: 7500, usd: 29, blurb: '8 bots · 15K convos · 150M credits/mo', feats: ['Unlimited leads · 50 FAQs · 100 MB storage', 'Unlimited history · mid-range AI models', 'Advanced analytics · unanswered questions', 'PDF upload · scraping · smart routing (Ph. 3)'], featured: true },
  ]
  const fmt = (pkr: number, usd: number) =>
    currency === 'PKR' ? (pkr === 0 ? '₨0' : `₨${pkr.toLocaleString()}`) : (usd === 0 ? '$0' : `$${usd}`)

  return (
    <section style={{ paddingBlock: 80 }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
        <Reveal
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            marginBottom: 32,
            flexWrap: 'wrap',
            gap: 24,
          }}
        >
          <div style={{ maxWidth: 620 }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--of-primary)', fontWeight: 500 }}>
              Pricing
            </span>
            <h2 style={{ marginTop: 10, fontSize: 'clamp(24px, 2.8vw, 34px)', fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.2 }}>
              Local pricing for Pakistani agencies. Fair USD for everyone else.
            </h2>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
            {/* Currency pill */}
            <div
              role="tablist"
              style={{
                display: 'inline-flex',
                padding: 4,
                gap: 2,
                background: 'var(--surface-2)',
                border: '1px solid var(--hairline)',
                borderRadius: 999,
              }}
            >
              {(['PKR', 'USD'] as const).map((k) => (
                <button
                  key={k}
                  onClick={() => setCurrency(k)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: 999,
                    border: 0,
                    background: currency === k ? 'var(--surface)' : 'transparent',
                    color: currency === k ? 'var(--ink)' : 'var(--ink-subtle)',
                    fontSize: 13,
                    fontWeight: currency === k ? 500 : 400,
                    cursor: 'pointer',
                    fontFamily: 'var(--font-mono)',
                    transition: 'all .15s',
                  }}
                >
                  {k === 'PKR' ? '₨ PKR' : '$ USD'}
                </button>
              ))}
            </div>
            <Link
              href="/pricing"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                fontSize: 14,
                color: 'var(--of-primary)',
                textDecoration: 'none',
                fontWeight: 500,
              }}
            >
              Full pricing & comparison <ArrowUpRight size={14} />
            </Link>
          </div>
        </Reveal>
        <div className="mkt-grid-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
          {plans.map((p) => {
            const price = fmt(p.pkr, p.usd)
            const suffix = p.pkr === 0 ? '' : '/mo'
            const featured = (p as { featured?: boolean }).featured
            return (
              <Reveal key={p.key} delay={plans.indexOf(p) * 80}>
                <div
                  style={
                    featured
                      ? {
                          background: 'var(--dark-bg)',
                          color: 'var(--dark-ink)',
                          borderRadius: 14,
                          padding: 24,
                          border: '1px solid var(--dark-hairline-strong)',
                          boxShadow: 'var(--shadow-lg)',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 14,
                          position: 'relative',
                          height: '100%',
                        }
                      : {
                          background: 'var(--surface)',
                          borderRadius: 14,
                          padding: 24,
                          border: '1px solid var(--hairline)',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 14,
                          height: '100%',
                          transition: 'border-color .2s, box-shadow .2s',
                        }
                  }
                >
                  {featured && (
                    <span
                      style={{
                        position: 'absolute',
                        top: -10,
                        right: 18,
                        background: 'var(--of-primary)',
                        color: 'white',
                        borderColor: 'transparent',
                        fontSize: 10,
                        fontFamily: 'var(--font-mono)',
                        padding: '2px 8px',
                        borderRadius: 999,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 4,
                      }}
                    >
                      <Sparkles size={9} /> MOST POPULAR
                    </span>
                  )}
                  <div>
                    <div style={{ fontSize: 13.5, fontWeight: 600 }}>{p.name}</div>
                    <div style={{ fontSize: 12, color: featured ? 'var(--dark-ink-muted)' : 'var(--ink-muted)', marginTop: 2 }}>{p.blurb}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 34, fontWeight: 600, letterSpacing: '-0.03em', lineHeight: 1 }}>{price}</span>
                    {suffix && <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: featured ? 'var(--dark-ink-muted)' : 'var(--ink-muted)' }}>{suffix}</span>}
                  </div>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {p.feats.map((f, i) => (
                      <li key={i} style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 13, color: featured ? 'var(--dark-ink)' : 'var(--ink)' }}>
                        <Check size={14} style={{ color: 'var(--of-primary)', flexShrink: 0 }} /> {f}
                      </li>
                    ))}
                  </ul>
                  <Link
                    href="/dashboard/signup"
                    style={{
                      marginTop: 4,
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      gap: 6,
                      padding: '10px 16px',
                      borderRadius: 8,
                      fontSize: 14,
                      fontWeight: 500,
                      textDecoration: 'none',
                      transition: 'background-color .15s',
                      ...(featured
                        ? { background: 'var(--of-primary)', color: 'white', border: '1px solid transparent' }
                        : { background: 'transparent', color: 'var(--ink)', border: '1px solid var(--hairline)' }),
                    }}
                  >
                    Get started
                  </Link>
                </div>
              </Reveal>
            )
          })}
        </div>
      </div>
    </section>
  )
}

// ─── Testimonials ─────────────────────────────────────────────────────────────

const QUOTES_ROW_1 = [
  { q: 'Used to spend a full day writing weekly chatbot reports for clients. Now they log in and see live numbers — and I bill them ₨15k/mo for the dashboard. Octively paid for itself in week one.', name: 'Owais A.', role: 'Solo dev · Karachi', initials: 'OA' },
  { q: 'We were paying $497/mo for Stammer.ai and getting buried in feature bloat. Switched 7 client bots to Octively Agency. Cleaner portal, white-labelled, 80% less spend.', name: 'Hira K.', role: 'Agency owner · Lahore', initials: 'HK' },
  { q: 'The credit system is the killer feature. I let small clients use the included models, and upsell premium clients onto flagship tiers without lifting a finger.', name: 'Bilal Q.', role: 'Founder · TalkBox.pk', initials: 'BQ' },
  { q: 'I onboarded a tea-export client in 12 minutes. They were sending Urdu queries to the bot and getting Urdu replies. Their finance team now exports leads to CSV themselves.', name: 'Maryam S.', role: 'Freelancer · Islamabad', initials: 'MS' },
]
const QUOTES_ROW_2 = [
  { q: 'The white-label is real white-label. My client sees chat.boltagency.com, my logo on the widget, my email on receipts. Not a single Octively pixel anywhere.', name: 'Daniyal R.', role: 'Bolt Agency · Lahore', initials: 'DR' },
  { q: 'Switched four clients off Botpress in a weekend. Embed key swap, that\'s the whole migration. Conversation history came along via the import endpoint.', name: 'Saad M.', role: 'Indie dev · Faisalabad', initials: 'SM' },
  { q: 'Tenant isolation is what got our retainer client to actually sign. They wouldn\'t touch a shared SaaS — now they review their own portal and never email me about it.', name: 'Fatima Z.', role: 'Co-founder · Stackbot', initials: 'FZ' },
  { q: 'I bill in PKR via PayFast, my UK client pays USD via Lemon Squeezy, both land in the same dashboard. No more two-spreadsheet accounting.', name: 'Aamir T.', role: 'Agency · Karachi → London', initials: 'AT' },
]

function TestimonialCard({ q, dark }: { q: (typeof QUOTES_ROW_1)[0]; dark: boolean }) {
  return (
    <div
      style={{
        flexShrink: 0,
        width: 380,
        background: dark ? 'var(--dark-surface)' : 'var(--surface)',
        border: `1px solid ${dark ? 'var(--dark-hairline)' : 'var(--hairline)'}`,
        borderRadius: 14,
        padding: 22,
        display: 'flex',
        flexDirection: 'column',
        gap: 14,
        color: dark ? 'var(--dark-ink)' : 'var(--ink)',
      }}
    >
      <Sparkles size={14} style={{ color: 'var(--of-primary)', flexShrink: 0 }} />
      <div style={{ fontSize: 14, lineHeight: 1.55 }}>&ldquo;{q.q}&rdquo;</div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          marginTop: 'auto',
          paddingTop: 6,
          borderTop: `1px solid ${dark ? 'var(--dark-hairline)' : 'var(--hairline)'}`,
        }}
      >
        <div
          style={{
            width: 30,
            height: 30,
            borderRadius: '50%',
            background: 'var(--of-primary)',
            display: 'grid',
            placeItems: 'center',
            color: 'white',
            fontSize: 10.5,
            fontWeight: 600,
            flexShrink: 0,
          }}
        >
          {q.initials}
        </div>
        <div>
          <div style={{ fontSize: 12.5, fontWeight: 500 }}>{q.name}</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10.5, color: dark ? 'var(--dark-ink-muted)' : 'var(--ink-muted)' }}>
            {q.role}
          </div>
        </div>
      </div>
    </div>
  )
}

function MarqueeRow({ items, direction, speed, dark }: { items: typeof QUOTES_ROW_1; direction: 'L' | 'R'; speed: number; dark: boolean }) {
  const loop = [...items, ...items]
  return (
    <div
      style={{
        width: '100%',
        overflow: 'hidden',
        maskImage: 'linear-gradient(to right, transparent, black 6%, black 94%, transparent)',
        WebkitMaskImage: 'linear-gradient(to right, transparent, black 6%, black 94%, transparent)',
      }}
    >
      <div
        style={{
          display: 'flex',
          gap: 14,
          width: 'max-content',
          animation: `marquee${direction} ${speed}s linear infinite`,
        }}
      >
        {loop.map((q, i) => (
          <TestimonialCard key={i} q={q} dark={dark} />
        ))}
      </div>
    </div>
  )
}

function Testimonials({ dark = true }: { dark?: boolean }) {
  return (
    <section
      style={{
        paddingBlock: 72,
        overflow: 'hidden',
        background: dark ? 'var(--dark-bg)' : 'var(--surface-2)',
        borderTop: '1px solid var(--hairline)',
      }}
    >
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', marginBottom: 32 }}>
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
          From the field
        </span>
        <h2
          style={{
            marginTop: 10,
            maxWidth: 760,
            fontSize: 'clamp(24px, 2.8vw, 34px)',
            fontWeight: 700,
            letterSpacing: '-0.02em',
            lineHeight: 1.2,
            color: dark ? 'var(--dark-ink)' : 'var(--ink)',
          }}
        >
          Built by an agency dev for agency devs.
        </h2>
        <p
          style={{
            marginTop: 10,
            color: dark ? 'var(--dark-ink-subtle)' : 'var(--ink-subtle)',
            fontSize: 16,
            lineHeight: 1.6,
            maxWidth: 560,
          }}
        >
          Real reviews from developers and agencies Octively was built for.
        </p>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <MarqueeRow items={QUOTES_ROW_1} direction="L" speed={64} dark={dark} />
        <MarqueeRow items={QUOTES_ROW_2} direction="R" speed={72} dark={dark} />
      </div>
    </section>
  )
}

// ─── CTA Banner ───────────────────────────────────────────────────────────────

function CTABanner() {
  return (
    <section style={{ paddingBlock: 80 }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
        <Reveal>
          <div
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--hairline-strong)',
              borderRadius: 20,
              padding: '56px 40px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 18,
              textAlign: 'center',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div className="mkt-grid-bg" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }} />
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                fontSize: 11,
                padding: '4px 12px',
                borderRadius: 999,
                border: '1px solid rgba(14,165,233,.3)',
                background: 'var(--of-primary-soft)',
                color: 'var(--of-primary-deep)',
                fontWeight: 500,
                position: 'relative',
              }}
            >
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--of-primary)' }} />
              Free forever · No credit card
            </span>
            <h2
              style={{
                position: 'relative',
                maxWidth: 700,
                fontSize: 'clamp(28px, 3.5vw, 42px)',
                fontWeight: 700,
                letterSpacing: '-0.02em',
                lineHeight: 1.15,
              }}
            >
              Start in 60 seconds. Bill your first retainer this week.
            </h2>
            <p style={{ position: 'relative', textAlign: 'center', maxWidth: 540, fontSize: 16, color: 'var(--ink-muted)', lineHeight: 1.6 }}>
              Create your first Octively bot, add it to your client&apos;s site, invite them to their portal. That&apos;s the whole onboarding.
            </p>
            <div
              style={{
                display: 'flex',
                gap: 10,
                flexWrap: 'wrap',
                justifyContent: 'center',
                position: 'relative',
                marginTop: 4,
              }}
            >
              <Link
                href="/dashboard/signup"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '13px 22px',
                  borderRadius: 10,
                  fontSize: 15,
                  fontWeight: 600,
                  background: 'var(--of-primary)',
                  color: 'white',
                  textDecoration: 'none',
                  border: '1px solid transparent',
                  transition: 'background-color .15s',
                }}
              >
                Create your first bot portal <ArrowRight size={16} />
              </Link>
              <a
                href="#"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '13px 22px',
                  borderRadius: 10,
                  fontSize: 15,
                  fontWeight: 500,
                  color: 'var(--ink)',
                  border: '1px solid var(--hairline-strong)',
                  textDecoration: 'none',
                  background: 'transparent',
                  transition: 'border-color .15s',
                }}
              >
                Talk to Owais
              </a>
            </div>
            <div
              style={{
                fontFamily: 'var(--font-mono)',
                position: 'relative',
                fontSize: 12,
                color: 'var(--ink-muted)',
                marginTop: 4,
              }}
            >
              Pay in PKR or USD · Cancel any time
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}

// ─── Hero ─────────────────────────────────────────────────────────────────────

function HeroLeadCopy() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
      <span
        style={{
          alignSelf: 'flex-start',
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          fontFamily: 'var(--font-mono)',
          fontSize: 11,
          padding: '4px 12px',
          borderRadius: 999,
          border: '1px solid rgba(14,165,233,.3)',
          background: 'var(--of-primary-soft)',
          color: 'var(--of-primary-deep)',
          fontWeight: 500,
        }}
      >
        <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--of-primary)' }} />
        v0.9 — Now in beta
      </span>
      <h1
        style={{
          fontSize: 'clamp(38px, 5vw, 60px)',
          fontWeight: 700,
          letterSpacing: '-0.03em',
          lineHeight: 1.08,
          margin: 0,
          color: 'var(--ink)',
        }}
      >
        Give every client their own
        <br />
        <span style={{ color: 'var(--of-primary)' }}>chatbot portal.</span>
      </h1>
      <p style={{ fontSize: 17, color: 'var(--ink-muted)', lineHeight: 1.65, margin: 0, maxWidth: '52ch' }}>
        Octively runs your AI chatbots and gives every client their own portal. Conversations, leads, analytics. One embed script. No rebuilding.
      </p>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <Link
          href="/dashboard/signup"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '13px 22px',
            borderRadius: 10,
            fontSize: 15,
            fontWeight: 600,
            background: 'var(--of-primary)',
            color: 'white',
            textDecoration: 'none',
            border: '1px solid transparent',
            transition: 'background-color .15s',
          }}
        >
          Start free <ArrowRight size={16} />
        </Link>
        <a
          href="#"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '13px 22px',
            borderRadius: 10,
            fontSize: 15,
            fontWeight: 500,
            color: 'var(--ink)',
            border: '1px solid var(--hairline-strong)',
            textDecoration: 'none',
            transition: 'border-color .15s',
          }}
        >
          Watch 60-sec demo
        </a>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 14, color: 'var(--ink-muted)', fontSize: 13, marginTop: 4 }}>
        <span style={{ fontFamily: 'var(--font-mono)', display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--of-success)' }} />
          200+ bots deployed
        </span>
        <span style={{ color: 'var(--hairline-strong)' }}>·</span>
        <span style={{ fontFamily: 'var(--font-mono)' }}>₨0 to start · No credit card</span>
      </div>
    </div>
  )
}

// ─── Root Component ───────────────────────────────────────────────────────────

export default function MarketingHome() {
  const { dark: darkMode, toggleDark } = useDarkMode()

  return (
    <div
      className={`marketing${darkMode ? ' dark' : ''}`}
      style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--ink)' }}
    >
      <MarketingNav dark={darkMode} onToggleDark={toggleDark} />

      {/* Hero */}
      <section
        style={{
          paddingTop: 48,
          paddingBottom: 40,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Grid background on its own layer so mask-image doesn't affect content */}
        <div className="mkt-grid-bg" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }} />
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', position: 'relative' }}>
          <div
            className="mkt-hero-grid"
            style={{
              display: 'grid',
              gridTemplateColumns: 'minmax(0, 1.05fr) minmax(0, 1fr)',
              gap: 56,
              alignItems: 'center',
            }}
          >
            <HeroLeadCopy />
            <div className="mkt-hero-mockup" style={{ position: 'relative' }}>
              <PortalMockup />
              <span className="mkt-embed-chip"><FloatingEmbedChip /></span>
            </div>
          </div>
        </div>
      </section>

      <LogoBar />
      <ProblemStrip />
      <HowItWorks />
      <FeatureBento />
      <PricingTeaser />
      <Testimonials dark={true} />
      <CTABanner />
      <MarketingFooter />
    </div>
  )
}
