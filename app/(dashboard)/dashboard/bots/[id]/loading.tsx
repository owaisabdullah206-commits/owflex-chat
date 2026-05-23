export default function Loading() {
  return (
    <div className="flex min-h-screen bg-[var(--bg)]">
      <div className="flex-1 md:ml-56 pb-16 md:pb-0">
        <div className="px-4 sm:px-8 py-5 border-b border-[var(--hairline)]">
          <div className="oct-skeleton h-6 w-48 rounded" />
        </div>
        <div className="flex gap-1 px-4 sm:px-8 border-b border-[var(--hairline)]">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="oct-skeleton h-8 w-20 rounded my-1.5" />
          ))}
        </div>
        <div className="px-4 sm:px-8 py-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="oct-skeleton h-20 rounded-lg" />
            ))}
          </div>
          <div className="oct-skeleton h-32 rounded-lg" />
        </div>
      </div>
    </div>
  )
}
