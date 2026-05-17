import { requirePlatformOwner } from '@/lib/auth/session'
import { getAllDevelopers } from '@/lib/db/queries/admin'
import { Sidebar } from '@/components/dashboard/Sidebar'
import { AdminDeveloperTable } from '@/components/dashboard/AdminDeveloperTable'

export default async function AdminDevelopersPage() {
  await requirePlatformOwner()
  const developers = await getAllDevelopers()

  return (
    <div className="flex min-h-screen bg-[var(--bg)]">
      <Sidebar />
      <main className="flex-1 ml-56">
        <div className="px-8 py-5 border-b border-[var(--hairline)]">
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--ink-subtle)]">Admin</p>
          <h1 className="text-lg font-bold text-[var(--ink)] mt-0.5">Developers</h1>
          <p className="text-xs text-[var(--ink-muted)] mt-0.5">Manage accounts — plans, credits, suspensions, password resets.</p>
        </div>
        <div className="px-8 py-6">
          <AdminDeveloperTable developers={developers} />
        </div>
      </main>
    </div>
  )
}
