import { revalidatePath } from 'next/cache'
import { eq } from 'drizzle-orm'
import { requirePlatformOwner } from '@/lib/auth/session'
import { getPlatformPrompt } from '@/lib/db/queries/platform'
import { db, schema } from '@/lib/db'
import { Sidebar } from '@/components/dashboard/Sidebar'
import { PlatformPromptForm } from '@/components/dashboard/PlatformPromptForm'

export default async function AdminPlatformPage() {
  await requirePlatformOwner()
  const currentPrompt = await getPlatformPrompt()

  async function savePrompt(text: string) {
    'use server'
    await db
      .insert(schema.platformConfig)
      .values({ id: 'default', systemPrompt: text })
      .onConflictDoUpdate({
        target: schema.platformConfig.id,
        set: { systemPrompt: text, updatedAt: new Date() },
      })
    revalidatePath('/dashboard/admin/platform')
  }

  return (
    <div className="flex min-h-screen bg-[var(--bg)]">
      <Sidebar />
      <main className="flex-1 ml-56">
        <div className="px-8 py-5 border-b border-[var(--hairline)]">
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--ink-subtle)]">Admin</p>
          <h1 className="text-lg font-bold text-[var(--ink)] mt-0.5">Platform System Prompt</h1>
          <p className="text-xs text-[var(--ink-muted)] mt-0.5">Prepended to every bot on the platform. Invisible to developers and clients.</p>
        </div>
        <div className="px-8 py-6 max-w-2xl">
          <PlatformPromptForm currentPrompt={currentPrompt} onSave={savePrompt} />
        </div>
      </main>
    </div>
  )
}
