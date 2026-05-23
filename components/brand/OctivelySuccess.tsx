'use client'

// Spin → settle → checkmark morph. Three states: idle | loading | done.
// Uses oct-spin, oct-pulse-mark, oct-check-in keyframes from globals.css.

import { useState, useEffect } from 'react'

type State = 'idle' | 'loading' | 'done'

interface Props {
  size?: number
  color?: string
  successColor?: string
  onComplete?: () => void
  className?: string
}

const G = { hub: 6, near: 14, far: 46, halfBase: 4 } as const

function bladePath(theta: number): string {
  const cx = 50, cy = 50
  const px = (r: number, off = 0) =>
    `${(cx + Math.cos(theta) * r - Math.sin(theta) * off).toFixed(2)},${(cy + Math.sin(theta) * r + Math.cos(theta) * off).toFixed(2)}`
  return `M ${px(G.near, -G.halfBase)} L ${px(G.far, 0)} L ${px(G.near, G.halfBase)} Z`
}

export function OctivelySuccess({
  size = 88,
  color = '#0EA5E9',
  successColor,
  onComplete,
  className,
}: Props) {
  const [state, setState] = useState<State>('idle')

  useEffect(() => {
    if (state !== 'loading') return
    const id = setTimeout(() => {
      setState('done')
      onComplete?.()
    }, 1400)
    return () => clearTimeout(id)
  }, [state, onComplete])

  const checkColor = successColor ?? color

  return (
    <div
      className={className}
      style={{ width: size, height: size, position: 'relative', display: 'inline-block' }}
    >
      {state !== 'done' ? (
        <svg
          width={size}
          height={size}
          viewBox="0 0 100 100"
          fill="none"
          style={{
            transformOrigin: 'center',
            animation: state === 'loading' ? 'oct-spin 1.2s linear infinite' : 'none',
          }}
        >
          {Array.from({ length: 8 }, (_, i) => (
            <path
              key={i}
              d={bladePath((i * 45 - 90) * (Math.PI / 180))}
              fill={color}
              fillOpacity={state === 'loading' ? (i % 2 === 0 ? 1 : 0.5) : 1}
            />
          ))}
          <circle cx="50" cy="50" r={G.hub} fill={color} />
        </svg>
      ) : (
        <svg
          width={size}
          height={size}
          viewBox="0 0 100 100"
          fill="none"
          style={{ animation: 'oct-pulse-mark .6s ease-out 1', transformOrigin: 'center' }}
        >
          <circle cx="50" cy="50" r="42" fill={checkColor} />
          <path
            d="M30 51 L45 65 L70 36"
            stroke="white"
            strokeWidth="8"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
            pathLength="1"
            strokeDasharray="1 1"
            style={{ animation: 'oct-check-in .45s cubic-bezier(.22,.61,.36,1) forwards' }}
          />
        </svg>
      )}
    </div>
  )
}

// Convenience hook for forms: returns { trigger, reset, state, isLoading, isDone }
export function useSuccessState() {
  const [state, setState] = useState<State>('idle')
  return {
    state,
    isLoading: state === 'loading',
    isDone: state === 'done',
    trigger: () => setState('loading'),
    reset: () => setState('idle'),
  }
}
