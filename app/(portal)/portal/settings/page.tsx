import { requireClient } from '@/lib/auth/session'
import { TopNav } from '@/components/portal/TopNav'
import { PortalSettingsForm } from '@/components/portal/PortalSettingsForm'

export default async function PortalSettingsPage() {
  const user = await requireClient()

  return (
    <div className="min-h-screen">
      <TopNav userEmail={user.email} userName={user.name} />

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-[var(--ink)]">Account Settings</h1>
          <p className="text-sm text-[var(--ink-muted)] mt-0.5">Manage your profile information.</p>
        </div>

        <div className="bg-[var(--surface)] rounded-xl border border-[var(--hairline)] shadow-sm overflow-hidden">
          <div className="h-0.5 bg-[var(--of-primary)]" />
          <div className="px-6 py-6">
            <PortalSettingsForm initialName={user.name ?? ''} email={user.email} />
          </div>
        </div>
      </div>
    </div>
  )
}
