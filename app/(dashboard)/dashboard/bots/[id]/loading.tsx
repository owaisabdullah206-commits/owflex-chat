export default function Loading() {
  return (
    <div className="flex min-h-screen bg-[var(--bg)]">
      <div className="flex-1 md:ml-56 pb-16 md:pb-0">
        <div className="px-4 sm:px-8 py-5 border-b border-[var(--hairline)]">
          <div className="animate-pulse h-6 w-48 bg-[var(--surface-2)] rounded" />
        </div>
        <div className="flex gap-1 px-4 sm:px-8 border-b border-[var(--hairline)]">
          {[...Array(7)].map((_, i) => (
            <div key={i} className="animate-pulse h-10 w-20 bg-[var(--surface-2)] rounded my-1" />
          ))}
        </div>
        <div className="px-4 sm:px-8 py-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse h-20 bg-[var(--surface-2)] rounded-lg" />
            ))}
          </div>
          <div className="animate-pulse h-32 bg-[var(--surface-2)] rounded-lg" />
        </div>
      </div>
    </div>
  )
}
