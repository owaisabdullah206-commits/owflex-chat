'use client'

import { Suspense, useState } from 'react'
import { usePathname } from 'next/navigation'
import { authClient } from '@/lib/auth/client'
import { ThemeToggleButton } from '@/components/shared/ThemeToggleButton'
import { BotSelector } from '@/components/portal/BotSelector'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ChevronDown, LogOut, Menu, Settings, X } from 'lucide-react'

interface Bot {
  id: string
  name: string
}

interface TopNavProps {
  userEmail: string
  userName?: string | null
  bots?: Bot[]
  activeBotId?: string
}

const NAV_BASES = [
  { label: 'Overview', href: '/portal' },
  { label: 'Conversations', href: '/portal/conversations' },
  { label: 'Leads', href: '/portal/leads' },
  { label: 'Settings', href: '/portal/settings' },
]

export function TopNav({ userEmail, userName, bots, activeBotId }: TopNavProps) {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  const buildHref = (base: string) =>
    activeBotId ? `${base}?bot=${activeBotId}` : base

  async function handleSignOut() {
    await authClient.signOut()
    window.location.href = '/portal/login'
  }

  return (
    <header className="border-b border-[var(--hairline)] bg-[var(--surface)]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 flex items-center h-14 gap-4">
        {/* Logo */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="w-6 h-6 rounded bg-[var(--of-primary)] flex items-center justify-center">
            <span className="text-white text-xs font-bold">O</span>
          </div>
          <span className="text-sm font-semibold text-[var(--ink)]">OwFlex</span>
        </div>

        {/* Bot selector (only when multiple bots) */}
        {bots && activeBotId && (
          <Suspense fallback={null}>
            <BotSelector bots={bots} activeBotId={activeBotId} />
          </Suspense>
        )}

        {/* Desktop nav */}
        <nav className="hidden sm:flex items-center gap-1 flex-1">
          {NAV_BASES.map((link) => {
            const active = pathname === link.href
            return (
              <a
                key={link.href}
                href={buildHref(link.href)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  active
                    ? 'bg-[var(--of-primary-soft)] text-[var(--of-primary-text-light)]'
                    : 'text-[var(--ink-muted)] hover:text-[var(--ink)] hover:bg-[var(--bg)]'
                }`}
              >
                {link.label}
              </a>
            )
          })}
        </nav>

        {/* Right side */}
        <div className="ml-auto flex items-center gap-2">
          <ThemeToggleButton surface="portal" />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="hidden sm:flex items-center gap-1.5 text-sm text-[var(--ink-muted)] hover:text-[var(--ink)] px-2 py-1.5 rounded-md hover:bg-[var(--bg)] transition-colors cursor-pointer">
                <span className="max-w-[140px] truncate">{userName || userEmail}</span>
                <ChevronDown className="h-3.5 w-3.5 shrink-0" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <a href="/portal/settings" className="flex items-center cursor-pointer">
                  <Settings className="mr-2 h-4 w-4" />
                  Account Settings
                </a>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleSignOut}>
                <LogOut className="mr-2 h-4 w-4" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Mobile hamburger */}
          <button
            className="sm:hidden p-1.5 rounded-md text-[var(--ink-muted)] hover:text-[var(--ink)] cursor-pointer"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile nav */}
      {mobileOpen && (
        <div className="sm:hidden border-t border-[var(--hairline)] bg-[var(--surface)] px-4 py-3 space-y-1">
          <p className="text-xs text-[var(--ink-subtle)] px-3 pt-1 pb-2 truncate">{userEmail}</p>
          {NAV_BASES.map((link) => {
            const active = pathname === link.href
            return (
              <a
                key={link.href}
                href={buildHref(link.href)}
                className={`block px-3 py-2.5 rounded-md text-sm font-medium min-h-[44px] flex items-center ${
                  active
                    ? 'bg-[var(--of-primary-soft)] text-[var(--of-primary-text-light)]'
                    : 'text-[var(--ink-muted)] hover:text-[var(--ink)]'
                }`}
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </a>
            )
          })}
          <button
            onClick={handleSignOut}
            className="w-full text-left px-3 py-2.5 text-sm text-[var(--ink-muted)] hover:text-[var(--ink)] flex items-center gap-2 min-h-[44px] cursor-pointer"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </div>
      )}
    </header>
  )
}
