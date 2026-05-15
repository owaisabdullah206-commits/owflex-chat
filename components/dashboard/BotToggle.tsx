'use client'

import { useTransition, useState } from 'react'
import { toggleBotActive } from '@/lib/db/queries/bots'

interface BotToggleProps {
  botId: string
  initialActive: boolean
}

export function BotToggle({ botId, initialActive }: BotToggleProps) {
  const [isActive, setIsActive] = useState(initialActive)
  const [isPending, startTransition] = useTransition()

  function handleToggle() {
    startTransition(async () => {
      const result = await toggleBotActive(botId)
      if (result.isActive !== undefined) setIsActive(result.isActive)
    })
  }

  return (
    <button
      onClick={handleToggle}
      disabled={isPending}
      title={isActive ? 'Deactivate bot' : 'Activate bot'}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-colors border ${
        isActive
          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/20'
          : 'bg-[var(--surface-2)] text-[var(--ink-muted)] border-[var(--hairline)] hover:bg-emerald-500/10 hover:text-emerald-400 hover:border-emerald-500/20'
      } disabled:opacity-50 disabled:cursor-not-allowed`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-emerald-400' : 'bg-[var(--ink-subtle)]'}`} />
      {isPending ? '…' : isActive ? 'Active' : 'Inactive'}
    </button>
  )
}
