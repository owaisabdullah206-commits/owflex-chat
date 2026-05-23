// Inline "● Live" status dot with pulsing halo.
// Uses oct-halo keyframe from globals.css.
// Works as a server component — pure CSS animation.

interface Props {
  label?: string
  color?: string
  className?: string
  style?: React.CSSProperties
}

export function LiveIndicator({
  label = 'Live',
  color = '#10B981',
  className,
  style,
}: Props) {
  return (
    <span
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        fontFamily: 'var(--font-mono, monospace)',
        fontSize: 11,
        fontWeight: 500,
        letterSpacing: '0.04em',
        textTransform: 'uppercase',
        color: 'inherit',
        ...style,
      }}
    >
      <span style={{ position: 'relative', width: 10, height: 10, display: 'inline-block', flexShrink: 0 }}>
        {/* Expanding halo */}
        <span
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '50%',
            background: color,
            opacity: 0.4,
            animation: 'oct-halo 1.6s ease-out infinite',
          }}
        />
        {/* Solid dot */}
        <span
          style={{
            position: 'absolute',
            inset: 2,
            borderRadius: '50%',
            background: color,
          }}
        />
      </span>
      {label}
    </span>
  )
}
