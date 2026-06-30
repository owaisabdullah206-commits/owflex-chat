import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { getAffiliateById } from '@/lib/affiliates/auth'
import { getAffiliateReferrals, getAffiliatePayouts, getReferralsCount } from '@/lib/db/queries/affiliates'
import { TrendingUp, DollarSign, Users, Clock } from 'lucide-react'

export default async function AffiliateDashboardPage() {
  const cookieStore = await cookies()
  const affSession = cookieStore.get('aff_session')
  if (!affSession) redirect('/login')

  const affiliate = await getAffiliateById(affSession.value)
  if (!affiliate) redirect('/login')

  const [referrals, payouts, referralCount] = await Promise.all([
    getAffiliateReferrals(affiliate.id, 5),
    getAffiliatePayouts(affiliate.id),
    getReferralsCount(affiliate.id),
  ])

  const pendingBalance = affiliate.totalEarned - affiliate.totalPaid
  const thisMonthReferrals = referrals.filter((r) => {
    const d = new Date(r.createdAt)
    const now = new Date()
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  })

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, margin: '0 0 4px' }}>Dashboard</h1>
        <p style={{ fontSize: 13, color: 'var(--ink-muted)', margin: 0 }}>
          Welcome back, {affiliate.name}. Here&apos;s your affiliate overview.
        </p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14, marginBottom: 32 }}>
        <StatCard icon={DollarSign} label="Total Earned" value={`₨${affiliate.totalEarned.toLocaleString()}`} />
        <StatCard icon={Clock} label="Pending Payout" value={`₨${pendingBalance.toLocaleString()}`} />
        <StatCard icon={Users} label="Total Referrals" value={referralCount} />
        <StatCard icon={TrendingUp} label="This Month" value={thisMonthReferrals.length} />
      </div>

      {/* Recent referrals */}
      <div style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 15, fontWeight: 700, margin: '0 0 12px' }}>Recent Referrals</h2>
        {referrals.length === 0 ? (
          <div
            style={{
              border: '1px solid var(--hairline)',
              borderRadius: 'var(--r-lg)',
              padding: 32,
              textAlign: 'center',
              background: 'var(--surface)',
            }}
          >
            <Users size={24} style={{ color: 'var(--ink-subtle)', opacity: 0.3, margin: '0 auto 8px' }} />
            <p style={{ fontSize: 13, color: 'var(--ink-muted)', margin: 0 }}>
              No referrals yet. Share your coupon code to start earning.
            </p>
          </div>
        ) : (
          <div style={{ border: '1px solid var(--hairline)', borderRadius: 'var(--r-lg)', overflow: 'hidden', background: 'var(--surface)' }}>
            <table style={{ width: '100%', fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--hairline)', background: 'var(--surface-2)' }}>
                  {['Date', 'Payment Type', 'Amount', 'Commission'].map((h) => (
                    <th
                      key={h}
                      style={{
                        padding: '10px 16px',
                        textAlign: 'left',
                        fontSize: 11,
                        fontWeight: 600,
                        color: 'var(--ink-subtle)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        fontFamily: 'var(--font-mono)',
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {referrals.map((r) => (
                  <tr key={r.id} style={{ borderBottom: '1px solid var(--hairline)' }}>
                    <td style={{ padding: '10px 16px', color: 'var(--ink-muted)' }}>
                      {new Date(r.createdAt).toLocaleDateString()}
                    </td>
                    <td style={{ padding: '10px 16px' }}>
                      <span
                        style={{
                          display: 'inline-block',
                          padding: '2px 8px',
                          borderRadius: 'var(--r-sm)',
                          fontSize: 11,
                          fontWeight: 600,
                          background: r.paymentType === 'plan' ? 'var(--of-primary-soft)' : 'var(--of-success-soft)',
                          color: r.paymentType === 'plan' ? 'var(--of-primary)' : 'var(--of-success)',
                        }}
                      >
                        {r.paymentType === 'plan' ? 'Plan' : 'Credits'}
                      </span>
                    </td>
                    <td style={{ padding: '10px 16px' }}>₨{r.finalAmount.toLocaleString()}</td>
                    <td style={{ padding: '10px 16px', fontWeight: 600, color: 'var(--of-success)' }}>
                      ₨{r.commissionAmount.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Coupon code */}
      <div
        style={{
          border: '1px solid var(--hairline)',
          borderRadius: 'var(--r-lg)',
          padding: 24,
          background: 'var(--surface)',
        }}
      >
        <h2 style={{ fontSize: 15, fontWeight: 700, margin: '0 0 4px' }}>Your Coupon Code</h2>
        <p style={{ fontSize: 13, color: 'var(--ink-muted)', margin: '0 0 12px' }}>
          Share this code with your audience. They&apos;ll get a discount at checkout, and you&apos;ll earn a commission.
        </p>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '8px 16px',
            borderRadius: 'var(--r-md)',
            background: 'var(--surface-2)',
            border: '1px solid var(--hairline)',
          }}
        >
          <code style={{ fontSize: 16, fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--of-primary)' }}>
            {affiliate.code}
          </code>
        </div>
        <p style={{ fontSize: 12, color: 'var(--ink-subtle)', margin: '8px 0 0' }}>
          Commission rate: {(affiliate.commissionRate * 100).toFixed(0)}% on first payment
        </p>
      </div>
    </div>
  )
}

function StatCard({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string | number }) {
  return (
    <div
      style={{
        border: '1px solid var(--hairline)',
        borderRadius: 'var(--r-lg)',
        padding: 16,
        background: 'var(--surface)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
        <Icon size={14} style={{ color: 'var(--of-primary)' }} />
        <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink-subtle)', textTransform: 'uppercase', letterSpacing: '0.05em', fontFamily: 'var(--font-mono)' }}>
          {label}
        </span>
      </div>
      <p style={{ fontSize: 24, fontWeight: 700, margin: 0, fontFamily: 'var(--font-mono)' }}>{value}</p>
    </div>
  )
}
