'use client'
import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { authClient } from '@/lib/auth/client'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const result = await authClient.requestPasswordReset({
        email,
        redirectTo: `${window.location.origin}/dashboard/reset-password`,
      })
      if (result.error) {
        setError(result.error.message ?? 'Could not send reset email. Please try again.')
      } else {
        setSent(true)
      }
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-6">
            <div className="w-7 h-7 bg-[var(--of-primary)] flex items-center justify-center">
              <span className="text-white text-sm font-bold">O</span>
            </div>
            <span className="text-[var(--ink)] font-semibold text-lg tracking-tight">Octively</span>
          </div>
          <h1 className="text-xl font-semibold text-[var(--ink)]">Reset your password</h1>
          <p className="text-sm text-[var(--ink-muted)] mt-1">
            {sent ? "Check your inbox" : "Enter your email and we'll send a reset link"}
          </p>
        </div>

        <div className="bg-[var(--surface)] border border-[var(--hairline)] p-6">
          {sent ? (
            <div className="text-center space-y-4">
              <div
                className="w-10 h-10 rounded-full bg-[var(--of-primary)]/10 border border-[var(--of-primary)]/30 flex items-center justify-center mx-auto"
              >
                <span className="text-[var(--of-primary)] text-lg">✓</span>
              </div>
              <p className="text-sm text-[var(--ink-muted)] leading-relaxed">
                If <span className="text-[var(--ink)] font-medium">{email}</span> is linked to an account,
                you'll receive a reset link within a few minutes.
              </p>
              <p className="text-xs text-[var(--ink-subtle)]">
                Don't see it? Check your spam folder.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email">Email address</Label>
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

              {error && (
                <p className="text-sm text-[var(--of-error)]">{error}</p>
              )}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Sending…' : 'Send reset link'}
              </Button>
            </form>
          )}
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
