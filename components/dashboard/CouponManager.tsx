'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, X, Loader2, Pencil, Trash2, ToggleLeft, ToggleRight } from 'lucide-react'

type Coupon = {
  id: string
  type: string
  code: string
  name: string | null
  affiliateId: string | null
  discountPercent: string
  appliesTo: string
  maxUses: number | null
  usedCount: number
  isActive: boolean
  expiresAt: Date | null
}

type Affiliate = { id: string; name: string; code: string }

export function CouponManager({ coupons, affiliates }: { coupons: Coupon[]; affiliates: Affiliate[] }) {
  const [createOpen, setCreateOpen] = useState(false)
  const [editing, setEditing] = useState<Coupon | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-[var(--ink)]">Coupons</h2>
        <button
          onClick={() => { setCreateOpen(true); setEditing(null) }}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-semibold text-white bg-[var(--of-primary)] rounded hover:opacity-90 transition-opacity"
        >
          <Plus size={13} />
          Create Coupon
        </button>
      </div>

      <div className="border border-[var(--hairline)] overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--hairline)] bg-[var(--surface-3)]">
              {['Code', 'Name', 'Type', 'Discount', 'Applies', 'Uses', 'Status', ''].map((h) => (
                <th key={h} className="px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--ink-subtle)]">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {coupons.map((c) => (
              <tr key={c.id} className="border-b border-[var(--hairline)] odd:bg-[var(--surface)] even:bg-[var(--surface-2)] hover:bg-[var(--surface-3)] transition-colors">
                <td className="px-4 py-2.5">
                  <code className="text-[12px] bg-[var(--surface-3)] px-1.5 py-0.5 rounded font-mono text-[var(--ink)]">{c.code}</code>
                </td>
                <td className="px-4 py-2.5 text-[13px] text-[var(--ink)]">{c.name || '—'}</td>
                <td className="px-4 py-2.5">
                  <span className={`text-[11px] font-medium px-1.5 py-0.5 rounded ${c.type === 'platform' ? 'bg-blue-500/10 text-blue-400' : 'bg-amber-500/10 text-amber-400'}`}>
                    {c.type}
                  </span>
                </td>
                <td className="px-4 py-2.5 text-[13px] text-[var(--ink)] font-mono">
                  {c.discountPercent}%
                </td>
                <td className="px-4 py-2.5 text-[13px] text-[var(--ink-muted)]">{c.appliesTo}</td>
                <td className="px-4 py-2.5 text-[13px] text-[var(--ink)]">
                  {c.usedCount}{c.maxUses ? ` / ${c.maxUses}` : ''}
                </td>
                <td className="px-4 py-2.5">
                  <span className={`text-[11px] font-medium ${c.isActive ? 'text-emerald-400' : 'text-zinc-400'}`}>
                    {c.isActive ? 'Active' : 'Off'}
                  </span>
                </td>
                <td className="px-4 py-2.5">
                  <div className="flex items-center gap-1">
                    <ToggleBtn coupon={c} router={router} />
                    <EditBtn coupon={c} onClick={() => { setEditing(c); setCreateOpen(true) }} />
                    <DeleteBtn coupon={c} router={router} />
                  </div>
                </td>
              </tr>
            ))}
            {coupons.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-[12px] text-[var(--ink-subtle)]">
                  No coupons yet. Create one to get started.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {(createOpen || editing) && (
        <CouponForm
          coupon={editing}
          affiliates={affiliates}
          onClose={() => { setCreateOpen(false); setEditing(null) }}
          onSaved={() => { setCreateOpen(false); setEditing(null); router.refresh() }}
        />
      )}
    </div>
  )
}

function ToggleBtn({ coupon, router }: { coupon: Coupon; router: ReturnType<typeof useRouter> }) {
  const [loading, setLoading] = useState(false)
  return (
    <button
      disabled={loading}
      onClick={async () => {
        setLoading(true)
        await fetch('/api/affiliates/admin/coupons', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: coupon.id, isActive: !coupon.isActive }),
        })
        setLoading(false)
        router.refresh()
      }}
      className="p-1 text-[var(--ink-subtle)] hover:text-[var(--ink)] disabled:opacity-50"
      title={coupon.isActive ? 'Deactivate' : 'Activate'}
    >
      {coupon.isActive ? <ToggleRight size={15} className="text-emerald-400" /> : <ToggleLeft size={15} />}
    </button>
  )
}

function EditBtn({ coupon, onClick }: { coupon: Coupon; onClick: () => void }) {
  return (
    <button onClick={onClick} className="p-1 text-[var(--ink-subtle)] hover:text-[var(--ink)]" title="Edit">
      <Pencil size={14} />
    </button>
  )
}

