'use client'
import { sendGAEvent, sendGTMEvent } from '@next/third-parties/google'

export function trackGAEvent(action: string, params?: Record<string, unknown>) {
  if (typeof window === 'undefined') return
  sendGAEvent('event', action, params)
}

export function trackGTMEvent(eventName: string, data?: Record<string, unknown>) {
  if (typeof window === 'undefined') return
  sendGTMEvent({ event: eventName, ...data })
}
