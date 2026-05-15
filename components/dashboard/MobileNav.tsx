'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Bot, Users, CreditCard, Settings } from 'lucide-react'

const items = [
  { href: '/dashboard/bots',     label: 'Bots',     icon: Bot },
  { href: '/dashboard/leads',    label: 'Leads',    icon: Users },
  { href: '/dashboard/billing',  label: 'Billing',  icon: CreditCard },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
]

export function MobileNav() {
  const pathname = usePathname()

  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 bg-[var(--surface)] border-t border-[var(--hairline)] z-30 flex safe-area-pb">
      {items.map(({ href, label, icon: Icon }) => {
        const active = pathname.startsWith(href)
        return (
          <Link
            key={href}
            href={href}
            className={`flex-1 flex flex-col items-center gap-1 py-2 text-[10px] font-medium transition-colors ${
              active ? 'text-[var(--of-primary)]' : 'text-[var(--ink-muted)]'
            }`}
          >
            <Icon className="h-5 w-5" />
            {label}
          </Link>
        )
      })}
    </nav>
  )
}
