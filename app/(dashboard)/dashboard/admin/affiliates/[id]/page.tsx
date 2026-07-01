import { requirePlatformOwner } from '@/lib/auth/session'
import { Sidebar } from '@/components/dashboard/Sidebar'
import { getAffiliateDetail } from '@/lib/db/queries/affiliates'
import { notFound } from 'next/navigation'
import { AffiliateDetailClient } from '@/components/dashboard/AffiliateDetailClient'

export default async function AffiliateDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requirePlatformOwner()
  const { id } = await params

  const detail = await getAffiliateDetail(id)
  if (!detail) notFound()

  return (
    <div className="flex min-h-screen bg-[var(--bg)]">
      <Sidebar />
      <main className="flex-1 ml-56">
        <div className="px-8 py-5 border-b border-[var(--hairline)]">
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--ink-subtle)]">
            Admin / Affiliates
          </p>
          <h1 className="text-lg font-bold text-[var(--ink)] mt-0.5">
            {detail.name}
          </h1>
          <p className="text-xs text-[var(--ink-muted)] mt-0.5">
            {detail.email} &middot; <code className="font-mono text-[var(--ink)]">{detail.code}</code>
          </p>
        </div>
        <AffiliateDetailClient detail={detail} />
      </main>
    </div>
  )
}
