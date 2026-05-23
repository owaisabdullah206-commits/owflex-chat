'use client'

// CTA button: compass mark rotates 135° on hover. Three sizes, two variants.

import { useState } from 'react'

const G = { hub: 6, near: 14, far: 46, halfBase: 4 } as const

function bladePath(theta: number): string {
  const cx = 50, cy = 50
  const px = (r: number, off = 0) =>
    `${(cx + Math.cos(theta) * r - Math.sin(theta) * off).toFixed(2)},${(cy + Math.sin(theta) * r + Math.cos(theta) * off).toFixed(2)}`
  return `M ${px(G.near, -G.halfBase)} L ${px(G.far, 0)} L ${px(G.near, G.halfBase)} Z`
}

type Size = 'sm' | 'md' | 'lg'
type Variant = 'primary' | 'ghost'

interface Props {
  children: React.ReactNode
  href?: string
  onClick?: () => void
  size?: Size
  variant?: Variant
  color?: string
  disabled?: boolean
  type?: 'button' | 'submit' | 'reset'
  className?: string
}

const SIZE_MAP: Record<Size, { height: number; px: string; fontSize: number; iconSize: number; gap: number }> = {
  sm: { height: 34, px: '0 14px', fontSize: 13, iconSize: 14, gap: 7 },
  md: { height: 40, px: '0 16px', fontSize: 14, iconSize: 16, gap: 8 },
  lg: { height: 48, px: '0 22px', fontSize: 15, iconSize: 18, gap: 10 },
}

export function OctivelyButton({
  children,
  href,
  onClick,
  size = 'md',
  variant = 'primary',
  color = '#0EA5E9',
  disabled,
  type = 'button',
  className,
}: Props) {
  const [hovered, setHovered] = useState(false)
  const s = SIZE_MAP[size]

  const baseStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: s.gap,
    height: s.height,
    padding: s.px,
    borderRadius: 10,
    fontFamily: 'var(--font-sans, Inter, sans-serif)',
    fontWeight: 600,
    fontSize: s.fontSize,
    letterSpacing: '-0.01em',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1,
    border: 'none',
    transition: 'background-color .15s, box-shadow .15s, transform .1s',
    textDecoration: 'none',
    whiteSpace: 'nowrap',
  }

  const variantStyle: React.CSSProperties =
    variant === 'primary'
      ? {
          background: color,
          color: '#fff',
          boxShadow: hovered
            ? '0 4px 16px rgba(14,165,233,.28), inset 0 1px 0 rgba(255,255,255,.18)'
            : '0 1px 2px rgba(0,0,0,.06), inset 0 1px 0 rgba(255,255,255,.18)',
        }
      : {
          background: 'transparent',
          color: 'currentColor',
          border: '1px solid var(--hairline-strong, rgba(0,0,0,0.14))',
          boxShadow: 'none',
        }

  const icon = (
    <svg
      width={s.iconSize}
      height={s.iconSize}
      viewBox="0 0 100 100"
      fill="none"
      aria-hidden="true"
      style={{
        transition: 'transform .8s cubic-bezier(.22,.61,.36,1)',
        transform: hovered ? 'rotate(135deg)' : 'rotate(0deg)',
        transformOrigin: 'center',
        flexShrink: 0,
      }}
    >
      {Array.from({ length: 8 }, (_, i) => (
        <path
          key={i}
          d={bladePath((i * 45 - 90) * (Math.PI / 180))}
          fill={variant === 'primary' ? '#fff' : color}
          fillOpacity={i % 2 === 0 ? 1 : 0.55}
        />
      ))}
      <circle cx="50" cy="50" r={G.hub} fill={variant === 'primary' ? '#fff' : color} />
    </svg>
  )

  const props = {
    style: { ...baseStyle, ...variantStyle },
    className,
    onMouseEnter: () => setHovered(true),
    onMouseLeave: () => setHovered(false),
  }

  if (href) {
    return (
      <a href={href} {...props}>
        {icon}
        {children}
      </a>
    )
  }

  return (
    <button type={type} disabled={disabled} onClick={onClick} {...props}>
      {icon}
      {children}
    </button>
  )
}
