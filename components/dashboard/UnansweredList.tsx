interface UnansweredMessage {
  id: string
  content: string
  createdAt: Date
  conversationId: string
  /** The visitor's question that preceded this flagged reply (null if none found). */
  question: string | null
}

interface UnansweredListProps {
  messages: UnansweredMessage[]
}

export function UnansweredList({ messages }: UnansweredListProps) {
  if (messages.length === 0) {
    return (
      <div className="border border-dashed border-[var(--hairline)] bg-[var(--surface)] px-6 py-10 text-center">
        <p className="text-sm text-[var(--ink-muted)]">No unanswered questions yet — great job!</p>
        <p className="text-xs text-[var(--ink-muted)] mt-1">
          Questions will appear here when the bot expresses uncertainty in its responses.
        </p>
      </div>
    )
  }

  return (
    <div className="border border-[var(--hairline)] bg-[var(--surface)] divide-y divide-[var(--hairline)]">
      {messages.map((msg) => (
        <div key={msg.id} className="px-5 py-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0 space-y-2">
              {/* Visitor's question (the part you actually want to answer) */}
              {msg.question && (
                <div className="flex gap-2">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--ink-subtle)] pt-0.5 shrink-0">Asked</span>
                  <p className="text-sm font-medium text-[var(--ink)] line-clamp-3">{msg.question}</p>
                </div>
              )}
              {/* Bot's uncertain reply */}
              <div className="flex gap-2">
                <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--ink-subtle)] pt-0.5 shrink-0">Bot</span>
                <p className="text-sm text-[var(--ink-muted)] line-clamp-3">{msg.content}</p>
              </div>
            </div>
            <a
              href={`/dashboard/conversations/${msg.conversationId}`}
              className="text-xs text-[var(--of-primary)] hover:underline shrink-0"
            >
              View conversation →
            </a>
          </div>
          <p className="text-xs text-[var(--ink-muted)] mt-2">
            {new Date(msg.createdAt).toLocaleDateString('en-US', {
              month: 'short', day: 'numeric', year: 'numeric',
              hour: '2-digit', minute: '2-digit',
            })}
          </p>
        </div>
      ))}
    </div>
  )
}
