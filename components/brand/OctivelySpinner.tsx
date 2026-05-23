// Continuous-spin loading indicator. Uses oct-spin keyframe from globals.css.
// Replaces all skeleton/spinner usage in dashboard and portal.

interface Props {
  size?: number
  color?: string
  duration?: number
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

export function OctivelySpinner({
  size = 24,
  color = 'currentColor',
  duration = 6,
  className,
  style,
}: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      aria-label="Loading"
      role="status"
      className={className}
      style={{
        animation: `oct-spin ${duration}s linear infinite`,
        transformOrigin: 'center',
        ...style,
      }}
    >
      {Array.from({ length: 8 }, (_, i) => (
        <path
          key={i}
          d={bladePath((i * 45 - 90) * (Math.PI / 180))}
          fill={color}
          fillOpacity={i % 2 === 0 ? 1 : 0.45}
        />
      ))}
      <circle cx="50" cy="50" r={G.hub} fill={color} />
    </svg>
  )
}
