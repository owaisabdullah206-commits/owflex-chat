'use client'

import { useTransition } from 'react'
import { RefreshCw } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { OctivelySpinner } from '@/components/brand/OctivelySpinner'

export function ReindexButton({ docId }: { docId: string }) {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  function handleReindex() {
    startTransition(async () => {
      const res = await fetch(`/api/v1/documents/${docId}/reindex`, { method: 'POST' })
      if (res.ok) {
        toast.success('Re-index queued')
        router.refresh()
      } else {
        const data = await res.json().catch(() => ({}))
        toast.error(data.error ?? 'Failed to re-index')
      }
    })
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      className="h-6 w-6 text-[var(--ink-muted)] hover:text-[var(--of-primary)] hover:bg-[var(--of-primary)]/10"
      onClick={handleReindex}
      disabled={isPending}
      title="Re-index document"
    >
      {isPending ? <OctivelySpinner size={16} color="var(--of-primary)" duration={4} /> : <RefreshCw className="h-3.5 w-3.5" />}
    </Button>
  )
}
