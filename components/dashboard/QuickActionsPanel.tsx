import { Settings, BookOpen, Users, MessageSquare, HelpCircle } from 'lucide-react'

interface QuickActionsPanelProps {
  botId: string
}

export function QuickActionsPanel({ botId }: QuickActionsPanelProps) {
  const actions = [
    { href: `/dashboard/bots/${botId}?tab=settings`,       icon: Settings,       label: 'Edit Settings' },
    { href: `/dashboard/bots/${botId}?tab=knowledge+base`, icon: BookOpen,       label: 'Knowledge Base' },
    { href: `/dashboard/bots/${botId}?tab=leads`,          icon: Users,          label: 'View Leads' },
    { href: `/dashboard/bots/${botId}?tab=conversations`,  icon: MessageSquare,  label: 'Conversations' },
    { href: `/dashboard/bots/${botId}?tab=unanswered`,     icon: HelpCircle,     label: 'Unanswered' },
  ]

  return (
    <div className="space-y-4">
      <div className="border border-[var(--hairline)] bg-[var(--surface)] p-4">
        <h3 className="text-xs font-semibold text-[var(--ink-muted)] uppercase tracking-wide mb-3">
          Quick Actions
        </h3>
        <div className="space-y-0.5">
          {actions.map(({ href, icon: Icon, label }) => (
            <a
              key={href}
              href={href}
              className="flex items-center gap-2.5 px-3 py-2 text-sm text-[var(--ink-muted)] hover:bg-[var(--surface-2)] hover:text-[var(--ink)] transition-colors"
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}
