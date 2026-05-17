'use client'

import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { X } from 'lucide-react'

interface OnboardingBannerProps {
  botId: string
}

export function OnboardingBanner({ botId: _botId }: OnboardingBannerProps) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  if (searchParams.get('onboarding') !== '1') return null

  function dismiss() {
    router.replace(pathname)
  }

  return (
    <div className="mx-4 sm:mx-8 mt-4 border-l-2 border-l-[var(--of-primary)] bg-[var(--of-primary)]/5 border border-[var(--of-primary)]/20 rounded-r-md px-5 py-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p
            className="text-[11px] font-semibold uppercase tracking-[0.05em] text-[var(--of-primary)] mb-2"
            style={{ fontFamily: 'var(--font-mono)' }}
          >
            bot.created · next_steps
          </p>
          <ol className="space-y-1 text-xs text-[var(--ink-muted)]">
            <li className="flex items-center gap-2" style={{ fontFamily: 'var(--font-mono)' }}>
              <span className="text-[var(--of-success)] shrink-0">✓</span>
              embed_key is ready
            </li>
            <li className="flex items-center gap-2" style={{ fontFamily: 'var(--font-mono)' }}>
              <span className="text-[var(--ink-subtle)] shrink-0">2.</span>
              copy embed script from <span className="text-[var(--ink)]">overview</span> tab → paste before {'</body>'}
            </li>
            <li className="flex items-center gap-2" style={{ fontFamily: 'var(--font-mono)' }}>
              <span className="text-[var(--ink-subtle)] shrink-0">3.</span>
              invite client via the <span className="text-[var(--ink)]">settings</span> tab
            </li>
          </ol>
        </div>
        <button
          onClick={dismiss}
          className="text-[var(--ink-muted)] hover:text-[var(--ink)] transition-colors shrink-0"
          aria-label="Dismiss"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
