'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Handshake, LayoutDashboard, Users, Wallet, Settings, LogOut } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/referrals', label: 'Referrals', icon: Users },
  { href: '/dashboard/payouts', label: 'Payouts', icon: Wallet },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
]

export default function AffiliatePortalNav({ affiliateName }: { affiliateName: string }) {
  const pathname = usePathname()
  const router = useRouter()

  async function handleSignOut() {
    document.cookie = 'aff_session=; path=/; max-age=0'
    router.push('/login')
  }

  return (
    <nav
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        background: 'rgba(250,250,249,0.85)',
        borderBottom: '1px solid var(--hairline)',
      }}
    >
      <div
        style={{
          maxWidth: 1100,
          margin: '0 auto',
          padding: '0 24px',
          height: 56,
          display: 'flex',
          alignItems: 'center',
          gap: 32,
        }}
      >
        <Link href="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
          <Handshake size={18} style={{ color: 'var(--of-primary)' }} />
          <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--ink)' }}>Affiliates</span>
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: 4, flex: 1 }}>
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(href))
            return (
              <Link
                key={href}
                href={href}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '6px 12px',
                  borderRadius: 'var(--r-md)',
                  fontSize: 13,
                  fontWeight: active ? 600 : 400,
                  color: active ? 'var(--ink)' : 'var(--ink-muted)',
                  background: active ? 'var(--surface-2)' : 'transparent',
                  textDecoration: 'none',
                  transition: 'background 0.15s, color 0.15s',
                }}
              >
                <Icon size={14} style={{ color: active ? 'var(--of-primary)' : 'currentColor' }} />
                {label}
              </Link>
            )
          })}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 12, color: 'var(--ink-muted)' }}>{affiliateName}</span>
          <button
            onClick={handleSignOut}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '6px 10px',
              background: 'none',
              border: 'none',
              color: 'var(--ink-muted)',
              fontSize: 12,
              cursor: 'pointer',
              borderRadius: 'var(--r-md)',
              transition: 'background 0.15s',
            }}
          >
            <LogOut size={14} />
          </button>
        </div>
      </div>
    </nav>
  )
}
