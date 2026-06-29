'use client'

import { useRef, useState } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { MessageSquare, UserPlus, Globe, BarChart2, Code2, Copy, Check } from 'lucide-react'

// ── Layout constants (keep in sync with mockup DOM) ──────────────────────────
// Chrome bar  ≈ 34 px.  Grid height fixed 220 px.  Total container ≈ 254 px.
// Sidebar width 76 px (max-width 380 px container).
// Nav item centres from container top:
//   chrome(34) + sidebar-pad-top(10) + logo-row(21) = 65 px offset before first item
//   each item ≈ 19 px tall (pad 5+5 + icon/text ~9 px) + 1 px gap
//   Bots   : 65 + 9.5            = 74.5 px → 74.5/254 ≈ 29 %
//   Leads  : 74.5 + 20           = 94.5 px → 94.5/254 ≈ 37 %
//   Clients: 94.5 + 20           = 114.5 px → 114.5/254 ≈ 45 %
// Bot row centres (grid starts at 34 px, BotsScreen pad-top 14 px, header ~24 px):
//   row-0 centre: 34+14+24+13 = 85 px → 85/254 ≈ 33 %
//   row-1 centre: 85+30        = 115 px → 45 %

const STEPS = [
  { title: 'Build your AI agent',          desc: 'Visual dashboard, no code required' },
  { title: 'Deploy with one script tag',   desc: 'Paste into any client website in 30 seconds' },
  { title: 'Leads captured automatically', desc: 'Every conversation turns into a lead record' },
  { title: 'Clients get their own portal', desc: 'They log in and see their data. You keep control.' },
  { title: 'Track performance at a glance', desc: 'Conversations, leads, and response rates in one view' },
  { title: 'All your agents, one place',   desc: 'Switch between clients without losing context' },
]

const NAV_ITEMS = [
  { label: 'Agents',     Icon: MessageSquare },
  { label: 'Leads',     Icon: UserPlus },
  { label: 'Clients',   Icon: Globe },
  { label: 'Analytics', Icon: BarChart2 },
]

// ── SVG cursor ───────────────────────────────────────────────────────────────
function CursorSVG() {
  return (
    <svg width="18" height="22" viewBox="0 0 18 22" fill="none"
      style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.45))' }}>
      <path d="M2 2L2 16.5L5.5 13L8 19L10 18L7.5 12L12.5 12L2 2Z"
        fill="white" stroke="#0C0A09" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  )
}

