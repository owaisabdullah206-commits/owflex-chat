'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, LogOut, MessageSquare, Users } from 'lucide-react'
import { authClient } from '@/lib/auth/client'

const items = [
  { href: '/portal',               label: 'Overview',      icon: LayoutDashboard },
  { href: '/portal/conversations', label: 'Conversations', icon: MessageSquare },
  { href: '/portal/leads',         label: 'Leads',         icon: Users },
]

export function MobileBottomNav() {
  const pathname = usePathname()

  async function handleSignOut() {
    await authClient.signOut()
    window.location.href = '/portal/login'
  }

  return (
    <nav className="sm:hidden fixed bottom-0 inset-x-0 bg-[var(--surface)] border-t border-[var(--hairline)] z-30 flex">
      {items.map(({ href, label, icon: Icon }) => {
        const active =
          href === '/portal' ? pathname === href : pathname.startsWith(href)
        return (
          <Link
            key={href}
            href={href}
            className={`flex-1 flex flex-col items-center gap-1 py-3 text-[10px] font-medium transition-colors cursor-pointer ${
              active ? 'text-[var(--of-primary)]' : 'text-[var(--ink-muted)]'
            }`}
          >
            <Icon className="h-5 w-5" />
            {label}
          </Link>
        )
      })}
      <button
        onClick={handleSignOut}
        className="flex-1 flex flex-col items-center gap-1 py-3 text-[10px] font-medium text-[var(--ink-muted)] hover:text-[var(--of-error-dark)] transition-colors cursor-pointer"
      >
        <LogOut className="h-5 w-5" />
        Sign out
      </button>
    </nav>
  )
}
