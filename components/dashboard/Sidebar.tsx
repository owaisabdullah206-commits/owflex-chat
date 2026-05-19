'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Bot, Users, UserCheck, CreditCard, Settings, LogOut, BarChart2, Cpu, Shield, Activity, GitBranch } from 'lucide-react'
import { authClient } from '@/lib/auth/client'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/dashboard/bots',     label: 'Bots',     icon: Bot },
  { href: '/dashboard/leads',    label: 'Leads',    icon: Users },
  { href: '/dashboard/clients',  label: 'Clients',  icon: UserCheck },
  { href: '/dashboard/billing',  label: 'Billing',  icon: CreditCard },
  { href: '/dashboard/usage',    label: 'Usage',    icon: Activity },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
]

const adminItems = [
  { href: '/dashboard/admin/developers', label: 'Developers', icon: Users },
  { href: '/dashboard/admin/analytics',  label: 'Analytics',  icon: BarChart2 },
  { href: '/dashboard/admin/routing',    label: 'Routing',    icon: GitBranch },
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
        'flex items-center gap-2 px-3 py-[7px] text-[13px] transition-colors',
        active
          ? 'bg-[var(--surface-2)] text-[var(--ink)] font-medium'
          : 'text-[var(--ink-muted)] hover:bg-[var(--surface-2)] hover:text-[var(--ink)]',
      )}
      style={{ fontFamily: 'var(--font-mono)' }}
    >
      <Icon className={cn('h-3.5 w-3.5 shrink-0', active ? 'text-[var(--of-primary)]' : 'text-current')} />
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
      <div className="flex items-center gap-2.5 h-12 px-4 border-b border-[var(--hairline)]">
        <div className="w-2 h-2 rounded-full bg-[var(--of-primary)] shrink-0" />
        <span
          className="text-[var(--ink)] font-semibold text-sm tracking-[-0.02em]"
          style={{ fontFamily: 'var(--font-mono)' }}
        >
          octively
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
        {navItems.map(({ href, label, icon }) => (
          <NavLink key={href} href={href} label={label} icon={icon} pathname={pathname} />
        ))}

        {isAdmin && (
          <>
            <div className="pt-4 pb-1 px-3">
              <span
                className="text-[9px] font-semibold uppercase tracking-[0.12em] text-[var(--ink-subtle)]"
                style={{ fontFamily: 'var(--font-mono)' }}
              >
                admin
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
          className="flex w-full items-center gap-2 px-3 py-[7px] text-[13px] text-[var(--ink-muted)] hover:bg-[var(--surface-2)] hover:text-[var(--ink)] transition-colors cursor-pointer"
          style={{ fontFamily: 'var(--font-mono)' }}
        >
          <LogOut className="h-3.5 w-3.5" />
          Sign out
        </button>
      </div>
    </aside>
  )
}
