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

function PackCard({ packId, appUrl }: { packId: PackId; appUrl: string }) {
  const pack = CREDIT_PACKS[packId]
  const label = packId.charAt(0).toUpperCase() + packId.slice(1)
  const tokensLabel = pack.tokens >= 1_000_000
    ? `${(pack.tokens / 1_000_000).toFixed(1)}M tokens`
    : `${(pack.tokens / 1000).toFixed(0)}k tokens`

  const pfNotifyUrl = `${appUrl}/api/webhooks/payfast`
  const pfReturnUrl = `${appUrl}/dashboard/billing`

  return (
    <div className="rounded-xl border border-[var(--hairline)] bg-[var(--surface)] p-5 flex flex-col gap-4">
      <div>
        <p className="text-sm font-semibold text-[var(--ink)]">{label}</p>
        <p
          className="text-2xl font-bold text-[var(--ink)] mt-1.5"
          style={{ fontFamily: 'var(--font-mono)' }}
        >
          {tokensLabel}
        </p>
        <p className="text-xs text-[var(--ink-muted)] mt-1" style={{ fontFamily: 'var(--font-mono)' }}>
          Rs {pack.pkr.toLocaleString()} &nbsp;·&nbsp; ${pack.usd} USD
        </p>
      </div>
      <div className="flex gap-2 mt-auto">
        <a
          href={`/api/billing/payfast-url?pack=${packId}&returnUrl=${encodeURIComponent(pfReturnUrl)}&notifyUrl=${encodeURIComponent(pfNotifyUrl)}`}
          className="flex-1 text-center py-2 rounded-lg bg-[var(--of-primary)] text-white text-xs font-medium hover:opacity-90 transition-opacity"
        >
          PayFast
        </a>
        <a
          href={`/api/billing/ls-url?pack=${packId}`}
          className="flex-1 text-center py-2 rounded-lg border border-[var(--hairline)] text-[var(--ink)] text-xs font-medium hover:bg-[var(--surface-2)] transition-colors"
        >
          Lemon Squeezy
        </a>
      </div>
    </div>
  )
}

export function CreditBalance({ balance, transactions, appUrl }: CreditBalanceProps) {
  return (
    <div className="space-y-6">
      {/* Buy Credits */}
      <div>
        <div className="flex items-baseline justify-between mb-3">
          <h3 className="text-sm font-semibold text-[var(--ink)]">Buy Credits</h3>
          <span className="text-xs text-[var(--ink-muted)]" style={{ fontFamily: 'var(--font-mono)' }}>
            {balance.toLocaleString()} tokens remaining
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {(Object.keys(CREDIT_PACKS) as PackId[]).map((packId) => (
            <PackCard key={packId} packId={packId} appUrl={appUrl} />
          ))}
        </div>
        <p className="text-xs text-[var(--ink-muted)] mt-3">
          PayFast accepts PKR &nbsp;·&nbsp; Lemon Squeezy accepts USD &nbsp;·&nbsp; Credits never expire
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
