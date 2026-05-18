'use client'

import { useFormStatus } from 'react-dom'

export function SavePromptButton() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="px-4 py-2 text-xs font-semibold uppercase tracking-wide rounded-none bg-[var(--of-primary)] hover:bg-[var(--of-primary-hover)] text-white disabled:opacity-50 transition-colors"
    >
      {pending ? 'Saving…' : 'Save Platform Prompt'}
    </button>
  )
}
