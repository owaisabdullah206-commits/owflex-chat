import { LiveIndicator } from '@/components/brand/LiveIndicator'

export function BotPreview() {
  return (
    <div className="sticky top-8">
      <p className="text-xs font-medium text-[var(--ink-muted)] mb-3 uppercase tracking-wide">Preview</p>
      <div className="rounded-2xl border border-[var(--hairline)] bg-[var(--surface)] overflow-hidden shadow-lg max-w-xs">
        {/* Chat header */}
        <div className="bg-[var(--of-primary)] px-4 py-3 flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
            <span className="text-white text-xs font-bold">B</span>
          </div>
          <span className="text-white text-sm font-medium">Your Bot</span>
          <LiveIndicator label="Online" color="white" style={{ fontSize: 10, opacity: 0.8, marginLeft: 'auto' }} />
        </div>

        {/* Sample messages */}
        <div className="p-3 space-y-2.5 bg-[var(--bg)] min-h-[200px]">
          <div className="flex gap-2 items-end">
            <div className="w-5 h-5 rounded-full bg-[var(--of-primary)] shrink-0 mb-0.5" />
            <div className="bg-[var(--surface)] border border-[var(--hairline)] text-[var(--ink)] text-xs rounded-2xl rounded-tl-sm px-3 py-2 max-w-[75%]">
              Hi! How can I help you today?
            </div>
          </div>
          <div className="flex justify-end">
            <div className="bg-[var(--of-primary)] text-white text-xs rounded-2xl rounded-tr-sm px-3 py-2 max-w-[75%]">
              Tell me about your services.
            </div>
          </div>
          <div className="flex gap-2 items-end">
            <div className="w-5 h-5 rounded-full bg-[var(--of-primary)] shrink-0 mb-0.5" />
            <div className="bg-[var(--surface)] border border-[var(--hairline)] text-[var(--ink)] text-xs rounded-2xl rounded-tl-sm px-3 py-2 max-w-[75%]">
              I&apos;d be happy to help with that!
            </div>
          </div>
        </div>

        {/* Input bar mockup */}
        <div className="px-3 py-2.5 border-t border-[var(--hairline)] flex items-center gap-2 bg-[var(--surface)]">
          <div className="flex-1 h-7 rounded-full bg-[var(--bg)] border border-[var(--hairline)]" />
          <div className="w-7 h-7 rounded-full bg-[var(--of-primary)] flex items-center justify-center shrink-0">
            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-white">
              <path d="M2 21l21-9L2 3v7l15 2-15 2v7z" />
            </svg>
          </div>
        </div>
      </div>

      <p className="text-xs text-[var(--ink-muted)] mt-3 leading-relaxed">
        This is a preview of your chat widget. Customise colors and welcome message in Settings after creation.
      </p>
    </div>
  )
}
