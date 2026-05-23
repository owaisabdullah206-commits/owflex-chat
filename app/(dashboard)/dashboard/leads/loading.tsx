export default function Loading() {
  return (
    <div className="flex min-h-screen bg-[var(--bg)]">
      <div className="flex-1 md:ml-56 pb-16 md:pb-0">
        <div className="px-4 sm:px-8 py-5 border-b border-[var(--hairline)]">
          <div className="oct-skeleton h-6 w-20 rounded" />
        </div>
        <div className="px-4 sm:px-8 py-6 space-y-3">
          <div className="oct-skeleton h-9 w-64 rounded-md mb-4" />
          {[...Array(7)].map((_, i) => (
            <div key={i} className="oct-skeleton h-11 rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  )
}
