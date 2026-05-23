import { OctivelyMark, type MarkVariant } from './OctivelyMark'

interface Props {
  size?: number
  color?: string
  wordmarkColor?: string
  showWordmark?: boolean
  layout?: 'horizontal' | 'stacked'
  variant?: MarkVariant
  className?: string
  style?: React.CSSProperties
}

export function OctivelyLogo({
  size = 24,
  color = 'currentColor',
  wordmarkColor,
  showWordmark = true,
  layout = 'horizontal',
  variant = 'alt',
  className,
  style,
}: Props) {
  if (!showWordmark) {
    return <OctivelyMark size={size} color={color} variant={variant} className={className} style={style} />
  }

  const fontSize = Math.round(size * 0.7)

  return (
    <span
      className={`inline-flex items-center gap-[0.55em] ${layout === 'stacked' ? 'flex-col' : ''} ${className ?? ''}`}
      style={style}
    >
      <OctivelyMark size={size} color={color} variant={variant} />
      <span
        style={{
          fontFamily: 'var(--font-sans, Inter, sans-serif)',
          fontWeight: 600,
          fontSize,
          letterSpacing: '-0.02em',
          lineHeight: 1,
          color: wordmarkColor ?? 'currentColor',
        }}
      >
        Octively
      </span>
    </span>
  )
}
