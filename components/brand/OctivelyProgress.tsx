// Determinate progress indicator — blades light up per octant (12.5% each).
// Controlled: pass progress (0–1) from outside.

interface Props {
  progress: number   // 0 to 1
  size?: number
  color?: string
  showPercent?: boolean
  className?: string
  style?: React.CSSProperties
}

const G = { hub: 6, near: 14, far: 46, halfBase: 4 } as const

function bladePath(theta: number): string {
  const cx = 50, cy = 50
  const px = (r: number, off = 0) =>
    `${(cx + Math.cos(theta) * r - Math.sin(theta) * off).toFixed(2)},${(cy + Math.sin(theta) * r + Math.cos(theta) * off).toFixed(2)}`
  return `M ${px(G.near, -G.halfBase)} L ${px(G.far, 0)} L ${px(G.near, G.halfBase)} Z`
}

export function OctivelyProgress({
  progress,
  size = 48,
  color = '#0EA5E9',
  showPercent = false,
  className,
  style,
}: Props) {
  const clamped = Math.max(0, Math.min(1, progress))
  const litCount = clamped * 8
  const pct = Math.round(clamped * 100)

  return (
    <div
      className={className}
      style={{ position: 'relative', width: size, height: size, display: 'inline-block', ...style }}
    >
      <svg width={size} height={size} viewBox="0 0 100 100" fill="none" aria-label={`${pct}%`} role="progressbar">
        {Array.from({ length: 8 }, (_, i) => {
          const theta = (i * 45 - 90) * (Math.PI / 180)
          const lit = i < Math.floor(litCount)
          const partial = i === Math.floor(litCount) ? litCount - Math.floor(litCount) : 0
          const opacity = lit ? 1 : partial > 0 ? 0.3 + partial * 0.7 : 0.15
          return (
            <path key={i} d={bladePath(theta)} fill={color} fillOpacity={opacity} />
          )
        })}
        <circle cx="50" cy="50" r={G.hub} fill={color} fillOpacity={clamped > 0 ? 1 : 0.3} />
      </svg>
      {showPercent && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'var(--font-mono, monospace)',
            fontSize: size * 0.18,
            fontWeight: 600,
            color: 'currentColor',
            pointerEvents: 'none',
          }}
        >
          {pct}%
        </div>
      )}
    </div>
  )
}
