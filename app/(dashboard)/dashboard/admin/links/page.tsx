import { requirePlatformOwner } from '@/lib/auth/session'
import { Sidebar } from '@/components/dashboard/Sidebar'
import { MobileNav } from '@/components/dashboard/MobileNav'
import { AdminLinksClient } from '@/components/dashboard/AdminLinksClient'
import { listShortLinks } from '@/lib/db/queries/links'
import { getAppBaseUrl } from '@/lib/url'

const appUrl = getAppBaseUrl()
const SITE = appUrl.includes('octively.com')
  ? 'https://octively.com'
  : appUrl.includes('octively.vercel.app')
    ? 'https://octively.vercel.app'
    : 'http://localhost:3000'

export default async function AdminLinksPage() {
  await requirePlatformOwner()
  const links = await listShortLinks()

  return (
    <div className="flex min-h-screen bg-[var(--bg)]">
      <Sidebar />
      <main className="flex-1 md:ml-56 pb-16 md:pb-0">
        <div className="flex items-start justify-between px-4 sm:px-8 py-5 border-b border-[var(--hairline)]">
          <div>
            <div
              className="flex items-center gap-1 mb-0.5 text-[10px] text-[var(--ink-subtle)] uppercase tracking-[0.1em]"
              style={{ fontFamily: 'var(--font-mono)' }}
            >
              <span>admin</span>
              <span className="opacity-40">/</span>
              <span className="text-[var(--ink-muted)]">links</span>
            </div>
            <h1 className="text-[17px] font-semibold text-[var(--ink)] leading-tight">
              Short links
            </h1>
            <p className="text-[13px] text-[var(--ink-muted)] mt-0.5">
              Shareable links that redirect to a destination with UTM params appended. Click count tracked.
            </p>
          </div>
        </div>

        <div className="px-4 sm:px-8 py-6">
          <AdminLinksClient links={links} site={SITE} />
        </div>
      </main>
      <MobileNav />
    </div>
  )
}
