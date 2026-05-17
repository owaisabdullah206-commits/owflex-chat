'use client'

import { useState, useEffect } from 'react'

function formatRelative(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()

  if (diffMs < 0) {
    // Future date
    const abs = -diffMs
    const diffMin = Math.floor(abs / 60_000)
    const diffHr  = Math.floor(abs / 3_600_000)
    const diffDay = Math.floor(abs / 86_400_000)
    if (diffMin < 1)  return 'just now'
    if (diffMin < 60) return `in ${diffMin}m`
    if (diffHr  < 24) return `in ${diffHr}h`
    if (diffDay === 1) return 'tomorrow'
    if (diffDay < 30) return `in ${diffDay}d`
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  const diffMin = Math.floor(diffMs / 60_000)
  const diffHr  = Math.floor(diffMs / 3_600_000)
  const diffDay = Math.floor(diffMs / 86_400_000)
  if (diffMin < 1)  return 'Just now'
  if (diffMin < 60) return `${diffMin}m ago`
  if (diffHr  < 24) return `${diffHr}h ago`
  if (diffDay === 1) return 'Yesterday'
  if (diffDay < 7)  return `${diffDay}d ago`
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

interface RelativeTimeProps {
  date: Date | string
  className?: string
}

export function RelativeTime({ date, className }: RelativeTimeProps) {
  const d = typeof date === 'string' ? new Date(date) : date
  const [rel, setRel] = useState(() => formatRelative(d))

  useEffect(() => {
    setRel(formatRelative(d))
    const id = setInterval(() => setRel(formatRelative(d)), 60_000)
    return () => clearInterval(id)
  }, [d])

  return (
    <time
      dateTime={d.toISOString()}
      title={d.toLocaleString()}
      className={className}
    >
      {rel}
    </time>
  )
}
