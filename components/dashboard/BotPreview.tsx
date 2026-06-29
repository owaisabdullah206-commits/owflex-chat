import { Bot } from 'lucide-react'
import { LiveIndicator } from '@/components/brand/LiveIndicator'

// Live preview shown on the new-bot form. Updates as the user types the bot name.
// Colours, welcome message, and other styling are configured in Settings after creation,
// so this mirrors the settings chat-window look using the defaults.
export function BotPreview({ botName }: { botName?: string }) {
  const name = botName?.trim() || 'My Agent'
  return (
    <div className="sticky top-8">
      <p className="text-xs font-medium text-[var(--ink-muted)] mb-3 uppercase tracking-wide">Preview</p>

      <div
        className="rounded-2xl border border-[var(--hairline)] overflow-hidden shadow-lg max-w-xs"
        style={{ minHeight: 460 }}
      >
        {/* Header */}
        <div className="px-4 py-3 flex items-center gap-2.5" style={{ background: 'var(--of-primary)' }}>
          <div className="relative w-8 h-8 rounded-full bg-white/20 flex items-center justify-center shrink-0">
            <Bot className="w-4 h-4 text-white" />
            <span
              className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-[#4ade80]"
              style={{ boxShadow: '0 0 0 2px var(--of-primary)' }}
            />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-white text-sm font-semibold leading-tight truncate">{name}</div>
            <LiveIndicator label="Online" color="white" style={{ fontSize: 10, opacity: 0.85, marginTop: 1 }} />
          </div>
          <span aria-hidden className="text-white/70 text-lg leading-none shrink-0">&#x2715;</span>
        </div>

        {/* Messages */}
        <div className="p-3.5 flex flex-col gap-2.5 bg-[var(--bg)]" style={{ minHeight: 340 }}>
          <div className="flex gap-2 items-end">
            <div className="w-7 h-7 rounded-full shrink-0 flex items-center justify-center" style={{ background: 'var(--of-primary)' }}>
              <Bot className="w-3.5 h-3.5 text-white" />
            </div>
            <div className="bg-[var(--surface)] border border-[var(--hairline)] text-[var(--ink)] text-[13px] leading-relaxed rounded-2xl rounded-bl-sm px-3 py-2 max-w-[80%]">
              Hi! How can I help you today?
            </div>
          </div>
          <div className="flex justify-end">
            <div className="text-white text-[13px] leading-relaxed rounded-2xl rounded-br-sm px-3 py-2 max-w-[80%]" style={{ background: 'var(--of-primary)' }}>
              Tell me about your services.
            </div>
          </div>
          <div className="flex gap-2 items-end">
            <div className="w-7 h-7 rounded-full shrink-0 flex items-center justify-center" style={{ background: 'var(--of-primary)' }}>
              <Bot className="w-3.5 h-3.5 text-white" />
            </div>
            <div className="bg-[var(--surface)] border border-[var(--hairline)] text-[var(--ink)] text-[13px] leading-relaxed rounded-2xl rounded-bl-sm px-3 py-2 max-w-[80%]">
              I&apos;d be happy to help with that!
            </div>
          </div>
        </div>

        {/* Input bar */}
        <div className="px-3 py-2.5 border-t border-[var(--hairline)] flex items-center gap-2 bg-[var(--surface)]">
          <div className="flex-1 h-8 rounded-full bg-[var(--bg)] border border-[var(--hairline)] flex items-center px-3 text-[11px] text-[var(--ink-subtle)]">
            Type a message…
          </div>
          <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0" style={{ background: 'var(--of-primary)' }}>
            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-white">
              <path d="M2 21l21-9L2 3v7l15 2-15 2v7z" />
            </svg>
          </div>
        </div>
      </div>

      <p className="text-xs text-[var(--ink-muted)] mt-3 leading-relaxed">
        Live preview of your agent. Customise colours, welcome message, and lead capture in Settings after you create it.
      </p>
    </div>
  )
}
