'use client'

import { ChevronDown } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'

interface Bot {
  id: string
  name: string
}

interface BotSelectorProps {
  bots: Bot[]
  activeBotId: string
}

export function BotSelector({ bots, activeBotId }: BotSelectorProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  if (bots.length <= 1) return null

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const params = new URLSearchParams(searchParams.toString())
    params.set('bot', e.target.value)
    router.push(`?${params.toString()}`)
  }

  return (
    <div className="relative flex items-center">
      <select
        value={activeBotId}
        onChange={handleChange}
        className="appearance-none h-8 pl-3 pr-8 text-sm bg-[var(--surface)] border border-[var(--hairline)]
          rounded-lg text-[var(--ink)] focus:outline-none focus:border-[var(--of-primary)] cursor-pointer
          hover:border-[var(--hairline-strong)] transition-colors"
      >
        {bots.map((b) => (
          <option key={b.id} value={b.id}>
            {b.name}
          </option>
        ))}
      </select>
      <ChevronDown className="absolute right-2 h-3.5 w-3.5 text-[var(--ink-muted)] pointer-events-none" />
    </div>
  )
}
