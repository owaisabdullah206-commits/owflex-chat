export function UpgradeCTA({ feature, requiredPlan }: { feature: string; requiredPlan: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
      <p className="text-sm font-medium text-[var(--ink)]">{feature}</p>
      <p className="text-xs text-[var(--ink-muted)]">
        Available on {requiredPlan} plan and above.
      </p>
      <a
        href="/pricing"
        className="mt-2 px-4 py-2 text-xs bg-[var(--of-primary)] text-white hover:bg-[var(--of-primary-hover)] transition-colors"
      >
        View pricing
      </a>
    </div>
  )
}