// ── Bots screen ──────────────────────────────────────────────────────────────
function BotsScreen({
  activeBotIdx,
  showEmbed,
  showCopied,
}: {
  activeBotIdx: number
  showEmbed: boolean
  showCopied: boolean
}) {
  const bots = [
    { name: 'Karachi Kurta Co.', convos: 142 },
    { name: 'Pak Travels',        convos: 89  },
    { name: 'MediCare Clinic',    convos: 54  },
  ]

  return (
    <div style={{ padding: '14px 16px 0', height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink)', letterSpacing: '-0.01em' }}>My Agents</span>
        <span style={{
          fontSize: 9, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase',
          color: 'var(--of-primary)', background: 'var(--of-primary-soft)', padding: '2px 7px', borderRadius: 4,
        }}>+ New agent</span>
      </div>

      {/* Bot rows */}
      {bots.map((bot, i) => (
        <div key={i} style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '7px 8px', borderRadius: 6, marginBottom: 4,
          background: i === activeBotIdx ? 'rgba(14,165,233,0.14)' : 'transparent',
          border: i === activeBotIdx ? '1px solid rgba(14,165,233,0.2)' : '1px solid transparent',
          transition: 'background 0.2s, border-color 0.2s',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <span style={{
              width: 6, height: 6, borderRadius: '50%',
              background: i === activeBotIdx ? 'var(--of-primary)' : 'var(--ink-subtle)',
              flexShrink: 0, transition: 'background 0.2s',
            }} />
            <span style={{ fontSize: 10, fontWeight: 500, color: 'var(--ink)' }}>{bot.name}</span>
          </div>
          <span style={{ fontSize: 9, fontFamily: 'var(--font-mono)', color: 'var(--ink-muted)' }}>
            {bot.convos} convos
          </span>
        </div>
      ))}

      {/* Embed block — always in DOM, opacity transition keeps height stable */}
      <div style={{
        marginTop: 8,
        background: '#0C0A09',
        borderRadius: 0,
        padding: '7px 10px 8px',
        border: '1px solid rgba(14,165,233,0.25)',
        opacity: showEmbed ? 1 : 0,
        transition: 'opacity 0.3s ease',
        flexShrink: 0,
      }}>
        {/* Label + copy button */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 5 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <Code2 size={9} style={{ color: 'var(--of-primary)' }} />
            <span style={{ fontSize: 8, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--of-primary)' }}>
              Embed script
            </span>
          </div>
          {/* Copy button — cursor clicks here */}
          <div style={{ position: 'relative' }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 3,
              padding: '2px 6px',
              border: '1px solid rgba(14,165,233,0.35)',
              borderRadius: 3,
              cursor: 'default',
              background: showCopied ? 'rgba(14,165,233,0.15)' : 'transparent',
              transition: 'background 0.2s',
            }}>
              {showCopied
                ? <Check size={8} style={{ color: '#22C55E' }} />
                : <Copy size={8} style={{ color: 'rgba(14,165,233,0.7)' }} />}
              <span style={{
                fontSize: 8, fontFamily: 'var(--font-mono)',
                color: showCopied ? '#22C55E' : 'rgba(14,165,233,0.7)',
                transition: 'color 0.2s',
              }}>
                {showCopied ? 'Copied!' : 'Copy'}
              </span>
            </div>
          </div>
        </div>

        {/* Code */}
        <code style={{
          display: 'block', fontFamily: 'var(--font-mono)', fontSize: 7.5,
          color: '#7DD3FC', lineHeight: 1.65, whiteSpace: 'pre',
        }}>
          {'<script\n  src="https://octively.com/e.js"\n  data-bot="k-kurta-co"\n></script>'}
        </code>
      </div>
    </div>
  )
}

// ── Leads screen ─────────────────────────────────────────────────────────────
function LeadsScreen() {
  return (
    <div style={{ padding: '14px 16px' }}>
      <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink)', letterSpacing: '-0.01em', display: 'block', marginBottom: 10 }}>
        Recent Leads
      </span>
      {[
        { name: 'Ahmed K.',  email: 'ahmed@...',  time: '2m ago'  },
        { name: 'Sana M.',   email: 'sana@...',   time: '18m ago' },
        { name: 'Omar F.',   email: 'omar@...',   time: '1h ago'  },
      ].map((l, i) => (
        <div key={i} style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '6px 8px', borderRadius: 6, marginBottom: 3,
          background: 'var(--surface-2)',
        }}>
          <div>
            <div style={{ fontSize: 10, fontWeight: 500, color: 'var(--ink)' }}>{l.name}</div>
            <div style={{ fontSize: 9, color: 'var(--ink-muted)', fontFamily: 'var(--font-mono)' }}>{l.email}</div>
          </div>
          <span style={{ fontSize: 9, color: 'var(--ink-subtle)' }}>{l.time}</span>
        </div>
      ))}
    </div>
  )
}

// ── Clients screen ────────────────────────────────────────────────────────────
function ClientsScreen() {
  return (
    <div style={{ padding: '14px 16px' }}>
      <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink)', letterSpacing: '-0.01em', display: 'block', marginBottom: 10 }}>
        Client Portals
      </span>
      {[
        { name: 'Karachi Kurta Co.', status: 'Active'  },
        { name: 'Pak Travels',        status: 'Active'  },
        { name: 'MediCare Clinic',    status: 'Invited' },
      ].map((c, i) => (
        <div key={i} style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '7px 8px', borderRadius: 6, marginBottom: 4,
          background: 'var(--surface-2)',
        }}>
          <span style={{ fontSize: 10, fontWeight: 500, color: 'var(--ink)' }}>{c.name}</span>
          <span style={{
            fontSize: 8, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase',
            color: c.status === 'Active' ? 'var(--of-success)' : 'var(--ink-muted)',
            background: c.status === 'Active' ? 'var(--of-success-soft)' : 'var(--surface)',
            padding: '2px 6px', borderRadius: 4,
          }}>{c.status}</span>
        </div>
      ))}
    </div>
  )
}

