import { redirect } from 'next/navigation'
import { requireDeveloper } from '@/lib/auth/session'
import { getPlatformPrompt, setPlatformPrompt } from '@/lib/db/queries/platform'
import { Sidebar } from '@/components/dashboard/Sidebar'
import { PlatformPromptForm } from '@/components/dashboard/PlatformPromptForm'

export default async function AdminPlatformPage() {
  const user = await requireDeveloper()

  if (user.email !== process.env.PLATFORM_OWNER_EMAIL) {
    redirect('/dashboard')
  }

  const currentPrompt = await getPlatformPrompt()

  return (
    <div className="flex min-h-screen bg-[var(--bg)]">
      <Sidebar />
      <main className="flex-1 ml-56">
        <div className="px-8 py-5 border-b border-[var(--hairline)]">
          <h1 className="text-lg font-semibold text-[var(--ink)]">Platform System Prompt</h1>
          <p className="text-sm text-[var(--ink-muted)] mt-0.5">
            This prompt is prepended to every bot on the platform. Invisible to developers and clients.
          </p>
        </div>
        <div className="px-8 py-6 max-w-2xl">
          <PlatformPromptForm currentPrompt={currentPrompt} onSave={setPlatformPrompt} />
        </div>
      </main>
    </div>
  )
}
