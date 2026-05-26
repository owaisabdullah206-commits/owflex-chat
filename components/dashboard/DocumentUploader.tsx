'use client'

import { useState, useRef, useTransition, useEffect } from 'react'
import { Upload, Link2, ChevronDown, ChevronUp, X, RefreshCw } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { CsvFormat } from '@/lib/knowledge/csv-cleaner'

const ACCEPTED_STANDARD = '.pdf,.docx,.txt,.md'
const ACCEPTED_CATALOG  = '.csv,.xlsx,.xls'
const ACCEPTED_ALL      = `${ACCEPTED_STANDARD},${ACCEPTED_CATALOG}`
const MAX_MB       = 10
const MAX_CATALOG_MB = 25

const CATALOG_EXTS = new Set(['.csv', '.xlsx', '.xls'])

const UNIQUE_ID_COLS: Record<CsvFormat, string[]> = {
  shopify:     ['Handle', 'ID', 'Variant SKU'],
  woocommerce: ['ID', 'SKU'],
  generic:     ['id', 'handle', 'sku', 'slug', 'permalink'],
}

const FORMAT_LABELS: Record<CsvFormat, string> = {
  shopify:     'Shopify Product Catalog',
  woocommerce: 'WooCommerce Product Catalog',
  generic:     'Generic CSV / Excel',
}

interface ExistingCatalog {
  docId: string
  displayName: string
  status: string
}

interface Props {
  botId: string
  quotaUsed: number
  quotaMax: number
  crawlUsed: number
  crawlMax: number
  plan: string
  storeUrl?: string
}

type Tab = 'file' | 'url'

function detectFormatFromHeaders(headers: string[]): CsvFormat {
  const set = new Set(headers)
  if (set.has('Body (HTML)') && set.has('Variant Price')) return 'shopify'
  if (set.has('post_content')) return 'woocommerce'
  if (set.has('Description') && set.has('Regular price')) return 'woocommerce'
  return 'generic'
}

async function sniffCsvFormat(file: File): Promise<CsvFormat> {
  if (!file.name.endsWith('.csv')) return 'generic'
  try {
    const text = await file.slice(0, 2048).text()
    const firstLine = text.split('\n')[0] ?? ''
    const headers = firstLine.split(',').map(h => h.trim().replace(/^"|"$/g, ''))
    return detectFormatFromHeaders(headers)
  } catch {
    return 'generic'
  }
}

