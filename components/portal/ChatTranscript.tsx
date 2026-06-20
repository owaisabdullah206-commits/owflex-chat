import { MarkdownContent } from '@/components/shared/MarkdownContent'
import { ClientDate } from '@/components/shared/ClientDate'

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
        const isAgent = msg.role === 'agent'
        return (
          <div
            key={msg.id}
            className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
          >
            <div className="max-w-[75%]">
              <div
                className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                  isUser
                    ? 'bg-[var(--of-primary)] text-white rounded-br-sm whitespace-pre-wrap'
                    : isAgent
                      ? 'bg-emerald-50 border border-emerald-200 text-[var(--ink)] rounded-bl-sm'
                      : 'bg-[var(--surface)] border border-[var(--hairline)] text-[var(--ink)] rounded-bl-sm'
                }`}
              >
                {isUser
                  ? msg.content
                  : <MarkdownContent content={msg.content} />
                }
              </div>
              <p className={`text-[10px] mt-1 ${isUser ? 'text-right text-[var(--ink-subtle)]' : isAgent ? 'text-left text-emerald-600 font-medium' : 'text-left text-[var(--ink-subtle)]'}`}>
                {isUser ? 'Visitor' : isAgent ? 'Live agent' : botName} ·{' '}
                <ClientDate iso={msg.createdAt} opts={{ hour: 'numeric', minute: '2-digit', hour12: true }} />
              </p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
