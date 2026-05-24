'use client'
import { useEffect, useRef, useState } from 'react'
import { X, MessageSquarePlus, Bug, MessageCircle, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'

type FeedbackType = 'bug' | 'general'

const TYPES: { value: FeedbackType; label: string; icon: React.ElementType }[] = [
  { value: 'bug',     label: 'Bug report', icon: Bug           },
  { value: 'general', label: 'General',    icon: MessageCircle },
]

interface ClientFeedbackModalProps {
  open: boolean
  onClose: () => void
}

export function ClientFeedbackModal({ open, onClose }: ClientFeedbackModalProps) {
  const [type, setType]         = useState<FeedbackType>('general')
  const [message, setMessage]   = useState('')
  const [status, setStatus]     = useState<'idle' | 'submitting' | 'done' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (open) {
      setType('general')
      setMessage('')
      setStatus('idle')
      setErrorMsg('')
      setTimeout(() => textareaRef.current?.focus(), 50)
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (status === 'submitting') return
    setStatus('submitting')
    setErrorMsg('')

    try {
      const res = await fetch('/api/portal/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          message: message.trim(),
          pageUrl: typeof window !== 'undefined' ? window.location.href : '',
        }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error((data as { error?: string }).error ?? 'Submission failed')
      }

      setStatus('done')
    } catch (err) {
      setStatus('error')
      setErrorMsg(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    }
  }

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center p-4"
      style={{ background: 'rgba(0,0,0,0.45)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        className="w-full max-w-md bg-[var(--surface)] border border-[var(--hairline)] rounded-lg flex flex-col"
        style={{ boxShadow: '0 16px 48px rgba(0,0,0,0.35)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--hairline)]">
          <div className="flex items-center gap-2">
            <MessageSquarePlus className="h-4 w-4 text-[var(--of-primary)]" />
            <span className="text-sm font-semibold text-[var(--ink)]">Send feedback</span>
          </div>
          <button
            onClick={onClose}
            className="text-[var(--ink-subtle)] hover:text-[var(--ink)] transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {status === 'done' ? (
          <div className="px-5 py-10 flex flex-col items-center gap-3 text-center">
            <CheckCircle className="h-10 w-10 text-[var(--of-primary)]" />
            <p className="text-sm font-medium text-[var(--ink)]">Thanks for the feedback!</p>
            <p className="text-xs text-[var(--ink-muted)]">We use every message to make things better.</p>
            <Button variant="secondary" size="sm" onClick={onClose} className="mt-2">
              Close
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-5">
            {/* Type selector */}
            <div className="flex gap-2">
              {TYPES.map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setType(value)}
                  className={[
                    'flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm border rounded-md transition-colors cursor-pointer',
                    type === value
                      ? 'border-[var(--of-primary)] bg-[var(--of-primary)]/10 text-[var(--of-primary)] font-medium'
                      : 'border-[var(--hairline)] text-[var(--ink-muted)] hover:border-[var(--ink-subtle)] hover:text-[var(--ink)]',
                  ].join(' ')}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span>{label}</span>
                </button>
              ))}
            </div>

            {/* Message */}
            <div className="space-y-1.5">
              <label className="text-xs text-[var(--ink-muted)]" htmlFor="client-feedback-msg">
                {type === 'bug'
                  ? 'Describe what happened and how to reproduce it.'
                  : 'What\'s on your mind?'}
              </label>
              <Textarea
                id="client-feedback-msg"
                ref={textareaRef}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Write here…"
                rows={5}
                maxLength={2000}
                required
                minLength={10}
                className="resize-none text-sm"
              />
              <p className="text-[11px] text-[var(--ink-subtle)] text-right">{message.length}/2000</p>
            </div>

            {errorMsg && (
              <p className="text-xs text-[var(--error-text)]">{errorMsg}</p>
            )}

            <div className="flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={onClose}
                className="text-xs text-[var(--ink-muted)] hover:text-[var(--ink)] transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <Button
                type="submit"
                size="sm"
                disabled={status === 'submitting' || message.trim().length < 10}
              >
                {status === 'submitting' ? 'Sending…' : 'Send feedback'}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
