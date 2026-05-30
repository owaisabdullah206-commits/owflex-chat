'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { authClient } from '@/lib/auth/client'
import Image from 'next/image'
import { OctivelyLogo } from '@/components/brand/OctivelyLogo'
import { AuthDemoPanel } from '@/components/dashboard/AuthDemoPanel'

function getStrength(pw: string): { score: number; label: string; color: string } {
  let score = 0
  if (pw.length >= 8) score++
  if (/[A-Z]/.test(pw)) score++
  if (/[a-z]/.test(pw)) score++
  if (/[0-9]/.test(pw)) score++
  if (/[^A-Za-z0-9]/.test(pw)) score++
  if (score <= 1) return { score, label: 'Weak',   color: '#EF4444' }
  if (score === 2) return { score, label: 'Fair',   color: '#F59E0B' }
  if (score === 3) return { score, label: 'Good',   color: '#84CC16' }
  return            { score, label: 'Strong', color: '#22C55E' }
}

export default function DashboardSignupPage() {
  const router = useRouter()
  const [name,     setName]     = useState('')
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [showPw,   setShowPw]   = useState(false)
  const [error,    setError]    = useState('')
  const [loading,  setLoading]  = useState(false)

  const strength = getStrength(password)

  async function handleGoogle() {
    await authClient.signIn.social({ provider: 'google', callbackURL: '/dashboard/bots' })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }
    setLoading(true)
    try {
      const result = await authClient.signUp.email({ name, email, password })
      if (result.error) {
        setError(result.error.message ?? 'Could not create account')
      } else {
        router.push('/dashboard/bots')
      }
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-41px)]">

      {/* ── Left: form ─────────────────────────────────────────────────────── */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-12 lg:px-12">
        <div className="w-full max-w-sm">

          {/* Logo */}
          <div className="mb-8">
            <div className="mb-5">
              <OctivelyLogo size={28} color="var(--of-primary)" wordmarkColor="var(--ink)" />
            </div>
            <h1 className="text-xl font-semibold text-[var(--ink)] tracking-tight">
              Create your free account
            </h1>
            <p className="text-sm text-[var(--ink-muted)] mt-1">
              Start managing AI chatbots for your clients
            </p>
          </div>

          {/* Form card */}
          <div className="bg-[var(--surface)] border border-[var(--hairline)] p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="name">Full name</Label>
                <Input
                  id="name"
                  type="text"
                  autoComplete="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  required
                />
              </div>
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
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPw ? 'text' : 'password'}
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min. 8 characters"
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

                {/* Password strength meter */}
                {password.length > 0 && (
                  <div className="space-y-1 pt-0.5">
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((seg) => (
                        <div
                          key={seg}
                          className="h-1 flex-1 rounded-full transition-colors duration-200"
                          style={{ background: seg <= strength.score ? strength.color : 'var(--surface-2)' }}
                        />
                      ))}
                    </div>
                    <p className="text-[11px]" style={{ color: strength.color, fontFamily: 'var(--font-mono)' }}>
                      {strength.label}
                    </p>
                  </div>
                )}
              </div>

              {error && <p className="text-sm text-[var(--of-error)]">{error}</p>}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Creating account…' : 'Create free account'}
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
            Already have an account?{' '}
            <Link href="/dashboard/login" className="text-[var(--of-primary)] hover:underline font-medium">
              Sign in →
            </Link>
          </p>
        </div>
      </div>

      {/* ── Right: animated product demo (desktop only) ─────────────────────── */}
      <div className="hidden lg:flex flex-1 items-center justify-center bg-[var(--surface-2)] border-l border-[var(--hairline)] px-12 py-12">
        <AuthDemoPanel />
      </div>

    </div>
  )
}
