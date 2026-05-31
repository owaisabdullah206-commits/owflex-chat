'use client'
import { sendGAEvent, sendGTMEvent } from '@next/third-parties/google'
import { getUTM } from '@/lib/utm'

export function trackGAEvent(action: string, params?: Record<string, unknown>) {
  if (typeof window === 'undefined') return
  sendGAEvent('event', action, { ...getUTM(), ...(params ?? {}) })
}

export function trackGTMEvent(eventName: string, data?: Record<string, unknown>) {
  if (typeof window === 'undefined') return
  sendGTMEvent({ event: eventName, ...getUTM(), ...data })
}
