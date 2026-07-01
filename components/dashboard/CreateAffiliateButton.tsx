'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, X, Loader2 } from 'lucide-react'

export function CreateAffiliateButton() {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', code: '', commissionRate: '20' })
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('/api/affiliates/admin/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          code: form.code.toUpperCase(),
          commissionRate: Number(form.commissionRate) / 100,
        }),
      })
      if (res.ok) {
        setOpen(false)
        setForm({ name: '', email: '', code: '', commissionRate: '20' })
        router.refresh()
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-semibold text-white bg-[var(--of-primary)] rounded hover:opacity-90 transition-opacity"
      >
        <Plus size={13} />
        Add Affiliate
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setOpen(false)}>
          <div
            className="bg-[var(--surface)] border border-[var(--hairline)] p-6 w-full max-w-md shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-[var(--ink)]">New Affiliate</h3>
              <button onClick={() => setOpen(false)} className="text-[var(--ink-subtle)] hover:text-[var(--ink)]">
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-3">
              <Field label="Name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} required />
              <Field label="Email" type="email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} required />
              <Field label="Coupon Code" value={form.code} onChange={(v) => setForm({ ...form, code: v })} placeholder="e.g. OWAIS20" required />
              <Field label="Commission %" type="number" value={form.commissionRate} onChange={(v) => setForm({ ...form, commissionRate: v })} min="1" max="50" required />
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2 text-[13px] font-semibold text-white bg-[var(--of-primary)] rounded hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading && <Loader2 size={14} className="animate-spin" />}
                Create Affiliate
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  )
}

function Field({
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  required,
  min,
  max,
}: {
  label: string
  type?: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  required?: boolean
  min?: string
  max?: string
}) {
  return (
    <div>
      <label className="block text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--ink-subtle)] mb-1">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        min={min}
        max={max}
        className="w-full px-3 py-2 text-[13px] bg-[var(--surface-2)] border border-[var(--hairline)] rounded text-[var(--ink)] placeholder:text-[var(--ink-subtle)] focus:outline-none focus:border-[var(--of-primary)]"
      />
    </div>
  )
}
