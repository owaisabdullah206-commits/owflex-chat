// Compass Burst mark — pure SVG, no animation.
// Alternating (alt) is the chosen variant: even blades full, odd blades at 55%.

export type MarkVariant = 'alt' | 'unified' | 'stroked' | 'chunky'

interface Props {
  size?: number
  color?: string
  variant?: MarkVariant
  className?: string
  style?: React.CSSProperties
}

const G = { hub: 6, near: 14, far: 46, halfBase: 4 } as const

function bladePath(theta: number, variant: MarkVariant): string {
  const cx = 50, cy = 50
  const px = (r: number, off = 0) =>
    `${(cx + Math.cos(theta) * r - Math.sin(theta) * off).toFixed(2)},${(cy + Math.sin(theta) * r + Math.cos(theta) * off).toFixed(2)}`
  if (variant === 'chunky') return `M ${px(G.near, -7)} L ${px(G.far, 0)} L ${px(G.near, 7)} Z`
  return `M ${px(G.near, -G.halfBase)} L ${px(G.far, 0)} L ${px(G.near, G.halfBase)} Z`
}

export function OctivelyMark({
  size = 24,
  color = 'currentColor',
  variant = 'alt',
  className,
  style,
}: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      className={className}
      style={style}
      aria-hidden="true"
    >
      {Array.from({ length: 8 }, (_, i) => {
        const theta = (i * 45 - 90) * (Math.PI / 180)
        if (variant === 'stroked') {
          return (
            <path
              key={i}
              d={bladePath(theta, variant)}
              fill="none"
              stroke={color}
              strokeWidth={3}
              strokeLinejoin="round"
            />
          )
        }
        return (
          <path
            key={i}
            d={bladePath(theta, variant)}
            fill={color}
            fillOpacity={variant === 'alt' ? (i % 2 === 0 ? 1 : 0.55) : 1}
          />
        )
      })}
      {variant !== 'chunky' && <circle cx="50" cy="50" r={G.hub} fill={color} />}
    </svg>
  )
}
