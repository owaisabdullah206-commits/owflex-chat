export default function ClientsLoading() {
  return (
    <div className="flex min-h-screen bg-[var(--bg)]">
      <div className="hidden md:block fixed inset-y-0 left-0 w-56 bg-[var(--surface)] border-r border-[var(--hairline)]" />
      <main className="flex-1 md:ml-56 pb-16 md:pb-0">
        <div className="px-4 sm:px-8 py-5 border-b border-[var(--hairline)]">
          <div className="h-6 w-24 rounded bg-[var(--surface-2)] animate-pulse" />
          <div className="h-4 w-56 rounded bg-[var(--surface-2)] animate-pulse mt-1.5" />
        </div>
        <div className="px-4 sm:px-8 py-6 space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-11 w-full rounded bg-[var(--surface-2)] animate-pulse" />
          ))}
        </div>
      </main>
    </div>
  )
}
