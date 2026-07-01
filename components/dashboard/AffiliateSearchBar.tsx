'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Plus, X } from 'lucide-react'

export default function AffiliateSearchBar({ total }: { total: number }) {
  const router = useRouter()
  const [query, setQuery] = useState('')

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    const params = new URLSearchParams(window.location.search)
    if (query.trim()) {
      params.set('q', query.trim())
    } else {
      params.delete('q')
    }
    router.push(`?${params.toString()}`)
  }

  return (
    <form onSubmit={handleSearch} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{ position: 'relative', flex: 1, maxWidth: 320 }}>
        <Search
          size={14}
          style={{
            position: 'absolute',
            left: 10,
            top: '50%',
            transform: 'translateY(-50%)',
            color: 'var(--ink-subtle)',
          }}
        />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={`Search ${total} affiliates...`}
          style={{
            width: '100%',
            padding: '7px 10px 7px 30px',
            border: '1px solid var(--hairline)',
            borderRadius: 'var(--r-md)',
            background: 'var(--bg)',
            color: 'var(--ink)',
            fontSize: 13,
            outline: 'none',
            boxSizing: 'border-box',
          }}
        />
        {query && (
          <button
            type="button"
            onClick={() => { setQuery(''); router.push(window.location.pathname) }}
            style={{
              position: 'absolute',
              right: 8,
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--ink-subtle)',
              padding: 2,
            }}
          >
            <X size={12} />
          </button>
        )}
      </div>
      <button
        type="submit"
        style={{
          padding: '7px 12px',
          border: '1px solid var(--hairline)',
          borderRadius: 'var(--r-md)',
          background: 'var(--surface)',
          color: 'var(--ink)',
          fontSize: 13,
          fontWeight: 500,
          cursor: 'pointer',
        }}
      >
        Search
      </button>
    </form>
  )
}
