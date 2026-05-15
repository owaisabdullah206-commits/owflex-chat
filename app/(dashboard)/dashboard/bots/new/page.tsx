'use client'

import { useActionState } from 'react'
import { Sidebar } from '@/components/dashboard/Sidebar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createBot } from '@/lib/db/queries/bots'

const DEFAULT_SYSTEM_PROMPT = 'You are a helpful assistant.'

export default function NewBotPage() {
  const [state, action, pending] = useActionState(createBot, null)

  return (
    <div className="flex min-h-screen bg-[var(--bg)]">
      <Sidebar />
      <main className="flex-1 ml-56">
        <div className="px-8 py-5 border-b border-[var(--hairline)]">
          <h1 className="text-lg font-semibold text-[var(--ink)]">Create a new bot</h1>
          <p className="text-sm text-[var(--ink-muted)] mt-0.5">
            Set up your bot and get an embed script
          </p>
        </div>

        <div className="px-8 py-8 max-w-xl">
          <form action={action} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium text-[var(--ink)]">
                Bot name
              </Label>
              <Input
                id="name"
                name="name"
                placeholder="e.g. Support Bot, Sales Assistant"
                required
                className="bg-[var(--surface)] border-[var(--hairline-md)] text-[var(--ink)]
                  placeholder:text-[var(--ink-subtle)] focus-visible:ring-[var(--of-primary)]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="systemPrompt" className="text-sm font-medium text-[var(--ink)]">
                System prompt
              </Label>
              <p className="text-xs text-[var(--ink-muted)]">
                Instructions that define how your bot behaves.
              </p>
              <textarea
                id="systemPrompt"
                name="systemPrompt"
                rows={6}
                defaultValue={DEFAULT_SYSTEM_PROMPT}
                required
                className="w-full rounded-md border border-[var(--hairline-md)] bg-[var(--surface)]
                  px-3 py-2 text-sm text-[var(--ink)] placeholder:text-[var(--ink-subtle)]
                  focus:outline-none focus:ring-2 focus:ring-[var(--of-primary)] focus:ring-offset-0
                  resize-y min-h-[120px]"
              />
            </div>

            {state?.error && (
              <p className="text-sm text-[var(--of-error-dark)]">{state.error}</p>
            )}

            <div className="flex items-center gap-3 pt-2">
              <Button type="submit" disabled={pending}>
                {pending ? 'Creating…' : 'Create bot'}
              </Button>
              <Button variant="ghost" asChild>
                <a href="/dashboard/bots">Cancel</a>
              </Button>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}
