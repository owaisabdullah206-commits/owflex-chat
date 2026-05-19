'use client'
import { useState, useEffect } from 'react'
import { Surface, Theme, DEFAULTS, getInitialTheme, applyTheme } from '@/lib/theme'

export function useTheme(surface: Surface) {
  const [theme, setTheme] = useState<Theme>(DEFAULTS[surface])

  useEffect(() => {
    const initial = getInitialTheme(surface)
    setTheme(initial)
    applyTheme(surface, initial)

    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = (e: MediaQueryListEvent) => {
      if (!localStorage.getItem('octively-theme')) {
        const t: Theme = e.matches ? 'dark' : 'light'
        setTheme(t)
        applyTheme(surface, t)
      }
    }
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [surface])

  const toggle = () => {
    const next: Theme = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    applyTheme(surface, next)
  }

  return { theme, toggle }
}
