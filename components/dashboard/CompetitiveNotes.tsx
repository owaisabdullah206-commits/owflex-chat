'use client'

import { useEffect, useState } from 'react'

const KEY = 'oct_competitive_notes'

/**
 * Editable text area for the competitive lens on the admin metrics page.
 * Stored in localStorage — no migration, no API. Founder-only tool.
 */
export function CompetitiveNotes() {
  const [notes, setNotes] = useState('')
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    setNotes(localStorage.getItem(KEY) ?? '')
  }, [])

  function handleChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setNotes(e.target.value)
    setSaved(false)
  }

  function save() {
    localStorage.setItem(KEY, notes)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="bg-[var(--surface)] border border-[var(--hairline)] rounded-xl p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--ink-subtle)]"
            style={{ fontFamily: 'var(--font-mono)' }}>
            competitive notes
          </p>
          <p className="text-[12px] text-[var(--ink-muted)] mt-0.5">
            Competitor pricing changes, new features, positioning shifts. Saved in your browser.
          </p>
        </div>
        <button
          onClick={save}
          className="px-3 py-1.5 text-[12px] font-semibold rounded-md bg-[var(--surface-2)] border border-[var(--hairline-md)] text-[var(--ink-muted)] hover:text-[var(--ink)] transition-colors"
        >
          {saved ? 'Saved' : 'Save'}
        </button>
      </div>
      <textarea
        value={notes}
        onChange={handleChange}
        rows={8}
        placeholder={`Weekly notes — e.g.:\n• Stammer.ai: no pricing changes this week\n• Chatbase: launched a "client sharing" feature (light version of our portal)\n• ConvoCore: new WhatsApp integration announced`}
        className="w-full bg-[var(--bg)] border border-[var(--hairline-md)] rounded-md px-3 py-2.5 text-[13px] text-[var(--ink)] placeholder:text-[var(--ink-subtle)] resize-y focus:outline-none focus:border-[var(--of-primary)]"
        style={{ fontFamily: 'inherit', lineHeight: 1.6 }}
      />
    </div>
  )
}
