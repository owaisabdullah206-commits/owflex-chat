'use client'

import { useState } from 'react'
import { Check, Copy } from 'lucide-react'
import { toast } from 'sonner'

interface EmbedCodeBlockProps {
  embedKey: string
}

export function EmbedCodeBlock({ embedKey }: EmbedCodeBlockProps) {
  const [copied, setCopied] = useState(false)

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://admin.owflex.com'
  const snippet = `<script src="${appUrl}/embed.js" data-key="${embedKey}"></script>`

  async function handleCopy() {
    await navigator.clipboard.writeText(snippet)
    setCopied(true)
    toast.success('Copied to clipboard!')
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="rounded-lg border border-[var(--hairline)] overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2.5 bg-[var(--surface-2)] border-b border-[var(--hairline)]">
        <span className="text-xs text-[var(--ink-muted)] font-medium">Embed Script</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-md transition-colors
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
