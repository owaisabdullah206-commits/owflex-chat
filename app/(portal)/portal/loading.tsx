export default function Loading() {
  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <div className="border-b border-[var(--hairline)] bg-[var(--surface)] h-14" />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <div className="animate-pulse h-7 w-48 bg-[var(--surface)] rounded mb-8" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse h-24 bg-[var(--surface)] rounded-xl border border-[var(--hairline)]" />
          ))}
        </div>
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="animate-pulse h-14 bg-[var(--surface)] rounded-xl border border-[var(--hairline)]" />
          ))}
        </div>
      </div>
    </div>
  )
}
