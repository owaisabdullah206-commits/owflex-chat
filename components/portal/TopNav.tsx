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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ChevronDown, LogOut, Menu, Settings, X } from 'lucide-react'

interface Bot {
  id: string
  name: string
}

export interface PortalConfig {
  showConversations?: boolean
  showLeads?: boolean
  showSettings?: boolean
}

interface TopNavProps {
  userEmail: string
  userName?: string | null
  bots?: Bot[]
  activeBotId?: string
  portalConfig?: PortalConfig | null
}

const ALL_NAV = [
  { label: 'Overview',      href: '/portal',               configKey: null                          },
  { label: 'Conversations', href: '/portal/conversations',  configKey: 'showConversations' as const  },
  { label: 'Leads',         href: '/portal/leads',          configKey: 'showLeads'         as const  },
  { label: 'Settings',      href: '/portal/settings',       configKey: 'showSettings'      as const  },
]

function isVisible(configKey: keyof PortalConfig | null, config: PortalConfig | null | undefined): boolean {
  if (!configKey) return true
  if (!config) return true
  return config[configKey] !== false
}

function initials(name: string | null | undefined, email: string): string {
  const src = name?.trim() || email
  const parts = src.split(/[\s@._-]+/).filter(Boolean)
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
  return src.slice(0, 2).toUpperCase()
}

export function TopNav({ userEmail, userName, bots, activeBotId, portalConfig }: TopNavProps) {
  const NAV_BASES = ALL_NAV.filter((n) => isVisible(n.configKey, portalConfig))
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  const userInitials = initials(userName, userEmail)

  const buildHref = (base: string) =>
    activeBotId ? `${base}?bot=${activeBotId}` : base

  const isActive = (href: string) =>
    href === '/portal'
      ? pathname === '/portal'
      : pathname === href || pathname.startsWith(href + '/')

  async function handleSignOut() {
    await authClient.signOut()
    window.location.href = '/portal/login'
  }

  return (
    <header className="bg-[var(--surface)] border-b border-[var(--hairline)] sticky top-0 z-30">
      {/* ── Desktop bar ── */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 flex items-stretch h-14">

        {/* Logo */}
        <div className="flex items-center gap-2 shrink-0 pr-5">
          <div className="w-7 h-7 rounded-md bg-[var(--of-primary)] flex items-center justify-center">
            <svg viewBox="0 0 16 16" fill="none" className="w-4 h-4">
              <path d="M8 2C4.686 2 2 4.686 2 8s2.686 6 6 6 6-2.686 6-6-2.686-6-6-6zm0 9.6A3.6 3.6 0 1 1 8 4.4a3.6 3.6 0 0 1 0 7.2z" fill="white"/>
            </svg>
          </div>
          <span className="text-sm font-semibold text-[var(--ink)] tracking-tight">octively</span>
        </div>

        {/* Separator */}
        <div className="hidden sm:block w-px bg-[var(--hairline)] my-3 mr-4" />

        {/* Bot selector */}
        {bots && bots.length > 0 && activeBotId && (
          <div className="hidden sm:flex items-center mr-3">
            <Suspense fallback={null}>
              <BotSelector bots={bots} activeBotId={activeBotId} />
            </Suspense>
          </div>
        )}

        {/* Desktop nav — items-stretch so links can carry full-height border-b */}
        <nav className="hidden sm:flex items-stretch gap-0">
          {NAV_BASES.map((link) => {
            const active = isActive(link.href)
            return (
              <a
                key={link.href}
                href={buildHref(link.href)}
                className={[
                  'flex items-center px-3.5 text-sm font-medium border-b-2 -mb-px transition-colors',
                  active
                    ? 'border-[var(--of-primary)] text-[var(--ink)]'
                    : 'border-transparent text-[var(--ink-muted)] hover:text-[var(--ink)]',
                ].join(' ')}
              >
                {link.label}
              </a>
            )
          })}
        </nav>

        {/* Right side */}
        <div className="ml-auto flex items-center gap-1.5">
          <div className="hidden sm:block">
            <ThemeToggleButton surface="portal" />
          </div>

          {/* Avatar dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="hidden sm:flex items-center gap-1.5 rounded-md px-1.5 py-1 hover:bg-[var(--bg)] transition-colors cursor-pointer group">
                <div className="w-7 h-7 rounded-full bg-[var(--of-primary-soft)] flex items-center justify-center">
                  <span className="text-[10px] font-bold text-[var(--of-primary-text-light)] leading-none">
                    {userInitials}
                  </span>
                </div>
                <ChevronDown className="h-3 w-3 text-[var(--ink-subtle)] group-hover:text-[var(--ink-muted)] transition-colors" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              <div className="px-3 py-2">
                {userName && (
                  <p className="text-sm font-medium text-[var(--ink)] truncate">{userName}</p>
                )}
                <p className="text-xs text-[var(--ink-muted)] truncate">{userEmail}</p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <a href="/portal/settings" className="flex items-center cursor-pointer">
                  <Settings className="mr-2 h-4 w-4" />
                  Account Settings
                </a>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={handleSignOut}
                className="text-[var(--error-text)] focus:text-[var(--error-text)] cursor-pointer"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Mobile hamburger */}
          <button
            className="sm:hidden p-2 -mr-1 rounded-md text-[var(--ink-muted)] hover:text-[var(--ink)] hover:bg-[var(--bg)] transition-colors cursor-pointer"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* ── Mobile drawer ── */}
      {mobileOpen && (
        <div className="sm:hidden border-t border-[var(--hairline)] bg-[var(--surface)]">
          {/* User row */}
          <div className="flex items-center gap-3 px-4 py-3.5 border-b border-[var(--hairline)]">
            <div className="w-9 h-9 rounded-full bg-[var(--of-primary-soft)] flex items-center justify-center shrink-0">
              <span className="text-xs font-bold text-[var(--of-primary-text-light)]">{userInitials}</span>
            </div>
            <div className="flex-1 min-w-0">
              {userName && (
                <p className="text-sm font-semibold text-[var(--ink)] truncate leading-none mb-0.5">{userName}</p>
              )}
              <p className="text-xs text-[var(--ink-muted)] truncate">{userEmail}</p>
            </div>
            <ThemeToggleButton surface="portal" />
          </div>

          {/* Nav links */}
          <nav className="px-3 py-2 space-y-0.5">
            {NAV_BASES.map((link) => {
              const active = isActive(link.href)
              return (
                <a
                  key={link.href}
                  href={buildHref(link.href)}
                  onClick={() => setMobileOpen(false)}
                  className={[
                    'flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium min-h-[44px] transition-colors',
                    active
                      ? 'bg-[var(--of-primary-soft)] text-[var(--of-primary-text-light)]'
                      : 'text-[var(--ink-muted)] hover:text-[var(--ink)] hover:bg-[var(--bg)]',
                  ].join(' ')}
                >
                  {link.label}
                </a>
              )
            })}
          </nav>

          {/* Sign out */}
          <div className="px-3 py-2 border-t border-[var(--hairline)]">
            <button
              onClick={handleSignOut}
              className="flex items-center gap-3 w-full px-3 py-2.5 rounded-md text-sm font-medium text-[var(--error-text)] hover:bg-[var(--of-primary-soft)]/10 min-h-[44px] transition-colors cursor-pointer"
            >
              <LogOut className="h-4 w-4 shrink-0" />
              Sign out
            </button>
          </div>
        </div>
      )}
    </header>
  )
}
