'use client'

import { useRouter } from 'next/navigation'

interface BotTabSelectProps {
  botId: string
  tabs: readonly string[]
  activeTab: string
}

export function BotTabSelect({ botId, tabs, activeTab }: BotTabSelectProps) {
  const router = useRouter()
  return (
    <select
      value={activeTab}
      onChange={(e) => router.push(`/dashboard/bots/${botId}?tab=${e.target.value}`)}
      className="sm:hidden w-full text-sm bg-[var(--surface)] border border-[var(--hairline)] rounded-md px-3 py-2 text-[var(--ink)] focus:outline-none focus:border-[var(--of-primary)] cursor-pointer"
    >
      {tabs.map((t) => (
        <option key={t} value={t.toLowerCase()}>
          {t}
        </option>
      ))}
    </select>
  )
}
