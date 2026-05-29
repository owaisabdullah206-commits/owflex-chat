import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/session'

// Returns { isAdmin: bool } — never leaks the owner email to the client.
// The check lives server-side; PLATFORM_OWNER_EMAIL stays out of the JS bundle.
export async function GET() {
  try {
    const session = await getSession()
    if (!session?.user?.email) return NextResponse.json({ isAdmin: false })
    const ownerEmail = process.env.PLATFORM_OWNER_EMAIL
    return NextResponse.json({ isAdmin: !!ownerEmail && session.user.email === ownerEmail })
  } catch {
    return NextResponse.json({ isAdmin: false })
  }
}
