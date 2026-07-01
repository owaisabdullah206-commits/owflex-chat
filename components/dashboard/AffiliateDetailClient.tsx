'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Shield, ShieldOff, Trash2, DollarSign, TrendingUp, Users, AlertTriangle,
  CheckCircle2, Clock, Banknote, Loader2, X, ExternalLink,
} from 'lucide-react'

type Detail = {
  id: string
  name: string
  email: string
  code: string
  commissionRate: string
  isActive: boolean
  bannedReason: string | null
  bannedAt: Date | null
  payoutInfo: Record<string, unknown>
  notes: string | null
  createdAt: Date
  totalEarned: number
  totalPaid: number
  pendingPayout: number
  referralCount: number
  totalCommission: number
  totalRevenue: number
  recentReferrals: {
    id: string
    orgId: string
    paymentType: string
    originalAmount: number
    discountAmount: number
    finalAmount: number
    commissionRate: number
    commissionAmount: number
    paymentRefId: string
    currency: string
    createdAt: Date
    couponCode: string
  }[]
  payouts: {
    id: string
    amount: number
    currency: string
    method: string
    reference: string | null
    notes: string | null
    paidAt: Date
  }[]
}

type FraudFlag = { type: string; severity: 'low' | 'medium' | 'high'; message: string }

