'use client'

import { FileText, Globe, Clock, CheckCircle2, XCircle, Loader2 } from 'lucide-react'
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

function StatusPill({ status }: { status: string }) {
  const map: Record<string, { label: string; className: string; icon: React.ReactNode }> = {
    queued:     { label: 'Queued',     className: 'bg-[var(--of-warning)]/10 text-[var(--warning-text)]', icon: <Clock className="h-3 w-3" /> },
    processing: { label: 'Processing', className: 'bg-[var(--of-primary)]/10 text-[var(--of-primary)]',   icon: <Loader2 className="h-3 w-3 animate-spin" /> },
    ready:      { label: 'Ready',      className: 'bg-[var(--of-success)]/10 text-[var(--success-text)]', icon: <CheckCircle2 className="h-3 w-3" /> },
    failed:     { label: 'Failed',     className: 'bg-[var(--of-error)]/10 text-[var(--error-text)]',     icon: <XCircle className="h-3 w-3" /> },
  }
  const s = map[status] ?? map.queued
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium ${s.className}`}>
      {s.icon}
      {s.label}
    </span>
  )
}

export function DocumentRow({ doc }: { doc: DocRow }) {
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
          <StatusPill status={doc.status} />
        </div>
      </div>

      <div className="flex items-center gap-4 pl-7 text-xs text-[var(--ink-muted)]">
        <span className="font-mono">{formatBytes(doc.byteSize)}</span>
        {doc.status === 'ready' && (
          <span className="font-mono">{doc.chunkCount} chunks</span>
        )}
        {doc.pageCount > 1 && (
          <span>{doc.pageCount} pages</span>
        )}
        <span>{formatDate(doc.createdAt)}</span>

        <div className="ml-auto flex items-center gap-1">
          {doc.sourceType === 'file' && doc.status === 'ready' && (
            <ReindexButton docId={doc.id} />
          )}
          <DocumentDeleteButton docId={doc.id} botId={doc.botId} displayName={doc.displayName} disabled={doc.status === 'processing'} />
        </div>
      </div>

      {doc.status === 'failed' && doc.errorMsg && (
        <p className="pl-7 text-xs text-red-400 mt-0.5">{doc.errorMsg}</p>
      )}
    </div>
  )
}
