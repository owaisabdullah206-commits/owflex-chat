'use client'

import { useState, useRef, useTransition } from 'react'
import { Upload, Link2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

const ACCEPTED = '.pdf,.docx,.txt,.md'
const MAX_MB = 10

interface Props {
  botId: string
  quotaUsed: number
  quotaMax: number
  crawlUsed: number
  crawlMax: number
  plan: string
}

type Tab = 'file' | 'url'

export function DocumentUploader({
  botId,
  quotaUsed,
  quotaMax,
  crawlUsed,
  crawlMax,
  plan,
}: Props) {
  const [tab, setTab] = useState<Tab>('file')
  const [urlValue, setUrlValue] = useState('')
  const [maxPages, setMaxPages] = useState(1)
  const [isPending, startTransition] = useTransition()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  const atDocLimit = quotaMax !== Infinity && quotaUsed >= quotaMax
  const atCrawlLimit = crawlMax !== Infinity && crawlUsed >= crawlMax

  function handleFileDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) uploadFile(file)
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) uploadFile(file)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  function uploadFile(file: File) {
    if (file.size > MAX_MB * 1_048_576) {
      toast.error(`File too large. Maximum size is ${MAX_MB} MB.`)
      return
    }
    startTransition(async () => {
      try {
        const formData = new FormData()
        formData.append('file', file)
        const res = await fetch(`/api/v1/documents/upload?botId=${botId}`, {
          method: 'POST',
          body: formData,
        })
        const data = await res.json().catch(() => ({}))
        if (res.ok || res.status === 202) {
          toast.success(`"${file.name}" queued for processing`)
          router.refresh()
        } else {
          toast.error(data.error ?? 'Upload failed')
        }
      } catch {
        toast.error('Upload failed — check your connection and try again.')
      }
    })
  }

  function handleUrlSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!urlValue.trim()) return
    startTransition(async () => {
      try {
        const res = await fetch('/api/v1/documents/url', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ botId, url: urlValue.trim(), maxPages }),
        })
        const data = await res.json().catch(() => ({}))
        if (res.ok || res.status === 202) {
          toast.success('URL queued for processing')
          setUrlValue('')
          router.refresh()
        } else {
          toast.error(data.error ?? 'Failed to add URL')
        }
      } catch {
        toast.error('Failed to add URL — check your connection and try again.')
      }
    })
  }

  return (
    <div className="border border-[var(--hairline)] bg-[var(--surface)] overflow-hidden">
      {/* Tab bar */}
      <div className="flex border-b border-[var(--hairline)]">
        <button
          onClick={() => setTab('file')}
          className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium transition-colors ${
            tab === 'file'
              ? 'text-[var(--of-primary)] border-b-2 border-[var(--of-primary)] -mb-px'
              : 'text-[var(--ink-muted)] hover:text-[var(--ink)]'
          }`}
        >
          <Upload className="h-3.5 w-3.5" />
          Upload file
        </button>
        <button
          onClick={() => setTab('url')}
          className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium transition-colors ${
            tab === 'url'
              ? 'text-[var(--of-primary)] border-b-2 border-[var(--of-primary)] -mb-px'
              : 'text-[var(--ink-muted)] hover:text-[var(--ink)]'
          }`}
        >
          <Link2 className="h-3.5 w-3.5" />
          Paste URL
        </button>
      </div>

      <div className="p-4">
        {tab === 'file' ? (
          atDocLimit ? (
            <p className="text-sm text-[var(--ink-muted)] text-center py-2">
              Document limit reached ({quotaUsed}/{quotaMax}). Upgrade your plan to add more.
            </p>
          ) : (
            <div
              onDrop={handleFileDrop}
              onDragOver={(e) => e.preventDefault()}
              onClick={() => fileInputRef.current?.click()}
              className="flex flex-col items-center gap-2 rounded-lg border-2 border-dashed border-[var(--hairline)] p-6 cursor-pointer hover:border-[var(--of-primary)]/50 hover:bg-[var(--of-primary)]/5 transition-colors"
            >
              <Upload className="h-8 w-8 text-[var(--ink-muted)]" />
              <p className="text-sm text-[var(--ink-muted)] text-center">
                {isPending ? 'Uploading…' : (
                  <>
                    Drag & drop or <span className="text-[var(--of-primary)]">browse</span>
                    <br />
                    <span className="text-xs">PDF, DOCX, TXT, Markdown · Max {MAX_MB} MB</span>
                  </>
                )}
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept={ACCEPTED}
                className="hidden"
                onChange={handleFileChange}
                disabled={isPending}
              />
            </div>
          )
        ) : (
          atCrawlLimit ? (
            <p className="text-sm text-[var(--ink-muted)] text-center py-2">
              Crawl page limit reached ({crawlUsed}/{crawlMax}). Upgrade your plan to crawl more.
            </p>
          ) : (
            <form onSubmit={handleUrlSubmit} className="flex flex-col gap-3">
              <Input
                type="url"
                placeholder="https://yoursite.com"
                value={urlValue}
                onChange={(e) => setUrlValue(e.target.value)}
                disabled={isPending}
                required
              />
              <div className="flex items-center gap-2">
                <label className="text-xs text-[var(--ink-muted)] whitespace-nowrap">Crawl up to</label>
                <Input
                  type="number"
                  min={1}
                  max={Math.min(50, crawlMax === Infinity ? 50 : crawlMax - crawlUsed)}
                  value={maxPages}
                  onChange={(e) => setMaxPages(Number(e.target.value))}
                  disabled={isPending}
                  className="w-20"
                />
                <span className="text-xs text-[var(--ink-muted)]">pages</span>
                <Button type="submit" size="sm" disabled={isPending || !urlValue.trim()} className="ml-auto">
                  {isPending ? 'Adding…' : 'Add'}
                </Button>
              </div>
              <p className="text-xs text-[var(--ink-muted)]">
                {crawlMax === Infinity
                  ? 'Unlimited crawl pages'
                  : `${crawlUsed} / ${crawlMax} pages used`}
              </p>
            </form>
          )
        )}

        {tab === 'file' && !atDocLimit && (
          <p className="text-xs text-[var(--ink-muted)] mt-2 text-center">
            {quotaMax === Infinity ? 'Unlimited documents' : `${quotaUsed} / ${quotaMax} documents used`}
          </p>
        )}
      </div>
    </div>
  )
}
