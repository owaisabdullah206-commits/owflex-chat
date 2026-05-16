'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { authClient } from '@/lib/auth/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Eye, EyeOff, Loader2 } from 'lucide-react'

type State = 'loading' | 'valid' | 'invalid' | 'expired' | 'used' | 'success'

function InviteContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get('token') ?? ''

  const [state, setState] = useState<State>('loading')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)

  const pwStrength = password.length === 0 ? 0 : password.length < 6 ? 1 : password.length < 10 ? 2 : 3
  const strengthLabel = ['', 'Weak', 'Fair', 'Strong'][pwStrength]
  const strengthColor = ['', 'bg-red-500', 'bg-amber-500', 'bg-emerald-500'][pwStrength]
  const strengthText = ['', 'text-red-500', 'text-amber-500', 'text-emerald-500'][pwStrength]

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
      // Step 1: Create account client-side — this ensures the accounts table
      // entry is created correctly so BetterAuth can verify credentials at login.
      const signUpResult = await authClient.signUp.email({
        email,
        password,
        name: email.split('@')[0],
      })

      if (signUpResult.error) {
        const msg = signUpResult.error.message ?? ''
        const isExists = signUpResult.error.status === 422 ||
          msg.toLowerCase().includes('already') ||
          msg.toLowerCase().includes('exists')

        if (isExists) {
          // Account already exists — try signing in with the provided credentials.
          // This handles sandbox testing (developer using their own email) and
          // partial-completion recovery (account created but invite not yet accepted).
          const signInResult = await authClient.signIn.email({ email, password })
          if (signInResult.error) {
            setError('An account already exists with this email. Check your password or sign in at /portal/login.')
            return
          }
          // Signed in — fall through to invite acceptance below.
        } else {
          setError(msg || 'Account creation failed. Please try again.')
          return
        }
      }

      // Step 2: Mark invite as accepted, set role=client, assign bot
      const res = await fetch('/api/invite/accept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      })

      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? 'Something went wrong. Please try again.')
        return
      }

      // Step 3: Sign out the signUp session (cached as role=developer), then
      // sign in fresh so the cookie cache is rebuilt with role=client from DB.
      await authClient.signOut()
      await authClient.signIn.email({ email, password })

      setState('success')
      router.push('/portal')
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
                <div className="relative">
                  <Input
                    id="password"
                    type={showPw ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 8 characters"
                    required
                    minLength={8}
                    className="border-[var(--hairline-strong)] bg-[var(--bg)] text-[var(--ink)] pr-10
                      placeholder:text-[var(--ink-faint)] focus-visible:ring-[var(--of-primary)]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(!showPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--ink-subtle)] hover:text-[var(--ink)] cursor-pointer"
                    aria-label={showPw ? 'Hide password' : 'Show password'}
                  >
                    {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {password.length > 0 && (
                  <div className="space-y-1">
                    <div className="flex gap-1">
                      {[1, 2, 3].map((level) => (
                        <div
                          key={level}
                          className={`h-1 flex-1 rounded-full transition-colors ${
                            level <= pwStrength ? strengthColor : 'bg-[var(--hairline)]'
                          }`}
                        />
                      ))}
                    </div>
                    <p className={`text-xs font-medium ${strengthText}`}>{strengthLabel}</p>
                  </div>
                )}
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
            <h1 className="text-lg font-semibold text-[var(--ink)] mb-3">You&apos;re all set!</h1>
            <div className="flex items-center justify-center gap-2 text-sm text-[var(--ink-muted)]">
              <Loader2 className="h-4 w-4 animate-spin text-[var(--of-primary)]" />
              Redirecting to your dashboard…
            </div>
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