function DeleteBtn({ coupon, router }: { coupon: Coupon; router: ReturnType<typeof useRouter> }) {
  const [loading, setLoading] = useState(false)
  return (
    <button
      disabled={loading}
      onClick={async () => {
        if (!confirm(`Delete coupon ${coupon.code}?`)) return
        setLoading(true)
        await fetch('/api/affiliates/admin/coupons', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: coupon.id }),
        })
        setLoading(false)
        router.refresh()
      }}
      className="p-1 text-[var(--ink-subtle)] hover:text-red-400 disabled:opacity-50"
      title="Delete"
    >
      <Trash2 size={14} />
    </button>
  )
}

function CouponForm({
  coupon,
  affiliates,
  onClose,
  onSaved,
}: {
  coupon: Coupon | null
  affiliates: Affiliate[]
  onClose: () => void
  onSaved: () => void
}) {
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    code: coupon?.code ?? '',
    name: coupon?.name ?? '',
    discountPercent: coupon?.discountPercent ?? '10',
    appliesTo: coupon?.appliesTo ?? 'both',
    type: coupon?.type ?? 'platform',
    affiliateId: coupon?.affiliateId ?? '',
    maxUses: coupon?.maxUses?.toString() ?? '',
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const method = coupon ? 'PATCH' : 'POST'
      await fetch('/api/affiliates/admin/coupons', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...(coupon ? { id: coupon.id } : {}),
          code: form.code.toUpperCase(),
          name: form.name || null,
          discountPercent: Number(form.discountPercent),
          appliesTo: form.appliesTo,
          type: form.type,
          affiliateId: form.type === 'affiliate' ? form.affiliateId : null,
          maxUses: form.maxUses ? Number(form.maxUses) : null,
        }),
      })
      onSaved()
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div className="bg-[var(--surface)] border border-[var(--hairline)] p-6 w-full max-w-md shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-[var(--ink)]">{coupon ? 'Edit Coupon' : 'New Coupon'}</h3>
          <button onClick={onClose} className="text-[var(--ink-subtle)] hover:text-[var(--ink)]"><X size={16} /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--ink-subtle)] mb-1">Type</label>
            <select
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
              className="w-full px-3 py-2 text-[13px] bg-[var(--surface-2)] border border-[var(--hairline)] rounded text-[var(--ink)]"
            >
              <option value="platform">Platform (no affiliate)</option>
              <option value="affiliate">Affiliate</option>
            </select>
          </div>
          {form.type === 'affiliate' && (
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--ink-subtle)] mb-1">Affiliate</label>
              <select
                value={form.affiliateId}
                onChange={(e) => setForm({ ...form, affiliateId: e.target.value })}
                required
                className="w-full px-3 py-2 text-[13px] bg-[var(--surface-2)] border border-[var(--hairline)] rounded text-[var(--ink)]"
              >
                <option value="">Select affiliate</option>
                {affiliates.map((a) => (
                  <option key={a.id} value={a.id}>{a.name} ({a.code})</option>
                ))}
              </select>
            </div>
          )}
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--ink-subtle)] mb-1">Code</label>
            <input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} required className="w-full px-3 py-2 text-[13px] bg-[var(--surface-2)] border border-[var(--hairline)] rounded text-[var(--ink)] font-mono" />
          </div>
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--ink-subtle)] mb-1">Name (label)</label>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Welcome Discount" className="w-full px-3 py-2 text-[13px] bg-[var(--surface-2)] border border-[var(--hairline)] rounded text-[var(--ink)]" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--ink-subtle)] mb-1">Customer Discount %</label>
              <input
                type="number"
                value={form.discountPercent}
                onChange={(e) => setForm({ ...form, discountPercent: e.target.value })}
                min="0"
                max="100"
                required
                className="w-full px-3 py-2 text-[13px] bg-[var(--surface-2)] border border-[var(--hairline)] rounded text-[var(--ink)] font-mono"
              />
              <p className="text-[10px] text-[var(--ink-subtle)] mt-1">0 = no discount for customer</p>
            </div>
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--ink-subtle)] mb-1">Applies To</label>
              <select value={form.appliesTo} onChange={(e) => setForm({ ...form, appliesTo: e.target.value })} className="w-full px-3 py-2 text-[13px] bg-[var(--surface-2)] border border-[var(--hairline)] rounded text-[var(--ink)]">
                <option value="both">Both</option>
                <option value="plan">Plans only</option>
                <option value="credits">Credits only</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--ink-subtle)] mb-1">Max Uses</label>
            <input type="number" value={form.maxUses} onChange={(e) => setForm({ ...form, maxUses: e.target.value })} placeholder="Unlimited" min="1" className="w-full px-3 py-2 text-[13px] bg-[var(--surface-2)] border border-[var(--hairline)] rounded text-[var(--ink)]" />
          </div>
          <button type="submit" disabled={loading} className="w-full py-2 text-[13px] font-semibold text-white bg-[var(--of-primary)] rounded hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2">
            {loading && <Loader2 size={14} className="animate-spin" />}
            {coupon ? 'Save Changes' : 'Create Coupon'}
          </button>
        </form>
      </div>
    </div>
  )
}
