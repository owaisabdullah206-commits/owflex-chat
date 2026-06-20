'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { MessagesSquare, Undo2 } from 'lucide-react'
import { replyInChatAsClient, returnToBotAsClient } from '@/lib/db/queries/conversations'

interface PortalLiveReplyProps {
  conversationId: string
  /** A human has already taken over this conversation. */
  agentActive: boolean
}

// Client-portal live takeover. Lets the client's staff reply directly inside the
// visitor's chat widget while the bot is paused. Agency plan only (enforced server-side).
export function PortalLiveReply({ conversationId, agentActive }: PortalLiveReplyProps) {
  const router = useRouter()
  const [text, setText] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [sending, startSend] = useTransition()
  const [returning, startReturn] = useTransition()

  function handleSend() {
    if (!text.trim()) return
    setError(null)
    startSend(async () => {
      const result = await replyInChatAsClient(conversationId, text.trim())
      if (result.error) { setError(result.error); return }
      setText('')
      router.refresh()
    })
  }

  function handleReturn() {
    startReturn(async () => {
      await returnToBotAsClient(conversationId)
      router.refresh()
    })
  }

  return (
    <div className="bg-[var(--surface)] rounded-xl border border-[var(--hairline)] shadow-sm overflow-hidden">
      <div className="h-0.5 bg-emerald-500" />
      <div className="p-4 sm:p-5 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-[var(--ink)] flex items-center gap-2">
            <MessagesSquare className="h-4 w-4 text-emerald-600" />
            {agentActive ? 'You are handling this chat live' : 'Reply to the visitor in real time'}
          </span>
          {agentActive && (
            <span className="text-xs text-emerald-600 font-medium flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" /> Live
            </span>
          )}
        </div>

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleSend() }}
          placeholder="Type a reply the visitor sees instantly…"
          rows={3}
          disabled={sending}
          className="w-full resize-none rounded-lg border border-[var(--hairline)] bg-[var(--bg)] px-3 py-2.5 text-sm text-[var(--ink)] placeholder:text-[var(--ink-subtle)] focus:outline-none focus:ring-2 focus:ring-[var(--of-primary)]/30 focus:border-[var(--of-primary)]"
        />

        {error && <p className="text-xs text-red-500">{error}</p>}

        <div className="flex items-center gap-2">
          <button
            onClick={handleSend}
            disabled={sending || !text.trim()}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--of-primary)] px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            <MessagesSquare className="h-4 w-4" />
            {sending ? 'Sending…' : 'Send reply'}
          </button>
          {agentActive && (
            <button
              onClick={handleReturn}
              disabled={returning}
              className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--hairline)] px-4 py-2 text-sm font-medium text-[var(--ink-muted)] transition-colors hover:text-[var(--ink)] disabled:opacity-50"
            >
              <Undo2 className="h-4 w-4" />
              {returning ? 'Returning…' : 'Return to bot'}
            </button>
          )}
        </div>
        <p className="text-[11px] text-[var(--ink-subtle)]">
          Press Ctrl/Cmd + Enter to send. The bot stays paused until you return the chat to it.
        </p>
      </div>
    </div>
  )
}
