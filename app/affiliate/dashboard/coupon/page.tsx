'use client'

import { useEffect, useState } from 'react'

export default function AffiliateCouponPage() {
  const [coupon, setCoupon] = useState<{ id: string; code: string; discountPercent: string; usedCount: number; isActive: boolean } | null>(null)
  const [commissionRate, setCommissionRate] = useState(0)
  const [discount, setDiscount] = useState(0)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/affiliates/my-coupon')
      .then((r) => r.json())
      .then((data) => {
        setCoupon(data.coupon)
        setCommissionRate(data.commissionRate)
        setDiscount(Number(data.coupon?.discountPercent ?? 0))
        setLoading(false)
      })
  }, [])

  async function handleSave() {
    setSaving(true)
    setSaved(false)
    await fetch('/api/affiliates/my-coupon', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ discountPercent: discount }),
    })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  if (loading) {
    return <div style={{ padding: 40, textAlign: 'center', color: 'var(--ink-subtle)' }}>Loading...</div>
  }

  if (!coupon) {
    return (
      <div style={{ padding: 40, textAlign: 'center' }}>
        <p style={{ fontSize: 14, color: 'var(--ink-muted)' }}>
          No coupon yet. Contact the admin to create your affiliate coupon.
        </p>
      </div>
    )
  }

  const maxDiscountPct = commissionRate * 100
  const affiliateEarningPct = maxDiscountPct - discount

  return (
    <div style={{ maxWidth: 600, margin: '0 auto' }}>
      <h1 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>My Coupon</h1>
      <p style={{ fontSize: 13, color: 'var(--ink-muted)', marginBottom: 32 }}>
        Set how much discount your referrals get. The rest is your commission.
      </p>

      {/* Coupon code */}
      <div
        style={{
          border: '1px solid var(--hairline)',
          borderRadius: 'var(--r-lg)',
          padding: 24,
          background: 'var(--surface)',
          marginBottom: 24,
        }}
      >
        <p style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--ink-subtle)', marginBottom: 8 }}>
          Your Coupon Code
        </p>
        <p style={{ fontSize: 28, fontWeight: 800, fontFamily: 'var(--font-mono)', letterSpacing: '0.05em', color: 'var(--of-primary)' }}>
          {coupon.code}
        </p>
        <p style={{ fontSize: 12, color: 'var(--ink-muted)', marginTop: 8 }}>
          Used {coupon.usedCount} time{coupon.usedCount !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Discount slider */}
      <div
        style={{
          border: '1px solid var(--hairline)',
          borderRadius: 'var(--r-lg)',
          padding: 24,
          background: 'var(--surface)',
          marginBottom: 24,
        }}
      >
        <p style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--ink-subtle)', marginBottom: 16 }}>
          Customer Discount
        </p>

        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 16 }}>
          <span style={{ fontSize: 40, fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--ink)' }}>
            {discount}
          </span>
          <span style={{ fontSize: 16, color: 'var(--ink-muted)' }}>%</span>
        </div>

        <input
          type="range"
          min={0}
          max={maxDiscountPct}
          step={1}
          value={discount}
          onChange={(e) => setDiscount(Number(e.target.value))}
          style={{
            width: '100%',
            accentColor: 'var(--of-primary)',
            height: 6,
            marginBottom: 8,
          }}
        />

        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--ink-subtle)' }}>
          <span>0% (no discount)</span>
          <span>{maxDiscountPct}% (max — your full commission)</span>
        </div>
      </div>

      {/* Breakdown */}
      <div
        style={{
          border: '1px solid var(--hairline)',
          borderRadius: 'var(--r-lg)',
          padding: 24,
          background: 'var(--surface)',
          marginBottom: 24,
        }}
      >
        <p style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--ink-subtle)', marginBottom: 16 }}>
          How It Splits
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, textAlign: 'center' }}>
          <div>
            <p style={{ fontSize: 24, fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--ink)' }}>{discount}%</p>
            <p style={{ fontSize: 11, color: 'var(--ink-muted)', marginTop: 4 }}>Customer Gets</p>
          </div>
          <div>
            <p style={{ fontSize: 24, fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--of-primary)' }}>{affiliateEarningPct}%</p>
            <p style={{ fontSize: 11, color: 'var(--ink-muted)', marginTop: 4 }}>You Earn</p>
          </div>
          <div>
            <p style={{ fontSize: 24, fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--ink)' }}>{maxDiscountPct}%</p>
            <p style={{ fontSize: 11, color: 'var(--ink-muted)', marginTop: 4 }}>Total Pool</p>
          </div>
        </div>

        <div style={{ marginTop: 20, padding: 16, background: 'var(--surface-2)', borderRadius: 'var(--r-md)', fontSize: 13, color: 'var(--ink-muted)', lineHeight: 1.6 }}>
          <strong style={{ color: 'var(--ink)' }}>Example:</strong> If a customer pays ₨1,000 for a plan:
          <br />They save <strong style={{ color: 'var(--ink)' }}>₨{(1000 * discount / 100).toLocaleString()}</strong> with your code.
          <br />You earn <strong style={{ color: 'var(--of-primary)' }}>₨{(1000 * affiliateEarningPct / 100).toLocaleString()}</strong> commission.
        </div>
      </div>

      {/* Save */}
      <button
        onClick={handleSave}
        disabled={saving}
        style={{
          width: '100%',
          padding: '12px 24px',
          background: 'var(--of-primary)',
          color: '#fff',
          border: 'none',
          borderRadius: 'var(--r-md)',
          fontSize: 14,
          fontWeight: 600,
          cursor: saving ? 'not-allowed' : 'pointer',
          opacity: saving ? 0.6 : 1,
          transition: 'opacity 0.15s',
        }}
      >
        {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Discount'}
      </button>
    </div>
  )
}
