import { eq } from 'drizzle-orm'
import { auth } from '@/lib/auth'
import { db, schema } from '@/lib/db'
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

  // Read role from DB directly — BetterAuth's cookie cache can return a stale
  // role='developer' if the role was updated after the session was created.
  const [dbUser] = await db
    .select({ role: schema.users.role })
    .from(schema.users)
    .where(eq(schema.users.id, session.user.id))
    .limit(1)

  if (!dbUser || dbUser.role !== 'client') redirect('/portal/login')
  return session.user
}

export async function getSession() {
  return auth.api.getSession({ headers: await headers() })
}
