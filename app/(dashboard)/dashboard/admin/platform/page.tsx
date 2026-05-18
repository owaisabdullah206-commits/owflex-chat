import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { requirePlatformOwner } from '@/lib/auth/session'
import { getPlatformPrompt } from '@/lib/db/queries/platform'
import { db, schema } from '@/lib/db'
import { eq } from 'drizzle-orm'
import { Sidebar } from '@/components/dashboard/Sidebar'
import { SavePromptButton } from '@/components/dashboard/SavePromptButton'

export default async function AdminPlatformPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string }>
}) {
  await requirePlatformOwner()

  const [currentPrompt, { saved }] = await Promise.all([
    getPlatformPrompt(),
    searchParams,
  ])

  async function savePrompt(formData: FormData) {
    'use server'
    const text = (formData.get('prompt') as string) ?? ''
    await db
      .insert(schema.platformConfig)
      .values({ id: 'default', systemPrompt: text })
      .onConflictDoUpdate({
        target: schema.platformConfig.id,
        set: { systemPrompt: text, updatedAt: new Date() },
      })
    revalidatePath('/dashboard/admin/platform')
    redirect('/dashboard/admin/platform?saved=1')
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
          <form action={savePrompt} className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="prompt" className="block text-xs text-[var(--ink-muted)]">
                Platform Prompt
              </label>
              <textarea
                id="prompt"
                name="prompt"
                rows={12}
                defaultValue={currentPrompt}
                placeholder="Leave empty to disable. This prompt prepends every bot's system prompt."
                className="w-full rounded-none bg-[var(--surface)] border border-[var(--hairline)] text-[var(--ink)] resize-none px-3 py-2 text-sm focus:outline-none focus:border-[var(--of-primary)]"
              />
              <p className="text-xs text-[var(--ink-muted)]">
                Changes take effect immediately. An empty prompt means no platform prefix.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <SavePromptButton />
              {saved === '1' && (
                <span className="text-xs text-emerald-400">Saved — changes are live</span>
              )}
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}
