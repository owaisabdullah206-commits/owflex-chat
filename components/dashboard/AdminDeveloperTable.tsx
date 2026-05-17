'use client'

import { useState, useTransition } from 'react'
import { Users, CreditCard, ShieldOff, Shield, KeyRound, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  giveCredits,
  changeOrgPlan,
  banOrg,
  unbanOrg,
  sendPasswordReset,
} from '@/lib/db/queries/admin'

type Developer = {
  userId: string
  name: string
  email: string
  userCreatedAt: Date
  orgId: string
  plan: string
  conversationsThisMonth: number
  bannedAt: Date | null
  banReason: string | null
  botCount: number
  creditBalance: number
}

const PLANS = ['free', 'starter', 'pro', 'agency'] as const

const PLAN_COLORS: Record<string, string> = {
  free:    'text-[var(--ink-muted)]',
  starter: 'text-[var(--of-primary)]',
  pro:     'text-[var(--success-text)]',
  agency:  'text-[var(--warning-text)]',
}

function Modal({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70"
      onClick={onClose}
    >
      <div onClick={(e) => e.stopPropagation()}>{children}</div>
    </div>
  )
}

function CreditsModal({ orgId, onClose }: { orgId: string; onClose: () => void }) {
  const [amount, setAmount] = useState('')
  const [reason, setReason] = useState('')
  const [error, setError]   = useState('')
  const [pending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const num = parseInt(amount, 10)
    if (isNaN(num) || num === 0) { setError('Enter a non-zero integer'); return }
    startTransition(async () => {
      const res = await giveCredits(orgId, num, reason || 'Admin gift')
      if (res.error) setError(res.error)
      else onClose()
    })
  }

  return (
    <Modal onClose={onClose}>
      <form
        className="bg-[var(--surface)] border border-[var(--hairline)] w-full max-w-sm shadow-2xl"
        onSubmit={handleSubmit}
      >
        <div className="h-[2px] bg-[var(--of-primary)]" />
        <div className="p-6 space-y-4">
          <h3 className="text-sm font-bold text-[var(--ink)] uppercase tracking-wide">Give / Remove Credits</h3>
          <p className="text-xs text-[var(--ink-muted)]">Positive = add, negative = remove.</p>
          <input
            type="number"
            placeholder="Amount (e.g. 5000)"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full px-3 py-2 bg-[var(--bg)] border border-[var(--hairline-md)] text-sm text-[var(--ink)] placeholder:text-[var(--ink-subtle)] focus:outline-none focus:border-[var(--of-primary)] font-mono"
          />
          <input
            type="text"
            placeholder="Reason (optional)"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full px-3 py-2 bg-[var(--bg)] border border-[var(--hairline-md)] text-sm text-[var(--ink)] placeholder:text-[var(--ink-subtle)] focus:outline-none focus:border-[var(--of-primary)]"
          />
          {error && <p className="text-xs text-[var(--of-error)]">{error}</p>}
          <div className="flex gap-2 justify-end pt-1">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium border border-[var(--hairline-md)] text-[var(--ink-muted)] hover:text-[var(--ink)] hover:border-[var(--hairline-strong)] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={pending}
              className="px-4 py-2 text-xs font-medium bg-[var(--of-primary)] text-white disabled:opacity-50 hover:bg-[var(--of-primary-hover)] transition-colors"
            >
              {pending ? 'Saving…' : 'Apply'}
            </button>
          </div>
        </div>
      </form>
    </Modal>
  )
}

function BanModal({ orgId, onClose }: { orgId: string; onClose: () => void }) {
  const [reason, setReason] = useState('')
  const [pending, startTransition] = useTransition()

  function handleBan() {
    startTransition(async () => {
      await banOrg(orgId, reason)
      onClose()
    })
  }

  return (
    <Modal onClose={onClose}>
      <div className="bg-[var(--surface)] border border-[var(--hairline)] w-full max-w-sm shadow-2xl">
        <div className="h-[2px] bg-[var(--of-error)]" />
        <div className="p-6 space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wide text-[var(--error-text)]">Suspend Account</h3>
          <p className="text-xs text-[var(--ink-muted)]">Their bots will return 403. They can still log in.</p>
          <input
            type="text"
            placeholder="Reason (optional)"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full px-3 py-2 bg-[var(--bg)] border border-[var(--hairline-md)] text-sm text-[var(--ink)] placeholder:text-[var(--ink-subtle)] focus:outline-none focus:border-[var(--of-error)]"
          />
          <div className="flex gap-2 justify-end pt-1">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium border border-[var(--hairline-md)] text-[var(--ink-muted)] hover:text-[var(--ink)] transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleBan}
              disabled={pending}
              className="px-4 py-2 text-xs font-medium bg-[var(--of-error)] text-white disabled:opacity-50 hover:opacity-90 transition-opacity"
            >
              {pending ? 'Suspending…' : 'Suspend'}
            </button>
          </div>
        </div>
      </div>
    </Modal>
  )
}

