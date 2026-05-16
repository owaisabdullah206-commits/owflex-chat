'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { UserPlus } from 'lucide-react'

interface InviteClientDialogProps {
  botId: string
}

export function InviteClientDialog({ botId }: InviteClientDialogProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setPending(true)

    try {
      const res = await fetch('/api/invite/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ botId, clientEmail: email }),
      })

      const data = await res.json()

      if (res.status === 409) {
        setError('An active invitation has already been sent to this email.')
        return
      }

      if (res.status === 403) {
        setError('Access denied.')
        return
      }

      if (!res.ok) {
        setError(data.error ?? 'Something went wrong. Please try again.')
        return
      }

      toast.success('Invitation sent!')
      setEmail('')
      setOpen(false)
      router.refresh()
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setPending(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="secondary" size="sm" className="gap-2">
          <UserPlus className="h-4 w-4" />
          Invite client
        </Button>
      </DialogTrigger>

      <DialogContent className="bg-[var(--surface)] border-[var(--hairline)] text-[var(--ink)]">
        <DialogHeader>
          <DialogTitle className="text-[var(--ink)]">Invite a client</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label htmlFor="clientEmail" className="text-sm font-medium text-[var(--ink)]">
              Client email
            </Label>
            <p className="text-xs text-[var(--ink-muted)]">
              They&apos;ll receive an email with a link to set up their account and view this bot&apos;s dashboard.
            </p>
            <Input
              id="clientEmail"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="client@example.com"
              required
              className="bg-[var(--surface-2)] border-[var(--hairline-md)] text-[var(--ink)]
                placeholder:text-[var(--ink-subtle)] focus-visible:ring-[var(--of-primary)]"
            />
          </div>

          {error && (
            <p className="text-sm text-[var(--of-error-dark)] bg-[var(--of-error-soft)] px-3 py-2 rounded-lg">
              {error}
            </p>
          )}

          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="ghost"
              onClick={() => { setOpen(false); setError(''); setEmail('') }}
              disabled={pending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={pending || !email}>
              {pending ? 'Sending…' : 'Send Invitation'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
