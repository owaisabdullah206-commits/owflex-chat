'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Bot, Users, UserCheck, CreditCard, Settings, LogOut, BarChart2, Cpu, Shield } from 'lucide-react'
import { authClient } from '@/lib/auth/client'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/dashboard/bots',     label: 'Bots',     icon: Bot },
  { href: '/dashboard/leads',    label: 'Leads',    icon: Users },
  { href: '/dashboard/clients',  label: 'Clients',  icon: UserCheck },
  { href: '/dashboard/billing',  label: 'Billing',  icon: CreditCard },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
]

const adminItems = [
  { href: '/dashboard/admin/developers', label: 'Developers', icon: Users },
  { href: '/dashboard/admin/analytics',  label: 'Analytics',  icon: BarChart2 },
  { href: '/dashboard/admin/models',     label: 'Models',     icon: Cpu },
  { href: '/dashboard/admin/platform',   label: 'Platform',   icon: Shield },
]

function NavLink({ href, label, icon: Icon, pathname }: {
  href: string; label: string; icon: React.ElementType; pathname: string
}) {
  const active = pathname.startsWith(href)
  return (
    <Link
      href={href}
      className={cn(
        'flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors',
        active
          ? 'bg-[var(--surface-2)] text-[var(--ink)] font-medium'
          : 'text-[var(--ink-muted)] hover:bg-[var(--surface-2)] hover:text-[var(--ink)]',
      )}
    >
      <Icon className={cn('h-4 w-4', active ? 'text-[var(--of-primary)]' : 'text-current')} />
      {label}
    </Link>
  )
}

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { data: session } = authClient.useSession()
  const isAdmin = session?.user?.email === process.env.NEXT_PUBLIC_PLATFORM_OWNER_EMAIL

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
      <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
        {navItems.map(({ href, label, icon }) => (
          <NavLink key={href} href={href} label={label} icon={icon} pathname={pathname} />
        ))}

        {isAdmin && (
          <>
            <div className="pt-3 pb-1 px-3">
              <span className="text-[10px] font-semibold uppercase tracking-widest text-[var(--ink-subtle)]">
                Admin
              </span>
            </div>
            {adminItems.map(({ href, label, icon }) => (
              <NavLink key={href} href={href} label={label} icon={icon} pathname={pathname} />
            ))}
          </>
        )}
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
