'use client'

import { Suspense, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Eye, EyeOff } from 'lucide-react'
import { authClient } from '@/lib/auth/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

function LoginContent() {
  const searchParams = useSearchParams()
  const notClient = searchParams.get('error') === 'not-client'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setPending(true)

    try {
      const result = await authClient.signIn.email({ email, password })
      if (result.error) {
        const msg = result.error.message ?? ''
        const isCredErr = msg.toLowerCase().includes('invalid') || msg.toLowerCase().includes('credential')
        setError(
          isCredErr
            ? 'Email or password is incorrect. If you signed in with Google, use the button below.'
            : (msg || 'Sign in failed. Please try again.')
        )
      } else {
        router.push('/portal')
      }
    } catch {
      setError('Sign in failed. Please try again.')
    } finally {
      setPending(false)
    }
  }

  async function handleGoogle() {
    await authClient.signIn.social({ provider: 'google', callbackURL: '/portal' })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[var(--bg)] to-[var(--surface)] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Branding */}
        <div className="text-center mb-8">
          <p className="text-[10px] font-medium uppercase tracking-widest text-[var(--ink-subtle)] mb-4">
            Powered by OwFlex
          </p>
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-[var(--of-primary)] flex items-center justify-center shadow-sm">
              <span className="text-white text-sm font-bold">O</span>
            </div>
          </div>
          <h1 className="text-2xl font-bold text-[var(--ink)]">Client Portal</h1>
          <p className="text-sm text-[var(--ink-muted)] mt-1.5">
            Sign in to view your conversations and leads
          </p>
        </div>

        {notClient && (
          <div className="mb-4 rounded-lg bg-amber-500/10 border border-amber-500/20 px-4 py-3 text-sm text-amber-400">
            This portal is for clients only.{' '}
            <a href="/dashboard/login" className="underline font-medium">
              Developer dashboard →
            </a>
          </div>
        )}

        {/* Card with teal top accent */}
        <div className="bg-[var(--surface)] rounded-xl border border-[var(--hairline)] shadow-sm overflow-hidden">
          <div className="h-0.5 bg-[var(--of-primary)]" />
          <div className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-sm font-medium text-[var(--ink)]">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  autoComplete="email"
                  className="border-[var(--hairline-strong)] bg-[var(--bg)] text-[var(--ink)]
                    placeholder:text-[var(--ink-faint)] focus-visible:ring-[var(--of-primary)]"
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
                    placeholder="••••••••"
                    required
                    autoComplete="current-password"
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
              </div>

              {error && (
                <p className="text-sm text-[var(--of-error)] rounded-lg bg-[var(--of-error-soft)] px-3 py-2">
                  {error}
                </p>
              )}

              <Button type="submit" className="w-full" disabled={pending}>
                {pending ? 'Signing in…' : 'Sign in'}
              </Button>
            </form>

            <div className="relative my-5">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[var(--hairline)]" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-[var(--surface)] px-2 text-[var(--ink-subtle)]">or</span>
              </div>
            </div>

            <Button type="button" variant="secondary" className="w-full" onClick={handleGoogle}>
              Continue with Google
            </Button>

            <p className="text-xs text-center text-[var(--ink-faint)] mt-5">
              Access is by invitation only
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function PortalLoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center">
        <p className="text-[var(--ink-muted)] text-sm">Loading…</p>
      </div>
    }>
      <LoginContent />
    </Suspense>
  )
}
