'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Bot, Users, CreditCard, Settings, LogOut } from 'lucide-react'
import { authClient } from '@/lib/auth/client'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/dashboard/bots',     label: 'Bots',     icon: Bot },
  { href: '/dashboard/leads',    label: 'Leads',    icon: Users },
  { href: '/dashboard/billing',  label: 'Billing',  icon: CreditCard },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()

  async function handleSignOut() {
    await authClient.signOut()
    router.push('/dashboard/login')
  }

  return (
    <aside className="hidden md:flex fixed inset-y-0 left-0 w-56 flex-col bg-[var(--surface)] border-r border-[var(--hairline)] z-20">
      {/* Logo */}
      <div className="flex items-center gap-2 h-14 px-4 border-b border-[var(--hairline)]">
        <div className="w-6 h-6 rounded bg-[var(--of-primary)] flex items-center justify-center shrink-0">
          <span className="text-white text-xs font-bold">O</span>
        </div>
        <span className="text-[var(--ink)] font-semibold text-sm tracking-tight">OwFlex</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-3 space-y-0.5">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors',
                active
                  ? 'bg-[var(--surface-2)] text-[var(--ink)] font-medium'
                  : 'text-[var(--ink-muted)] hover:bg-[var(--surface-2)] hover:text-[var(--ink)]',
              )}
            >
              <Icon
                className={cn('h-4 w-4', active ? 'text-[var(--of-primary)]' : 'text-current')}
              />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Sign out */}
      <div className="px-2 pb-3">
        <button
          onClick={handleSignOut}
          className="flex w-full items-center gap-2.5 px-3 py-2 rounded-md text-sm text-[var(--ink-muted)] hover:bg-[var(--surface-2)] hover:text-[var(--ink)] transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
      </div>
    </aside>
  )
}
