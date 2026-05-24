import { eq } from 'drizzle-orm'
import { auth } from '@/lib/auth'
import { db, schema } from '@/lib/db'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'

export async function requireDeveloper() {
  const session = await auth.api.getSession({ headers: await headers() })
  // Pass ?reason=expired so the login page can explain why the user was redirected.
  if (!session?.user) redirect('/dashboard/login?reason=expired')
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

  if (!dbUser) redirect('/portal/login')
  if (dbUser.role === 'client') return session.user

  // Developers who invited themselves for testing keep role=developer but still
  // have a bot assigned to them — grant portal access so the dashboard stays intact.
  if (dbUser.role === 'developer') {
    const [assignedBot] = await db
      .select({ id: schema.bots.id })
      .from(schema.bots)
      .where(eq(schema.bots.clientUserId, session.user.id))
      .limit(1)
    if (assignedBot) return session.user
  }

  redirect('/portal/login?error=not-client')
}

export async function requirePlatformOwner() {
  const user = await requireDeveloper()
  if (user.email !== process.env.NEXT_PUBLIC_PLATFORM_OWNER_EMAIL) redirect('/dashboard')
  return user
}

export async function getSession() {
  return auth.api.getSession({ headers: await headers() })
}
