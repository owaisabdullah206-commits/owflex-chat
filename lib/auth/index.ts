import { betterAuth } from 'better-auth'
import { createAuthMiddleware } from 'better-auth/api'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { Redis } from '@upstash/redis'
import { eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import * as schema from '@/lib/db/schema'
import { sendWelcomeEmail } from '@/lib/email/welcome'
import { sendResetPasswordEmail } from '@/lib/email/reset-password'
import { sendVerificationEmail } from '@/lib/email/verify-email'

// Upstash-backed SecondaryStorage adapter for BetterAuth.
// Stores sessions and rate-limit counters in Redis so they survive across
// serverless function instances (Netlify/Vercel edge workers share nothing).
function makeSecondaryStorage() {
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    return undefined
  }
  const redis = new Redis({
    url:   process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  })
  return {
    async get(key: string) {
      return redis.get<string>(key)
    },
    async set(key: string, value: string, ttl?: number) {
      if (ttl) {
        await redis.set(key, value, { ex: ttl })
      } else {
        await redis.set(key, value)
      }
    },
    async delete(key: string) {
      await redis.del(key)
    },
  }
}

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema: {
      user:         schema.users,
      session:      schema.sessions,
      account:      schema.accounts,
      verification: schema.verifications,
    },
  }),

  user: {
    additionalFields: {
      role: {
        type: 'string' as const,
        required: true,
        defaultValue: 'developer',
        input: false,
      },
      // Buyer segment from the signup form (failure-mode #4: instrument which
      // segment converts). Optional — Google OAuth signups skip the form.
      segment: {
        type: 'string' as const,
        required: false,
        input: true,
      },
    },
  },

  emailVerification: {
    sendVerificationEmail: async ({ user, url }: { user: { email: string; name?: string | null }; url: string }) => {
      void sendVerificationEmail({ email: user.email, name: user.name ?? 'Developer', url })
    },
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    expiresIn: 3600,
  },

  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    sendResetPassword: async ({ user, url }: { user: { email: string }; url: string }) => {
      await sendResetPasswordEmail({ email: user.email, url })
    },
  },

  socialProviders: {
    google: {
      clientId:     process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },

  // Create an organization for every new developer account.
  // Client accounts are created via the invitation flow and skipped here.
  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          const u = user as { id: string; name?: string | null; email: string; role?: string }
          if (u.role && u.role !== 'developer') return

          // Don't create an org if this email has a pending invite (they're a client).
          const [pendingInvite] = await db
            .select({ id: schema.invitations.id })
            .from(schema.invitations)
            .where(eq(schema.invitations.email, u.email))
            .limit(1)

          if (!pendingInvite) {
            await db.insert(schema.organizations).values({
              ownerId: u.id,
              name: `${u.name ?? u.email.split('@')[0]}'s Workspace`,
              plan: 'free',
            })
          }

          // Google OAuth users are pre-verified — send welcome email immediately.
          // Email/password users get a combined welcome+verify email from sendVerificationEmail.
          const [account] = await db
            .select({ providerId: schema.accounts.providerId })
            .from(schema.accounts)
            .where(eq(schema.accounts.userId, u.id))
            .limit(1)
          const isOAuth = account?.providerId && account.providerId !== 'credential'
          if (isOAuth) {
            try {
              await sendWelcomeEmail({ name: u.name ?? 'Developer', email: u.email })
            } catch (err) {
              console.error('[auth] welcome email failed:', err)
            }
          }
        },
      },
    },
  },

  // Upstash Redis-backed storage so rate-limit counters and sessions are shared
  // across all serverless instances (Netlify/Vercel workers share no in-process memory).
  secondaryStorage: makeSecondaryStorage(),

  rateLimit: {
    enabled:  true,
    storage:  'secondary-storage',
    window:   60,   // 1-minute window
    max:      10,   // 10 requests per window per IP (default for all auth routes)
    customRules: {
      // Login: tighter — 5 attempts per minute per IP before lockout
      '/sign-in/email':    { window: 60, max: 5 },
      // Password reset: 3 requests per minute (limits reset-email spam)
      '/forget-password':  { window: 60, max: 3 },
      // Signup: 3 per minute (limits account-creation abuse)
      '/sign-up/email':    { window: 60, max: 3 },
    },
  },

  session: {
    // 5-minute cache: reduces DB load while keeping the stale-session window
    // short enough that a BETTER_AUTH_SECRET rotation clears sessions quickly.
    cookieCache: { enabled: true, maxAge: 60 * 5 },
  },

  // UI-hint cookie for the marketing site. octively.com has its OWN session cookie,
  // separate from admin./app. subdomains (see the note below), so it cannot read the
  // dashboard/portal session. On login we drop a tiny non-sensitive flag scoped to
  // .octively.com (oct_dev / oct_client) that the marketing nav reads to show the
  // right button; cleared on sign-out. It never carries the real session token.
  hooks: {
    after: createAuthMiddleware(async (ctx) => {
      try {
        const host = ctx.headers?.get('host') ?? ''
        // Only on the production octively.com domain family — the parent-domain
        // cookie is shared across subdomains there. Dev/preview hosts fall back to
        // useSession (same-origin), so we skip them.
        if (!host.endsWith('octively.com')) return
        const opts = {
          domain: '.octively.com',
          path: '/',
          sameSite: 'lax' as const,
          secure: true,
          httpOnly: false, // read by the marketing nav (UI hint only)
          maxAge: 60 * 60 * 24 * 30,
        }
        const newSession = ctx.context.newSession
        if (newSession) {
          const role = (newSession.user as { role?: string }).role === 'client' ? 'client' : 'developer'
          ctx.setCookie(role === 'client' ? 'oct_client' : 'oct_dev', '1', opts)
          return
        }
        if (ctx.path.startsWith('/sign-out')) {
          // Clear only the hint for the subdomain that signed out.
          ctx.setCookie(host.startsWith('app.') ? 'oct_client' : 'oct_dev', '', { ...opts, maxAge: 0 })
        }
      } catch (err) {
        console.error('[auth] hint-cookie hook failed:', err)
      }
    }),
  },

  // Each subdomain gets its own scoped session cookie (admin.octively.com vs app.octively.com).
  // Cross-subdomain sharing caused the admin session to be wiped when a client logged in on
  // app.octively.com — both surfaces wrote to the same .octively.com cookie.

  trustedOrigins: [
    // Production domains
    'https://octively.com',
    'https://admin.octively.com',
    'https://app.octively.com',
    // Vercel dev/preview
    'https://octively-chat.vercel.app',
    'https://octively.vercel.app',
    // Netlify pro/preview 
    'https://calm-gaufre-2c65d3.netlify.app',
    // Wildcard covers every preview deployment regardless of hash
    'https://octively-*-owaisabdullah206-1391s-projects.vercel.app',
    // Local dev
    'http://localhost:3000',
  ],
})

export type Session = typeof auth.$Infer.Session
export type User = typeof auth.$Infer.Session.user
