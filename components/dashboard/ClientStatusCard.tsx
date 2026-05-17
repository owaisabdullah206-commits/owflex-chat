'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Copy, Check, UserX } from 'lucide-react'
import { RelativeTime } from '@/components/shared/RelativeTime'
import { InviteClientDialog } from '@/components/dashboard/InviteClientDialog'

interface ClientStatusCardProps {
  botId: string
  client: { email: string; name: string; joinedAt: Date | null } | null
  invite: { email: string; expiresAt: Date; expired: boolean } | null
}

export function ClientStatusCard({ botId, client, invite }: ClientStatusCardProps) {
  const router = useRouter()
  const [copied, setCopied] = useState(false)
  const [removing, setRemoving] = useState(false)
  const [resending, setResending] = useState(false)

  async function handleRemove() {
    setRemoving(true)
    try {
      const res = await fetch(`/api/v1/bots/${botId}/client`, { method: 'DELETE' })
      if (!res.ok) throw new Error()
      toast.success('Client removed')
      router.refresh()
    } catch {
      toast.error('Failed to remove client')
    } finally {
      setRemoving(false)
    }
  }

  async function handleResend(email: string) {
    setResending(true)
    try {
      const res = await fetch(`/api/v1/bots/${botId}/invite/resend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      toast.success(data.message ?? 'Invitation resent')
      router.refresh()
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to resend invitation')
    } finally {
      setResending(false)
    }
  }

  function handleCopyPortalLink() {
    const portalUrl = process.env.NEXT_PUBLIC_PORTAL_URL ?? window.location.origin
    navigator.clipboard.writeText(`${portalUrl}/portal/login`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="border border-[var(--hairline)] bg-[var(--surface)] divide-y divide-[var(--hairline)]">
      <div className="px-5 py-3">
        <p
          className="text-[11px] font-medium tracking-[0.5px] uppercase text-[var(--ink-muted)]"
        >
          Client Access
        </p>
      </div>

      <div className="px-5 py-4 space-y-3">
        {/* State 1: Client assigned */}
        {client ? (
          <>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-medium text-[var(--ink)] truncate">{client.email}</p>
                {client.joinedAt && (
                  <p className="text-xs text-[var(--ink-muted)] mt-0.5">
                    Joined <RelativeTime date={client.joinedAt} />
                  </p>
                )}
              </div>
              <span className="shrink-0 inline-flex items-center px-2 py-0.5 text-[11px] font-medium bg-[var(--of-success)]/10 text-[var(--success-text)] border border-[var(--of-success)]/20">
                Active
              </span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleCopyPortalLink}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-[var(--surface-2)] text-[var(--ink-muted)] hover:text-[var(--ink)] border border-[var(--hairline)] transition-colors cursor-pointer"
              >
                {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                {copied ? 'Copied!' : 'Copy portal link'}
              </button>
              <button
                onClick={handleRemove}
                disabled={removing}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-transparent text-[var(--error-text)] border border-[var(--error-text)] hover:bg-[var(--of-error)]/10 transition-colors disabled:opacity-50 cursor-pointer"
              >
                <UserX className="h-3.5 w-3.5" />
                {removing ? 'Removing…' : 'Remove access'}
              </button>
            </div>
          </>
        ) : invite && !invite.expired ? (
          /* State 2: Invite pending */
          <>
            <div>
              <p className="text-xs text-[var(--ink-muted)] mb-1">Invite pending</p>
              <p className="text-sm font-medium text-[var(--ink)] truncate">{invite.email}</p>
              <p className="text-xs text-[var(--ink-muted)] mt-0.5">
                Expires <RelativeTime date={invite.expiresAt} />
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleResend(invite.email)}
                disabled={resending}
                className="px-3 py-1.5 text-xs font-medium bg-[var(--surface-2)] text-[var(--ink-muted)] hover:text-[var(--ink)] border border-[var(--hairline)] transition-colors disabled:opacity-50 cursor-pointer"
              >
                {resending ? 'Resending…' : 'Resend'}
              </button>
            </div>
          </>
        ) : invite && invite.expired ? (
          /* State 3: Invite expired */
          <>
            <div>
              <p className="text-xs text-[var(--warning-text)] mb-1">Invite expired</p>
              <p className="text-sm font-medium text-[var(--ink)] truncate">{invite.email}</p>
            </div>
            <button
              onClick={() => handleResend(invite.email)}
              disabled={resending}
              className="px-3 py-1.5 text-xs font-medium bg-[var(--of-primary)]/10 text-[var(--of-primary)] border border-[var(--of-primary)]/30 hover:bg-[var(--of-primary)]/20 transition-colors disabled:opacity-50 cursor-pointer"
            >
              {resending ? 'Resending…' : 'Resend invite'}
            </button>
          </>
        ) : (
          /* State 4: No client, no invite */
          <>
            <p className="text-sm text-[var(--ink-muted)]">No client assigned</p>
            <InviteClientDialog botId={botId} />
          </>
        )}
      </div>
    </div>
  )
}
