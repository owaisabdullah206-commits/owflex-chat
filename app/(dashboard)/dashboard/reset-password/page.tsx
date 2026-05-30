'use client'
import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { authClient } from '@/lib/auth/client'
import { OctivelyLogo } from '@/components/brand/OctivelyLogo'

function getStrength(pw: string): { score: number; label: string; color: string } {
  let score = 0
  if (pw.length >= 8) score++
  if (/[A-Z]/.test(pw)) score++
  if (/[a-z]/.test(pw)) score++
  if (/[0-9]/.test(pw)) score++
  if (/[^A-Za-z0-9]/.test(pw)) score++
  if (score <= 1) return { score, label: 'Weak', color: '#EF4444' }
  if (score === 2) return { score, label: 'Fair', color: '#F59E0B' }
  if (score === 3) return { score, label: 'Good', color: '#84CC16' }
  return { score, label: 'Strong', color: '#22C55E' }
}

function ResetForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token') ?? ''

  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const strength = getStrength(password)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }
    if (!token) {
      setError('Invalid or expired reset link. Please request a new one.')
      return
    }
    setLoading(true)
    try {
      const result = await authClient.resetPassword({ newPassword: password, token })
      if (result.error) {
        setError(result.error.message ?? 'Could not reset password. The link may have expired.')
      } else {
        setDone(true)
        setTimeout(() => router.push('/dashboard/login'), 3000)
      }
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (!token) {
    return (
      <div className="text-center space-y-3">
        <p className="text-sm text-[var(--of-error)]">
          Invalid or missing reset token.
        </p>
        <Link href="/dashboard/forgot-password" className="text-sm text-[var(--of-primary)] hover:underline">
          Request a new reset link →
        </Link>
      </div>
    )
  }

  if (done) {
    return (
      <div className="text-center space-y-4">
        <div className="w-10 h-10 rounded-full bg-[var(--of-primary)]/10 border border-[var(--of-primary)]/30 flex items-center justify-center mx-auto">
          <span className="text-[var(--of-primary)] text-lg">✓</span>
        </div>
        <p className="text-sm text-[var(--ink-muted)] leading-relaxed">
          Password updated. Redirecting to sign in…
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="password">New password</Label>
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

        {/* Strength meter */}
        {password.length > 0 && (
          <div className="space-y-1 pt-0.5">
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((seg) => (
                <div
                  key={seg}
                  className="h-1 flex-1 rounded-full transition-colors duration-200"
                  style={{
                    background: seg <= strength.score ? strength.color : 'var(--surface-2)',
                  }}
                />
              ))}
            </div>
            <p className="text-[11px]" style={{ color: strength.color, fontFamily: 'var(--font-mono)' }}>
              {strength.label}
            </p>
          </div>
        )}
      </div>

      {error && (
        <p className="text-sm text-[var(--of-error)]">{error}</p>
      )}

      <Button type="submit" className="w-full" disabled={loading || password.length < 8}>
        {loading ? 'Updating…' : 'Set new password'}
      </Button>
    </form>
  )
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="mb-6">
            <OctivelyLogo size={28} color="var(--of-primary)" wordmarkColor="var(--ink)" />
          </div>
          <h1 className="text-xl font-semibold text-[var(--ink)]">Choose a new password</h1>
          <p className="text-sm text-[var(--ink-muted)] mt-1">Pick something strong and unique</p>
        </div>

        <div className="bg-[var(--surface)] border border-[var(--hairline)] p-6">
          <Suspense fallback={<p className="text-sm text-[var(--ink-muted)]">Loading…</p>}>
            <ResetForm />
          </Suspense>
        </div>

        <p className="text-center text-sm text-[var(--ink-muted)] mt-5">
          <Link href="/dashboard/login" className="text-[var(--primary-text)] hover:underline font-medium">
            ← Back to sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
