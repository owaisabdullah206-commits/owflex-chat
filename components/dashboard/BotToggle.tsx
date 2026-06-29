'use client'

import { useTransition, useState } from 'react'
import { toggleBotActive } from '@/lib/db/queries/bots'
import { LiveIndicator } from '@/components/brand/LiveIndicator'

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
      title={isActive ? 'Deactivate agent' : 'Activate agent'}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-colors border cursor-pointer ${
        isActive
          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/20'
          : 'bg-[var(--surface-2)] text-[var(--ink-muted)] border-[var(--hairline)] hover:bg-emerald-500/10 hover:text-emerald-400 hover:border-emerald-500/20'
      } disabled:opacity-50 disabled:cursor-not-allowed`}
    >
      {isActive
        ? <LiveIndicator label={isPending ? '…' : 'Active'} color="#10B981" style={{ fontSize: 11 }} />
        : <span className="flex items-center gap-1.5">{isPending ? '…' : 'Inactive'}</span>
      }
    </button>
  )
}
