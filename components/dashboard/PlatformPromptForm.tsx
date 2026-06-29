'use client'

import { useTransition, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

interface PlatformPromptFormProps {
  currentPrompt: string
  onSave: (text: string) => Promise<void>
}

export function PlatformPromptForm({ currentPrompt, onSave }: PlatformPromptFormProps) {
  const [isPending, startTransition] = useTransition()
  const [prompt, setPrompt] = useState(currentPrompt)
  const [saved, setSaved] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    startTransition(async () => {
      await onSave(prompt)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="platformPrompt" className="text-xs text-[var(--ink-muted)]">
          Platform Prompt
        </Label>
        <Textarea
          id="platformPrompt"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          rows={12}
          placeholder="Leave empty to disable. This prompt prepends every agent's system prompt."
          className="rounded-none bg-[var(--surface)] border-[var(--hairline)] text-[var(--ink)] resize-none"
          disabled={isPending}
        />
        <p className="text-xs text-[var(--ink-muted)]">
          Changes take effect immediately. An empty prompt means no platform prefix.
        </p>
      </div>
      <div className="flex items-center gap-3">
        <Button
          type="submit"
          disabled={isPending}
          className="rounded-none bg-[var(--of-primary)] hover:bg-[var(--of-primary-hover)] text-white"
        >
          {isPending ? 'Saving…' : 'Save Platform Prompt'}
        </Button>
        {saved && <span className="text-xs text-emerald-400">Saved — changes are live</span>}
      </div>
    </form>
  )
}
