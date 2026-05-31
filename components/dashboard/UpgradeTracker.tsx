'use client'
import { useEffect } from 'react'
import { trackGAEvent } from '@/lib/analytics'

export function UpgradeTracker({ plan }: { plan: string }) {
  useEffect(() => {
    trackGAEvent('plan_upgraded', { plan })
    const url = new URL(window.location.href)
    url.searchParams.delete('upgraded')
    window.history.replaceState({}, '', url.toString())
  }, [plan])
  return null
}
