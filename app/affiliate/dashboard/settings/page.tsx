import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { getAffiliateById } from '@/lib/affiliates/auth'
import { Settings } from 'lucide-react'

export default async function AffiliateSettingsPage() {
  const cookieStore = await cookies()
  const affSession = cookieStore.get('aff_session')
  if (!affSession) redirect('/login')

  const affiliate = await getAffiliateById(affSession.value)
  if (!affiliate) redirect('/login')

  const payoutInfo = affiliate.payoutInfo as Record<string, string> | null

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, margin: '0 0 4px' }}>Settings</h1>
        <p style={{ fontSize: 13, color: 'var(--ink-muted)', margin: 0 }}>
          Your affiliate profile and payout information.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 20 }}>
        {/* Profile */}
        <div style={{ border: '1px solid var(--hairline)', borderRadius: 'var(--r-lg)', padding: 24, background: 'var(--surface)' }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Settings size={16} style={{ color: 'var(--of-primary)' }} />
            Profile
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--ink-subtle)', textTransform: 'uppercase', letterSpacing: '0.05em', fontFamily: 'var(--font-mono)', marginBottom: 4 }}>
                Name
              </label>
              <p style={{ fontSize: 14, margin: 0 }}>{affiliate.name}</p>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--ink-subtle)', textTransform: 'uppercase', letterSpacing: '0.05em', fontFamily: 'var(--font-mono)', marginBottom: 4 }}>
                Email
              </label>
              <p style={{ fontSize: 14, margin: 0 }}>{affiliate.email}</p>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--ink-subtle)', textTransform: 'uppercase', letterSpacing: '0.05em', fontFamily: 'var(--font-mono)', marginBottom: 4 }}>
                Affiliate Code
              </label>
              <p style={{ fontSize: 14, margin: 0, fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--of-primary)' }}>
                {affiliate.code}
              </p>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--ink-subtle)', textTransform: 'uppercase', letterSpacing: '0.05em', fontFamily: 'var(--font-mono)', marginBottom: 4 }}>
                Commission Rate
              </label>
              <p style={{ fontSize: 14, margin: 0 }}>{(affiliate.commissionRate * 100).toFixed(0)}% on first payment</p>
            </div>
          </div>
        </div>

        {/* Payout Info */}
        <div style={{ border: '1px solid var(--hairline)', borderRadius: 'var(--r-lg)', padding: 24, background: 'var(--surface)' }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, margin: '0 0 16px' }}>
            Payout Information
          </h2>

          {payoutInfo && Object.keys(payoutInfo).length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {Object.entries(payoutInfo).map(([key, value]) => (
                <div key={key}>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--ink-subtle)', textTransform: 'uppercase', letterSpacing: '0.05em', fontFamily: 'var(--font-mono)', marginBottom: 4 }}>
                    {key.replace(/_/g, ' ')}
                  </label>
                  <p style={{ fontSize: 14, margin: 0 }}>{value}</p>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ fontSize: 13, color: 'var(--ink-muted)', margin: 0 }}>
              No payout information on file. Contact the admin to update your payout details.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
