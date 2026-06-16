'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import {
  LEAD_STATUSES,
  LEAD_STATUS_LABEL,
  LEAD_STATUS_CLASS,
  type LeadStatus,
} from '@/lib/leads/status'

interface LeadStatusSelectProps {
  leadId: string
  status: LeadStatus
  // '/api/v1/leads' (dashboard) or '/api/portal/leads' (portal)
  apiBase: string
}

/**
 * Inline pipeline-stage selector. Optimistically updates, PATCHes the status
 * endpoint, and reverts on failure. Used in both the developer dashboard and
 * the client portal — colour styling is surface-agnostic.
 */
export function LeadStatusSelect({ leadId, status, apiBase }: LeadStatusSelectProps) {
  const router = useRouter()
  const [value, setValue] = useState<LeadStatus>(status)
  const [pending, startTransition] = useTransition()
  const [saving, setSaving] = useState(false)

  async function update(next: LeadStatus) {
    const prev = value
    setValue(next)
    setSaving(true)
    try {
      const res = await fetch(`${apiBase}/${leadId}/status`, {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ status: next }),
      })
      if (!res.ok) throw new Error(`status ${res.status}`)
      startTransition(() => router.refresh())
    } catch {
      setValue(prev) // revert optimistic change
    } finally {
      setSaving(false)
    }
  }

  return (
    <select
      value={value}
      disabled={saving || pending}
      onChange={(e) => update(e.target.value as LeadStatus)}
      aria-label="Lead status"
      className={`appearance-none cursor-pointer rounded-md border px-2 py-1 text-xs font-medium outline-none transition-colors disabled:opacity-60 ${LEAD_STATUS_CLASS[value]}`}
    >
      {LEAD_STATUSES.map((s) => (
        <option key={s} value={s} className="bg-[var(--surface)] text-[var(--ink)]">
          {LEAD_STATUS_LABEL[s]}
        </option>
      ))}
    </select>
  )
}