// ── Analytics screen ─────────────────────────────────────────────────────────
function AnalyticsScreen() {
  const stats = [
    { label: 'Conversations', value: '1,284', delta: '+12%' },
    { label: 'Leads captured', value: '187',   delta: '+8%'  },
    { label: 'Avg. response',  value: '1.4s',  delta: '—'    },
  ]
  const bars = [42, 67, 55, 80, 63, 74, 88]
  return (
    <div style={{ padding: '14px 16px' }}>
      <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink)', letterSpacing: '-0.01em', display: 'block', marginBottom: 10 }}>
        Analytics
      </span>
      {/* Stat tiles */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 5, marginBottom: 12 }}>
        {stats.map((s, i) => (
          <div key={i} style={{ background: 'var(--surface-2)', padding: '6px 7px', borderRadius: 4 }}>
            <div style={{ fontSize: 12, fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--ink)', lineHeight: 1 }}>
              {s.value}
            </div>
            <div style={{ fontSize: 8, color: 'var(--ink-muted)', marginTop: 2 }}>{s.label}</div>
            <div style={{ fontSize: 8, color: s.delta.startsWith('+') ? 'var(--of-success)' : 'var(--ink-subtle)', marginTop: 1 }}>
              {s.delta}
            </div>
          </div>
        ))}
      </div>
      {/* Mini bar chart */}
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 40 }}>
        {bars.map((h, i) => (
          <div key={i} style={{
            flex: 1, borderRadius: 2,
            height: `${h}%`,
            background: i === bars.length - 1 ? 'var(--of-primary)' : 'var(--of-primary-soft)',
            transition: 'height 0.4s ease',
          }} />
        ))}
      </div>
      <div style={{ fontSize: 8, color: 'var(--ink-subtle)', marginTop: 4 }}>Last 7 days</div>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────
