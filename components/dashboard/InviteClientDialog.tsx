'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Copy, Check, UserPlus } from 'lucide-react'
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

interface InviteClientDialogProps {
  botId: string
}

export function InviteClientDialog({ botId }: InviteClientDialogProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)
  const [inviteUrl, setInviteUrl] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  function handleCopy() {
    if (!inviteUrl) return
    navigator.clipboard.writeText(inviteUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function handleClose(next: boolean) {
    setOpen(next)
    if (!next) {
      setEmail('')
      setError('')
      setInviteUrl(null)
      setCopied(false)
    }
  }

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

      if (data.emailSent) {
        toast.success('Invitation sent!')
        setEmail('')
        setOpen(false)
        router.refresh()
      } else {
        // Email delivery failed (Resend sandbox limitation — only delivers to account owner).
        // Show the invite link so the developer can share it manually.
        setInviteUrl(data.inviteUrl ?? null)
        router.refresh()
      }
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setPending(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
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

        {inviteUrl ? (
          <div className="space-y-4 pt-2">
            <div className="bg-[var(--of-warning)]/10 border border-[var(--of-warning)]/20 px-4 py-3">
              <p className="text-sm font-medium text-[var(--warning-text)] mb-1">Email delivery failed</p>
              <p className="text-xs text-[var(--ink-muted)]">
                Your Resend account is in sandbox mode and can only deliver to your own email.
                Share this invite link directly with the client:
              </p>
            </div>
            <div className="flex gap-2">
              <input
                readOnly
                value={inviteUrl}
                className="flex-1 text-xs bg-[var(--surface-2)] border border-[var(--hairline)] px-3 py-2 text-[var(--ink-muted)] truncate"
              />
              <button
                onClick={handleCopy}
                className="shrink-0 flex items-center gap-1.5 px-3 py-2 text-xs font-medium bg-[var(--surface-2)] border border-[var(--hairline)] text-[var(--ink-muted)] hover:text-[var(--ink)] transition-colors cursor-pointer"
              >
                {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <p className="text-xs text-[var(--ink-muted)]">
              To send real emails, verify your domain in the{' '}
              <span className="text-[var(--ink)]">Resend dashboard</span> and update{' '}
              <code className="text-xs bg-[var(--surface-2)] px-1">RESEND_FROM_EMAIL</code>.
            </p>
            <div className="flex justify-end">
              <Button variant="ghost" onClick={() => handleClose(false)}>
                Done
              </Button>
            </div>
          </div>
        ) : (
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
              <p className="text-sm text-[var(--error-text)] bg-[var(--of-error)]/10 px-3 py-2">
                {error}
              </p>
            )}

            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="ghost"
                onClick={() => handleClose(false)}
                disabled={pending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={pending || !email}>
                {pending ? 'Sending…' : 'Send Invitation'}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
