import { notFound } from 'next/navigation'
import Link from 'next/link'
import { eq, and, asc, sql } from 'drizzle-orm'
import { ArrowLeft, Bot, User, AlertTriangle, CheckCircle2, Mail } from 'lucide-react'
import { requireDeveloper } from '@/lib/auth/session'
import { db, schema } from '@/lib/db'
import { Sidebar } from '@/components/dashboard/Sidebar'
import { RelativeTime } from '@/components/shared/RelativeTime'
import { HandoffActions } from '@/components/dashboard/HandoffActions'
import { MarkdownContent } from '@/components/shared/MarkdownContent'

export default async function ConversationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const user = await requireDeveloper()

  // Load conversation + verify it belongs to this developer's org
  const [conv] = await db
    .select({
      id:           schema.conversations.id,
      botId:        schema.conversations.botId,
      botName:      schema.bots.name,
      pageUrl:      schema.conversations.pageUrl,
      startedAt:    schema.conversations.startedAt,
      messageCount: schema.conversations.messageCount,
      needsHuman:   sql<boolean>`COALESCE(${schema.conversations.needsHuman}, false)`,
      escalatedAt:  schema.conversations.escalatedAt,
      sessionId:    schema.conversations.sessionId,
      orgPlan:      schema.organizations.plan,
    })
    .from(schema.conversations)
    .innerJoin(schema.bots, eq(schema.conversations.botId, schema.bots.id))
    .innerJoin(schema.organizations, eq(schema.bots.orgId, schema.organizations.id))
    .where(
      and(
        eq(schema.conversations.id, id),
        eq(schema.organizations.ownerId, user.id),
      )
    )
    .limit(1)

  if (!conv) notFound()

  // Fetch visitor lead info (best-effort join on conversationId)
  // Do NOT expose hidden leads — they are invisible until the org upgrades
  const [lead] = await db
    .select({
      name:           schema.leads.name,
      email:          schema.leads.email,
      phone:          schema.leads.phone,
      hiddenByLimit:  schema.leads.hiddenByLimit,
    })
    .from(schema.leads)
    .where(eq(schema.leads.conversationId, id))
    .limit(1)

  // Treat hidden leads as if they don't exist
  const visibleLead = lead && !lead.hiddenByLimit ? lead : undefined

  const messages = await db
    .select({
      id:        schema.messages.id,
      role:      schema.messages.role,
      content:   schema.messages.content,
      modelUsed: schema.messages.modelUsed,
      createdAt: schema.messages.createdAt,
    })
    .from(schema.messages)
    .where(eq(schema.messages.conversationId, id))
    .orderBy(asc(schema.messages.createdAt))

  return (
    <div className="flex min-h-screen bg-[var(--bg)]">
      <Sidebar />
      <main className="flex-1 ml-56">
        {/* Header */}
        <div className="px-8 py-5 border-b border-[var(--hairline)] flex items-center gap-4">
          <Link
            href={`/dashboard/bots/${conv.botId}?tab=Conversations`}
            className="flex items-center gap-1.5 text-xs text-[var(--ink-muted)] hover:text-[var(--ink)] transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back
          </Link>
          <div className="w-px h-4 bg-[var(--hairline)]" />
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--ink-subtle)]">
              {conv.botName}
            </p>
            <h1 className="text-lg font-bold text-[var(--ink)] mt-0.5 leading-none">Conversation</h1>
          </div>
          <div className="ml-auto flex items-center gap-4 text-xs text-[var(--ink-muted)]">
            {conv.needsHuman && (
              <span className="flex items-center gap-1.5 text-amber-400 font-medium">
                <AlertTriangle className="h-3.5 w-3.5" />
                Needs human
              </span>
            )}
            {conv.pageUrl && (
              <a
                href={conv.pageUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="truncate max-w-xs hover:text-[var(--ink)] transition-colors"
                style={{ fontFamily: 'var(--font-mono)' }}
              >
                {conv.pageUrl}
              </a>
            )}
            <span><RelativeTime date={conv.startedAt} /></span>
            <span style={{ fontFamily: 'var(--font-mono)' }}>{conv.messageCount} msgs</span>
          </div>
        </div>

        <div className="px-8 py-6 max-w-3xl space-y-6">
          {/* Escalation banner */}
          {conv.needsHuman && (
            <div className="border border-amber-500/30 bg-amber-500/10 p-4 space-y-3">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0" />
                    <p className="text-sm font-semibold text-amber-300">Human handoff requested</p>
                  </div>
                  {conv.escalatedAt && (
                    <p className="text-xs text-amber-400/70 mt-1 ml-6">
                      Escalated <RelativeTime date={conv.escalatedAt} />
                    </p>
                  )}
                  {(visibleLead?.name || visibleLead?.email || visibleLead?.phone) && (
                    <div className="mt-2 ml-6 text-xs text-[var(--ink-muted)] space-y-0.5">
                      {visibleLead.name  && <p>Visitor: <span className="text-[var(--ink)]">{visibleLead.name}</span></p>}
                      {visibleLead.email && (
                        <p>
                          Email:{' '}
                          <a href={`mailto:${visibleLead.email}`} className="text-[var(--of-primary)] hover:underline">
                            {visibleLead.email}
                          </a>
                        </p>
                      )}
                      {visibleLead.phone && <p>Phone: <span className="text-[var(--ink)]">{visibleLead.phone}</span></p>}
                    </div>
                  )}
                </div>
              </div>
              <HandoffActions
                conversationId={conv.id}
                visitorEmail={visibleLead?.email ?? null}
                visitorName={visibleLead?.name ?? null}
              />
            </div>
          )}

          {/* Messages */}
          {messages.length === 0 ? (
            <p className="text-sm text-[var(--ink-muted)]">No messages in this conversation.</p>
          ) : (
            <div className="space-y-3">
              {messages.map((msg) => {
                const isUser = msg.role === 'user'
                return (
                  <div key={msg.id} className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}>
                    {!isUser && (
                      <div className="w-7 h-7 shrink-0 bg-[var(--of-primary)]/15 flex items-center justify-center mt-0.5">
                        <Bot className="h-3.5 w-3.5 text-[var(--of-primary)]" />
                      </div>
                    )}
                    <div className={`max-w-[75%] flex flex-col gap-1 ${isUser ? 'items-end' : 'items-start'}`}>
                      <div
                        className={`px-4 py-2.5 text-sm leading-relaxed ${
                          isUser
                            ? 'bg-[var(--of-primary)] text-white whitespace-pre-wrap'
                            : 'bg-[var(--surface-2)] text-[var(--ink)] border border-[var(--hairline)]'
                        }`}
                      >
                        {isUser
                          ? msg.content
                          : <MarkdownContent content={msg.content} />
                        }
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-[var(--ink-subtle)]">
                        <RelativeTime date={msg.createdAt} />
                        {!isUser && msg.modelUsed && conv.orgPlan !== 'free' && (
                          <span style={{ fontFamily: 'var(--font-mono)' }}>{msg.modelUsed}</span>
                        )}
                      </div>
                    </div>
                    {isUser && (
                      <div className="w-7 h-7 shrink-0 bg-[var(--surface-3)] flex items-center justify-center mt-0.5">
                        <User className="h-3.5 w-3.5 text-[var(--ink-muted)]" />
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
