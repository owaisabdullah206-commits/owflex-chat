import { Resend } from 'resend'
import { BrevoClient } from '@getbrevo/brevo'

// Resend — auth, invites, critical system emails
// Free: 3,000/month · 100/day
// Fallback prevents a throw at module evaluation during `next build` (no env vars in Docker builder).
// Actual sends will fail with 401 if RESEND_API_KEY is not set at runtime.
export const resend = new Resend(process.env.RESEND_API_KEY ?? 'not-configured')

// Brevo — digest, usage nudges, marketing emails
// Free: 9,000/month · 300/day
export const brevo = new BrevoClient({
  apiKey: process.env.BREVO_API_KEY ?? '',
})

// RESEND_FROM_EMAIL env var = the verified sender address in your Resend dashboard
// e.g. "Octively <noreply@octively.com>"
export const RESEND_FROM = process.env.RESEND_FROM_EMAIL ?? 'Octively <noreply@octively.com>'

// Brevo senders — must be verified in Brevo dashboard → Senders & Domains
export const BREVO_SENDER  = { email: process.env.BREVO_FROM_EMAIL  ?? 'noreply@octively.com', name: 'Octively' }
export const DIGEST_SENDER = { email: process.env.BREVO_DIGEST_EMAIL ?? 'digest@octively.com',  name: 'Octively' }