export function AuthDemoPanel() {
  const containerRef  = useRef<HTMLDivElement>(null)
  const cursorRef     = useRef<HTMLDivElement>(null)

  // Animation state driven by GSAP .call() hooks
  const [step,         setStep]         = useState(0)
  const [activeBotIdx, setActiveBotIdx] = useState(-1)   // -1 = no bot selected
  const [showEmbed,    setShowEmbed]    = useState(false)
  const [showCopied,   setShowCopied]   = useState(false)
  const [activeNav,    setActiveNav]    = useState(0)

  // ── GSAP timeline ─────────────────────────────────────────────────────────
  // Container = chrome(~34px) + grid(250px) = 284px total.
  // Sidebar nav x centre ≈ 9% (35px/380px).
  // Nav y centres: Bots 26%, Leads 33%, Clients 40% — click targets shifted +3% down.
  // Bot row-0 centre ≈ 33%. Embed copy button ≈ (84%, 76%).
  useGSAP(() => {
    const c = cursorRef.current!
    const ease = 'power3.inOut'
    const dn = { scale: 0.80, duration: 0.07 }
    const up = { scale: 1.00, duration: 0.10 }

    const tl = gsap.timeline({ repeat: -1 })

    // ── Step 0: hover on Karachi Kurta Co (no bot selected) ──────────────────
    tl.set(c, { left: '55%', top: '33%' })
      .call(() => { setStep(0); setActiveBotIdx(-1); setActiveNav(0); setShowEmbed(false); setShowCopied(false) })
      .to({}, { duration: 1.2 })

      // click → bot highlights + embed appears immediately
      .to(c, { ...dn, ease }).to(c, { ...up, ease })
      .call(() => { setActiveBotIdx(0); setShowEmbed(true); setStep(1) })
      .to({}, { duration: 0.5 })

    // ── Step 1: move to embed Copy button ────────────────────────────────────
      .to(c, { left: '84%', top: '74%', duration: 0.8, ease })
      .to({}, { duration: 0.7 })  // let embed fully fade in before clicking
      .to(c, { ...dn, ease }).to(c, { ...up, ease })
      .call(() => setShowCopied(true))
      .to({}, { duration: 1.4 })
      .call(() => setShowCopied(false))
      .to({}, { duration: 0.4 })

    // ── Step 2: click Leads nav tab ───────────────────────────────────────────
      .to(c, { left: '9%', top: '39%', duration: 0.85, ease })
      .to(c, { ...dn, ease }).to(c, { ...up, ease })
      .call(() => { setStep(2); setActiveNav(1) })
      .to({}, { duration: 2.4 })

    // ── Step 3: click Clients nav tab ─────────────────────────────────────────
      .to(c, { left: '9%', top: '47%', duration: 0.7, ease })
      .to(c, { ...dn, ease }).to(c, { ...up, ease })
      .call(() => { setStep(3); setActiveNav(2) })
      .to({}, { duration: 2.2 })

    // ── Step 4: click Analytics nav tab ──────────────────────────────────────
    // Analytics nav centre: Clients(114.5) + 20 = 134.5px → 134.5/284 ≈ 47%  click +3% = 50%
      .to(c, { left: '9%', top: '55%', duration: 0.7, ease })
      .to(c, { ...dn, ease }).to(c, { ...up, ease })
      .call(() => { setStep(4); setActiveNav(3) })
      .to({}, { duration: 2.0 })

    // ── Step 5: click Bots nav tab (closes the loop naturally) ───────────────
      .to(c, { left: '9%', top: '29%', duration: 0.7, ease })
      .to(c, { ...dn, ease }).to(c, { ...up, ease })
      .call(() => { setStep(5); setActiveNav(0); setActiveBotIdx(-1); setShowEmbed(false) })
      .to({}, { duration: 1.0 })

    // ── Return cursor to bot-row area — seamless repeat ───────────────────────
      .to(c, { left: '55%', top: '33%', duration: 0.8, ease })
      .to({}, { duration: 0.4 })

  }, { scope: containerRef })

  return (
    <div style={{ width: '100%', maxWidth: 380, display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* Header copy */}
      <div>
        <p style={{
          fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase',
          color: 'var(--of-primary)', marginBottom: 8, fontFamily: 'var(--font-mono)',
        }}>
          Octively dashboard
        </p>
        <h2 style={{
          fontSize: 'clamp(17px, 1.8vw, 21px)', fontWeight: 700, letterSpacing: '-0.02em',
          lineHeight: 1.25, color: 'var(--ink)', marginBottom: 5,
        }}>
          {STEPS[step].title}
        </h2>
        <p style={{ fontSize: 13, color: 'var(--ink-muted)', lineHeight: 1.5 }}>
          {STEPS[step].desc}
        </p>
      </div>

      {/* Dashboard mockup */}
      <div
        ref={containerRef}
        style={{
          position: 'relative',
          borderRadius: 0,
          border: '1px solid var(--hairline-strong)',
          overflow: 'hidden',
          boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
        }}
      >
        {/* Browser chrome */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px',
          background: 'var(--surface-2)', borderBottom: '1px solid var(--hairline)',
        }}>
          <div style={{ display: 'flex', gap: 5 }}>
            {['#FF5F57', '#FEBC2E', '#28C840'].map((c, i) => (
              <span key={i} style={{ width: 9, height: 9, borderRadius: '50%', background: c }} />
            ))}
          </div>
          <div style={{
            flex: 1, background: 'var(--surface)', borderRadius: 0, padding: '3px 8px',
            fontSize: 9, fontFamily: 'var(--font-mono)', color: 'var(--ink-muted)',
            border: '1px solid var(--hairline)',
          }}>
            admin.octively.com/dashboard
          </div>
        </div>

        {/* App grid — FIXED height 250px so embed block (≈84px) fits fully */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '76px 1fr',
          height: 250,
          background: 'var(--surface)',
          overflow: 'hidden',
        }}>
          {/* Sidebar */}
          <aside style={{
            borderRight: '1px solid var(--hairline)',
            padding: '10px 6px',
            background: 'var(--surface-2)',
            display: 'flex', flexDirection: 'column',
            height: '100%',
            fontFamily: 'var(--font-mono)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '2px 4px 10px' }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--of-primary)', flexShrink: 0 }} />
              <span style={{ fontSize: 9, fontWeight: 600, color: 'var(--ink)' }}>Octively</span>
            </div>
            {NAV_ITEMS.map(({ label, Icon }, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 5, padding: '5px 6px',
                borderRadius: 4, marginBottom: 1,
                background: i === activeNav ? 'var(--of-primary-soft)' : 'transparent',
                color: i === activeNav ? 'var(--of-primary-deep)' : 'var(--ink-subtle)',
                transition: 'background 0.25s, color 0.25s',
              }}>
                <Icon size={9} />
                <span style={{ fontSize: 8.5 }}>{label}</span>
              </div>
            ))}
          </aside>

          {/* Main content — clips to grid height */}
          <div style={{ overflow: 'hidden', height: '100%' }}>
            {activeNav === 0 && (
              <BotsScreen activeBotIdx={activeBotIdx} showEmbed={showEmbed} showCopied={showCopied} />
            )}
            {activeNav === 1 && <LeadsScreen />}
            {activeNav === 2 && <ClientsScreen />}
            {activeNav === 3 && <AnalyticsScreen />}
          </div>
        </div>

        {/* Animated cursor */}
        <div
          ref={cursorRef}
          style={{
            position: 'absolute',
            left: '55%',
            top: '33%',
            pointerEvents: 'none',
            zIndex: 10,
          }}
        >
          <CursorSVG />
        </div>
      </div>

      {/* Step dots */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        {STEPS.map((_, i) => (
          <span key={i} style={{
            width: i === step ? 20 : 6, height: 6, borderRadius: 3,
            background: i === step ? 'var(--of-primary)' : 'var(--hairline-strong)',
            transition: 'all 0.35s ease',
          }} />
        ))}
      </div>

    </div>
  )
}
