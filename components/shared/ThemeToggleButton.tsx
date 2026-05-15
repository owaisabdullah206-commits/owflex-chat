'use client'

import { Surface, Theme } from '@/lib/theme'
import { useTheme } from '@/hooks/useTheme'

// Controlled variant (used by layout.tsx)
interface ControlledProps {
  theme: Theme
  onToggle: () => void
  surface?: never
}

// Self-contained variant (used by TopNav, standalone)
interface SurfaceProps {
  surface: Surface
  theme?: never
  onToggle?: never
}

type Props = ControlledProps | SurfaceProps

function ToggleButton({ theme, onToggle }: { theme: Theme; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md
                 text-[var(--ink-muted)] text-xs font-medium
                 bg-[var(--surface-2)] border border-[var(--hairline)]
                 hover:text-[var(--ink)] transition-colors"
    >
      {theme === 'dark' ? '☀ Light' : '☾ Dark'}
    </button>
  )
}

function SelfContained({ surface }: { surface: Surface }) {
  const { theme, toggle } = useTheme(surface)
  return <ToggleButton theme={theme} onToggle={toggle} />
}

export function ThemeToggleButton(props: Props) {
  if (props.surface) {
    return <SelfContained surface={props.surface} />
  }
  return <ToggleButton theme={props.theme} onToggle={props.onToggle} />
}
