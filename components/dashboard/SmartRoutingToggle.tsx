'use client'

import { useOptimistic, useTransition } from 'react'
import { toast } from 'sonner'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { updateSmartRouting } from '@/lib/db/queries/bots'

interface Props {
  botId: string
  initialEnabled: boolean
}

export function SmartRoutingToggle({ botId, initialEnabled }: Props) {
  const [optimisticEnabled, setOptimistic] = useOptimistic(initialEnabled)
  const [isPending, startTransition] = useTransition()

  function handleChange(checked: boolean) {
    startTransition(async () => {
      setOptimistic(checked)
      const result = await updateSmartRouting(botId, checked)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success(`Smart routing ${checked ? 'enabled' : 'disabled'}`)
      }
    })
  }

  return (
    <div className="flex items-start gap-4 rounded-xl border border-[var(--hairline)] bg-[var(--surface)] p-4">
      <Switch
        id="smart-routing"
        checked={optimisticEnabled}
        onCheckedChange={handleChange}
        disabled={isPending}
        className="mt-0.5"
      />
      <div>
        <Label htmlFor="smart-routing" className="text-sm font-medium text-[var(--ink)] cursor-pointer">
          Smart routing {optimisticEnabled ? '(on)' : '(off)'}
        </Label>
        <p className="text-xs text-[var(--ink-muted)] mt-0.5">
          {optimisticEnabled
            ? 'Classifying each message — greetings use your default model, complex questions use a stronger model.'
            : 'All messages use your bot\'s single configured model. Enable to save credits on simple messages.'}
        </p>
      </div>
    </div>
  )
}
