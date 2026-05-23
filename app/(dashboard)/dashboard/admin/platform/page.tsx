import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { requirePlatformOwner } from '@/lib/auth/session'
import { getPlatformPrompt } from '@/lib/db/queries/platform'
import { db, schema } from '@/lib/db'
import { eq } from 'drizzle-orm'
import { Sidebar } from '@/components/dashboard/Sidebar'
import { SavePromptButton } from '@/components/dashboard/SavePromptButton'
import { AdminPlatformEditor } from '@/components/dashboard/AdminPlatformEditor'

const MAX_CHARS = 3000

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
    const raw = (formData.get('prompt') as string) ?? ''
    const text = raw.slice(0, MAX_CHARS)
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
          <p className="text-xs text-[var(--ink-muted)] mt-0.5">
            Prepended to every bot on the platform before their individual system prompt. Invisible to developers and clients.
          </p>
        </div>
        <div className="px-8 py-6 max-w-2xl">
          <form action={savePrompt} className="space-y-4">
            <AdminPlatformEditor initialValue={currentPrompt} />
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
