'use client'
import { useTheme } from '@/hooks/useTheme'
import { ThemeToggleButton } from '@/components/shared/ThemeToggleButton'

const themeScript = `(function(){
  var stored = localStorage.getItem('owflex-theme-dashboard');
  var systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  var theme = stored || (systemDark ? 'dark' : 'light');
  document.documentElement.classList.add('dashboard', theme);
})()`

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { theme, toggle } = useTheme('dashboard')

  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      <div className="flex min-h-screen bg-[var(--bg)]">
        <div className="flex-1 flex flex-col">
          <header className="flex items-center justify-end px-4 py-2 border-b border-[var(--hairline)]">
            <ThemeToggleButton theme={theme} onToggle={toggle} />
          </header>
          <main className="flex-1">{children}</main>
        </div>
      </div>
    </>
  )
}