export function AdminDeveloperTable({ developers }: { developers: Developer[] }) {
  const [search, setSearch]             = useState('')
  const [planFilter, setPlanFilter]     = useState('all')
  const [creditsModal, setCreditsModal] = useState<string | null>(null)
  const [banModal, setBanModal]         = useState<string | null>(null)
  const [pending, startTransition]      = useTransition()

  const filtered = developers.filter((d) => {
    const matchSearch = !search ||
      d.email.toLowerCase().includes(search.toLowerCase()) ||
      d.name.toLowerCase().includes(search.toLowerCase())
    const matchPlan = planFilter === 'all' || d.plan === planFilter
    return matchSearch && matchPlan
  })

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex gap-2 flex-wrap items-center">
        <input
          type="text"
          placeholder="Search name or email…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-3 py-2 text-sm bg-[var(--bg)] border border-[var(--hairline-md)] text-[var(--ink)] placeholder:text-[var(--ink-subtle)] focus:outline-none focus:border-[var(--of-primary)] w-60"
        />
        <div className="relative">
          <select
            value={planFilter}
            onChange={(e) => setPlanFilter(e.target.value)}
            className="appearance-none pl-3 pr-8 py-2 text-sm bg-[var(--bg)] border border-[var(--hairline-md)] text-[var(--ink)] focus:outline-none focus:border-[var(--of-primary)] cursor-pointer"
          >
            <option value="all">All Plans</option>
            {PLANS.map((p) => (
              <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-2 top-2.5 h-3.5 w-3.5 text-[var(--ink-muted)]" />
        </div>
        <span className="ml-auto text-[11px] text-[var(--ink-subtle)]" style={{ fontFamily: 'var(--font-mono)' }}>
          {filtered.length} / {developers.length}
        </span>
      </div>

      {/* Table */}
      <div className="border border-[var(--hairline)] overflow-hidden">
        <div className="h-[2px] bg-[var(--of-primary)]" />
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--hairline)] bg-[var(--surface-3)]">
              {['Developer', 'Plan', 'Bots', 'Msgs / Mo', 'Credits', 'Joined', 'Status', 'Actions'].map((h) => (
                <th
                  key={h}
                  className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--ink-subtle)]"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((dev) => (
              <tr
                key={dev.userId}
                className={cn(
                  'border-b border-[var(--hairline)] odd:bg-[var(--surface)] even:bg-[var(--surface-2)] hover:bg-[var(--surface-3)] transition-colors',
                  dev.bannedAt && 'opacity-50',
                )}
              >
                {/* Developer */}
                <td className="px-4 py-3">
                  <p className="font-medium text-[var(--ink)] truncate max-w-[150px]">{dev.name}</p>
                  <p className="text-[11px] text-[var(--ink-muted)] truncate max-w-[150px]">{dev.email}</p>
                </td>

                {/* Plan */}
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      'text-[11px] font-bold uppercase tracking-wide',
                      PLAN_COLORS[dev.plan] ?? 'text-[var(--ink-muted)]',
                    )}>
                      {dev.plan}
                    </span>
                    <div className="relative">
                      <select
                        defaultValue={dev.plan}
                        onChange={(e) => {
                          startTransition(async () => { await changeOrgPlan(dev.orgId, e.target.value) })
                        }}
                        className="appearance-none text-[10px] opacity-0 absolute inset-0 w-full cursor-pointer"
                      >
                        {PLANS.map((p) => (
                          <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
                        ))}
                      </select>
                      <ChevronDown className="h-3 w-3 text-[var(--ink-subtle)] cursor-pointer" />
                    </div>
                  </div>
                </td>

                {/* Numeric columns */}
                <td className="px-4 py-3 font-mono text-[var(--ink)]">{dev.botCount}</td>
                <td className="px-4 py-3 font-mono text-[var(--ink)]">{dev.conversationsThisMonth.toLocaleString()}</td>
                <td className="px-4 py-3 font-mono text-[var(--ink)]">{dev.creditBalance.toLocaleString()}</td>

                {/* Joined */}
                <td className="px-4 py-3 text-[11px] text-[var(--ink-muted)] whitespace-nowrap font-mono">
                  {new Date(dev.userCreatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' })}
                </td>

                {/* Status */}
                <td className="px-4 py-3">
                  {dev.bannedAt ? (
                    <span className="text-[10px] font-bold uppercase tracking-wide text-[var(--of-error)]">Banned</span>
                  ) : (
                    <span className="text-[10px] font-bold uppercase tracking-wide text-[var(--success-text)]">Active</span>
                  )}
                </td>

                {/* Actions */}
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    <button
                      title="Give/remove credits"
                      onClick={() => setCreditsModal(dev.orgId)}
                      className="p-1.5 hover:bg-[var(--surface-3)] text-[var(--ink-muted)] hover:text-[var(--ink)] transition-colors"
                    >
                      <CreditCard className="h-3.5 w-3.5" />
                    </button>
                    <button
                      title="Send password reset"
                      onClick={() => startTransition(async () => { await sendPasswordReset(dev.email) })}
                      disabled={pending}
                      className="p-1.5 hover:bg-[var(--surface-3)] text-[var(--ink-muted)] hover:text-[var(--ink)] transition-colors disabled:opacity-40"
                    >
                      <KeyRound className="h-3.5 w-3.5" />
                    </button>
                    {dev.bannedAt ? (
                      <button
                        title="Unban"
                        onClick={() => startTransition(async () => { await unbanOrg(dev.orgId) })}
                        disabled={pending}
                        className="p-1.5 hover:bg-[var(--surface-3)] text-[var(--success-text)] hover:opacity-80 transition-colors disabled:opacity-40"
                      >
                        <Shield className="h-3.5 w-3.5" />
                      </button>
                    ) : (
                      <button
                        title="Suspend"
                        onClick={() => setBanModal(dev.orgId)}
                        className="p-1.5 hover:bg-[var(--surface-3)] text-[var(--ink-muted)] hover:text-[var(--error-text)] transition-colors"
                      >
                        <ShieldOff className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-12 text-center">
                  <Users className="h-8 w-8 mx-auto mb-3 text-[var(--ink-subtle)] opacity-30" />
                  <p className="text-xs text-[var(--ink-subtle)] uppercase tracking-wide">No developers found</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {creditsModal && <CreditsModal orgId={creditsModal} onClose={() => setCreditsModal(null)} />}
      {banModal     && <BanModal     orgId={banModal}     onClose={() => setBanModal(null)}     />}
    </div>
  )
}
