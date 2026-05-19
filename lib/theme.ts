export type Surface = 'dashboard' | 'portal'
export type Theme = 'dark' | 'light'

export const DEFAULTS: Record<Surface, Theme> = {
  dashboard: 'dark',
  portal: 'light',
}

function storageKey(surface: Surface) {
  return `octively-theme-${surface}`
}

export function getInitialTheme(surface: Surface): Theme {
  if (typeof window === 'undefined') return DEFAULTS[surface]
  // 1. Surface-specific stored preference
  const stored = localStorage.getItem(storageKey(surface)) as Theme | null
  if (stored === 'dark' || stored === 'light') return stored
  // 2. System preference
  const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches
  return systemDark ? 'dark' : 'light'
}

export function applyTheme(surface: Surface, theme: Theme) {
  const html = document.documentElement
  html.classList.remove('dashboard', 'portal', 'marketing', 'dark', 'light')
  html.classList.add(surface)
  html.classList.add(theme)
  localStorage.setItem(storageKey(surface), theme)
}
