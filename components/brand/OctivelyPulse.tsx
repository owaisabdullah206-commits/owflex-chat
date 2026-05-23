// Heartbeat pulse with expanding halo — for real-time / live events.
// Uses oct-halo + oct-pulse-mark keyframes from globals.css.

interface Props {
  size?: number
  color?: string
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

export function OctivelyPulse({ size = 64, color = '#0EA5E9', className, style }: Props) {
  const markSize = Math.round(size * 0.78)

  return (
    <div
      className={className}
      style={{
        position: 'relative',
        width: size,
        height: size,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        ...style,
      }}
    >
      {/* Expanding halo */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: '50%',
          background: color,
          opacity: 0.18,
          animation: 'oct-halo 1.8s ease-out infinite',
          transformOrigin: 'center',
        }}
      />
      {/* Pulsing mark */}
      <div
        style={{
          animation: 'oct-pulse-mark 1.6s ease-in-out infinite',
          transformOrigin: 'center',
          lineHeight: 0,
        }}
      >
        <svg width={markSize} height={markSize} viewBox="0 0 100 100" fill="none" aria-hidden="true">
          {Array.from({ length: 8 }, (_, i) => (
            <path
              key={i}
              d={bladePath((i * 45 - 90) * (Math.PI / 180))}
              fill={color}
            />
          ))}
          <circle cx="50" cy="50" r={G.hub} fill={color} />
        </svg>
      </div>
    </div>
  )
}
