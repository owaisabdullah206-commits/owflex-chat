'use client'

import { useState, useTransition } from 'react'
import { updateClientProfile } from '@/lib/db/queries/account'

export function PortalSettingsForm({ initialName, email }: { initialName: string; email: string }) {
  const [name, setName]           = useState(initialName)
  const [saved, setSaved]         = useState(false)
  const [error, setError]         = useState('')
  const [pending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaved(false)
    setError('')
    startTransition(async () => {
      const res = await updateClientProfile(name)
      if (res.error) {
        setError(res.error)
      } else {
        setSaved(true)
        setTimeout(() => setSaved(false), 3000)
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Email (read-only) */}
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-[var(--ink-muted)]">Email</label>
        <div className="px-3 py-2.5 rounded-lg bg-[var(--bg)] border border-[var(--hairline)] text-sm text-[var(--ink-subtle)]">
          {email}
        </div>
        <p className="text-[11px] text-[var(--ink-subtle)]">Email cannot be changed. Contact your administrator.</p>
      </div>

      {/* Display Name */}
      <div className="space-y-1.5">
        <label htmlFor="name" className="text-xs font-medium text-[var(--ink-muted)]">Display Name</label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={100}
          disabled={pending}
          className="w-full px-3 py-2.5 rounded-lg bg-[var(--bg)] border border-[var(--hairline)] text-sm text-[var(--ink)] placeholder:text-[var(--ink-subtle)] focus:outline-none focus:border-[var(--of-primary)] disabled:opacity-60 transition-colors"
          placeholder="Your name"
        />
      </div>

      {error && (
        <p className="text-xs text-[var(--of-error)]">{error}</p>
      )}

      <div className="flex items-center gap-3 pt-1">
        <button
          type="submit"
          disabled={pending}
          className="px-4 py-2 rounded-lg bg-[var(--of-primary)] text-white text-sm font-medium disabled:opacity-50 hover:bg-[var(--of-primary-hover)] transition-colors"
        >
          {pending ? 'Saving…' : 'Save Changes'}
        </button>
        {saved && (
          <span className="text-xs text-emerald-500">Changes saved</span>
        )}
      </div>
    </form>
  )
}
