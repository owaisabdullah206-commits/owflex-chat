'use client'

/**
 * LandingPreloader — Premium full-page boot screen for the marketing home.
 *
 * Design: Octively Brand Sheet · Motion Lab · "Landing-page preloader"
 * (FullPagePreloader, dark-on-light variant — landing page is cream so the
 *  preloader uses the contrasting dark theme for impact)
 *
 * Behaviour:
 *  - Full-viewport overlay, dark background (#0A0A0A), once per browser session.
 *  - 120px Compass Burst mark with spotlight-sweep animation (premium).
 *  - Top-left brand stamp · wordmark · shimmer status · indeterminate progress bar.
 *  - Exit: content fades + scales in 250ms, then 8 horizontal bands shutter off
 *    alternating left/right — centre bands exit first, edges last (~850ms).
 *  - Fires once per session via sessionStorage.
 */

import { useEffect, useState } from 'react'

// ─── Geometry (matches brand-sheet compass-loaders.jsx exactly) ──────────────
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
const HOLD_MS         = 2000  // ms to show before triggering exit
const CONTENT_EXIT_MS = 250   // content fades first
const STRIPS_EXIT_MS  = 1100  // shutter animation (max delay 0.14s + 0.85s + buffer)

// Dark-theme tokens (landing page is light cream → preloader is dark for contrast)
const BG         = '#0A0A0A'
const INK        = '#FAFAF9'
const INK_SUBTLE = '#A8A29E'
const TRACK_BG   = 'rgba(255,255,255,0.06)'

// ─── StaggerMark — spotlight-sweep with Alternating A rhythm ─────────────────
// Even blades (cardinal: N/E/S/W) sweep to full brightness.
// Odd blades (diagonal: NE/SE/SW/NW) sweep to 55% — matching the Alternating A
// variant the brand sheet defaults to, so the clockwise rhythm is visible even
// mid-animation.
function StaggerMark({ size = 120, withHub = true }: { size?: number; withHub?: boolean }) {
  const DURATION = 1.4
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" style={{ overflow: 'visible' }}>
      {Array.from({ length: 8 }).map((_, i) => {
        const theta   = (i * 45 - 90) * (Math.PI / 180)
        const isEven  = i % 2 === 0
        const kf      = isEven ? 'oct-lp-sweep-even' : 'oct-lp-sweep-odd'
        return (
          <path
            key={i}
            d={bladePath(theta)}
            fill={COLOR}
            style={{
              transformOrigin: '50px 50px',
              animation: `${kf} ${DURATION}s cubic-bezier(.4,0,.2,1) ${i * (DURATION / 8)}s infinite`,
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
  const stripW  = 100 / STRIP_COUNT
  const mid     = (STRIP_COUNT - 1) / 2   // 3.5 — used to compute centre-first exit delay

  return (
    <>
      <style>{`
        /* Spotlight sweep — even blades (cardinal) sweep full brightness */
        @keyframes oct-lp-sweep-even {
          0%   { opacity: 0.35; transform: scale(1); }
          8%   { opacity: 1;    transform: scale(1.08); }
          35%  { opacity: 0.6;  transform: scale(1); }
          100% { opacity: 0.35; transform: scale(1); }
        }
        /* Odd blades (diagonal) sweep dimmer — creates the alternating A rhythm */
        @keyframes oct-lp-sweep-odd {
          0%   { opacity: 0.18; transform: scale(1); }
          8%   { opacity: 0.55; transform: scale(1.04); }
          35%  { opacity: 0.3;  transform: scale(1); }
          100% { opacity: 0.18; transform: scale(1); }
        }
        /* Hub breathes in counterpoint to the blades */
        @keyframes oct-lp-hub {
          0%, 100% { opacity: 0.4; transform: scale(0.9); }
          50%      { opacity: 1;   transform: scale(1.15); }
        }
        /* Entrance — stamp + wordmark slide up from 8px */
        @keyframes oct-lp-in {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        /* Shimmer — gradient sweeps across status text */
        @keyframes oct-lp-shimmer {
          0%   { background-position: -200% 0; }
          100% { background-position:  200% 0; }
        }
        /* Indeterminate progress blob */
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
        {/* ── 8 horizontal bands — shutter exit ───────────────────────────── */}
        <div style={{ position: 'absolute', inset: 0 }} aria-hidden>
          {Array.from({ length: STRIP_COUNT }).map((_, i) => {
            const goLeft = i % 2 === 0                      // alternating direction
            const dist   = Math.abs(i - mid)
            const delay  = (mid - dist) * 0.04              // centre=0.14s, edges=0s
            return (
              <div
                key={i}
                style={{
                  position:         'absolute',
                  left:             0,
                  right:            0,
                  top:              `${i * stripW}%`,
                  height:           `${stripW + 0.15}%`,    // tiny overlap kills subpixel seams
                  background:       BG,
                  transform:        visible
                    ? 'translateX(0)'
                    : `translateX(${goLeft ? '-110vw' : '110vw'})`,
                  transition:       'transform .85s cubic-bezier(.83,0,.17,1)',
                  transitionDelay:  visible ? '0s' : `${delay}s`,
                  willChange:       'transform',
                }}
              />
            )
          })}
        </div>

        {/* ── Soft radial glow behind the mark ────────────────────────────── */}
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
            transition:    `opacity ${CONTENT_EXIT_MS}ms ease-out`,
          }}
        />

        {/* ── Content — fades + scales before strips open ──────────────────── */}
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
              animation:  'oct-lp-in .8s cubic-bezier(.22,.61,.36,1) .2s both',
            }}
          >
            <StaggerMark size={16} withHub={false} />
            <span style={{
              fontFamily:    "'JetBrains Mono', monospace",
              fontSize:      10,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color:         INK_SUBTLE,
            }}>
              Octively
            </span>
          </div>

          {/* Centre stack: mark → wordmark → status + progress */}
          <div
            style={{
              display:        'flex',
              flexDirection:  'column',
              alignItems:     'center',
              gap:            36,
              animation:      'oct-lp-in .8s cubic-bezier(.22,.61,.36,1) both',
            }}
          >
            <StaggerMark size={120} />

            {/* Wordmark */}
            <div style={{
              fontWeight:    600,
              fontSize:      28,
              letterSpacing: '-0.035em',
              lineHeight:    1,
              color:         INK,
            }}>
              Octively
            </div>

            {/* Shimmer status + indeterminate bar */}
            <div style={{
              display:        'flex',
              flexDirection:  'column',
              alignItems:     'center',
              gap:            14,
              minWidth:       280,
            }}>
              {/* Shimmer text — cannot use backgroundClip in TSX inline style safely,
                  so we use a dedicated keyframe + className approach via the <style> above */}
              <span style={{
                fontFamily:           "'JetBrains Mono', monospace",
                fontSize:             11,
                letterSpacing:        '0.12em',
                textTransform:        'uppercase' as const,
                background:           `linear-gradient(90deg, ${INK_SUBTLE} 0%, ${INK} 50%, ${INK_SUBTLE} 100%)`,
                backgroundSize:       '200% 100%',
                WebkitBackgroundClip: 'text',
                backgroundClip:       'text',
                color:                'transparent',
                animation:            'oct-lp-shimmer 2.4s ease-in-out infinite',
              }}>
                Welcome
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
