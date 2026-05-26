'use client'

/**
 * Renders a UTC timestamp in the user's local browser timezone.
 * Use instead of new Date().toLocaleString() in server components,
 * which defaults to UTC (server timezone) rather than the visitor's local time.
 */
export function ClientDate({
  iso,
  opts,
}: {
  iso: string | Date
  opts?: Intl.DateTimeFormatOptions
}) {
  const d = new Date(iso)
  const formatted = d.toLocaleString(undefined, {
    month:  'short',
    day:    'numeric',
    hour:   '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
    ...opts,
  })

  return (
    <time dateTime={d.toISOString()} suppressHydrationWarning>
      {formatted}
    </time>
  )
}
