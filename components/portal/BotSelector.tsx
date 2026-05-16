'use client'

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
    <select
      value={activeBotId}
      onChange={handleChange}
      className="text-sm bg-[var(--bg)] border border-[var(--hairline)] rounded-md px-2 py-1.5 text-[var(--ink)] focus:outline-none focus:border-[var(--of-primary)] cursor-pointer"
    >
      {bots.map((b) => (
        <option key={b.id} value={b.id}>
          {b.name}
        </option>
      ))}
    </select>
  )
}
