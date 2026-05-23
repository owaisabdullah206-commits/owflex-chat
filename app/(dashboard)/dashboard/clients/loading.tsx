export default function ClientsLoading() {
  return (
    <div className="flex min-h-screen bg-[var(--bg)]">
      <div className="flex-1 md:ml-56 pb-16 md:pb-0">
        <div className="px-4 sm:px-8 py-5 border-b border-[var(--hairline)]">
          <div className="oct-skeleton h-6 w-28 rounded" />
          <div className="oct-skeleton h-4 w-52 rounded mt-1.5" />
        </div>
        <div className="px-4 sm:px-8 py-6 space-y-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="oct-skeleton h-11 w-full rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  )
}
