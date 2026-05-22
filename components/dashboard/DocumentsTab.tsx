import { listDocsByBot } from '@/lib/db/queries/documents'
import { PLAN_LIMITS } from '@/lib/limits'
import { db, schema } from '@/lib/db'
import { and, eq, sql } from 'drizzle-orm'
import { DocumentUploader } from './DocumentUploader'
import { DocumentsTabClient } from './DocumentsTabClient'
import { FileText } from 'lucide-react'

type Plan = keyof typeof PLAN_LIMITS

interface Props {
  botId: string
  orgId: string
  plan: string
}

async function getDocStats(botId: string, orgId: string) {
  const [docCount] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(schema.documents)
    .where(
      and(
        eq(schema.documents.botId, botId),
        sql`${schema.documents.status} != 'failed'`,
      ),
    )

  const [crawlSum] = await db
    .select({ pages: sql<number>`coalesce(sum(page_count), 0)::int` })
    .from(schema.documents)
    .where(
      and(
        eq(schema.documents.botId, botId),
        eq(schema.documents.sourceType, 'url'),
        sql`${schema.documents.status} != 'failed'`,
      ),
    )

  return {
    docCount: docCount?.count ?? 0,
    crawlPages: crawlSum?.pages ?? 0,
  }
}

export async function DocumentsTab({ botId, orgId, plan }: Props) {
  const limits = PLAN_LIMITS[(plan as Plan) in PLAN_LIMITS ? (plan as Plan) : 'free']
  const [docs, stats] = await Promise.all([
    listDocsByBot(botId),
    getDocStats(botId, orgId),
  ])

  return (
    <div className="space-y-4">
      <DocumentUploader
        botId={botId}
        quotaUsed={stats.docCount}
        quotaMax={limits.docs === Infinity ? Infinity : limits.docs}
        crawlUsed={stats.crawlPages}
        crawlMax={limits.crawlPages === Infinity ? Infinity : limits.crawlPages}
        plan={plan}
      />

      {docs.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-12 text-center">
          <FileText className="h-10 w-10 text-[var(--ink-subtle)]" />
          <p className="text-sm font-medium text-[var(--ink-muted)]">No documents yet</p>
          <p className="text-xs text-[var(--ink-muted)] max-w-xs">
            Upload a PDF, DOCX, TXT, or Markdown file — or paste a URL — to give your bot a knowledge base.
          </p>
        </div>
      ) : (
        <div className="border border-[var(--hairline)] bg-[var(--surface)] overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-2.5 border-b border-[var(--hairline)] text-xs text-[var(--ink-muted)] font-medium">
            <span className="flex-1">Document</span>
            <span>Status</span>
          </div>
          <DocumentsTabClient docs={docs} />
        </div>
      )}
    </div>
  )
}
