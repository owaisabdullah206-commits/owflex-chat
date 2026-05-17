'use client'

import { useRouter } from 'next/navigation'
import { ChevronDown } from 'lucide-react'

interface BotTabSelectProps {
  botId: string
  tabs: readonly string[]
  activeTab: string
}

export function BotTabSelect({ botId, tabs, activeTab }: BotTabSelectProps) {
  const router = useRouter()
  return (
    <div className="relative sm:hidden">
      <select
        value={activeTab}
        onChange={(e) => router.push(`/dashboard/bots/${botId}?tab=${e.target.value}`)}
        className="w-full appearance-none text-sm bg-[var(--bg)] border border-[var(--hairline)] pl-3 pr-8 py-2 text-[var(--ink)] focus:outline-none focus:border-[var(--of-primary)] cursor-pointer"
      >
        {tabs.map((t) => (
          <option key={t} value={t.toLowerCase()}>
            {t}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[var(--ink-muted)]" />
    </div>
  )
}
