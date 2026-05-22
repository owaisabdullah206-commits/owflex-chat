'use client'

import { useState, useTransition } from 'react'
import { FileText, Globe, CheckCircle2, XCircle, Loader2, AlertTriangle, RefreshCw } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import type { DocRow } from '@/lib/db/queries/documents'
import { DocumentDeleteButton } from './DocumentDeleteButton'
import { ReindexButton } from './ReindexButton'

function formatBytes(bytes: number): string {
  if (bytes === 0) return '—'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1_048_576) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1_048_576).toFixed(1)} MB`
}

function formatDate(d: Date): string {
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export const NON_TERMINAL = ['queued', 'processing', 'embedding', 'finalizing']

const STEPS: { key: string; label: string }[] = [
  { key: 'queued',     label: 'Queued'     },
  { key: 'processing', label: 'Parsing'    },
  { key: 'embedding',  label: 'Embedding'  },
  { key: 'finalizing', label: 'Finalizing' },
]

function RetryButton({ docId }: { docId: string }) {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  function handleRetry() {
    startTransition(async () => {
      const res = await fetch(`/api/v1/documents/${docId}/reindex`, { method: 'POST' })
      if (res.ok) {
        toast.success('Re-queued for processing')
        router.refresh()
      } else {
        const data = await res.json().catch(() => ({}))
        toast.error(data.error ?? 'Failed to retry')
      }
    })
  }

  return (
    <button
      onClick={handleRetry}
      disabled={isPending}
      className="inline-flex items-center gap-1 text-[10px] font-medium text-amber-600 dark:text-amber-400 hover:underline disabled:opacity-50"
    >
      <RefreshCw className={`h-2.5 w-2.5 ${isPending ? 'animate-spin' : ''}`} />
      Retry ingestion
    </button>
  )
}

function StepProgress({ status, updatedAt, docId }: { status: string; updatedAt: Date; docId: string }) {
  const currentIdx = STEPS.findIndex(s => s.key === status)
  if (currentIdx === -1) return null

  const staleMs = Date.now() - new Date(updatedAt).getTime()
  const isStale = staleMs > 10 * 60 * 1000

  return (
    <div className="flex flex-col gap-1.5 mt-0.5 pl-7">
      <div className="flex items-center gap-0 flex-wrap">
        {STEPS.map((step, i) => {
          const done = i < currentIdx
          const active = i === currentIdx
          return (
            <div key={step.key} className="flex items-center">
              <div
                className={`flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-medium ${
                  done   ? 'text-[var(--success-text)]' :
                  active ? 'text-[var(--of-primary)]' :
                           'text-[var(--ink-subtle)]'
                }`}
                style={{ fontFamily: 'var(--font-mono)' }}
              >
                {done ? (
                  <CheckCircle2 className="h-2.5 w-2.5 shrink-0" />
                ) : active ? (
                  <Loader2 className="h-2.5 w-2.5 shrink-0 animate-spin" />
                ) : (
                  <span className="h-2.5 w-2.5 shrink-0 inline-flex items-center justify-center rounded-full border border-current text-[7px]">
                    {i + 1}
                  </span>
                )}
                {step.label}
              </div>
              {i < STEPS.length - 1 && (
                <span className="text-[var(--ink-subtle)] text-[10px] opacity-40 px-0.5">›</span>
              )}
            </div>
          )
        })}
      </div>

      {isStale && (
        <div className="flex items-center gap-2 text-[10px] text-amber-600 dark:text-amber-400">
          <AlertTriangle className="h-3 w-3 shrink-0" />
          <span>Taking longer than expected.</span>
          <RetryButton docId={docId} />
        </div>
      )}
    </div>
  )
}

function StatusPill({ status }: { status: string }) {
  const map: Record<string, { label: string; className: string; icon: React.ReactNode }> = {
    ready:  { label: 'Ready',  className: 'bg-[var(--of-success)]/10 text-[var(--success-text)]', icon: <CheckCircle2 className="h-3 w-3" /> },
    failed: { label: 'Failed', className: 'bg-[var(--of-error)]/10 text-[var(--error-text)]',     icon: <XCircle className="h-3 w-3" /> },
  }
  const s = map[status]
  if (!s) return null
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium ${s.className}`}>
      {s.icon}
      {s.label}
    </span>
  )
}

export function DocumentRow({ doc }: { doc: DocRow }) {
  const isPending = NON_TERMINAL.includes(doc.status)

  return (
    <div className="flex flex-col gap-1 py-3 px-4 border-b border-[var(--hairline)] last:border-0 hover:bg-[var(--surface-2)]/50 transition-colors">
      <div className="flex items-center gap-3">
        <div className="text-[var(--ink-muted)] shrink-0">
          {doc.sourceType === 'url' ? <Globe className="h-4 w-4" /> : <FileText className="h-4 w-4" />}
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-[var(--ink)] truncate">{doc.displayName}</p>
          {doc.sourceUrl && (
            <p className="text-xs text-[var(--ink-muted)] truncate">{doc.sourceUrl}</p>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {!isPending && <StatusPill status={doc.status} />}
        </div>
      </div>

      {isPending && (
        <StepProgress status={doc.status} updatedAt={doc.updatedAt} docId={doc.id} />
      )}

      <div className="flex items-center gap-4 pl-7 text-xs text-[var(--ink-muted)]">
        <span style={{ fontFamily: 'var(--font-mono)' }}>{formatBytes(doc.byteSize)}</span>
        {doc.status === 'ready' && (
          <span style={{ fontFamily: 'var(--font-mono)' }}>{doc.chunkCount} chunks</span>
        )}
        {doc.pageCount > 1 && (
          <span>{doc.pageCount} pages</span>
        )}
        <span>{formatDate(doc.createdAt)}</span>

        <div className="ml-auto flex items-center gap-1">
          {doc.sourceType === 'file' && doc.status === 'ready' && (
            <ReindexButton docId={doc.id} />
          )}
          <DocumentDeleteButton docId={doc.id} botId={doc.botId} displayName={doc.displayName} disabled={isPending} />
        </div>
      </div>

      {doc.status === 'failed' && doc.errorMsg && (
        <p className="pl-7 text-xs text-[var(--error-text)] mt-0.5">{doc.errorMsg}</p>
      )}
    </div>
  )
}
