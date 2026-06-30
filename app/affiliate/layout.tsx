import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { getAffiliateById } from '@/lib/affiliates/auth'

export default async function AffiliateLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies()
  const affSession = cookieStore.get('aff_session')

  // Login page doesn't need auth
  const isLoginPage = false // handled by individual pages

  if (affSession) {
    const affiliate = await getAffiliateById(affSession.value)
    if (!affiliate || !affiliate.isActive) {
      // Invalid or inactive affiliate — clear cookie and redirect to login
      redirect('/login')
    }
  }

  return <>{children}</>
}
