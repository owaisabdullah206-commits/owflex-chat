'use client'

import { LogOut } from 'lucide-react'
import { authClient } from '@/lib/auth/client'

export function SignOutButton() {
  async function handle() {
    await authClient.signOut()
    window.location.href = '/dashboard/login'
  }

  return (
    <button
      onClick={handle}
      className="flex items-center gap-2 text-sm text-[var(--error-text)]
        border border-[var(--error-text)] px-4 py-2
        hover:bg-[var(--of-error)]/10 transition-colors cursor-pointer"
    >
      <LogOut className="h-4 w-4" />
      Sign out
    </button>
  )
}
