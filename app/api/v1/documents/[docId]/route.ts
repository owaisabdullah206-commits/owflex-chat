import { NextRequest, NextResponse } from 'next/server'
import { requireDeveloper } from '@/lib/auth/session'
import { getDocById, deleteDocWithCleanup } from '@/lib/db/queries/documents'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ docId: string }> },
) {
  try {
    await requireDeveloper()
  } catch {
    return NextResponse.json({ error: 'Unauthorized', code: 'UNAUTHORIZED', status: 401 }, { status: 401 })
  }

  const { docId } = await params
  const doc = await getDocById(docId)
  if (!doc) {
    return NextResponse.json({ error: 'Document not found', code: 'NOT_FOUND', status: 404 }, { status: 404 })
  }

  return NextResponse.json(doc)
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ docId: string }> },
) {
  try {
    await requireDeveloper()
  } catch {
    return NextResponse.json({ error: 'Unauthorized', code: 'UNAUTHORIZED', status: 401 }, { status: 401 })
  }

  const { docId } = await params
  const doc = await getDocById(docId)
  if (!doc) {
    return NextResponse.json({ error: 'Document not found', code: 'NOT_FOUND', status: 404 }, { status: 404 })
  }

  await deleteDocWithCleanup(docId, doc.botId)
  return new NextResponse(null, { status: 204 })
}
