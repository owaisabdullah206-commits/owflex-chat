import { NextRequest, NextResponse } from 'next/server'
import { requireDeveloper } from '@/lib/auth/session'
import { getDocById, bumpDocVersion } from '@/lib/db/queries/documents'
import { publishJSON, getIngestUrl } from '@/lib/queue/qstash'
import { createAuditLog } from '@/lib/db/queries/audit'

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ docId: string }> },
) {
  let user: Awaited<ReturnType<typeof requireDeveloper>>
  try {
    user = await requireDeveloper()
  } catch {
    return NextResponse.json({ error: 'Unauthorized', code: 'UNAUTHORIZED', status: 401 }, { status: 401 })
  }

  const { docId } = await params
  const doc = await getDocById(docId)

  if (!doc) {
    return NextResponse.json({ error: 'Document not found', code: 'NOT_FOUND', status: 404 }, { status: 404 })
  }

  if (doc.sourceType !== 'file') {
    return NextResponse.json(
      { error: 'Re-index is only supported for uploaded files', code: 'UNSUPPORTED', status: 400 },
      { status: 400 },
    )
  }

  if (doc.status === 'processing') {
    return NextResponse.json(
      { error: 'Document is already processing', code: 'ALREADY_PROCESSING', status: 409 },
      { status: 409 },
    )
  }

  await bumpDocVersion(docId)

  await publishJSON(getIngestUrl(), { docId, sourceType: 'file' })

  void createAuditLog({
    orgId:      doc.orgId,
    userId:     user.id,
    action:     'document.reindexed',
    entityType: 'document',
    entityId:   docId,
    meta:       { fileName: doc.displayName, botId: doc.botId },
  })

  return NextResponse.json({ docId, status: 'queued' }, { status: 202 })
}
