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
    <div className="mx-4 sm:mx-8 mt-4 rounded-xl border border-[var(--of-primary)]/30 bg-[var(--of-primary)]/5 px-5 py-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-[var(--ink)] mb-2">
            Bot created! Here&apos;s what to do next:
          </p>
          <ol className="space-y-1.5 text-sm text-[var(--ink-muted)]">
            <li className="flex items-center gap-2">
              <span className="text-emerald-500 font-medium shrink-0">✓</span>
              Bot created — your embed key is ready
            </li>
            <li className="flex items-center gap-2">
              <span className="text-[var(--ink-subtle)] shrink-0 font-medium">2.</span>
              Copy the embed script from the <strong className="text-[var(--ink)]">Overview</strong> tab and paste it into your website
            </li>
            <li className="flex items-center gap-2">
              <span className="text-[var(--ink-subtle)] shrink-0 font-medium">3.</span>
              Use the <strong className="text-[var(--ink)]">Invite</strong> button above to give your client portal access
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
