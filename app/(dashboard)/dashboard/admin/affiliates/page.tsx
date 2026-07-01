import { requirePlatformOwner } from '@/lib/auth/session'
import { Sidebar } from '@/components/dashboard/Sidebar'
import { getAffiliateStats, listAffiliates, listCoupons, listPlatformCoupons } from '@/lib/db/queries/affiliates'
import { Handshake, Users, DollarSign, TrendingUp, Ticket } from 'lucide-react'
import { CreateAffiliateButton } from '@/components/dashboard/CreateAffiliateButton'
import { CouponManager } from '@/components/dashboard/CouponManager'

export default async function AdminAffiliatesPage() {
  await requirePlatformOwner()

  const [stats, affiliates, allCoupons, platformCoupons] = await Promise.all([
    getAffiliateStats(),
    listAffiliates(),
    listCoupons(),
    listPlatformCoupons(),
  ])

  const affiliateList = affiliates.map((a) => ({ id: a.id, name: a.name, code: a.code }))

  return (
    <div className="flex min-h-screen bg-[var(--bg)]">
      <Sidebar />
      <main className="flex-1 ml-56">
        <div className="px-8 py-5 border-b border-[var(--hairline)]">
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--ink-subtle)]">
            Admin
          </p>
          <h1 className="text-lg font-bold text-[var(--ink)] mt-0.5">
            Affiliates
          </h1>
          <p className="text-xs text-[var(--ink-muted)] mt-0.5">
            Manage affiliate accounts, coupons, and payouts
          </p>
          <div className="mt-3">
            <CreateAffiliateButton />
          </div>
        </div>

        <div className="px-8 py-6 space-y-6">
          {/* Stats tiles */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatTile
              icon={Users}
              label="Active Affiliates"
              value={stats.activeAffiliates}
              sub={`${stats.totalAffiliates} total`}
            />
            <StatTile
              icon={TrendingUp}
              label="Total Referrals"
              value={stats.totalReferrals}
              sub={`${stats.monthlyReferrals} this month`}
            />
            <StatTile
              icon={DollarSign}
              label="Total Earned"
              value={`₨${stats.totalEarnedAll.toLocaleString()}`}
              sub={`₨${stats.totalPaidAll.toLocaleString()} paid`}
            />
            <StatTile
              icon={Ticket}
              label="Active Coupons"
              value={allCoupons.filter((c) => c.isActive).length}
              sub={`${allCoupons.length} total`}
            />
          </div>

          {/* Affiliates table */}
          <div className="border border-[var(--hairline)] overflow-hidden">
            <div className="h-[2px] bg-[var(--of-primary)]" />
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--hairline)] bg-[var(--surface-3)]">
                  {['Affiliate', 'Code', 'Commission', 'Referrals', 'Earned', 'Paid', 'Status'].map((h) => (
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
                {affiliates.map((aff) => (
                  <tr
                    key={aff.id}
                    className="border-b border-[var(--hairline)] odd:bg-[var(--surface)] even:bg-[var(--surface-2)] hover:bg-[var(--surface-3)] transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-[13px] font-medium text-[var(--ink)]">{aff.name}</p>
                        <p className="text-[11px] text-[var(--ink-muted)]">{aff.email}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <code className="text-[12px] bg-[var(--surface-3)] px-1.5 py-0.5 rounded font-mono text-[var(--ink)]">
                        {aff.code}
                      </code>
                    </td>
                    <td className="px-4 py-3 text-[13px] text-[var(--ink)]">
                      {(aff.commissionRate * 100).toFixed(0)}%
                    </td>
                    <td className="px-4 py-3 text-[13px] text-[var(--ink)]">
                      {aff.referralCount}
                    </td>
                    <td className="px-4 py-3 text-[13px] text-[var(--ink)]">
                      ₨{aff.totalEarned.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-[13px] text-[var(--ink)]">
                      ₨{aff.totalPaid.toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ${
                          aff.isActive
                            ? 'bg-emerald-500/10 text-emerald-400'
                            : 'bg-zinc-500/10 text-zinc-400'
                        }`}
                      >
                        {aff.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                  </tr>
                ))}
                {affiliates.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center">
                      <Handshake className="h-8 w-8 mx-auto mb-3 text-[var(--ink-subtle)] opacity-30" />
                      <p className="text-xs text-[var(--ink-subtle)] uppercase tracking-wide">
                        No affiliates yet
                      </p>
                      <p className="text-[11px] text-[var(--ink-muted)] mt-1">
                        Create your first affiliate to start tracking referrals
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Coupon management */}
          <CouponManager coupons={allCoupons as any} affiliates={affiliateList} />

          {/* Top affiliates */}
          {stats.topAffiliates.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-[var(--ink)] mb-3">
                Top Affiliates
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {stats.topAffiliates.map((aff, i) => (
                  <div
                    key={aff.id}
                    className="border border-[var(--hairline)] bg-[var(--surface)] p-4 flex items-center gap-3"
                  >
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[var(--surface-3)] text-[var(--ink-subtle)] text-[13px] font-bold">
                      {i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-medium text-[var(--ink)] truncate">{aff.name}</p>
                      <p className="text-[11px] text-[var(--ink-muted)]">
                        {aff.referralCount} referrals · ₨{aff.totalEarned.toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

function StatTile({
  icon: Icon,
  label,
  value,
  sub,
}: {
  icon: React.ElementType
  label: string
  value: string | number
  sub?: string
}) {
  return (
    <div className="border border-[var(--hairline)] bg-[var(--surface)] p-4">
      <div className="flex items-center gap-2 mb-2">
        <Icon className="h-3.5 w-3.5 text-[var(--of-primary)]" />
        <span className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--ink-subtle)]">
          {label}
        </span>
      </div>
      <p className="text-2xl font-bold text-[var(--ink)]" style={{ fontFamily: 'var(--font-mono)' }}>
        {value}
      </p>
      {sub && (
        <p className="text-[11px] text-[var(--ink-muted)] mt-0.5">{sub}</p>
      )}
    </div>
  )
}
