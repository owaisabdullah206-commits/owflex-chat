'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { authClient } from '@/lib/auth/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

type State = 'loading' | 'valid' | 'invalid' | 'expired' | 'used' | 'success'

function InviteContent() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token') ?? ''

  const [state, setState] = useState<State>('loading')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)

  useEffect(() => {
    if (!token) { setState('invalid'); return }

    fetch(`/api/invite/accept?token=${encodeURIComponent(token)}`)
      .then((r) => {
        if (r.status === 404) { setState('invalid'); return null }
        if (r.status === 410) { setState('expired'); return null }
        if (r.status === 409) { setState('used'); return null }
        return r.json()
      })
      .then((data) => {
        if (data?.valid) {
          setEmail(data.email)
          setState('valid')
        }
      })
      .catch(() => setState('invalid'))
  }, [token])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setPending(true)

    try {
      const res = await fetch('/api/invite/accept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error ?? 'Something went wrong. Please try again.')
        return
      }

      await authClient.signIn.email({
        email,
        password,
        callbackURL: '/portal',
      })

      setState('success')
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setPending(false)
    }
  }

  return (
    <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center px-4">
      <div className="w-full max-w-sm text-center">
        <div className="inline-flex items-center gap-2 mb-6">
          <div className="w-7 h-7 rounded-md bg-[var(--of-primary)] flex items-center justify-center">
            <span className="text-white text-sm font-bold">O</span>
          </div>
          <span className="text-lg font-semibold text-[var(--ink)]">OwFlex</span>
        </div>

        {state === 'loading' && (
          <p className="text-[var(--ink-muted)] text-sm">Verifying your invitation…</p>
        )}

        {state === 'invalid' && (
          <div className="bg-[var(--surface)] rounded-xl border border-[var(--hairline)] shadow-sm p-6">
            <h1 className="text-lg font-semibold text-[var(--ink)] mb-2">Invalid invitation</h1>
            <p className="text-sm text-[var(--ink-muted)]">
              This invitation link is invalid or has already been used.
            </p>
          </div>
        )}

        {state === 'expired' && (
          <div className="bg-[var(--surface)] rounded-xl border border-[var(--hairline)] shadow-sm p-6">
            <h1 className="text-lg font-semibold text-[var(--ink)] mb-2">Invitation expired</h1>
            <p className="text-sm text-[var(--ink-muted)]">
              This invitation link has expired. Please ask the developer to send a new one.
            </p>
          </div>
        )}

        {state === 'used' && (
          <div className="bg-[var(--surface)] rounded-xl border border-[var(--hairline)] shadow-sm p-6">
            <h1 className="text-lg font-semibold text-[var(--ink)] mb-2">Already accepted</h1>
            <p className="text-sm text-[var(--ink-muted)] mb-4">
              This invitation has already been used.
            </p>
            <Button asChild className="w-full">
              <a href="/portal/login">Sign in instead</a>
            </Button>
          </div>
        )}

        {state === 'valid' && (
          <div className="bg-[var(--surface)] rounded-xl border border-[var(--hairline)] shadow-sm p-6 text-left">
            <h1 className="text-xl font-bold text-[var(--ink)] mb-1">Set your password</h1>
            <p className="text-sm text-[var(--ink-muted)] mb-5">
              You&apos;ve been invited. Create a password to access your dashboard.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-[var(--ink)]">Email</Label>
                <Input
                  type="email"
                  value={email}
                  readOnly
                  className="border-[var(--hairline)] bg-[var(--bg)] text-[var(--ink-muted)]"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-sm font-medium text-[var(--ink)]">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  required
                  minLength={8}
                  className="border-[var(--hairline-strong)] bg-[var(--bg)] text-[var(--ink)]
                    placeholder:text-[var(--ink-faint)] focus-visible:ring-[var(--of-primary)]"
                />
              </div>

              {error && (
                <p className="text-sm text-[var(--of-error)] rounded-lg bg-[var(--of-error-soft)] px-3 py-2">
                  {error}
                </p>
              )}

              <Button type="submit" className="w-full" disabled={pending}>
                {pending ? 'Setting up your account…' : 'Create account & sign in'}
              </Button>
            </form>
          </div>
        )}

        {state === 'success' && (
          <div className="bg-[var(--surface)] rounded-xl border border-[var(--hairline)] shadow-sm p-6">
            <h1 className="text-lg font-semibold text-[var(--ink)] mb-2">You&apos;re all set!</h1>
            <p className="text-sm text-[var(--ink-muted)]">Redirecting to your dashboard…</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default function InvitePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center">
        <p className="text-[var(--ink-muted)] text-sm">Loading…</p>
      </div>
    }>
      <InviteContent />
    </Suspense>
  )
}
