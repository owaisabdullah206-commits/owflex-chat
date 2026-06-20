'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Check, Copy, RotateCw } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog'

interface EmbedCodeBlockProps {
  embedKey: string
  botId?: string
}

export function EmbedCodeBlock({ embedKey, botId }: EmbedCodeBlockProps) {
  const router = useRouter()
  const [copied, setCopied] = useState(false)
  const [rotating, setRotating] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://admin.octively.com'
  const snippet = `<script src="${appUrl}/api/embed" data-key="${embedKey}"></script>`

  async function handleCopy() {
    await navigator.clipboard.writeText(snippet)
    setCopied(true)
    toast.success('Copied to clipboard!')
    setTimeout(() => setCopied(false), 2000)
  }

  async function handleRotate() {
    if (!botId) return
    setRotating(true)
    try {
      const res = await fetch(`/api/v1/bots/${botId}/rotate-embed-key`, { method: 'POST' })
      if (!res.ok) throw new Error(`status ${res.status}`)
      toast.success('Embed key rotated. Old key works for 24h.')
      setConfirmOpen(false)
      router.refresh()
    } catch {
      toast.error('Could not rotate the key. Try again.')
    } finally {
      setRotating(false)
    }
  }

  return (
    <div className="border border-[var(--hairline)] overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2.5 bg-[var(--surface-2)] border-b border-[var(--hairline)]">
        <span className="text-xs text-[var(--ink-muted)] font-medium">Embed Script</span>
        <div className="flex items-center gap-2">
          {botId && (
            <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
              <DialogTrigger asChild>
                <button
                  disabled={rotating}
                  title="Rotate the embed key (old key valid for 24h)"
                  className="flex items-center gap-1.5 text-xs px-2.5 py-1 transition-colors disabled:opacity-60
                    bg-[var(--surface-3)] text-[var(--ink-muted)] hover:text-[var(--ink)] hover:bg-[var(--surface-4)]"
                >
                  <RotateCw className={`h-3 w-3 ${rotating ? 'animate-spin' : ''}`} />
                  <span>{rotating ? 'Rotating…' : 'Rotate key'}</span>
                </button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Rotate this embed key?</DialogTitle>
                  <DialogDescription className="text-[var(--ink-muted)]">
                    A new key is generated immediately. The current key keeps working for{' '}
                    <strong className="text-[var(--ink)]">24 hours</strong>, then stops. Update your
                    site with the new script tag within that window or the widget will go offline.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter className="gap-2">
                  <Button variant="ghost" onClick={() => setConfirmOpen(false)} disabled={rotating}>
                    Cancel
                  </Button>
                  <Button
                    onClick={handleRotate}
                    disabled={rotating}
                    className="bg-[var(--of-primary)] hover:bg-[var(--of-primary-hover)] text-white"
                  >
                    {rotating ? 'Rotating…' : 'Rotate key'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 text-xs px-2.5 py-1 transition-colors
              bg-[var(--surface-3)] text-[var(--ink-muted)] hover:text-[var(--ink)] hover:bg-[var(--surface-4)]"
          >
            {copied ? (
              <>
                <Check className="h-3 w-3 text-[var(--of-success)]" />
                <span className="text-[var(--of-success)]">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="h-3 w-3" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>
      </div>
      <pre className="px-4 py-4 bg-[var(--surface)] overflow-x-auto">
        <code
          className="text-sm text-[var(--ink)] leading-relaxed"
          style={{ fontFamily: 'var(--font-mono)' }}
        >
          {snippet}
        </code>
      </pre>
    </div>
  )
}
