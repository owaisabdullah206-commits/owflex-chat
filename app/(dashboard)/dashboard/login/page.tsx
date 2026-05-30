'use client'
import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { authClient } from '@/lib/auth/client'
import Image from 'next/image'
import { OctivelyLogo } from '@/components/brand/OctivelyLogo'
import { AuthDemoPanel } from '@/components/dashboard/AuthDemoPanel'

function SessionExpiredBanner() {
  const searchParams = useSearchParams()
  if (searchParams.get('reason') !== 'expired') return null
  return (
    <div className="mb-5 flex items-start gap-2.5 rounded px-3 py-2.5 text-sm border border-amber-400/25 bg-amber-400/8 text-amber-400">
      <span className="mt-0.5 shrink-0 text-base leading-none">⚠</span>
      <span>Your session expired. Sign in to continue.</span>
    </div>
  )
}

export default function DashboardLoginPage() {
  const router = useRouter()
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [showPw,   setShowPw]   = useState(false)
  const [error,    setError]    = useState('')
  const [loading,  setLoading]  = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const result = await authClient.signIn.email({ email, password })
      if (result.error) {
        setError(result.error.message ?? 'Invalid email or password')
      } else {
        router.push('/dashboard/bots')
      }
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  async function handleGoogle() {
    await authClient.signIn.social({ provider: 'google', callbackURL: '/dashboard/bots' })
  }

  return (
    <div className="flex min-h-[calc(100vh-41px)]">

      {/* ── Left: animated product demo (desktop only) ──────────────────────── */}
      <div className="hidden lg:flex flex-1 items-center justify-center bg-[var(--surface-2)] border-r border-[var(--hairline)] px-12 py-12">
        <AuthDemoPanel />
      </div>

      {/* ── Right: form ────────────────────────────────────────────────────── */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-12 lg:px-12">
        <div className="w-full max-w-sm">

          {/* Logo */}
          <div className="mb-8">
            <div className="mb-5">
              <OctivelyLogo size={28} color="var(--of-primary)" wordmarkColor="var(--ink)" />
            </div>
            <h1 className="text-xl font-semibold text-[var(--ink)] tracking-tight">
              Sign in to your dashboard
            </h1>
            <p className="text-sm text-[var(--ink-muted)] mt-1">Manage your bots and clients</p>
          </div>

          {/* Form card */}
          <div className="bg-[var(--surface)] border border-[var(--hairline)] p-6">
            <Suspense>
              <SessionExpiredBanner />
            </Suspense>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Link
                    href="/dashboard/forgot-password"
                    className="text-xs text-[var(--ink-subtle)] hover:text-[var(--of-primary)] transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPw ? 'text' : 'password'}
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="pr-10"
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

              {error && <p className="text-sm text-[var(--of-error)]">{error}</p>}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Signing in…' : 'Sign in'}
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

            <Button type="button" variant="secondary" className="w-full flex items-center justify-center gap-2.5" onClick={handleGoogle}>
              <Image src="/Google-logo.svg.webp" alt="Google" width={18} height={18} unoptimized />
              Continue with Google
            </Button>
          </div>

          <p className="text-center text-sm text-[var(--ink-muted)] mt-5">
            Don&apos;t have an account?{' '}
            <Link href="/dashboard/signup" className="text-[var(--of-primary)] hover:underline font-medium">
              Sign up free →
            </Link>
          </p>
        </div>
      </div>


    </div>
  )
}
