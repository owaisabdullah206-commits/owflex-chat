'use server'

import { and, eq, sql } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { db, schema } from '@/lib/db'
import { requireDeveloper } from '@/lib/auth/session'
import { deleteObject } from '@/lib/storage/r2'

export type DocumentStatus = 'queued' | 'processing' | 'embedding' | 'finalizing' | 'ready' | 'failed'

export interface DocRow {
  id: string
  botId: string
  orgId: string
  sourceType: string
  sourceUrl: string | null
  storageKey: string | null
  displayName: string
  mimeType: string | null
  byteSize: number
  status: string
  errorCode: string | null
  errorMsg: string | null
  pageCount: number
  chunkCount: number
  version: number
  createdAt: Date
  updatedAt: Date
  readyAt: Date | null
}

export async function createDoc(data: {
  botId: string
  orgId: string
  sourceType: 'file' | 'url'
  sourceUrl?: string
  storageKey?: string
  displayName: string
  mimeType?: string
  byteSize?: number
}): Promise<{ id: string }> {
  const [doc] = await db
    .insert(schema.documents)
    .values({
      botId: data.botId,
      orgId: data.orgId,
      sourceType: data.sourceType,
      sourceUrl: data.sourceUrl ?? null,
      storageKey: data.storageKey ?? null,
      displayName: data.displayName,
      mimeType: data.mimeType ?? null,
      byteSize: data.byteSize ?? 0,
      status: 'queued',
    })
    .returning({ id: schema.documents.id })
  return doc
}

export async function listDocsByBot(botId: string): Promise<DocRow[]> {
  return db
    .select()
    .from(schema.documents)
    .where(eq(schema.documents.botId, botId))
    .orderBy(sql`${schema.documents.createdAt} DESC`) as Promise<DocRow[]>
}

export async function getDocById(docId: string): Promise<DocRow | null> {
  const user = await requireDeveloper()
  const [doc] = await db
    .select()
    .from(schema.documents)
    .innerJoin(schema.bots, eq(schema.documents.botId, schema.bots.id))
    .innerJoin(schema.organizations, eq(schema.bots.orgId, schema.organizations.id))
    .where(
      and(
        eq(schema.documents.id, docId),
        eq(schema.organizations.ownerId, user.id),
      ),
    )
    .limit(1)

  if (!doc) return null
  return doc.documents as DocRow
}

export async function updateDocStatus(
  docId: string,
  status: DocumentStatus,
  extra?: {
    errorCode?: string
    errorMsg?: string
    chunkCount?: number
    pageCount?: number
  },
): Promise<void> {
  const update: Record<string, unknown> = {
    status,
    updatedAt: new Date(),
  }
  if (status === 'ready') update.readyAt = new Date()
  if (extra?.errorCode !== undefined) update.errorCode = extra.errorCode
  if (extra?.errorMsg !== undefined) update.errorMsg = extra.errorMsg
  if (extra?.chunkCount !== undefined) update.chunkCount = extra.chunkCount
  if (extra?.pageCount !== undefined) update.pageCount = extra.pageCount

  await db
    .update(schema.documents)
    .set(update)
    .where(eq(schema.documents.id, docId))
}

export async function bumpDocVersion(docId: string): Promise<number> {
  const [updated] = await db
    .update(schema.documents)
    .set({
      version: sql`${schema.documents.version} + 1`,
      status: 'queued',
      updatedAt: new Date(),
    })
    .where(eq(schema.documents.id, docId))
    .returning({ version: schema.documents.version })
  return updated.version
}

export async function deleteDocWithCleanup(
  docId: string,
  botId: string,
): Promise<void> {
  const user = await requireDeveloper()

  const [doc] = await db
    .select({
      id: schema.documents.id,
      storageKey: schema.documents.storageKey,
    })
    .from(schema.documents)
    .innerJoin(schema.bots, eq(schema.documents.botId, schema.bots.id))
    .innerJoin(schema.organizations, eq(schema.bots.orgId, schema.organizations.id))
    .where(
      and(
        eq(schema.documents.id, docId),
        eq(schema.documents.botId, botId),
        eq(schema.organizations.ownerId, user.id),
      ),
    )
    .limit(1)

  if (!doc) return

  if (doc.storageKey) {
    try {
      await deleteObject(doc.storageKey)
    } catch {
      // log but don't block DB cleanup
      console.error(`[deleteDoc] R2 delete failed for key ${doc.storageKey}`)
    }
  }

  await db.delete(schema.documents).where(eq(schema.documents.id, docId))
  revalidatePath(`/dashboard/bots/${botId}`)
}

export async function getDocCount(botId: string): Promise<number> {
  const [row] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(schema.documents)
    .where(
      and(
        eq(schema.documents.botId, botId),
        sql`${schema.documents.status} != 'failed'`,
      ),
    )
  return row?.count ?? 0
}
