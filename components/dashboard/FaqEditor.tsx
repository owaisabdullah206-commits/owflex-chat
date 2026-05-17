'use client'

import { useTransition, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { createFaq, updateFaq, deleteFaq } from '@/lib/db/queries/faqs'

interface Faq {
  id: string
  question: string
  answer: string
  isActive: boolean
  createdAt: Date
}

interface FaqEditorProps {
  botId: string
  initialFaqs: Faq[]
}

export function FaqEditor({ botId, initialFaqs }: FaqEditorProps) {
  const [isPending, startTransition] = useTransition()
  const [faqs, setFaqs] = useState<Faq[]>(initialFaqs)
  const [newQuestion, setNewQuestion] = useState('')
  const [newAnswer, setNewAnswer] = useState('')
  const [addError, setAddError] = useState<string | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)

  function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    setAddError(null)
    startTransition(async () => {
      const result = await createFaq(botId, { question: newQuestion, answer: newAnswer })
      if (result.error) {
        setAddError(result.error)
        return
      }
      setFaqs((prev) => [
        ...prev,
        { id: result.id!, question: newQuestion, answer: newAnswer, isActive: true, createdAt: new Date() },
      ])
      setNewQuestion('')
      setNewAnswer('')
      setShowAddForm(false)
    })
  }

  function handleToggle(faqId: string, isActive: boolean) {
    startTransition(async () => {
      await updateFaq(faqId, { isActive })
      setFaqs((prev) => prev.map((f) => f.id === faqId ? { ...f, isActive } : f))
    })
  }

  function handleDelete(faqId: string) {
    startTransition(async () => {
      await deleteFaq(faqId)
      setFaqs((prev) => prev.filter((f) => f.id !== faqId))
    })
  }

  return (
    <div className="space-y-4">
      {faqs.length === 0 && !showAddForm && (
        <div className="rounded-lg border border-dashed border-[var(--hairline)] bg-[var(--surface)] px-6 py-10 text-center">
          <p className="text-sm text-[var(--ink-muted)] mb-3">No FAQ entries yet.</p>
          <Button
            size="sm"
            onClick={() => setShowAddForm(true)}
            className="bg-[var(--of-primary)] hover:bg-[var(--of-primary-hover)] text-white"
          >
            Add First Entry
          </Button>
        </div>
      )}

      {faqs.length > 0 && (
        <div className="rounded-lg border border-[var(--hairline)] bg-[var(--surface)] divide-y divide-[var(--hairline)]">
          {faqs.map((faq) => (
            <div key={faq.id} className={`px-5 py-4 flex gap-4 items-start ${!faq.isActive ? 'opacity-50' : ''}`}>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[var(--ink)] truncate">{faq.question}</p>
                <p className="text-xs text-[var(--ink-muted)] mt-1 line-clamp-2">{faq.answer}</p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <Switch
                  checked={faq.isActive}
                  onCheckedChange={(v) => handleToggle(faq.id, v)}
                  disabled={isPending}
                />
                <button
                  onClick={() => handleDelete(faq.id)}
                  disabled={isPending}
                  className="text-xs text-red-400 hover:text-red-300 disabled:opacity-40"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showAddForm && (
        <form onSubmit={handleAdd} className="rounded-lg border border-[var(--hairline)] bg-[var(--surface)] p-5 space-y-3">
          <div className="space-y-1.5">
            <Label className="text-xs text-[var(--ink-muted)]">Question</Label>
            <Input
              value={newQuestion}
              onChange={(e) => setNewQuestion(e.target.value)}
              placeholder="e.g. What are your business hours?"
              className="bg-[var(--bg)] border-[var(--hairline)] text-[var(--ink)]"
              disabled={isPending}
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-[var(--ink-muted)]">Answer</Label>
            <Textarea
              value={newAnswer}
              onChange={(e) => setNewAnswer(e.target.value)}
              placeholder="e.g. Monday to Friday, 9am–6pm PKT."
              rows={3}
              className="bg-[var(--bg)] border-[var(--hairline)] text-[var(--ink)] resize-none"
              disabled={isPending}
              required
            />
          </div>
          {addError && <p className="text-xs text-red-400">{addError}</p>}
          <div className="flex gap-2">
            <Button type="submit" size="sm" disabled={isPending}
              className="bg-[var(--of-primary)] hover:bg-[var(--of-primary-hover)] text-white">
              {isPending ? 'Saving…' : 'Add Entry'}
            </Button>
            <Button type="button" size="sm" variant="ghost" onClick={() => setShowAddForm(false)} disabled={isPending}>
              Cancel
            </Button>
          </div>
        </form>
      )}

      {faqs.length > 0 && !showAddForm && (
        <Button
          size="sm"
          variant="outline"
          onClick={() => setShowAddForm(true)}
          className="border-[var(--hairline)] text-[var(--ink-muted)] hover:text-[var(--ink)]"
        >
          + Add Entry
        </Button>
      )}
    </div>
  )
}
