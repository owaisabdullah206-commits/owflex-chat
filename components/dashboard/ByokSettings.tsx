'use client'

import { useTransition, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { saveOrgApiKey, clearOrgApiKey } from '@/lib/db/queries/account'

interface ByokSettingsProps {
  hasKey: boolean
}

export function ByokSettings({ hasKey }: ByokSettingsProps) {
  const [isPending, startTransition] = useTransition()
  const [apiKey, setApiKey]  = useState('')
  const [saved, setSaved]    = useState(false)
  const [error, setError]    = useState<string | null>(null)
  const [keySet, setKeySet]  = useState(hasKey)

  function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!apiKey.trim()) return
    setSaved(false)
    setError(null)
    startTransition(async () => {
      const res = await saveOrgApiKey(apiKey.trim())
      if (res.error) {
        setError(res.error)
      } else {
        setSaved(true)
        setApiKey('')
        setKeySet(true)
      }
    })
  }

  function handleClear() {
    setError(null)
    setSaved(false)
    startTransition(async () => {
      const res = await clearOrgApiKey()
      if (res.error) {
        setError(res.error)
      } else {
        setKeySet(false)
      }
    })
  }

  return (
    <div className="border border-[var(--hairline)] bg-[var(--surface)] overflow-hidden">
      <div className="px-5 py-4 border-b border-[var(--hairline)]">
        <p className="text-[11px] font-semibold uppercase tracking-[0.05em] text-[var(--ink-subtle)] mb-0.5" style={{ fontFamily: 'var(--font-mono)' }}>
          llm_api_key (BYOK)
        </p>
        <p className="text-xs text-[var(--ink-muted)]">
          Use your own OpenAI, Anthropic, or LiteLLM-compatible key. Leave blank to use the platform key.
        </p>
      </div>

      <div className="px-5 py-4 space-y-3">
        {keySet ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span
                className="w-2 h-2 rounded-full bg-[var(--of-success)]"
                style={{ display: 'inline-block' }}
              />
              <span className="text-[12px] text-[var(--ink-muted)]" style={{ fontFamily: 'var(--font-mono)' }}>
                key_stored · encrypted at rest
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="text-[11px] text-red-500 hover:text-red-600 h-7"
              onClick={handleClear}
              disabled={isPending}
            >
              Remove key
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSave} className="flex gap-2">
            <Input
              type="password"
              placeholder="sk-… or key-…"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="flex-1 font-mono text-[12px] h-8"
              disabled={isPending}
              autoComplete="off"
            />
            <Button type="submit" size="sm" disabled={isPending || !apiKey.trim()} className="h-8 text-[12px]">
              {isPending ? 'Saving…' : 'Save'}
            </Button>
          </form>
        )}

        {saved && <p className="text-[11px] text-[var(--of-success)]" style={{ fontFamily: 'var(--font-mono)' }}>key_saved</p>}
        {error && <p className="text-[11px] text-red-500" style={{ fontFamily: 'var(--font-mono)' }}>{error}</p>}
      </div>
    </div>
  )
}
