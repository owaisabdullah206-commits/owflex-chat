'use client'

/**
 * LandingPreloader — Single full-page boot screen for the marketing home.
 *
 * Design: Octively Brand Sheet · compass-loaders.jsx · FullPagePreloader
 * (dark-on-light: landing page is cream, preloader is #0A0A0A for contrast)
 *
 * Behaviour:
 *  - Renders once per browser session (sessionStorage flag).
 *  - 120px Compass Burst with spotlight-sweep animation (premium oct-sweep).
 *  - Wordmark · tagline · shimmer status line · indeterminate progress bar.
 *  - Top-left brand stamp (16px mark + "OCTIVELY") · bottom-right v0.9.
 *  - Exit: content fades + scales in 250ms, then 8 horizontal bands shutter
 *    alternating left/right — centre bands first, edges last (~850ms).
 */

import { useEffect, useState } from 'react'

// ─── Geometry — matches compass-loaders.jsx exactly ─────────────────────────
const G = { hub: 6, near: 14, far: 46, halfBase: 4 }

function bladePath(theta: number): string {
  const cx = 50, cy = 50
  const px = (r: number, off = 0) =>
    `${cx + Math.cos(theta) * r - Math.sin(theta) * off},${cy + Math.sin(theta) * r + Math.cos(theta) * off}`
  return `M ${px(G.near, -G.halfBase)} L ${px(G.far, 0)} L ${px(G.near, G.halfBase)} Z`
}

// ─── Constants ───────────────────────────────────────────────────────────────
const SESSION_KEY     = 'octively_preloader_shown'
const COLOR           = '#0EA5E9'
const STRIP_COUNT     = 8
const HOLD_MS         = 2000   // ms before triggering exit
const CONTENT_EXIT_MS = 250    // content fades first
const STRIPS_EXIT_MS  = 1100   // shutter animation (max delay 0.14s + 0.85s + buffer)

// Dark theme — landing page is cream, preloader is near-black for contrast
const BG         = '#0A0A0A'
const INK        = '#FAFAF9'
const INK_SUBTLE = '#A8A29E'
const TRACK_BG   = 'rgba(255,255,255,0.06)'

// ─── StaggerMark — spotlight sweep (uniform across all blades, per design) ──
function StaggerMark({ size = 120, hub = true }: { size?: number; hub?: boolean }) {
  const D = 1.4  // duration
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" style={{ overflow: 'visible' }}>
      {Array.from({ length: 8 }).map((_, i) => {
        const theta = (i * 45 - 90) * (Math.PI / 180)
        return (
          <path
            key={i}
            d={bladePath(theta)}
            fill={COLOR}
            style={{
              transformOrigin: '50px 50px',
              animation: `oct-lp-sweep ${D}s cubic-bezier(.4,0,.2,1) ${i * (D / 8)}s infinite`,
              opacity: 0.28,
            }}
          />
        )
      })}
      {hub && (
        <circle
          cx="50" cy="50" r={G.hub} fill={COLOR}
          style={{
            transformOrigin: '50px 50px',
            animation: `oct-lp-hub ${D}s ease-in-out infinite`,
          }}
        />
      )}
    </svg>
  )
}

