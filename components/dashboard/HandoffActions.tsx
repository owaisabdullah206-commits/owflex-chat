'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle2, Mail, MessagesSquare, Undo2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { acceptHandoff, replyByEmail, replyInChat, returnToBot } from '@/lib/db/queries/conversations'

interface HandoffActionsProps {
  conversationId: string
  visitorEmail: string | null
  visitorName: string | null
  /** Bot is configured for real-time in-widget takeover (Agency+). */
  liveMode?: boolean
  /** A human has already taken over this conversation. */
  agentActive?: boolean
}

export function HandoffActions({ conversationId, visitorEmail, visitorName, liveMode = false, agentActive = false }: HandoffActionsProps) {
  const router = useRouter()
  const [accepting, startAccept] = useTransition()
  const [replying, startReply] = useTransition()
  const [showReply, setShowReply] = useState(false)
  const [replyText, setReplyText] = useState('')
  const [replyError, setReplyError] = useState<string | null>(null)
  const [replySent, setReplySent] = useState(false)

  // Live in-widget reply
  const [liveText, setLiveText] = useState('')
  const [liveError, setLiveError] = useState<string | null>(null)
  const [liveSending, startLiveSend] = useTransition()
  const [returning, startReturn] = useTransition()

  function handleLiveSend() {
    if (!liveText.trim()) return
    setLiveError(null)
    startLiveSend(async () => {
      const result = await replyInChat(conversationId, liveText.trim())
      if (result.error) { setLiveError(result.error); return }
      setLiveText('')
      router.refresh()
    })
  }

  function handleReturnToBot() {
    startReturn(async () => {
      await returnToBot(conversationId)
      router.refresh()
    })
  }

  function handleAccept() {
    startAccept(async () => {
      await acceptHandoff(conversationId)
      router.refresh()
    })
  }

  function handleReply() {
    if (!replyText.trim()) return
    setReplyError(null)
    startReply(async () => {
      const result = await replyByEmail(conversationId, replyText.trim())
      if (result.error) {
        setReplyError(result.error)
      } else {
        setReplySent(true)
        setReplyText('')
        setShowReply(false)
      }
    })
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Live in-widget reply — Agency plan, real-time takeover */}
      {liveMode && (
        <div className="flex flex-col gap-2 p-3 border border-[var(--hairline)] bg-[var(--surface)]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[var(--ink)] flex items-center gap-1.5">
              <MessagesSquare className="h-3.5 w-3.5 text-emerald-400" />
              {agentActive ? 'You are handling this chat' : 'Reply live in the widget'}
            </span>
            {agentActive && (
              <span className="text-[10px] text-emerald-400 flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" /> Live
              </span>
            )}
          </div>
          <Textarea
            value={liveText}
            onChange={(e) => setLiveText(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleLiveSend() }}
            placeholder="Type a reply the visitor sees instantly…"
            rows={2}
            className="bg-[var(--bg)] border-[var(--hairline)] text-[var(--ink)] text-sm resize-none rounded-none"
            disabled={liveSending}
          />
          {liveError && <p className="text-xs text-red-400">{liveError}</p>}
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={handleLiveSend}
              disabled={liveSending || !liveText.trim()}
              className="h-8 text-xs bg-[var(--of-primary)] hover:bg-[var(--of-primary-hover)] text-white gap-1.5"
            >
              <MessagesSquare className="h-3.5 w-3.5" />
              {liveSending ? 'Sending…' : 'Send reply'}
            </Button>
            {agentActive && (
              <Button
                size="sm"
                variant="outline"
                onClick={handleReturnToBot}
                disabled={returning}
                className="h-8 text-xs border-[var(--hairline)] text-[var(--ink-muted)] gap-1.5"
              >
                <Undo2 className="h-3.5 w-3.5" />
                {returning ? 'Returning…' : 'Return to agent'}
              </Button>
            )}
          </div>
          <p className="text-[10px] text-[var(--ink-subtle)]">⌘/Ctrl + Enter to send. The agent stays paused until you return the chat to it.</p>
        </div>
      )}

      <div className="flex items-center gap-2 flex-wrap">
        <Button
          size="sm"
          onClick={handleAccept}
          disabled={accepting}
          className="h-8 text-xs bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5"
        >
          <CheckCircle2 className="h-3.5 w-3.5" />
          {accepting ? 'Accepting…' : 'Accept handoff'}
        </Button>

        {visitorEmail && !replySent && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowReply((v) => !v)}
            disabled={replying}
            className="h-8 text-xs border-[var(--hairline)] text-[var(--ink)] gap-1.5"
          >
            <Mail className="h-3.5 w-3.5" />
            Reply by email
          </Button>
        )}

        {replySent && (
          <span className="text-xs text-emerald-400 flex items-center gap-1">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Email sent to {visitorEmail}
          </span>
        )}
      </div>

      {showReply && visitorEmail && (
        <div className="space-y-2">
          <p className="text-xs text-[var(--ink-muted)]">
            Reply to{' '}
            <span className="text-[var(--ink)]">{visitorName ?? visitorEmail}</span>{' '}
            &lt;{visitorEmail}&gt;
          </p>
          <Textarea
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder="Type your reply…"
            rows={4}
            className="bg-[var(--surface)] border-[var(--hairline)] text-[var(--ink)] text-sm resize-none rounded-none"
            disabled={replying}
          />
          {replyError && (
            <p className="text-xs text-red-400">{replyError}</p>
          )}
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={handleReply}
              disabled={replying || !replyText.trim()}
              className="h-8 text-xs bg-[var(--of-primary)] hover:bg-[var(--of-primary-hover)] text-white"
            >
              {replying ? 'Sending…' : 'Send email'}
            </Button>
            <button
              onClick={() => { setShowReply(false); setReplyError(null) }}
              className="text-xs text-[var(--ink-muted)] hover:text-[var(--ink)] transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
