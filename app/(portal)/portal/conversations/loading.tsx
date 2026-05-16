export default function Loading() {
  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <div className="border-b border-[var(--hairline)] bg-[var(--surface)] h-14" />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <div className="animate-pulse h-7 w-44 bg-[var(--surface)] rounded mb-6" />
        <div className="bg-[var(--surface)] rounded-xl border border-[var(--hairline)] divide-y divide-[var(--hairline)]">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="animate-pulse px-4 py-4 flex gap-4">
              <div className="flex-1 space-y-2">
                <div className="h-4 w-32 bg-[var(--bg)] rounded" />
                <div className="h-3 w-48 bg-[var(--bg)] rounded" />
              </div>
              <div className="h-5 w-16 bg-[var(--bg)] rounded-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
