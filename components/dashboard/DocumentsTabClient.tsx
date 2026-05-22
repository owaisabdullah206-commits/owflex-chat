'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import type { DocRow } from '@/lib/db/queries/documents'
import { DocumentRow, NON_TERMINAL } from './DocumentRow'

export function DocumentsTabClient({ docs }: { docs: DocRow[] }) {
  const router = useRouter()
  const hasPending = docs.some(d => NON_TERMINAL.includes(d.status))

  useEffect(() => {
    if (!hasPending) return
    const id = setInterval(() => router.refresh(), 8000)
    return () => clearInterval(id)
  }, [hasPending, router])

  return (
    <>
      {docs.map(doc => (
        <DocumentRow key={doc.id} doc={doc} />
      ))}
    </>
  )
}
