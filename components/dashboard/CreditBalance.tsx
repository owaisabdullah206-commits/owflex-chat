import { CREDIT_PACKS, type PackId } from '@/lib/billing/payfast'

interface Transaction {
  id: string
  delta: number
  reason: string
  createdAt: Date
}

interface CreditBalanceProps {
  balance: number
  transactions: Transaction[]
  appUrl: string
}

function PackRow({ packId, appUrl }: { packId: PackId; appUrl: string }) {
  const pack = CREDIT_PACKS[packId]
  const label = packId.charAt(0).toUpperCase() + packId.slice(1)
  const tokensLabel = pack.tokens >= 1_000_000
    ? `${(pack.tokens / 1_000_000).toFixed(1)}M tokens`
    : `${(pack.tokens / 1000).toFixed(0)}k tokens`

  const pfNotifyUrl = `${appUrl}/api/webhooks/payfast`
  const pfReturnUrl = `${appUrl}/dashboard/billing`

  return (
    <div className="flex items-center justify-between py-3 px-5">
      <div>
        <p className="text-sm font-medium text-[var(--ink)]">{label}</p>
        <p className="text-xs text-[var(--ink-muted)]" style={{ fontFamily: 'var(--font-mono)' }}>
          {tokensLabel}
        </p>
      </div>
      <div className="flex items-center gap-4 text-xs text-[var(--ink-muted)]">
        <span style={{ fontFamily: 'var(--font-mono)' }}>Rs {pack.pkr.toLocaleString()} / ${pack.usd}</span>
        <div className="flex gap-2">
          <a
            href={`/api/billing/payfast-url?pack=${packId}&returnUrl=${encodeURIComponent(pfReturnUrl)}&notifyUrl=${encodeURIComponent(pfNotifyUrl)}`}
            className="px-3 py-1 rounded bg-[var(--of-primary)] text-white text-xs hover:opacity-90 transition-opacity"
          >
            PayFast
          </a>
          <a
            href={`/api/billing/ls-url?pack=${packId}`}
            className="px-3 py-1 rounded border border-[var(--hairline)] text-[var(--ink)] text-xs hover:bg-[var(--surface-2)] transition-colors"
          >
            Lemon Squeezy
          </a>
        </div>
      </div>
    </div>
  )
}

export function CreditBalance({ balance, transactions, appUrl }: CreditBalanceProps) {
  return (
    <div className="space-y-6">
      {/* Balance card */}
      <div className="rounded-lg border border-[var(--hairline)] bg-[var(--surface)] px-6 py-5">
        <p className="text-xs text-[var(--ink-muted)] uppercase tracking-wide mb-1">Credit Balance</p>
        <p className="text-3xl font-bold text-[var(--ink)]" style={{ fontFamily: 'var(--font-mono)' }}>
          {balance.toLocaleString()}
        </p>
        <p className="text-xs text-[var(--ink-muted)] mt-1">tokens remaining</p>
      </div>

      {/* Credit packs */}
      <div>
        <h3 className="text-sm font-semibold text-[var(--ink)] mb-2">Buy Credits</h3>
        <div className="rounded-lg border border-[var(--hairline)] bg-[var(--surface)] divide-y divide-[var(--hairline)]">
          {(Object.keys(CREDIT_PACKS) as PackId[]).map((packId) => (
            <PackRow key={packId} packId={packId} appUrl={appUrl} />
          ))}
        </div>
        <p className="text-xs text-[var(--ink-muted)] mt-2">
          PayFast — PKR · Lemon Squeezy — USD. Credits never expire.
        </p>
      </div>

      {/* Recent transactions */}
      {transactions.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-[var(--ink)] mb-2">Recent Transactions</h3>
          <div className="rounded-lg border border-[var(--hairline)] bg-[var(--surface)] divide-y divide-[var(--hairline)]">
            {transactions.map((tx) => (
              <div key={tx.id} className="flex items-center justify-between px-5 py-3">
                <div>
                  <p className="text-xs text-[var(--ink-muted)]">{tx.reason.replace('_', ' ')}</p>
                  <p className="text-xs text-[var(--ink-muted)]">
                    {new Date(tx.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                </div>
                <p
                  className={`text-sm font-medium ${tx.delta > 0 ? 'text-emerald-400' : 'text-[var(--ink-muted)]'}`}
                  style={{ fontFamily: 'var(--font-mono)' }}
                >
                  {tx.delta > 0 ? '+' : ''}{tx.delta.toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
