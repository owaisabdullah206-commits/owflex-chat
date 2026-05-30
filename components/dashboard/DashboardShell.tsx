'use client'

import { usePathname } from 'next/navigation'
import { useTheme } from '@/hooks/useTheme'
import { ThemeToggleButton } from '@/components/shared/ThemeToggleButton'
import { HeaderCreditPill } from '@/components/dashboard/HeaderCreditPill'
import { Toaster } from '@/components/ui/sonner'

const themeScript = `(function(){
  var stored = localStorage.getItem('Octively-theme-dashboard');
  var systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  var theme = stored || (systemDark ? 'dark' : 'light');
  document.documentElement.classList.add('dashboard', theme);
})()`

const AUTH_PATHS = [
  '/dashboard/login',
  '/dashboard/signup',
  '/dashboard/forgot-password',
  '/dashboard/reset-password',
]

export function DashboardShell({ children, banner, isPlatformOwner = false }: { children: React.ReactNode; banner?: React.ReactNode; isPlatformOwner?: boolean }) {
  const { theme, toggle } = useTheme('dashboard')
  const pathname = usePathname()
  const isAuthPage = AUTH_PATHS.includes(pathname)

  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      <div className="flex min-h-screen bg-[var(--bg)]">
        <div className="flex-1 flex flex-col">
          {isAuthPage ? (
            // Auth pages: no header bar, just a floating theme toggle in the corner
            <div className="fixed top-3 right-4 z-50">
              <ThemeToggleButton theme={theme} onToggle={toggle} />
            </div>
          ) : (
            <>
              {banner}
              <header className="flex items-center justify-end gap-3 px-4 py-2 border-b border-[var(--hairline)]">
                <HeaderCreditPill />
                <ThemeToggleButton theme={theme} onToggle={toggle} />
              </header>
            </>
          )}
          <main className="flex-1">{children}</main>
        </div>
      </div>
      <Toaster position="bottom-right" />
    </>
  )
}
