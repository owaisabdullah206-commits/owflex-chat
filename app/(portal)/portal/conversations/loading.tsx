import { OctivelyStagger } from '@/components/brand/OctivelyStagger'

export default function Loading() {
  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <div className="border-b border-[var(--hairline)] bg-[var(--surface)] h-14" />
      <div className="flex items-center justify-center" style={{ minHeight: 'calc(100vh - 56px)' }}>
        <OctivelyStagger size={52} color="var(--of-primary)" />
      </div>
    </div>
  )
}
