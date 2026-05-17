'use client'

import { useState, useTransition } from 'react'
import { updatePortalConfig, type PortalConfig } from '@/lib/db/queries/portal-config'

interface Props {
  botId: string
  initial: PortalConfig
}

interface Toggle {
  key: keyof PortalConfig
  label: string
  description: string
}

const TOGGLES: Toggle[] = [
  { key: 'showConversations', label: 'Conversations', description: 'Chat history tab' },
  { key: 'showLeads',         label: 'Leads',         description: 'Lead capture tab' },
  { key: 'showSettings',      label: 'Settings',      description: 'Account settings tab' },
]

function resolved(val: boolean | undefined): boolean {
  return val !== false
}

export function ClientPortalAccess({ botId, initial }: Props) {
  const [config, setConfig] = useState<PortalConfig>(initial)
  const [pending, startTransition] = useTransition()

  function toggle(key: keyof PortalConfig) {
    const next = { ...config, [key]: !resolved(config[key]) }
    setConfig(next)
    startTransition(async () => {
      try {
        await updatePortalConfig(botId, next)
      } catch {
        // revert on error
        setConfig(config)
      }
    })
  }

  return (
    <div className="flex flex-col gap-1.5">
      {TOGGLES.map(({ key, label, description }) => {
        const on = resolved(config[key])
        return (
          <button
            key={key}
            onClick={() => toggle(key)}
            disabled={pending}
            className="flex items-center justify-between gap-4 px-3 py-2 text-left hover:bg-[var(--surface-3)] transition-colors disabled:opacity-50 cursor-pointer"
          >
            <div>
              <p className="text-[12px] font-medium text-[var(--ink)] leading-none mb-0.5">{label}</p>
              <p className="text-[10px] text-[var(--ink-subtle)] leading-none">{description}</p>
            </div>
            {/* pill toggle */}
            <div
              className={`relative shrink-0 w-9 h-5 transition-colors ${on ? 'bg-[var(--of-primary)]' : 'bg-[var(--surface-3)] border border-[var(--hairline)]'}`}
            >
              <span
                className={`absolute top-0.5 w-4 h-4 bg-white transition-transform ${on ? 'translate-x-4' : 'translate-x-0.5'}`}
              />
            </div>
          </button>
        )
      })}
    </div>
  )
}