export function AffiliateDetailClient({ detail }: { detail: Detail }) {
  const router = useRouter()
  const [flags, setFlags] = useState<FraudFlag[]>([])
  const [flagsLoaded, setFlagsLoaded] = useState(false)
  const [payoutOpen, setPayoutOpen] = useState(false)
  const [banOpen, setBanOpen] = useState(false)
  const [banReason, setBanReason] = useState('')
  const [loading, setLoading] = useState(false)

  // Load fraud flags
  async function loadFlags() {
    if (flagsLoaded) return
    const res = await fetch(`/api/affiliates/admin/${detail.id}`)
    const data = await res.json()
    setFlags(data.flags ?? [])
    setFlagsLoaded(true)
  }

  // Ban / Unban
  async function handleBan(isActive: boolean) {
    setLoading(true)
    await fetch(`/api/affiliates/admin/${detail.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive, reason: banReason || null }),
    })
    setLoading(false)
    setBanOpen(false)
    setBanReason('')
    router.refresh()
  }

  // Delete
  async function handleDelete() {
    if (!confirm(`Delete affiliate "${detail.name}"? This cannot be undone.`)) return
    setLoading(true)
    const res = await fetch(`/api/affiliates/admin/${detail.id}`, { method: 'DELETE' })
    const data = await res.json()
    setLoading(false)
    if (data.error) {
      alert(data.error)
      return
    }
    router.push('/dashboard/admin/affiliates')
  }

  const rate = (Number(detail.commissionRate) * 100).toFixed(0)

  return (
    <div className="px-8 py-6 space-y-6">
      {/* Status banner if banned */}
      {detail.bannedReason && (
        <div className="flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded">
          <ShieldOff className="h-4 w-4 text-red-400 mt-0.5 shrink-0" />
          <div>
            <p className="text-[13px] font-semibold text-red-400">Banned</p>
            <p className="text-[12px] text-red-400/80 mt-0.5">{detail.bannedReason}</p>
            {detail.bannedAt && (
              <p className="text-[11px] text-red-400/60 mt-1">
                Banned on {new Date(detail.bannedAt).toLocaleDateString()}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Stats tiles */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <StatTile icon={TrendingUp} label="Total Earned" value={`₨${detail.totalEarned.toLocaleString()}`} />
        <StatTile icon={Banknote} label="Total Paid" value={`₨${detail.totalPaid.toLocaleString()}`} />
        <StatTile icon={DollarSign} label="Pending Payout" value={`₨${detail.pendingPayout.toLocaleString()}`} highlight={detail.pendingPayout > 0} />
        <StatTile icon={Users} label="Referrals" value={detail.referralCount} />
        <StatTile icon={CheckCircle2} label="Commission Rate" value={`${rate}%`} />
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-3">
        {detail.isActive ? (
          <button
            onClick={() => setBanOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-semibold text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded hover:bg-amber-500/20 transition-colors"
          >
            <ShieldOff size={13} />
            Ban Affiliate
          </button>
        ) : (
          <button
            onClick={() => handleBan(true)}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded hover:bg-emerald-500/20 transition-colors disabled:opacity-50"
          >
            <Shield size={13} />
            Unban
          </button>
        )}
        <button
          onClick={handleDelete}
          disabled={loading}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-semibold text-red-400 bg-red-500/10 border border-red-500/20 rounded hover:bg-red-500/20 transition-colors disabled:opacity-50"
        >
          <Trash2 size={13} />
          Remove
        </button>
        {detail.pendingPayout > 0 && (
          <button
            onClick={() => setPayoutOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-semibold text-white bg-[var(--of-primary)] rounded hover:opacity-90 transition-opacity ml-auto"
          >
            <DollarSign size={13} />
            Record Payout
          </button>
        )}
        <button
          onClick={loadFlags}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-semibold text-[var(--ink-subtle)] bg-[var(--surface-2)] border border-[var(--hairline)] rounded hover:bg-[var(--surface-3)] transition-colors ml-auto"
        >
          <AlertTriangle size={13} />
          Fraud Check
        </button>
      </div>

      {/* Fraud flags */}
      {flagsLoaded && flags.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-sm font-semibold text-[var(--ink)]">Fraud Flags</h2>
          {flags.map((f, i) => (
            <div
              key={i}
              className={`flex items-start gap-3 p-3 border rounded ${
                f.severity === 'high' ? 'bg-red-500/10 border-red-500/20' :
                f.severity === 'medium' ? 'bg-amber-500/10 border-amber-500/20' :
                'bg-zinc-500/10 border-zinc-500/20'
              }`}
            >
              <AlertTriangle className={`h-3.5 w-3.5 mt-0.5 shrink-0 ${
                f.severity === 'high' ? 'text-red-400' :
                f.severity === 'medium' ? 'text-amber-400' :
                'text-zinc-400'
              }`} />
              <div>
                <p className={`text-[12px] font-medium ${
                  f.severity === 'high' ? 'text-red-400' :
                  f.severity === 'medium' ? 'text-amber-400' :
                  'text-zinc-400'
                }`}>
                  {f.message}
                </p>
                <p className="text-[11px] text-[var(--ink-subtle)] mt-0.5 capitalize">{f.type.replace(/_/g, ' ')}</p>
              </div>
            </div>
          ))}
        </div>
      )}
      {flagsLoaded && flags.length === 0 && (
        <div className="flex items-center gap-2 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded">
          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
          <p className="text-[12px] text-emerald-400 font-medium">No fraud flags detected</p>
        </div>
      )}

      {/* Profile info */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="border border-[var(--hairline)] bg-[var(--surface)] p-5">
          <h2 className="text-sm font-semibold text-[var(--ink)] mb-4">Profile</h2>
          <div className="space-y-3">
            <InfoRow label="Name" value={detail.name} />
            <InfoRow label="Email" value={detail.email} />
            <InfoRow label="Coupon Code" value={detail.code} mono />
            <InfoRow label="Commission" value={`${rate}%`} />
            <InfoRow label="Status" value={detail.isActive ? 'Active' : 'Banned'} />
            <InfoRow label="Created" value={new Date(detail.createdAt).toLocaleDateString()} />
          </div>
        </div>
        <div className="border border-[var(--hairline)] bg-[var(--surface)] p-5">
          <h2 className="text-sm font-semibold text-[var(--ink)] mb-4">Payout Info</h2>
          {detail.payoutInfo && Object.keys(detail.payoutInfo).length > 0 ? (
            <div className="space-y-3">
              {Object.entries(detail.payoutInfo).map(([k, v]) => (
                <InfoRow key={k} label={k.replace(/_/g, ' ')} value={String(v)} />
              ))}
            </div>
          ) : (
            <p className="text-[12px] text-[var(--ink-subtle)]">No payout info on file. Affiliate can set this from their portal.</p>
          )}
        </div>
      </div>

      {/* Referrals table */}
      <div>
        <h2 className="text-sm font-semibold text-[var(--ink)] mb-3">
          Referrals ({detail.recentReferrals.length})
        </h2>
        <div className="border border-[var(--hairline)] overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--hairline)] bg-[var(--surface-3)]">
                {['Date', 'Coupon', 'Type', 'Amount', 'Discount', 'Final', 'Commission', 'Ref ID'].map((h) => (
                  <th key={h} className="px-3 py-2.5 text-left text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--ink-subtle)] whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {detail.recentReferrals.map((r) => (
                <tr key={r.id} className="border-b border-[var(--hairline)] odd:bg-[var(--surface)] even:bg-[var(--surface-2)] hover:bg-[var(--surface-3)] transition-colors">
                  <td className="px-3 py-2.5 text-[12px] text-[var(--ink-muted)] whitespace-nowrap">
                    {new Date(r.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-3 py-2.5">
                    <code className="text-[11px] bg-[var(--surface-3)] px-1.5 py-0.5 rounded font-mono text-[var(--ink)]">{r.couponCode}</code>
                  </td>
                  <td className="px-3 py-2.5">
                    <span className={`text-[11px] font-medium px-1.5 py-0.5 rounded ${
                      r.paymentType === 'plan' ? 'bg-blue-500/10 text-blue-400' : 'bg-purple-500/10 text-purple-400'
                    }`}>
                      {r.paymentType}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-[12px] text-[var(--ink)] font-mono">
                    ₨{r.originalAmount.toLocaleString()}
                  </td>
                  <td className="px-3 py-2.5 text-[12px] text-amber-400 font-mono">
                    -₨{r.discountAmount.toLocaleString()}
                  </td>
                  <td className="px-3 py-2.5 text-[12px] text-[var(--ink)] font-mono font-medium">
                    ₨{r.finalAmount.toLocaleString()}
                  </td>
                  <td className="px-3 py-2.5 text-[12px] text-emerald-400 font-mono font-medium">
                    ₨{r.commissionAmount.toLocaleString()}
                  </td>
                  <td className="px-3 py-2.5 text-[11px] text-[var(--ink-subtle)] font-mono max-w-[120px] truncate">
                    {r.paymentRefId}
                  </td>
                </tr>
              ))}
              {detail.recentReferrals.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-[12px] text-[var(--ink-subtle)]">
                    No referrals yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payout history */}
      <div>
        <h2 className="text-sm font-semibold text-[var(--ink)] mb-3">
          Payout History ({detail.payouts.length})
        </h2>
        <div className="border border-[var(--hairline)] overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--hairline)] bg-[var(--surface-3)]">
                {['Date', 'Amount', 'Method', 'Reference', 'Notes'].map((h) => (
                  <th key={h} className="px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--ink-subtle)]">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {detail.payouts.map((p) => (
                <tr key={p.id} className="border-b border-[var(--hairline)] odd:bg-[var(--surface)] even:bg-[var(--surface-2)]">
                  <td className="px-4 py-2.5 text-[12px] text-[var(--ink-muted)]">
                    {new Date(p.paidAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-2.5 text-[13px] text-[var(--ink)] font-mono font-medium">
                    ₨{p.amount.toLocaleString()}
                  </td>
                  <td className="px-4 py-2.5 text-[12px] text-[var(--ink-muted)]">{p.method}</td>
                  <td className="px-4 py-2.5 text-[12px] text-[var(--ink-subtle)] font-mono">{p.reference || '—'}</td>
                  <td className="px-4 py-2.5 text-[12px] text-[var(--ink-muted)] max-w-[200px] truncate">{p.notes || '—'}</td>
                </tr>
              ))}
              {detail.payouts.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-[12px] text-[var(--ink-subtle)]">
                    No payouts recorded
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Ban modal */}
      {banOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setBanOpen(false)}>
          <div className="bg-[var(--surface)] border border-[var(--hairline)] p-6 w-full max-w-md shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-[var(--ink)]">Ban Affiliate</h3>
              <button onClick={() => setBanOpen(false)} className="text-[var(--ink-subtle)] hover:text-[var(--ink)]"><X size={16} /></button>
            </div>
            <p className="text-[13px] text-[var(--ink-muted)] mb-4">
              This will deactivate <strong>{detail.name}&apos;s</strong> account. Their coupon will stop working.
            </p>
            <div className="mb-4">
              <label className="block text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--ink-subtle)] mb-1">Reason (optional)</label>
              <textarea
                value={banReason}
                onChange={(e) => setBanReason(e.target.value)}
                placeholder="e.g. Fraudulent referrals detected"
                className="w-full px-3 py-2 text-[13px] bg-[var(--surface-2)] border border-[var(--hairline)] rounded text-[var(--ink)] placeholder:text-[var(--ink-subtle)] focus:outline-none focus:border-[var(--of-primary)] resize-none"
                rows={3}
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => handleBan(false)}
                disabled={loading}
                className="flex-1 py-2 text-[13px] font-semibold text-white bg-amber-500 rounded hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading && <Loader2 size={14} className="animate-spin" />}
                Ban
              </button>
              <button
                onClick={() => setBanOpen(false)}
                className="px-4 py-2 text-[13px] font-semibold text-[var(--ink-subtle)] bg-[var(--surface-2)] border border-[var(--hairline)] rounded hover:bg-[var(--surface-3)]"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payout modal */}
      {payoutOpen && (
        <PayoutModal
          affiliateId={detail.id}
          pending={detail.pendingPayout}
          onClose={() => setPayoutOpen(false)}
          onSaved={() => { setPayoutOpen(false); router.refresh() }}
        />
      )}
    </div>
  )
}

function StatTile({ icon: Icon, label, value, highlight }: {
  icon: React.ElementType
  label: string
  value: string | number
  highlight?: boolean
}) {
  return (
    <div className={`border bg-[var(--surface)] p-4 ${highlight ? 'border-[var(--of-primary)]/30' : 'border-[var(--hairline)]'}`}>
      <div className="flex items-center gap-2 mb-2">
        <Icon className={`h-3.5 w-3.5 ${highlight ? 'text-[var(--of-primary)]' : 'text-[var(--ink-subtle)]'}`} />
        <span className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--ink-subtle)]">{label}</span>
      </div>
      <p className="text-xl font-bold text-[var(--ink)]" style={{ fontFamily: 'var(--font-mono)' }}>{value}</p>
    </div>
  )
}

function InfoRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--ink-subtle)]">{label}</span>
      <span className={`text-[13px] text-[var(--ink)] ${mono ? 'font-mono' : ''}`}>{value}</span>
    </div>
  )
}

function PayoutModal({ affiliateId, pending, onClose, onSaved }: {
  affiliateId: string
  pending: number
  onClose: () => void
  onSaved: () => void
}) {
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    amount: pending.toString(),
    method: 'bank_transfer',
    reference: '',
    notes: '',
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    await fetch(`/api/affiliates/admin/${affiliateId}/payout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount: Number(form.amount),
        method: form.method,
        reference: form.reference || null,
        notes: form.notes || null,
      }),
    })
    setLoading(false)
    onSaved()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div className="bg-[var(--surface)] border border-[var(--hairline)] p-6 w-full max-w-md shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-[var(--ink)]">Record Payout</h3>
          <button onClick={onClose} className="text-[var(--ink-subtle)] hover:text-[var(--ink)]"><X size={16} /></button>
        </div>
        <p className="text-[12px] text-[var(--ink-muted)] mb-4">
          Pending balance: <strong className="text-[var(--ink)]" style={{ fontFamily: 'var(--font-mono)' }}>₨{pending.toLocaleString()}</strong>
        </p>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--ink-subtle)] mb-1">Amount (₨)</label>
            <input
              type="number"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
              min="1"
              max={pending}
              required
              className="w-full px-3 py-2 text-[13px] bg-[var(--surface-2)] border border-[var(--hairline)] rounded text-[var(--ink)] font-mono"
            />
          </div>
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--ink-subtle)] mb-1">Method</label>
            <select
              value={form.method}
              onChange={(e) => setForm({ ...form, method: e.target.value })}
              className="w-full px-3 py-2 text-[13px] bg-[var(--surface-2)] border border-[var(--hairline)] rounded text-[var(--ink)]"
            >
              <option value="bank_transfer">Bank Transfer</option>
              <option value="jazzcash">JazzCash</option>
              <option value="easypaisa">EasyPaisa</option>
              <option value="paypal">PayPal</option>
              <option value="wise">Wise</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--ink-subtle)] mb-1">Reference / Transaction ID</label>
            <input
              value={form.reference}
              onChange={(e) => setForm({ ...form, reference: e.target.value })}
              placeholder="e.g. TXN123456"
              className="w-full px-3 py-2 text-[13px] bg-[var(--surface-2)] border border-[var(--hairline)] rounded text-[var(--ink)] font-mono"
            />
          </div>
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--ink-subtle)] mb-1">Notes</label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="e.g. March 2026 payout"
              className="w-full px-3 py-2 text-[13px] bg-[var(--surface-2)] border border-[var(--hairline)] rounded text-[var(--ink)] placeholder:text-[var(--ink-subtle)] focus:outline-none focus:border-[var(--of-primary)] resize-none"
              rows={2}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 text-[13px] font-semibold text-white bg-[var(--of-primary)] rounded hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading && <Loader2 size={14} className="animate-spin" />}
            Record Payout
          </button>
        </form>
      </div>
    </div>
  )
}