export function DocumentUploader({
  botId,
  quotaUsed,
  quotaMax,
  crawlUsed,
  crawlMax,
  plan,
  storeUrl,
}: Props) {
  const [tab, setTab] = useState<Tab>('file')

  // URL tab state
  const [urlValue, setUrlValue] = useState('')
  const [maxPages, setMaxPages] = useState(1)
  const [showPathFilters, setShowPathFilters] = useState(false)
  const [includePathsInput, setIncludePathsInput] = useState('')
  const [excludePathsInput, setExcludePathsInput] = useState('')

  // CSV / catalog state
  const [csvFile, setCsvFile] = useState<File | null>(null)
  const [csvFormat, setCsvFormat] = useState<CsvFormat>('generic')
  const [csvUniqueCol, setCsvUniqueCol] = useState('')
  const [existingCatalog, setExistingCatalog] = useState<ExistingCatalog | null>(null)
  const [catalogChecking, setCatalogChecking] = useState(false)
  const [overwrite, setOverwrite] = useState(true)

  const [isPending, startTransition] = useTransition()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  const atDocLimit  = quotaMax !== Infinity && quotaUsed >= quotaMax
  const atCrawlLimit = crawlMax !== Infinity && crawlUsed >= crawlMax

  // When a CSV/Excel is selected, detect format + check for existing catalog
  useEffect(() => {
    if (!csvFile) return

    sniffCsvFormat(csvFile).then(format => {
      setCsvFormat(format)
      const cols = UNIQUE_ID_COLS[format]
      setCsvUniqueCol(cols[0] ?? '')
    })

    setCatalogChecking(true)
    fetch(`/api/v1/documents/catalog-check?botId=${botId}`)
      .then(r => r.json())
      .then(data => {
        setExistingCatalog(data.catalog ?? null)
        setOverwrite(!!data.catalog)
      })
      .catch(() => setExistingCatalog(null))
      .finally(() => setCatalogChecking(false))
  }, [csvFile, botId])

  function isCatalogFile(file: File): boolean {
    const ext = '.' + (file.name.split('.').pop() ?? '').toLowerCase()
    return CATALOG_EXTS.has(ext)
  }

  function handleFileDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) processFileSelection(file)
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) processFileSelection(file)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  function processFileSelection(file: File) {
    if (isCatalogFile(file)) {
      if (file.size > MAX_CATALOG_MB * 1_048_576) {
        toast.error(`File too large. Maximum size for CSV / Excel is ${MAX_CATALOG_MB} MB.`)
        return
      }
      setCsvFile(file)
    } else {
      if (file.size > MAX_MB * 1_048_576) {
        toast.error(`File too large. Maximum size is ${MAX_MB} MB.`)
        return
      }
      uploadFile(file)
    }
  }

  function cancelCsvSelection() {
    setCsvFile(null)
    setExistingCatalog(null)
    setCsvUniqueCol('')
    setOverwrite(true)
  }

  function uploadFile(file: File, opts?: { replaceDocId?: string }) {
    startTransition(async () => {
      try {
        const formData = new FormData()
        formData.append('file', file)
        let endpoint = `/api/v1/documents/upload?botId=${botId}`
        if (opts?.replaceDocId) endpoint += `&replaceDocId=${opts.replaceDocId}`

        const res = await fetch(endpoint, { method: 'POST', body: formData })
        const data = await res.json().catch(() => ({}))
        if (res.ok || res.status === 202) {
          toast.success(`"${file.name}" queued for processing`)
          cancelCsvSelection()
          router.refresh()
        } else {
          toast.error(data.error ?? 'Upload failed')
        }
      } catch {
        toast.error('Upload failed — check your connection and try again.')
      }
    })
  }

  function handleCatalogUpload() {
    if (!csvFile) return
    const replaceDocId = overwrite && existingCatalog ? existingCatalog.docId : undefined
    uploadFile(csvFile, { replaceDocId })
  }

  function handleUrlSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!urlValue.trim()) return
    const includePaths = includePathsInput.split(',').map(s => s.trim()).filter(Boolean)
    const excludePaths = excludePathsInput.split(',').map(s => s.trim()).filter(Boolean)
    startTransition(async () => {
      try {
        const res = await fetch('/api/v1/documents/url', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            botId,
            url: urlValue.trim(),
            maxPages,
            ...(includePaths.length ? { includePaths } : {}),
            ...(excludePaths.length ? { excludePaths } : {}),
          }),
        })
        const data = await res.json().catch(() => ({}))
        if (res.ok || res.status === 202) {
          toast.success('URL queued for processing')
          setUrlValue('')
          setIncludePathsInput('')
          setExcludePathsInput('')
          setShowPathFilters(false)
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
        {!storeUrl ? (
          <div className="py-6 text-center space-y-2">
            <p className="text-sm text-amber-400 font-medium">Store URL required</p>
            <p className="text-xs text-[var(--ink-muted)]">
              Set your store URL in{' '}
              <a href="?tab=settings" className="underline text-[var(--of-primary)]">Settings → Catalog / Store</a>{' '}
              before uploading documents.
            </p>
          </div>
        ) : tab === 'file' ? (
          atDocLimit && !csvFile ? (
            <p className="text-sm text-[var(--ink-muted)] text-center py-2">
              Document limit reached ({quotaUsed}/{quotaMax}). Upgrade your plan to add more.
            </p>
          ) : csvFile ? (
            // ── Catalog setup card ──────────────────────────────────────────
            <div className="flex flex-col gap-3 rounded-lg border border-[var(--hairline)] bg-[var(--surface-2)] p-4">
              {/* Header */}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold text-[var(--ink)]">
                    {catalogChecking ? 'Detecting format…' : FORMAT_LABELS[csvFormat]}
                  </p>
                  <p className="text-xs text-[var(--ink-muted)] mt-0.5 truncate max-w-[240px]">
                    {csvFile.name}
                  </p>
                </div>
                <button
                  onClick={cancelCsvSelection}
                  disabled={isPending}
                  className="text-[var(--ink-subtle)] hover:text-[var(--ink)] transition-colors mt-0.5"
                  aria-label="Cancel"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Free-plan catalog limit notice */}
              {plan === 'free' && !catalogChecking && (
                <div className="flex items-start gap-2 rounded-md bg-amber-500/10 border border-amber-500/20 px-3 py-2">
                  <span className="text-[11px] leading-relaxed text-amber-400">
                    <strong className="font-semibold">Free plan:</strong> Only the first{' '}
                    <strong className="font-semibold">10 products</strong> will be indexed from this
                    file.{' '}
                    <a
                      href="/dashboard/billing"
                      className="underline underline-offset-2 hover:text-amber-300 transition-colors"
                    >
                      Upgrade
                    </a>{' '}
                    to index your full catalog.
                  </span>
                </div>
              )}

              {/* Unique identifier column */}
              {!catalogChecking && (
                <div className="flex flex-col gap-1.5">
                  <p className="text-xs font-medium text-[var(--ink-muted)]">
                    Unique identifier column
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {UNIQUE_ID_COLS[csvFormat].map((col, i) => (
                      <label
                        key={col}
                        className="flex items-center gap-1.5 cursor-pointer text-xs"
                      >
                        <input
                          type="radio"
                          name="uniqueCol"
                          value={col}
                          checked={csvUniqueCol === col}
                          onChange={() => setCsvUniqueCol(col)}
                          className="accent-[var(--of-primary)]"
                        />
                        <span className="text-[var(--ink)]">
                          {col}
                          {i === 0 && (
                            <span className="ml-1 text-[10px] text-[var(--ink-muted)]">(recommended)</span>
                          )}
                        </span>
                      </label>
                    ))}
                    {UNIQUE_ID_COLS[csvFormat].length === 0 && (
                      <Input
                        type="text"
                        placeholder="Column name e.g. id"
                        value={csvUniqueCol}
                        onChange={e => setCsvUniqueCol(e.target.value)}
                        className="text-xs h-7 w-40"
                      />
                    )}
                  </div>
                  <p className="text-[11px] text-[var(--ink-subtle)]">
                    This column must be unique per product. Used to match products on re-upload.
                  </p>
                </div>
              )}

              {/* Overwrite toggle */}
              {!catalogChecking && (
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={overwrite}
                    onChange={e => setOverwrite(e.target.checked)}
                    className="mt-0.5 accent-[var(--of-primary)]"
                  />
                  <span className="flex flex-col gap-0.5">
                    <span className="text-xs font-medium text-[var(--ink)]">
                      Replace existing product catalog
                    </span>
                    {existingCatalog ? (
                      <span className="text-[11px] text-[var(--ink-muted)]">
                        Will overwrite &ldquo;{existingCatalog.displayName}&rdquo; and its embeddings.
                      </span>
                    ) : (
                      <span className="text-[11px] text-[var(--ink-muted)]">
                        No existing product catalog found — a new document will be created.
                      </span>
                    )}
                  </span>
                </label>
              )}

              {/* Action buttons */}
              <div className="flex gap-2 pt-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={cancelCsvSelection}
                  disabled={isPending}
                  className="text-[var(--ink-muted)]"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  size="sm"
                  onClick={handleCatalogUpload}
                  disabled={isPending || catalogChecking || (!csvUniqueCol && UNIQUE_ID_COLS[csvFormat].length > 0)}
                  className="ml-auto"
                >
                  {isPending ? (
                    <span className="flex items-center gap-1.5">
                      <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                      Uploading…
                    </span>
                  ) : overwrite && existingCatalog ? (
                    'Replace catalog'
                  ) : (
                    'Upload catalog'
                  )}
                </Button>
              </div>
            </div>
          ) : (
            // ── Standard dropzone ───────────────────────────────────────────
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
                    <span className="text-xs">
                      PDF, DOCX, TXT, Markdown · Max {MAX_MB} MB
                      <br />
                      CSV, Excel (Shopify / WooCommerce) · Max {MAX_CATALOG_MB} MB
                      {plan === 'free' && (
                        <>
                          <br />
                          <span className="text-amber-400/80">Free plan: CSV/Excel limited to 10 products</span>
                        </>
                      )}
                    </span>
                  </>
                )}
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept={ACCEPTED_ALL}
                className="hidden"
                onChange={handleFileChange}
                disabled={isPending}
              />
            </div>
          )
        ) : (
          crawlMax === 0 ? (
            <p className="text-sm text-[var(--ink-muted)] text-center py-2">
              Website crawling is not available on the Free plan.{' '}
              <a href="/dashboard/billing" className="underline text-[var(--of-primary)]">Upgrade to Starter or above.</a>
            </p>
          ) : atCrawlLimit ? (
            <p className="text-sm text-[var(--ink-muted)] text-center py-2">
              Crawl page limit reached ({crawlUsed}/{crawlMax} pages used).{' '}
              <a href="/dashboard/billing" className="underline text-[var(--of-primary)]">Upgrade your plan for more.</a>
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

              {/* Advanced path filters */}
              <button
                type="button"
                onClick={() => setShowPathFilters(v => !v)}
                className="flex items-center gap-1 text-xs text-[var(--ink-muted)] hover:text-[var(--ink)] transition-colors"
              >
                {showPathFilters ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                Advanced path filters
              </button>

              {showPathFilters && (
                <div className="flex flex-col gap-2 p-3 rounded-lg bg-[var(--surface-2)] border border-[var(--hairline)]">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-medium text-[var(--ink-muted)]">Include paths</label>
                    <Input
                      type="text"
                      placeholder="/docs, /pricing"
                      value={includePathsInput}
                      onChange={e => setIncludePathsInput(e.target.value)}
                      disabled={isPending}
                      className="text-xs h-8"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-medium text-[var(--ink-muted)]">Exclude paths</label>
                    <Input
                      type="text"
                      placeholder="/blog, /admin, /login"
                      value={excludePathsInput}
                      onChange={e => setExcludePathsInput(e.target.value)}
                      disabled={isPending}
                      className="text-xs h-8"
                    />
                  </div>
                  <p className="text-[11px] text-[var(--ink-subtle)]">
                    Glob patterns, comma-separated. e.g. <code className="font-mono">/docs/**</code> includes all pages under /docs. Leave blank to crawl all discovered pages.
                  </p>
                </div>
              )}
            </form>
          )
        )}

        {storeUrl && tab === 'file' && !atDocLimit && !csvFile && (
          <p className="text-xs text-[var(--ink-muted)] mt-2 text-center">
            {quotaMax === Infinity ? 'Unlimited documents' : `${quotaUsed} / ${quotaMax} documents used`}
          </p>
        )}
      </div>
    </div>
  )
}
