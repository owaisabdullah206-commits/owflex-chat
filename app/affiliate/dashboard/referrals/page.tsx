import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { getAffiliateById } from '@/lib/affiliates/auth'
import { getAffiliateReferrals, getReferralsCount } from '@/lib/db/queries/affiliates'
import { Users } from 'lucide-react'

export default async function AffiliateReferralsPage() {
  const cookieStore = await cookies()
  const affSession = cookieStore.get('aff_session')
  if (!affSession) redirect('/login')

  const affiliate = await getAffiliateById(affSession.value)
  if (!affiliate) redirect('/login')

  const [referrals, totalCount] = await Promise.all([
    getAffiliateReferrals(affiliate.id, 100),
    getReferralsCount(affiliate.id),
  ])

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, margin: '0 0 4px' }}>Referrals</h1>
        <p style={{ fontSize: 13, color: 'var(--ink-muted)', margin: 0 }}>
          {totalCount} total referral{totalCount !== 1 ? 's' : ''}
        </p>
      </div>

      {referrals.length === 0 ? (
        <div
          style={{
            border: '1px solid var(--hairline)',
            borderRadius: 'var(--r-lg)',
            padding: 48,
            textAlign: 'center',
            background: 'var(--surface)',
          }}
        >
          <Users size={32} style={{ color: 'var(--ink-subtle)', opacity: 0.3, margin: '0 auto 12px' }} />
          <h2 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 8px' }}>No referrals yet</h2>
          <p style={{ fontSize: 13, color: 'var(--ink-muted)', margin: 0, maxWidth: 360, marginInline: 'auto' }}>
            Share your coupon code with your audience. When they sign up and pay, you&apos;ll see them here.
          </p>
        </div>
      ) : (
        <div style={{ border: '1px solid var(--hairline)', borderRadius: 'var(--r-lg)', overflow: 'hidden', background: 'var(--surface)' }}>
          <table style={{ width: '100%', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--hairline)', background: 'var(--surface-2)' }}>
                {['Date', 'Payment Type', 'Original Amount', 'Discount', 'Final Amount', 'Commission'].map((h) => (
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
                  <td style={{ padding: '10px 16px' }}>₨{r.originalAmount.toLocaleString()}</td>
                  <td style={{ padding: '10px 16px', color: 'var(--ink-muted)' }}>-₨{r.discountAmount.toLocaleString()}</td>
                  <td style={{ padding: '10px 16px', fontWeight: 600 }}>₨{r.finalAmount.toLocaleString()}</td>
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
  )
}
