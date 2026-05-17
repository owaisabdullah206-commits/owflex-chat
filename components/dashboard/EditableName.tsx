'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Pencil, Check, X } from 'lucide-react'
import { updateName } from '@/app/(dashboard)/dashboard/settings/actions'

export function EditableName({ name }: { name: string }) {
  const router = useRouter()
  const [editing, setEditing] = useState(false)
  const [value, setValue] = useState(name)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  function startEdit() {
    setValue(name)
    setError('')
    setEditing(true)
    setTimeout(() => inputRef.current?.focus(), 0)
  }

  function cancel() {
    setEditing(false)
    setError('')
  }

  async function save() {
    setError('')
    setPending(true)
    try {
      const result = await updateName(value)
      if (result.error) {
        setError(result.error)
      } else {
        setEditing(false)
        router.refresh()
      }
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setPending(false)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') save()
    if (e.key === 'Escape') cancel()
  }

  if (editing) {
    return (
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-2">
          <input
            ref={inputRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            maxLength={80}
            className="flex-1 text-sm bg-[var(--bg)] border border-[var(--of-primary)] rounded-md px-3 py-1.5 text-[var(--ink)] focus:outline-none"
          />
          <button
            onClick={save}
            disabled={pending}
            className="p-1.5 rounded-md bg-[var(--of-primary)] text-white hover:opacity-90 transition-opacity disabled:opacity-50 cursor-pointer"
            aria-label="Save"
          >
            <Check className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={cancel}
            className="p-1.5 rounded-md border border-[var(--hairline)] text-[var(--ink-muted)] hover:text-[var(--ink)] transition-colors cursor-pointer"
            aria-label="Cancel"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
        {error && <p className="text-xs text-[var(--of-error-dark)]">{error}</p>}
      </div>
    )
  }

  return (
    <div className="group flex items-center gap-2">
      <p className="text-sm text-[var(--ink)]">{name}</p>
      <button
        onClick={startEdit}
        className="opacity-40 hover:opacity-100 transition-opacity p-1 rounded text-[var(--ink-subtle)] hover:text-[var(--ink)] cursor-pointer"
        aria-label="Edit name"
      >
        <Pencil className="h-3.5 w-3.5" />
      </button>
    </div>
  )
}
