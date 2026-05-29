import { ImageResponse } from 'next/og'

// Route segment config
export const runtime = 'edge'
export const alt = 'Octively — White-label AI chatbot platform for agencies & freelancers'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

// OG image — matches the "Social card · 1200×630" from the Octively Brand Sheet
// Design: brand-sheet.jsx › OGMock
// Dark background, teal mark top-left, headline + subtext bottom-left,
// faint large compass mark bottom-right.

const COLOR   = '#0EA5E9'
const BG      = '#0C0A09'
const INK     = '#FAFAF9'
const SUBTLE  = '#A8A29E'

// Compass Burst mark — Alternating A variant as SVG path strings
// G = { hub: 6, near: 14, far: 46, halfBase: 4 }
function bladeD(i: number) {
  const theta = (i * 45 - 90) * (Math.PI / 180)
  const cx = 50, cy = 50
  const px = (r: number, off = 0) =>
    `${cx + Math.cos(theta) * r - Math.sin(theta) * off},${cy + Math.sin(theta) * r + Math.cos(theta) * off}`
  return `M ${px(14, -4)} L ${px(46, 0)} L ${px(14, 4)} Z`
}

function CompassMark({ size: s, color, opacity = 1 }: { size: number; color: string; opacity?: number }) {
  const scale = s / 100
  return (
    <svg
      width={s}
      height={s}
      viewBox="0 0 100 100"
      style={{ opacity }}
    >
      {Array.from({ length: 8 }).map((_, i) => (
        <path
          key={i}
          d={bladeD(i)}
          fill={color}
          fillOpacity={i % 2 === 0 ? 1 : 0.55}
        />
      ))}
      <circle cx="50" cy="50" r="6" fill={color} />
    </svg>
  )
}

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width:          1200,
          height:         630,
          background:     BG,
          color:          INK,
          fontFamily:     'Inter, -apple-system, sans-serif',
          display:        'flex',
          flexDirection:  'column',
          justifyContent: 'space-between',
          padding:        '48px 56px',
          position:       'relative',
          overflow:       'hidden',
        }}
      >
        {/* Faint large compass mark — bottom-right */}
        <div style={{
          position: 'absolute',
          right:    -60,
          bottom:   -90,
          opacity:  0.14,
          display:  'flex',
        }}>
          <CompassMark size={420} color={COLOR} />
        </div>

        {/* Top-left: mark + wordmark */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <CompassMark size={32} color={COLOR} />
          <span style={{
            fontWeight:    700,
            fontSize:      22,
            letterSpacing: '-0.02em',
            color:         INK,
          }}>
            Octively
          </span>
        </div>

        {/* Bottom: headline + subtext */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{
            fontSize:      52,
            fontWeight:    600,
            letterSpacing: '-0.03em',
            lineHeight:    1.08,
            maxWidth:      760,
            color:         INK,
          }}>
            White-label AI chatbots for agencies & freelancers
          </div>
          <div style={{
            fontSize:  20,
            color:     SUBTLE,
            marginTop: 4,
          }}>
            Build bots for your clients. They get their own branded portal.
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}
