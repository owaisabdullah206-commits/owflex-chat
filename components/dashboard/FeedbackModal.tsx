'use client'
import { useEffect, useRef, useState } from 'react'
import { X, MessageSquarePlus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'

type FeedbackType = 'feature' | 'suggestion' | 'bug' | 'general'

const TYPES: { value: FeedbackType; label: string; emoji: string }[] = [
  { value: 'feature',    label: 'Feature',    emoji: '🚀' },
  { value: 'suggestion', label: 'Suggestion', emoji: '💡' },
  { value: 'bug',        label: 'Bug report', emoji: '🐛' },
  { value: 'general',   label: 'General',    emoji: '💬' },
]

interface FeedbackModalProps {
  open: boolean
  onClose: () => void
  initialType?: FeedbackType
}

export function FeedbackModal({ open, onClose, initialType = 'general' }: FeedbackModalProps) {
  const [type, setType]       = useState<FeedbackType>(initialType)
  const [message, setMessage] = useState('')
  const [status, setStatus]   = useState<'idle' | 'submitting' | 'done' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Reset state whenever the modal opens
  useEffect(() => {
    if (open) {
      setType(initialType)
      setMessage('')
      setStatus('idle')
      setErrorMsg('')
      // Focus textarea after paint
      setTimeout(() => textareaRef.current?.focus(), 50)
    }
  }, [open])

  // Close on Escape
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
      const res = await fetch('/api/v1/feedback', {
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
    // Backdrop
    <div
      className="fixed inset-0 z-50 flex items-end justify-start sm:items-center sm:justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.55)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      {/* Modal card */}
      <div
        className="w-full max-w-md bg-[var(--surface)] border border-[var(--hairline)] flex flex-col"
        style={{ boxShadow: '0 16px 48px rgba(0,0,0,0.5)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--hairline)]">
          <div className="flex items-center gap-2">
            <MessageSquarePlus className="h-4 w-4 text-[var(--of-primary)]" />
            <span className="text-[13px] font-semibold text-[var(--ink)]" style={{ fontFamily: 'var(--font-mono)' }}>
              Send feedback
            </span>
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
          // Success state
          <div className="px-5 py-10 flex flex-col items-center gap-3 text-center">
            <span className="text-3xl">🎉</span>
            <p className="text-[13px] font-medium text-[var(--ink)]">Thanks for the feedback!</p>
            <p className="text-[12px] text-[var(--ink-muted)]">We read everything and use it to improve Octively.</p>
            <Button variant="secondary" size="sm" onClick={onClose} className="mt-2">
              Close
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-5">
            {/* Type selector — 2×2 grid to fit 4 types */}
            <div className="grid grid-cols-2 gap-2">
              {TYPES.map(({ value, label, emoji }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setType(value)}
                  className={[
                    'flex items-center gap-1.5 px-3 py-2 text-[12px] border transition-colors cursor-pointer',
                    type === value
                      ? 'border-[var(--of-primary)] bg-[var(--of-primary)]/10 text-[var(--of-primary)] font-medium'
                      : 'border-[var(--hairline)] text-[var(--ink-muted)] hover:border-[var(--ink-subtle)] hover:text-[var(--ink)]',
                  ].join(' ')}
                >
                  <span>{emoji}</span>
                  <span style={{ fontFamily: 'var(--font-mono)' }}>{label}</span>
                </button>
              ))}
            </div>

            {/* Message */}
            <div className="space-y-1.5">
              <label className="text-[12px] text-[var(--ink-muted)]" htmlFor="feedback-msg">
                {type === 'feature'
                  ? 'What feature do you want us to build?'
                  : type === 'suggestion'
                  ? 'What should we improve?'
                  : type === 'bug'
                  ? 'Describe the bug and how to reproduce it.'
                  : 'What\'s on your mind?'}
              </label>
              <Textarea
                id="feedback-msg"
                ref={textareaRef}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Write here…"
                rows={5}
                maxLength={2000}
                required
                minLength={10}
                className="resize-none text-[13px]"
              />
              <p className="text-[11px] text-[var(--ink-subtle)] text-right">{message.length}/2000</p>
            </div>

            {errorMsg && (
              <p className="text-[12px] text-[var(--of-error)]">{errorMsg}</p>
            )}

            <div className="flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={onClose}
                className="text-[12px] text-[var(--ink-muted)] hover:text-[var(--ink)] transition-colors cursor-pointer"
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
