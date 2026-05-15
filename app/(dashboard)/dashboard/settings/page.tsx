import { requireDeveloper } from '@/lib/auth/session'
import { Sidebar } from '@/components/dashboard/Sidebar'
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

const comingFeatures = [
  { title: 'Knowledge Base', description: 'Upload documents and PDFs for your chatbot to reference.' },
  { title: 'Widget Customization', description: 'Customize colors, position, and greeting messages.' },
  { title: 'Billing & Credits', description: 'Manage your plan and monitor usage credits.' },
]

export default async function SettingsPage() {
  await requireDeveloper()

  return (
    <div className="flex min-h-screen bg-[var(--bg)]">
      <Sidebar />
      <main className="flex-1 ml-56">
        <div className="px-8 py-5 border-b border-[var(--hairline)]">
          <h1 className="text-lg font-semibold text-[var(--ink)]">Settings</h1>
          <p className="text-sm text-[var(--ink-muted)] mt-0.5">Account and workspace preferences</p>
        </div>
        <div className="px-8 py-6">
          <p className="text-sm text-[var(--ink-muted)] mb-4">Coming in Phase 2:</p>
          <div className="grid gap-3 max-w-xl">
            {comingFeatures.map((f) => (
              <Card key={f.title} className="opacity-60">
                <CardHeader className="py-4">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-sm">{f.title}</CardTitle>
                    <Badge variant="secondary" className="text-[10px]">Soon</Badge>
                  </div>
                  <CardDescription className="text-xs">{f.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
