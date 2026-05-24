import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import MarketingHome from '@/components/marketing/MarketingHome'
import { LandingPreloader } from '@/components/marketing/LandingPreloader'

export const dynamic = 'force-dynamic'

export default async function Home() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (session) redirect('/dashboard')
  return (
    <>
      <LandingPreloader />
      <MarketingHome />
    </>
  )
}
