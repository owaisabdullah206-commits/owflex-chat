import { redirect } from 'next/navigation'
import { requireDeveloper } from '@/lib/auth/session'

export default async function DashboardRootPage() {
  await requireDeveloper()
  redirect('/dashboard/bots')
}
