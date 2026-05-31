'use client'
import { useEffect } from 'react'
import { trackGAEvent } from '@/lib/analytics'

export function OnboardingTracker() {
  useEffect(() => {
    trackGAEvent('bot_created')
    const url = new URL(window.location.href)
    url.searchParams.delete('onboarding')
    window.history.replaceState({}, '', url.toString())
  }, [])
  return null
}
