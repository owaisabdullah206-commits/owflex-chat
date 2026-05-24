'use client'

/**
 * LandingPreloader — Premium full-page boot screen for the marketing home.
 *
 * Design source: Octively Brand Sheet · Motion Lab · "Stagger preloader"
 * (premium spotlight sweep, described as the full-page preloader)
 *
 * Behaviour:
 *  - Shows a full-viewport overlay on first visit (sessionStorage flag).
 *  - 120px Compass Burst mark with spotlight-sweep animation.
 *  - Wordmark + shimmer status line + indeterminate progress bar.
 *  - On dismiss: content fades out, then 8 horizontal bands shutter off
 *    left/right (alternating, center-first) revealing the page beneath.
 *  - Hidden on subsequent navigations within the same browser tab.
 */

import { useEffect, useState } from 'react'

// ─── Geometry (matches brand sheet compass-loaders.jsx exactly) ─────────────
const G = { hub: 6, near: 14, far: 46, halfBase: 4 }

function bladePath(theta: number): string {
  const cx = 50, cy = 50
  const px = (r: number, off = 0) =>
    `${cx + Math.cos(theta) * r - Math.sin(theta) * off},${cy + Math.sin(theta) * r + Math.cos(theta) * off}`
  return `M ${px(G.near, -G.halfBase)} L ${px(G.far, 0)} L ${px(G.near, G.halfBase)} Z`
}

// ─── Constants ──────────────────────────────────────────────────────────────
const SESSION_KEY     = 'octively_preloader_shown'
const COLOR           = '#0EA5E9'
const STRIP_COUNT     = 8
const HOLD_MS         = 2000   // hold duration before exit begins
const CONTENT_EXIT_MS = 250    // content fades out first
const STRIPS_EXIT_MS  = 1100   // strips animation (delay=0.14s + 0.85s transit + buffer)

// Light theme tokens (landing page is cream #FAFAF9)
const BG         = '#FAFAF9'
const INK        = '#0C0A09'
const INK_SUBTLE = '#57534E'
const TRACK_BG   = 'rgba(12,10,9,0.06)'

// ─── StaggerMark — spotlight sweep animation ─────────────────────────────────
function StaggerMark({ size = 120, withHub = true }: { size?: number; withHub?: boolean }) {
  const DURATION = 1.4
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
              animation: `oct-lp-sweep ${DURATION}s cubic-bezier(.4,0,.2,1) ${i * (DURATION / 8)}s infinite`,
              opacity: 0.28,
            }}
          />
        )
      })}
      {withHub && (
        <circle
          cx="50" cy="50" r={G.hub}
          fill={COLOR}
          style={{
            transformOrigin: '50px 50px',
            animation: `oct-lp-hub ${DURATION}s ease-in-out infinite`,
          }}
        />
      )}
    </svg>
  )
}

