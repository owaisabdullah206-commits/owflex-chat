interface Message {
  id: string
  role: string
  content: string
  createdAt: Date
}

interface ChatTranscriptProps {
  messages: Message[]
  botName: string
}

export function ChatTranscript({ messages, botName }: ChatTranscriptProps) {
  if (messages.length === 0) {
    return (
      <p className="text-sm text-[var(--ink-muted)] text-center py-8">
        No messages in this conversation.
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {messages.map((msg) => {
        const isUser = msg.role === 'user'
        return (
          <div
            key={msg.id}
            className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
          >
            <div className="max-w-[75%]">
              <div
                className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                  isUser
                    ? 'bg-[var(--of-primary)] text-white rounded-br-sm'
                    : 'bg-[var(--surface)] border border-[var(--hairline)] text-[var(--ink)] rounded-bl-sm'
                }`}
              >
                {msg.content}
              </div>
              <p className={`text-[10px] text-[var(--ink-subtle)] mt-1 ${isUser ? 'text-right' : 'text-left'}`}>
                {isUser ? 'Visitor' : botName} ·{' '}
                {new Date(msg.createdAt).toLocaleTimeString('en-US', {
                  hour: 'numeric', minute: '2-digit',
                })}
              </p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
