export default function Loading() {
  return (
    <div className="flex min-h-screen bg-[var(--bg)]">
      <div className="flex-1 md:ml-56 pb-16 md:pb-0">
        <div className="px-4 sm:px-8 py-5 border-b border-[var(--hairline)]">
          <div className="animate-pulse h-6 w-20 bg-[var(--surface-2)] rounded" />
        </div>
        <div className="px-4 sm:px-8 py-6 space-y-3">
          <div className="animate-pulse h-9 w-64 bg-[var(--surface-2)] rounded-md mb-4" />
          {[...Array(6)].map((_, i) => (
            <div key={i} className="animate-pulse h-11 bg-[var(--surface-2)] rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  )
}