// ─── LandingPreloader ─────────────────────────────────────────────────────────
export function LandingPreloader() {
  // 'visible' → 'exiting' (content fades, strips slide) → 'gone'
  const [phase, setPhase] = useState<'visible' | 'exiting' | 'gone'>('gone')

  useEffect(() => {
    if (typeof sessionStorage === 'undefined') return
    if (sessionStorage.getItem(SESSION_KEY)) return
    sessionStorage.setItem(SESSION_KEY, '1')
    setPhase('visible')

    const holdTimer = setTimeout(() => {
      setPhase('exiting')
      const doneTimer = setTimeout(() => setPhase('gone'), CONTENT_EXIT_MS + STRIPS_EXIT_MS)
      return () => clearTimeout(doneTimer)
    }, HOLD_MS)

    return () => clearTimeout(holdTimer)
  }, [])

  if (phase === 'gone') return null

  const visible = phase === 'visible'
  const stripWidth = 100 / STRIP_COUNT
  const mid = (STRIP_COUNT - 1) / 2 // 3.5

  return (
    <>
      <style>{`
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
        @keyframes oct-lp-fade-in {
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
        .oct-lp-shimmer {
          font-family: 'JetBrains Mono', monospace;
          font-size: 11px;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          background: linear-gradient(90deg, ${INK_SUBTLE} 0%, ${INK} 50%, ${INK_SUBTLE} 100%);
          background-size: 200% 100%;
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          animation: oct-lp-shimmer 2.4s ease-in-out infinite;
        }
      `}</style>

      <div
        aria-hidden="true"
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 9999,
          color: INK,
          fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
          overflow: 'hidden',
          pointerEvents: visible ? 'auto' : 'none',
        }}
      >
        {/* ── 8 horizontal bands — shutter exit ── */}
        <div style={{ position: 'absolute', inset: 0 }} aria-hidden>
          {Array.from({ length: STRIP_COUNT }).map((_, i) => {
            const goLeft  = i % 2 === 0
            const dist    = Math.abs(i - mid)
            const delay   = (mid - dist) * 0.04  // center exits first (0.14s), edges last (0s)
            return (
              <div
                key={i}
                style={{
                  position:  'absolute',
                  left:      0,
                  right:     0,
                  top:       `${i * stripWidth}%`,
                  height:    `${stripWidth + 0.15}%`, // small overlap kills subpixel gaps
                  background: BG,
                  transform: visible
                    ? 'translateX(0)'
                    : `translateX(${goLeft ? '-110vw' : '110vw'})`,
                  transition: 'transform .85s cubic-bezier(.83,0,.17,1)',
                  transitionDelay: visible ? '0s' : `${delay}s`,
                  willChange: 'transform',
                }}
              />
            )
          })}
        </div>

        {/* ── Soft radial glow ── */}
        <div
          aria-hidden
          style={{
            position:   'absolute',
            width:      '60%',
            aspectRatio: '1',
            left:       '50%',
            top:        '50%',
            transform:  'translate(-50%, -55%)',
            background: `radial-gradient(circle, ${COLOR}22 0%, transparent 60%)`,
            pointerEvents: 'none',
            opacity:    visible ? 1 : 0,
            transition: `opacity ${CONTENT_EXIT_MS}ms ease-out`,
          }}
        />

        {/* ── Content layer — fades out before strips open ── */}
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
            transition:     `opacity ${CONTENT_EXIT_MS}ms ease-out, transform 350ms cubic-bezier(.4,0,.2,1)`,
          }}
        >
          {/* Top-left brand stamp */}
          <div
            style={{
              position:   'absolute',
              top:        28,
              left:       32,
              display:    'flex',
              alignItems: 'center',
              gap:        8,
              opacity:    0.55,
              animation:  'oct-lp-fade-in .8s cubic-bezier(.22,.61,.36,1) .2s both',
            }}
          >
            <StaggerMark size={16} withHub={false} />
            <span
              style={{
                fontFamily:    "'JetBrains Mono', monospace",
                fontSize:      10,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color:         INK_SUBTLE,
              }}
            >
              Octively
            </span>
          </div>

          {/* Center stack: mark → wordmark → status + progress */}
          <div
            style={{
              position:       'relative',
              display:        'flex',
              flexDirection:  'column',
              alignItems:     'center',
              gap:            36,
              animation:      'oct-lp-fade-in .8s cubic-bezier(.22,.61,.36,1) both',
            }}
          >
            <StaggerMark size={120} />

            {/* Wordmark */}
            <div style={{ fontWeight: 600, fontSize: 28, letterSpacing: '-0.035em', lineHeight: 1 }}>
              Octively
            </div>

            {/* Status + indeterminate bar */}
            <div
              style={{
                display:        'flex',
                flexDirection:  'column',
                alignItems:     'center',
                gap:            14,
                minWidth:       280,
              }}
            >
              <span className="oct-lp-shimmer">Welcome</span>

              <div
                style={{
                  position:     'relative',
                  width:        280,
                  height:       2,
                  background:   TRACK_BG,
                  borderRadius: 999,
                  overflow:     'hidden',
                }}
              >
                <div
                  style={{
                    position:   'absolute',
                    inset:      0,
                    width:      '40%',
                    background: `linear-gradient(90deg, transparent 0%, ${COLOR} 50%, transparent 100%)`,
                    animation:  'oct-lp-progress 1.6s cubic-bezier(.4,0,.2,1) infinite',
                  }}
                />
              </div>
            </div>
          </div>

          {/* Bottom-right version stamp */}
          <div
            style={{
              position:      'absolute',
              bottom:        28,
              right:         32,
              fontFamily:    "'JetBrains Mono', monospace",
              fontSize:      10,
              letterSpacing: '0.08em',
              color:         INK_SUBTLE,
              opacity:       0.45,
              animation:     'oct-lp-fade-in .8s cubic-bezier(.22,.61,.36,1) .4s both',
            }}
          >
            v0.9
          </div>
        </div>
      </div>
    </>
  )
}
