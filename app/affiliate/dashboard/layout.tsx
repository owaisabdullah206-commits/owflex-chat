import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { getAffiliateById } from '@/lib/affiliates/auth'
import AffiliatePortalNav from '@/components/affiliate/AffiliatePortalNav'

export default async function AffiliateDashboardLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies()
  const affSession = cookieStore.get('aff_session')

  if (!affSession) {
    redirect('/login')
  }

  const affiliate = await getAffiliateById(affSession.value)

  if (!affiliate || !affiliate.isActive) {
    redirect('/login')
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--ink)' }}>
      <AffiliatePortalNav affiliateName={affiliate.name} />
      <main style={{ maxWidth: 1100, margin: '0 auto', padding: '24px 24px 64px' }}>
        {children}
      </main>
    </div>
  )
}
