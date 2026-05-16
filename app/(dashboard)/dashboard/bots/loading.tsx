export default function Loading() {
  return (
    <div className="flex min-h-screen bg-[var(--bg)]">
      <div className="flex-1 md:ml-56 pb-16 md:pb-0">
        <div className="px-4 sm:px-8 py-5 border-b border-[var(--hairline)]">
          <div className="animate-pulse h-6 w-24 bg-[var(--surface-2)] rounded" />
        </div>
        <div className="px-4 sm:px-8 py-6 space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="animate-pulse h-12 bg-[var(--surface-2)] rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  )
}
