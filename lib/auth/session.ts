import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'

export async function requireDeveloper() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) redirect('/dashboard/login')
  if ((session.user as { role?: string }).role !== 'developer') redirect('/dashboard/login')
  return session.user
}

export async function requireClient() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) redirect('/portal/login')
  if ((session.user as { role?: string }).role !== 'client') redirect('/portal/login')
  return session.user
}

export async function getSession() {
  return auth.api.getSession({ headers: await headers() })
}