// ─── LandingPreloader ─────────────────────────────────────────────────────────
export function LandingPreloader() {
  const [phase, setPhase] = useState<'visible' | 'exiting' | 'gone'>('gone')

  useEffect(() => {
    if (typeof sessionStorage === 'undefined') return
    if (sessionStorage.getItem(SESSION_KEY)) return
    sessionStorage.setItem(SESSION_KEY, '1')
    setPhase('visible')

    const hold = setTimeout(() => {
      setPhase('exiting')
      const done = setTimeout(() => setPhase('gone'), CONTENT_EXIT_MS + STRIPS_EXIT_MS)
      return () => clearTimeout(done)
    }, HOLD_MS)

    return () => clearTimeout(hold)
  }, [])

  if (phase === 'gone') return null

  const visible = phase === 'visible'
  const sw  = 100 / STRIP_COUNT          // strip height %
  const mid = (STRIP_COUNT - 1) / 2      // 3.5

  return (
    <>
      <style>{`
        /* Premium spotlight sweep — brightness rotates blade by blade */
        @keyframes oct-lp-sweep {
          0%   { opacity: 0.28; transform: scale(1); }
          8%   { opacity: 1;    transform: scale(1.08); }
          35%  { opacity: 0.55; transform: scale(1); }
          100% { opacity: 0.28; transform: scale(1); }
        }
        @keyframes oct-lp-hub {
          0%, 100% { opacity: 0.4; transform: scale(0.9); }
          50%      { opacity: 1;   transform: scale(1.15); }
        }
        @keyframes oct-lp-in {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes oct-lp-shimmer {
          0%   { background-position: -200% 0; }
          100% { background-position:  200% 0; }
        }
        @keyframes oct-lp-progress {
          0%   { transform: translateX(-100%); }
          50%  { transform: translateX(0%); }
          100% { transform: translateX(100%); }
        }
      `}</style>

      <div
        aria-hidden="true"
        style={{
          position:      'fixed',
          inset:         0,
          zIndex:        9999,
          color:         INK,
          fontFamily:    "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
          overflow:      'hidden',
          pointerEvents: visible ? 'auto' : 'none',
        }}
      >
        {/* ── 8 horizontal bands — slide off L/R, centre-first on exit ── */}
        <div style={{ position: 'absolute', inset: 0 }} aria-hidden>
          {Array.from({ length: STRIP_COUNT }).map((_, i) => {
            const goLeft = i % 2 === 0
            const dist   = Math.abs(i - mid)
            const delay  = (mid - dist) * 0.04   // 0.14s at centre → 0s at edges
            return (
              <div
                key={i}
                style={{
                  position:        'absolute',
                  left:            0,
                  right:           0,
                  top:             `${i * sw}%`,
                  height:          `${sw + 0.15}%`,  // tiny overlap kills subpixel seams
                  background:      BG,
                  transform:       visible
                    ? 'translateX(0)'
                    : `translateX(${goLeft ? '-110vw' : '110vw'})`,
                  transition:      'transform .85s cubic-bezier(.83,0,.17,1)',
                  transitionDelay: visible ? '0s' : `${delay}s`,
                  willChange:      'transform',
                }}
              />
            )
          })}
        </div>

        {/* ── Soft radial glow ── */}
        <div
          aria-hidden
          style={{
            position:      'absolute',
            width:         '60%',
            aspectRatio:   '1',
            left:          '50%',
            top:           '50%',
            transform:     'translate(-50%, -55%)',
            background:    `radial-gradient(circle, ${COLOR}22 0%, transparent 60%)`,
            pointerEvents: 'none',
            opacity:       visible ? 1 : 0,
            transition:    `opacity .25s ease-out`,
          }}
        />

        {/* ── Content — fades + scales out before strips open ── */}
        <div
          style={{
            position:       'absolute',
            inset:          0,
            display:        'flex',
            alignItems:     'center',
            justifyContent: 'center',
            flexDirection:  'column',
            opacity:        visible ? 1 : 0,
            transform:      visible ? 'scale(1)' : 'scale(0.94)',
            transition:     `opacity .25s ease-out, transform .35s cubic-bezier(.4,0,.2,1)`,
          }}
        >
          {/* Top-left brand stamp */}
          <div style={{
            position:   'absolute',
            top:        28,
            left:       32,
            display:    'flex',
            alignItems: 'center',
            gap:        8,
            opacity:    0.55,
            animation:  'oct-lp-in .8s cubic-bezier(.22,.61,.36,1) .2s both',
          }}>
            <StaggerMark size={16} hub={false} />
            <span style={{
              fontFamily:    "'JetBrains Mono', monospace",
              fontSize:      10,
              letterSpacing: '0.12em',
              textTransform: 'uppercase' as const,
              color:         INK_SUBTLE,
            }}>
              Octively
            </span>
          </div>

          {/* Centre stack: mark → wordmark + tagline → status + bar */}
          <div style={{
            display:       'flex',
            flexDirection: 'column',
            alignItems:    'center',
            gap:           36,
            animation:     'oct-lp-in .8s cubic-bezier(.22,.61,.36,1) both',
          }}>
            <StaggerMark size={120} />

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
              <div style={{ fontWeight: 600, fontSize: 28, letterSpacing: '-0.035em', lineHeight: 1 }}>
                Octively
              </div>
              <div style={{ fontSize: 13, color: INK_SUBTLE, letterSpacing: '-0.01em' }}>
                The client dashboard layer for custom AI
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, minWidth: 280 }}>
              {/* Shimmer status — display:inline-block + WebkitTextFillColor required for cross-browser gradient clip */}
              <span style={{
                display:              'inline-block',
                fontFamily:           "'JetBrains Mono', monospace",
                fontSize:             11,
                letterSpacing:        '0.12em',
                textTransform:        'uppercase' as const,
                background:           `linear-gradient(90deg, ${INK_SUBTLE} 0%, ${INK} 50%, ${INK_SUBTLE} 100%)`,
                backgroundSize:       '200% 100%',
                WebkitBackgroundClip: 'text',
                backgroundClip:       'text',
                WebkitTextFillColor:  'transparent',
                color:                'transparent',
                animation:            'oct-lp-shimmer 2.4s ease-in-out infinite',
              }}>
                Welcome to Octively
              </span>

              {/* Indeterminate progress track */}
              <div style={{
                position:     'relative',
                width:        280,
                height:       2,
                background:   TRACK_BG,
                borderRadius: 999,
                overflow:     'hidden',
              }}>
                <div style={{
                  position:   'absolute',
                  inset:      0,
                  width:      '40%',
                  background: `linear-gradient(90deg, transparent 0%, ${COLOR} 50%, transparent 100%)`,
                  animation:  'oct-lp-progress 1.6s cubic-bezier(.4,0,.2,1) infinite',
                }} />
              </div>
            </div>
          </div>

          {/* Bottom-right version stamp */}
          <div style={{
            position:      'absolute',
            bottom:        28,
            right:         32,
            fontFamily:    "'JetBrains Mono', monospace",
            fontSize:      10,
            letterSpacing: '0.08em',
            color:         INK_SUBTLE,
            opacity:       0.45,
            animation:     'oct-lp-in .8s cubic-bezier(.22,.61,.36,1) .4s both',
          }}>
            v0.9
          </div>
        </div>
      </div>
    </>
  )
}
