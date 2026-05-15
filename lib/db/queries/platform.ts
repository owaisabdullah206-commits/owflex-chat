'use server'

import { revalidateTag } from 'next/cache'
import { unstable_cache } from 'next/cache'
import { eq } from 'drizzle-orm'
import { db, schema } from '@/lib/db'

export const getPlatformPrompt = unstable_cache(
  async (): Promise<string> => {
    const [row] = await db
      .select({ systemPrompt: schema.platformConfig.systemPrompt })
      .from(schema.platformConfig)
      .where(eq(schema.platformConfig.id, 'default'))
      .limit(1)
    return row?.systemPrompt ?? ''
  },
  ['platform-prompt'],
  { tags: ['platform-prompt'], revalidate: 300 },
)

export async function setPlatformPrompt(text: string): Promise<void> {
  await db
    .insert(schema.platformConfig)
    .values({ id: 'default', systemPrompt: text })
    .onConflictDoUpdate({
      target: schema.platformConfig.id,
      set: { systemPrompt: text, updatedAt: new Date() },
    })
  revalidateTag('platform-prompt')
}
