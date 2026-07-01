'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Mail, ArrowRight, CheckCircle2, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { OctivelyLogo } from '@/components/brand/OctivelyLogo'

export default function AffiliateLoginPage() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'sent' | 'verifying' | 'error'>('idle')
  const [error, setError] = useState('')

  // Auto-verify if token is present
  useEffect(() => {
    if (!token) return
    setStatus('verifying')
    fetch('/api/affiliates/auth/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    })
      .then((r) => r.json())
      .then((data: { success?: boolean; error?: string }) => {
        if (data.success) {
          window.location.href = '/dashboard'
        } else {
          setError(data.error ?? 'Invalid or expired link')
          setStatus('error')
        }
      })
      .catch(() => {
        setError('Something went wrong. Please try again.')
        setStatus('error')
      })
  }, [token])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim()) return

    setStatus('loading')
    setError('')

    try {
      const res = await fetch('/api/affiliates/auth/magic-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      })
      const data = await res.json()

      if (data.success) {
        setStatus('sent')
      } else {
        setError(data.error ?? 'Something went wrong')
        setStatus('idle')
      }
    } catch {
      setError('Something went wrong. Please try again.')
      setStatus('idle')
    }
  }

  return (
    <div
      className="marketing"
      style={{
        minHeight: '100vh',
        background: 'var(--bg)',
        color: 'var(--ink)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
      }}
    >
      <Link
        href="/"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          textDecoration: 'none',
          marginBottom: 32,
        }}
      >
        <OctivelyLogo size={22} showWordmark />
      </Link>

      <div
        style={{
          width: '100%',
          maxWidth: 400,
          border: '1px solid var(--hairline)',
          borderRadius: 'var(--r-lg)',
          background: 'var(--surface)',
          padding: 32,
        }}
      >
        {status === 'verifying' ? (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <Loader2
              size={24}
              style={{ color: 'var(--of-primary)', animation: 'spin 1s linear infinite', margin: '0 auto 12px' }}
            />
            <p style={{ fontSize: 14, color: 'var(--ink-muted)' }}>Verifying your link...</p>
          </div>
        ) : status === 'sent' ? (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <CheckCircle2
              size={32}
              style={{ color: 'var(--of-success)', margin: '0 auto 12px' }}
            />
            <h2 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 8px' }}>Check your email</h2>
            <p style={{ fontSize: 14, color: 'var(--ink-muted)', lineHeight: 1.6, margin: 0 }}>
              We sent a login link to <strong>{email}</strong>. Click the link in the email to access your dashboard.
            </p>
            <button
              onClick={() => { setStatus('idle'); setEmail('') }}
              style={{
                marginTop: 20,
                background: 'none',
                border: 'none',
                color: 'var(--of-primary)',
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
                padding: 0,
              }}
            >
              Use a different email
            </button>
          </div>
        ) : (
          <>
            <h2 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 4px', textAlign: 'center' }}>
              Affiliate Login
            </h2>
            <p style={{ fontSize: 13, color: 'var(--ink-muted)', margin: '0 0 24px', textAlign: 'center' }}>
              Enter your email to receive a login link
            </p>

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: 16 }}>
                <label
                  htmlFor="email"
                  style={{
                    display: 'block',
                    fontSize: 12,
                    fontWeight: 600,
                    color: 'var(--ink-muted)',
                    marginBottom: 6,
                    fontFamily: 'var(--font-mono)',
                    letterSpacing: '0.03em',
                  }}
                >
                  Email address
                </label>
                <div style={{ position: 'relative' }}>
                  <Mail
                    size={16}
                    style={{
                      position: 'absolute',
                      left: 12,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: 'var(--ink-subtle)',
                    }}
                  />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    autoFocus
                    style={{
                      width: '100%',
                      padding: '10px 12px 10px 36px',
                      border: '1px solid var(--hairline)',
                      borderRadius: 'var(--r-md)',
                      background: 'var(--bg)',
                      color: 'var(--ink)',
                      fontSize: 14,
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
              </div>

              {error && (
                <p style={{ fontSize: 13, color: '#ef4444', margin: '0 0 12px' }}>{error}</p>
              )}

              <button
                type="submit"
                disabled={status === 'loading' || !email.trim()}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  padding: '10px 16px',
                  background: 'var(--of-primary)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 'var(--r-md)',
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: status === 'loading' ? 'not-allowed' : 'pointer',
                  opacity: status === 'loading' || !email.trim() ? 0.6 : 1,
                  transition: 'opacity 0.15s',
                }}
              >
                {status === 'loading' ? (
                  <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                ) : (
                  <>
                    Send login link
                    <ArrowRight size={14} />
                  </>
                )}
              </button>
            </form>
          </>
        )}
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
