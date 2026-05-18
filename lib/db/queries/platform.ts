import { eq } from 'drizzle-orm'
import { db, schema } from '@/lib/db'

// Plain async function — safe to import in API routes and server components
export async function getPlatformPrompt(): Promise<string> {
  const [row] = await db
    .select({ systemPrompt: schema.platformConfig.systemPrompt })
    .from(schema.platformConfig)
    .where(eq(schema.platformConfig.id, 'default'))
    .limit(1)
  return row?.systemPrompt ?? ''
}
