// Renders a money string (e.g. "₨20,000", "$79/mo", "Free") with the leading
// ₨ / $ glyph shrunk. The ₨ glyph (U+20A8) is absent from JetBrains Mono, so it
// falls back to a system font that renders visibly larger than the digits — this
// scales it down so the symbol matches the number. Same fix used in the admin metrics.
export function Money({ children }: { children: string }) {
  const s = children ?? ''
  const sym = s[0]
  if (sym === '₨' || sym === '$') {
    return (
      <>
        <span style={{ fontSize: '0.6em', fontWeight: 600, verticalAlign: '0.08em', marginRight: '0.02em' }}>{sym}</span>
        {s.slice(1)}
      </>
    )
  }
  return <>{s}</>
}
