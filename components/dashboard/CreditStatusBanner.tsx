interface Props {
  graceActive: boolean
  graceDisabled: boolean
  plan: string
}

export function CreditStatusBanner({ graceActive, graceDisabled, plan }: Props) {
  if (plan === 'free') return null

  if (graceActive) {
    return (
      <div className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-3 flex items-start gap-3">
        <span className="text-amber-400 mt-0.5 text-base leading-none">⚠</span>
        <div className="flex-1">
          <p className="text-sm font-semibold text-amber-300">Credits depleted — bots running on default model</p>
          <p className="text-xs text-amber-300/70 mt-0.5">
            Your bots are currently responding via DeepSeek Flash. Top up within 2 hours to avoid a temporary service interruption.
          </p>
        </div>
        <a
          href="/dashboard/billing"
          className="shrink-0 rounded-md bg-amber-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-amber-400 transition-colors"
        >
          Top Up Now
        </a>
      </div>
    )
  }

  if (graceDisabled) {
    return (
      <div className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 flex items-start gap-3">
        <span className="text-red-400 mt-0.5 text-base leading-none">✕</span>
        <div className="flex-1">
          <p className="text-sm font-semibold text-red-300">Your bots are temporarily disabled</p>
          <p className="text-xs text-red-300/70 mt-0.5">
            The grace period has ended without a credit top-up. Add credits to restore service.
          </p>
        </div>
        <a
          href="/dashboard/billing"
          className="shrink-0 rounded-md bg-red-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-400 transition-colors"
        >
          Top Up Now
        </a>
      </div>
    )
  }

  return null
}
