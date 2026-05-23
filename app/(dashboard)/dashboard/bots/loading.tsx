import { OctivelyStagger } from '@/components/brand/OctivelyStagger'

export default function Loading() {
  return (
    <div className="flex min-h-screen bg-[var(--bg)]">
      <div className="flex-1 md:ml-56 flex items-center justify-center">
        <OctivelyStagger size={52} color="var(--of-primary)" />
      </div>
    </div>
  )
}
