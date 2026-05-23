// Blade-by-blade chase preloader — for page/section loads.
// Uses oct-stagger-fade keyframe from globals.css.

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

export function OctivelyStagger({
  size = 64,
  color = '#0EA5E9',
  duration = 1.6,
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
      style={style}
    >
      {Array.from({ length: 8 }, (_, i) => (
        <path
          key={i}
          d={bladePath((i * 45 - 90) * (Math.PI / 180))}
          fill={color}
          style={{
            transformOrigin: '50px 50px',
            animation: `oct-stagger-fade ${duration}s ease-in-out ${(i * duration) / 8}s infinite`,
            opacity: 0.18,
          }}
        />
      ))}
      <circle cx="50" cy="50" r={G.hub} fill={color} opacity="0.35" />
    </svg>
  )
}
