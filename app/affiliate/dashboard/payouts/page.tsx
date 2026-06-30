import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { getAffiliateById } from '@/lib/affiliates/auth'
import { getAffiliatePayouts } from '@/lib/db/queries/affiliates'
import { Wallet } from 'lucide-react'

export default async function AffiliatePayoutsPage() {
  const cookieStore = await cookies()
  const affSession = cookieStore.get('aff_session')
  if (!affSession) redirect('/login')

  const affiliate = await getAffiliateById(affSession.value)
  if (!affiliate) redirect('/login')

  const payouts = await getAffiliatePayouts(affiliate.id)
  const pendingBalance = affiliate.totalEarned - affiliate.totalPaid

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, margin: '0 0 4px' }}>Payouts</h1>
        <p style={{ fontSize: 13, color: 'var(--ink-muted)', margin: 0 }}>
          Request a payout once per month. Payouts are processed manually.
        </p>
      </div>

      {/* Balance */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 14,
          marginBottom: 32,
        }}
      >
        <div style={{ border: '1px solid var(--hairline)', borderRadius: 'var(--r-lg)', padding: 16, background: 'var(--surface)' }}>
          <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink-subtle)', textTransform: 'uppercase', letterSpacing: '0.05em', fontFamily: 'var(--font-mono)' }}>
            Total Earned
          </span>
          <p style={{ fontSize: 24, fontWeight: 700, margin: '4px 0 0', fontFamily: 'var(--font-mono)' }}>
            ₨{affiliate.totalEarned.toLocaleString()}
          </p>
        </div>
        <div style={{ border: '1px solid var(--hairline)', borderRadius: 'var(--r-lg)', padding: 16, background: 'var(--surface)' }}>
          <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink-subtle)', textTransform: 'uppercase', letterSpacing: '0.05em', fontFamily: 'var(--font-mono)' }}>
            Total Paid
          </span>
          <p style={{ fontSize: 24, fontWeight: 700, margin: '4px 0 0', fontFamily: 'var(--font-mono)' }}>
            ₨{affiliate.totalPaid.toLocaleString()}
          </p>
        </div>
        <div style={{ border: '1px solid var(--hairline)', borderRadius: 'var(--r-lg)', padding: 16, background: 'var(--surface)' }}>
          <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink-subtle)', textTransform: 'uppercase', letterSpacing: '0.05em', fontFamily: 'var(--font-mono)' }}>
            Pending
          </span>
          <p style={{ fontSize: 24, fontWeight: 700, margin: '4px 0 0', fontFamily: 'var(--font-mono)', color: 'var(--of-primary)' }}>
            ₨{pendingBalance.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Payout history */}
      <h2 style={{ fontSize: 15, fontWeight: 700, margin: '0 0 12px' }}>Payout History</h2>
      {payouts.length === 0 ? (
        <div
          style={{
            border: '1px solid var(--hairline)',
            borderRadius: 'var(--r-lg)',
            padding: 48,
            textAlign: 'center',
            background: 'var(--surface)',
          }}
        >
          <Wallet size={32} style={{ color: 'var(--ink-subtle)', opacity: 0.3, margin: '0 auto 12px' }} />
          <h2 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 8px' }}>No payouts yet</h2>
          <p style={{ fontSize: 13, color: 'var(--ink-muted)', margin: 0, maxWidth: 360, marginInline: 'auto' }}>
            Your payout history will appear here once you request and receive a payout.
          </p>
        </div>
      ) : (
        <div style={{ border: '1px solid var(--hairline)', borderRadius: 'var(--r-lg)', overflow: 'hidden', background: 'var(--surface)' }}>
          <table style={{ width: '100%', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--hairline)', background: 'var(--surface-2)' }}>
                {['Date', 'Amount', 'Method', 'Reference'].map((h) => (
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
              {payouts.map((p) => (
                <tr key={p.id} style={{ borderBottom: '1px solid var(--hairline)' }}>
                  <td style={{ padding: '10px 16px', color: 'var(--ink-muted)' }}>
                    {new Date(p.paidAt).toLocaleDateString()}
                  </td>
                  <td style={{ padding: '10px 16px', fontWeight: 600 }}>₨{Number(p.amount).toLocaleString()}</td>
                  <td style={{ padding: '10px 16px' }}>{p.method}</td>
                  <td style={{ padding: '10px 16px', color: 'var(--ink-muted)' }}>{p.reference ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
