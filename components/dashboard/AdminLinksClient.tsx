'use client'

import { useState, useTransition } from 'react'
import { Copy, Check, Trash2, ExternalLink } from 'lucide-react'
import { createShortLink, deleteShortLink } from '@/lib/db/queries/links'
import type { CreateLinkInput } from '@/lib/db/queries/links'

type LinkRow = {
  id: string
  code: string
  label: string | null
  destinationUrl: string
  utmSource: string | null
  utmMedium: string | null
  utmCampaign: string | null
  utmTerm: string | null
  utmContent: string | null
  clickCount: number
  createdAt: Date
}

const inp = 'w-full px-3 py-2 text-[13px] rounded-md bg-[var(--bg)] border border-[var(--hairline-md)] text-[var(--ink)] placeholder:text-[var(--ink-subtle)] focus:outline-none focus:border-[var(--of-primary)]'
const lbl = 'block text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--ink-subtle)] mb-1'

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  function copy() {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }
  return (
    <button onClick={copy} title="Copy" className="p-1.5 rounded hover:bg-[var(--surface-2)] text-[var(--ink-muted)] hover:text-[var(--ink)] transition-colors">
      {copied ? <Check size={14} className="text-[var(--of-success)]" /> : <Copy size={14} />}
    </button>
  )
}

export function AdminLinksClient({ links: initial, site }: { links: LinkRow[]; site: string }) {
  const [links, setLinks] = useState<LinkRow[]>(initial)
  const [form, setForm] = useState<CreateLinkInput>({
    destinationUrl: '', label: '', code: '',
    utmSource: '', utmMedium: '', utmCampaign: '', utmTerm: '', utmContent: '',
  })
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function field(key: keyof CreateLinkInput) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((prev) => ({ ...prev, [key]: e.target.value }))
  }

  function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    startTransition(async () => {
      const res = await createShortLink(form)
      if ('error' in res) { setError(res.error ?? 'Unknown error'); return }
      setLinks((prev) => [res.link as LinkRow, ...prev])
      setForm({ destinationUrl: '', label: '', code: '', utmSource: '', utmMedium: '', utmCampaign: '', utmTerm: '', utmContent: '' })
    })
  }

  function handleDelete(id: string) {
    startTransition(async () => {
      await deleteShortLink(id)
      setLinks((prev) => prev.filter((l) => l.id !== id))
    })
  }

  return (
    <div className="flex flex-col gap-6 max-w-4xl">

      {/* Create form */}
      <form onSubmit={handleCreate} className="bg-[var(--surface)] border border-[var(--hairline)] rounded-xl p-5 flex flex-col gap-4">
        <p className="text-[13px] font-semibold text-[var(--ink)]">Create a new short link</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="sm:col-span-2">
            <label className={lbl}>Destination URL *</label>
            <input required type="url" placeholder="https://octively.com/pricing" className={inp} value={form.destinationUrl} onChange={field('destinationUrl')} />
          </div>
          <div>
            <label className={lbl}>Label (private, for your reference)</label>
            <input type="text" placeholder="Facebook PK freelancers" className={inp} value={form.label ?? ''} onChange={field('label')} />
          </div>
          <div>
            <label className={lbl}>Custom code (optional)</label>
            <input type="text" placeholder="fb-pk-1" className={inp} value={form.code ?? ''} onChange={field('code')} />
            <p className="text-[11px] text-[var(--ink-subtle)] mt-1">Lowercase letters, numbers, hyphens, underscores. Leave blank to auto-generate.</p>
          </div>
        </div>

        <div className="border-t border-[var(--hairline)] pt-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--ink-subtle)] mb-3">UTM parameters</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[
              { key: 'utmSource' as const,   label: 'Source',   placeholder: 'facebook' },
              { key: 'utmMedium' as const,   label: 'Medium',   placeholder: 'community' },
              { key: 'utmCampaign' as const, label: 'Campaign', placeholder: 'pk-freelancers' },
              { key: 'utmTerm' as const,     label: 'Term',     placeholder: 'optional' },
              { key: 'utmContent' as const,  label: 'Content',  placeholder: 'optional' },
            ].map(({ key, label, placeholder }) => (
              <div key={key}>
                <label className={lbl}>{label}</label>
                <input type="text" placeholder={placeholder} className={inp} value={(form[key] as string) ?? ''} onChange={field(key)} />
              </div>
            ))}
          </div>
        </div>

        {error && <p className="text-[13px] text-[var(--of-error)]">{error}</p>}

        <button
          type="submit"
          disabled={isPending}
          className="self-start px-4 py-2 text-[13px] font-semibold rounded-md bg-[var(--of-primary)] text-white disabled:opacity-60"
        >
          {isPending ? 'Creating...' : 'Create link'}
        </button>
      </form>

      {/* Links table */}
      {links.length === 0 ? (
        <p className="text-[13px] text-[var(--ink-muted)]">No short links yet. Create one above.</p>
      ) : (
        <div className="bg-[var(--surface)] border border-[var(--hairline)] rounded-xl overflow-hidden">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-[var(--hairline)]">
                {['Short link', 'Label / destination', 'UTM', 'Clicks', ''].map((h) => (
                  <th key={h} className="px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--ink-subtle)] bg-[var(--surface-3)] whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {links.map((l) => {
                const shortUrl = `${site}/r/${l.code}`
                const utmParts = [l.utmSource, l.utmMedium, l.utmCampaign].filter(Boolean).join(' / ')
                return (
                  <tr key={l.id} className="border-b border-[var(--hairline)] last:border-0 hover:bg-[var(--surface-2)]">
                    <td className="px-4 py-3 align-middle">
                      <div className="flex items-center gap-1">
                        <span style={{ fontFamily: 'var(--font-mono)' }} className="text-[var(--of-primary-text-dark)] text-[12px]">
                          /r/{l.code}
                        </span>
                        <CopyButton text={shortUrl} />
                        <a href={shortUrl} target="_blank" rel="noopener noreferrer" title="Open" className="p-1.5 rounded hover:bg-[var(--surface-3)] text-[var(--ink-muted)]">
                          <ExternalLink size={12} />
                        </a>
                      </div>
                    </td>
                    <td className="px-4 py-3 align-middle max-w-[220px]">
                      {l.label && <p className="font-medium text-[var(--ink)] truncate">{l.label}</p>}
                      <p className="text-[var(--ink-subtle)] truncate text-[12px]">{l.destinationUrl}</p>
                    </td>
                    <td className="px-4 py-3 align-middle text-[var(--ink-muted)]">
                      {utmParts || <span className="opacity-40">none</span>}
                    </td>
                    <td className="px-4 py-3 align-middle" style={{ fontFamily: 'var(--font-mono)' }}>
                      {l.clickCount.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 align-middle">
                      <button
                        onClick={() => handleDelete(l.id)}
                        disabled={isPending}
                        title="Delete"
                        className="p-1.5 rounded hover:bg-[var(--surface-3)] text-[var(--ink-subtle)] hover:text-[var(--of-error-dark)] transition-colors disabled:opacity-40"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
