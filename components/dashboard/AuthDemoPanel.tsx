'use client'

import { useEffect, useRef, useState } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { MessageSquare, UserPlus, Globe, BarChart2, Code2 } from 'lucide-react'

gsap.registerPlugin()

// ── Feature steps cycled by the animated cursor ─────────────────────────────
const STEPS = [
  {
    id: 'bots',
    title: 'Build your AI chatbot',
    desc: 'Visual dashboard, no code required',
    cursorX: '62%',
    cursorY: '34%',
    activeNav: 0,
  },
  {
    id: 'embed',
    title: 'Deploy with one script tag',
    desc: 'Paste into any client website in 30 seconds',
    cursorX: '72%',
    cursorY: '56%',
    activeNav: 0,
  },
  {
    id: 'leads',
    title: 'Leads captured automatically',
    desc: 'Every conversation turns into a lead record',
    cursorX: '22%',
    cursorY: '46%',
    activeNav: 1,
  },
  {
    id: 'clients',
    title: 'Clients get their own portal',
    desc: 'They log in and see their data. You keep control.',
    cursorX: '22%',
    cursorY: '58%',
    activeNav: 2,
  },
]

const NAV_ITEMS = [
  { label: 'Bots', Icon: MessageSquare },
  { label: 'Leads', Icon: UserPlus },
  { label: 'Clients', Icon: Globe },
  { label: 'Analytics', Icon: BarChart2 },
]

// ── Mini SVG cursor ──────────────────────────────────────────────────────────
function CursorSVG() {
  return (
    <svg
      width="18"
      height="22"
      viewBox="0 0 18 22"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.4))' }}
    >
      <path
        d="M2 2L2 16.5L5.5 13L8 19L10 18L7.5 12L12.5 12L2 2Z"
        fill="white"
        stroke="#0C0A09"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  )
}

