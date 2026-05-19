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
  plan: string
}

function PackCard({ packId, appUrl }: { packId: PackId; appUrl: string }) {
  const pack = CREDIT_PACKS[packId]
  const label = packId.charAt(0).toUpperCase() + packId.slice(1)
  const tokensLabel = pack.tokens >= 1_000_000
    ? `${(pack.tokens / 1_000_000).toFixed(1)}M`
    : `${(pack.tokens / 1000).toFixed(0)}k`

  const pfNotifyUrl = `${appUrl}/api/webhooks/payfast`
  const pfReturnUrl = `${appUrl}/dashboard/billing`

  return (
    <div className="bg-[var(--surface)] border border-[var(--hairline)] p-4 flex flex-col gap-4">
      <div>
        <p
          className="text-[11px] font-semibold uppercase tracking-[0.05em] text-[var(--ink-subtle)] mb-1"
          style={{ fontFamily: 'var(--font-mono)' }}
        >
          {label}
        </p>
        <p
          className="text-[28px] font-semibold leading-none text-[var(--ink)]"
          style={{ fontFamily: 'var(--font-mono)', letterSpacing: '-0.04em' }}
        >
          {tokensLabel}
          <span className="text-[14px] text-[var(--ink-subtle)] ml-1">tokens</span>
        </p>
        <p className="text-[11px] text-[var(--ink-muted)] mt-1.5" style={{ fontFamily: 'var(--font-mono)' }}>
          Rs {pack.pkr.toLocaleString()} · ${pack.usd} USD
        </p>
      </div>
      <div className="flex gap-2 mt-auto">
        <a
          href={`/api/billing/payfast-url?pack=${packId}&returnUrl=${encodeURIComponent(pfReturnUrl)}&notifyUrl=${encodeURIComponent(pfNotifyUrl)}`}
          className="flex-1 text-center py-1.5 bg-[var(--of-primary)] text-white text-[11px] font-medium hover:opacity-90 transition-opacity"
          style={{ fontFamily: 'var(--font-mono)' }}
        >
          PayFast
        </a>
        <a
          href={`/api/billing/ls-url?pack=${packId}`}
          className="flex-1 text-center py-1.5 border border-[var(--hairline)] text-[var(--ink)] text-[11px] font-medium hover:bg-[var(--surface-2)] transition-colors"
          style={{ fontFamily: 'var(--font-mono)' }}
        >
          Lemon Squeezy
        </a>
      </div>
    </div>
  )
}

const thClass = 'px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--ink-subtle)] bg-[var(--surface-2)] border-b border-[var(--hairline)]'
const tdClass = 'px-4 py-3 border-b border-[var(--hairline)] text-[12px]'

export function CreditBalance({ balance, transactions, appUrl, plan }: CreditBalanceProps) {
  const canTopUp = plan !== 'free'

  return (
    <div className="space-y-6">
      {/* Buy Credits — hidden for free plan */}
      {canTopUp && (
      <div>
        <div className="flex items-baseline justify-between mb-3">
          <p
            className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--ink-subtle)]"
            style={{ fontFamily: 'var(--font-mono)' }}
          >
            credits.topup
          </p>
          <span className="text-[11px] text-[var(--of-primary)]" style={{ fontFamily: 'var(--font-mono)' }}>
            {balance.toLocaleString()} remaining
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {(Object.keys(CREDIT_PACKS) as PackId[]).map((packId) => (
            <PackCard key={packId} packId={packId} appUrl={appUrl} />
          ))}
        </div>
        <p className="text-[11px] text-[var(--ink-muted)] mt-3" style={{ fontFamily: 'var(--font-mono)' }}>
          payfast=PKR · lemon_squeezy=USD · credits.ttl=never
        </p>
      </div>
      )}

      {/* Recent transactions */}
      {transactions.length > 0 && (
        <div>
          <p
            className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--ink-subtle)] mb-3"
            style={{ fontFamily: 'var(--font-mono)' }}
          >
            transactions.recent
          </p>
          <div className="border border-[var(--hairline)] overflow-hidden">
            <table className="w-full text-sm" style={{ fontFamily: 'var(--font-mono)' }}>
              <thead>
                <tr>
                  <th className={thClass}>reason</th>
                  <th className={thClass}>date</th>
                  <th className={`${thClass} text-right`}>delta</th>
                </tr>
              </thead>
              <tbody className="bg-[var(--surface)]">
                {transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-[var(--surface-2)] transition-colors">
                    <td className={`${tdClass} text-[var(--ink-muted)]`}>
                      {tx.reason.replace(/_/g, ' ')}
                    </td>
                    <td className={`${tdClass} text-[var(--ink-subtle)]`}>
                      {new Date(tx.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className={`${tdClass} text-right font-medium ${tx.delta > 0 ? 'text-[var(--of-success)]' : 'text-[var(--ink-muted)]'}`}>
                      {tx.delta > 0 ? '+' : ''}{tx.delta.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
