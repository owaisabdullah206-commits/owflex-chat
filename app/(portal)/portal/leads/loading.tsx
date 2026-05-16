export default function Loading() {
  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <div className="border-b border-[var(--hairline)] bg-[var(--surface)] h-14" />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <div className="animate-pulse h-7 w-20 bg-[var(--surface)] rounded" />
          <div className="animate-pulse h-8 w-24 bg-[var(--surface)] rounded" />
        </div>
        <div className="animate-pulse h-9 w-full bg-[var(--surface)] rounded-md mb-4" />
        <div className="hidden sm:block bg-[var(--surface)] rounded-xl border border-[var(--hairline)] overflow-hidden">
          <div className="h-10 border-b border-[var(--hairline)] bg-[var(--bg)]" />
          {[...Array(5)].map((_, i) => (
            <div key={i} className="animate-pulse h-12 border-b border-[var(--hairline)] last:border-0 bg-[var(--surface)]" />
          ))}
        </div>
        <div className="sm:hidden space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="animate-pulse h-24 bg-[var(--surface)] rounded-xl border border-[var(--hairline)]" />
          ))}
        </div>
      </div>
    </div>
  )
}