// ── Bot list screen ──────────────────────────────────────────────────────────
function BotsScreen({ step }: { step: number }) {
  const bots = [
    { name: 'Karachi Kurta Co.', status: 'Active', convos: 142 },
    { name: 'Pak Travels', status: 'Active', convos: 89 },
    { name: 'MediCare Clinic', status: 'Active', convos: 54 },
  ]

  return (
    <div style={{ padding: '14px 16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink)', letterSpacing: '-0.01em' }}>My Bots</span>
        <span
          style={{
            fontSize: 9,
            fontWeight: 700,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            color: 'var(--of-primary)',
            background: 'var(--of-primary-soft)',
            padding: '2px 7px',
            borderRadius: 4,
          }}
        >
          + New bot
        </span>
      </div>

      {/* Bot rows */}
      {bots.map((bot, i) => (
        <div
          key={i}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '7px 8px',
            borderRadius: 6,
            marginBottom: 4,
            background: i === 0 ? 'var(--of-primary-soft)' : 'transparent',
            border: i === 0 ? '1px solid rgba(14,165,233,0.18)' : '1px solid transparent',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                background: 'var(--of-primary)',
                flexShrink: 0,
              }}
            />
            <span style={{ fontSize: 10, fontWeight: 500, color: 'var(--ink)' }}>{bot.name}</span>
          </div>
          <span style={{ fontSize: 9, fontFamily: 'var(--font-mono)', color: 'var(--ink-muted)' }}>
            {bot.convos} convos
          </span>
        </div>
      ))}

      {/* Embed code block (shown on step 1) */}
      {step === 1 && (
        <div
          style={{
            marginTop: 10,
            background: '#0C0A09',
            borderRadius: 6,
            padding: '8px 10px',
            border: '1px solid rgba(14,165,233,0.25)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 5 }}>
            <Code2 size={9} style={{ color: 'var(--of-primary)' }} />
            <span style={{ fontSize: 8, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--of-primary)' }}>
              Embed script
            </span>
          </div>
          <code
            style={{
              display: 'block',
              fontFamily: 'var(--font-mono)',
              fontSize: 8,
              color: '#7DD3FC',
              lineHeight: 1.6,
              whiteSpace: 'pre',
            }}
          >
            {'<script\n  src="https://octively.com/e.js"\n  data-bot="k-kurta-co"\n></script>'}
          </code>
        </div>
      )}
    </div>
  )
}

// ── Leads screen ─────────────────────────────────────────────────────────────
function LeadsScreen() {
  const leads = [
    { name: 'Ahmed K.', email: 'ahmed@...', time: '2m ago' },
    { name: 'Sana M.', email: 'sana@...', time: '18m ago' },
    { name: 'Omar F.', email: 'omar@...', time: '1h ago' },
  ]
  return (
    <div style={{ padding: '14px 16px' }}>
      <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink)', letterSpacing: '-0.01em', display: 'block', marginBottom: 10 }}>
        Recent Leads
      </span>
      {leads.map((l, i) => (
        <div
          key={i}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '6px 8px',
            borderRadius: 6,
            marginBottom: 3,
            background: 'var(--surface-2)',
          }}
        >
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
  const clients = [
    { name: 'Karachi Kurta Co.', portal: 'Active' },
    { name: 'Pak Travels', portal: 'Active' },
    { name: 'MediCare Clinic', portal: 'Invited' },
  ]
  return (
    <div style={{ padding: '14px 16px' }}>
      <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink)', letterSpacing: '-0.01em', display: 'block', marginBottom: 10 }}>
        Client Portals
      </span>
      {clients.map((c, i) => (
        <div
          key={i}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '7px 8px',
            borderRadius: 6,
            marginBottom: 4,
            background: 'var(--surface-2)',
          }}
        >
          <span style={{ fontSize: 10, fontWeight: 500, color: 'var(--ink)' }}>{c.name}</span>
          <span
            style={{
              fontSize: 8,
              fontWeight: 700,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              color: c.portal === 'Active' ? 'var(--of-success)' : 'var(--ink-muted)',
              background: c.portal === 'Active' ? 'var(--of-success-soft)' : 'var(--surface)',
              padding: '2px 6px',
              borderRadius: 4,
            }}
          >
            {c.portal}
          </span>
        </div>
      ))}
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────
export function AuthDemoPanel() {
  const containerRef = useRef<HTMLDivElement>(null)
  const cursorRef    = useRef<HTMLDivElement>(null)
  const [step, setStep] = useState(0)

  // Cursor animation — GSAP moves it between positions, React state drives the step
  useGSAP(
    () => {
      if (!cursorRef.current) return
      const tl = gsap.timeline({ repeat: -1, defaults: { ease: 'power3.inOut' } })

      STEPS.forEach((s, i) => {
        tl
          // Move to position
          .to(cursorRef.current!, {
            left: s.cursorX,
            top:  s.cursorY,
            duration: 0.75,
          })
          // Tiny click-scale
          .to(cursorRef.current!, { scale: 0.82, duration: 0.08 })
          .to(cursorRef.current!, { scale: 1,    duration: 0.12 })
          // Hold & update React state
          .call(() => setStep(i))
          .to({}, { duration: 2.6 })
      })
    },
    { scope: containerRef },
  )

  const activeNav = STEPS[step].activeNav

  return (
    <div
      style={{
        width: '100%',
        maxWidth: 380,
        display: 'flex',
        flexDirection: 'column',
        gap: 24,
      }}
    >
      {/* Header copy */}
      <div>
        <p
          style={{
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: 'var(--of-primary)',
            marginBottom: 8,
            fontFamily: 'var(--font-mono)',
          }}
        >
          Octively dashboard
        </p>
        <h2
          style={{
            fontSize: 'clamp(18px, 2vw, 22px)',
            fontWeight: 700,
            letterSpacing: '-0.02em',
            lineHeight: 1.25,
            color: 'var(--ink)',
            marginBottom: 6,
          }}
        >
          {STEPS[step].title}
        </h2>
        <p style={{ fontSize: 13.5, color: 'var(--ink-muted)', lineHeight: 1.5 }}>
          {STEPS[step].desc}
        </p>
      </div>

      {/* Dashboard mockup */}
      <div
        ref={containerRef}
        style={{
          position: 'relative',
          borderRadius: 12,
          border: '1px solid var(--hairline-strong)',
          overflow: 'hidden',
          boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
        }}
      >
        {/* Browser chrome */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '8px 12px',
            background: 'var(--surface-2)',
            borderBottom: '1px solid var(--hairline)',
          }}
        >
          <div style={{ display: 'flex', gap: 5 }}>
            {['#FF5F57', '#FEBC2E', '#28C840'].map((c, i) => (
              <span key={i} style={{ width: 9, height: 9, borderRadius: '50%', background: c }} />
            ))}
          </div>
          <div
            style={{
              flex: 1,
              background: 'var(--surface)',
              borderRadius: 5,
              padding: '3px 8px',
              fontSize: 9,
              fontFamily: 'var(--font-mono)',
              color: 'var(--ink-muted)',
              border: '1px solid var(--hairline)',
            }}
          >
            admin.octively.com/dashboard
          </div>
        </div>

        {/* App grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '76px 1fr',
            minHeight: 190,
            background: 'var(--surface)',
          }}
        >
          {/* Sidebar */}
          <aside
            style={{
              borderRight: '1px solid var(--hairline)',
              padding: '10px 6px',
              background: 'var(--surface-2)',
              display: 'flex',
              flexDirection: 'column',
              height: '100%',
              fontFamily: 'var(--font-mono)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '2px 4px 10px' }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--of-primary)', flexShrink: 0 }} />
              <span style={{ fontSize: 9, fontWeight: 600, color: 'var(--ink)' }}>Octively</span>
            </div>
            {NAV_ITEMS.map(({ label, Icon }, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 5,
                  padding: '5px 6px',
                  borderRadius: 4,
                  marginBottom: 1,
                  background: i === activeNav ? 'var(--of-primary-soft)' : 'transparent',
                  color: i === activeNav ? 'var(--of-primary-deep)' : 'var(--ink-subtle)',
                  transition: 'all 0.3s ease',
                }}
              >
                <Icon size={9} />
                <span style={{ fontSize: 8.5 }}>{label}</span>
              </div>
            ))}
          </aside>

          {/* Main content — switches per step */}
          <div style={{ overflow: 'hidden' }}>
            {activeNav === 0 && <BotsScreen step={step} />}
            {activeNav === 1 && <LeadsScreen />}
            {activeNav === 2 && <ClientsScreen />}
          </div>
        </div>

        {/* Animated cursor */}
        <div
          ref={cursorRef}
          style={{
            position: 'absolute',
            left: STEPS[0].cursorX,
            top:  STEPS[0].cursorY,
            pointerEvents: 'none',
            zIndex: 10,
            transform: 'translate(-2px, -2px)',
          }}
        >
          <CursorSVG />
        </div>
      </div>

      {/* Step dots */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        {STEPS.map((_, i) => (
          <span
            key={i}
            style={{
              width: i === step ? 20 : 6,
              height: 6,
              borderRadius: 3,
              background: i === step ? 'var(--of-primary)' : 'var(--hairline-strong)',
              transition: 'all 0.35s ease',
            }}
          />
        ))}
      </div>
    </div>
  )
}
