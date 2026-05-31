import { betterAuth } from 'better-auth'
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

  // Share the session cookie across all three Octively subdomains in production.
  // On Vercel previews (octively.vercel.app), NEXT_PUBLIC_APP_URL doesn't contain
  // 'admin.octively.com', so we skip this to avoid breaking preview auth.
  ...((process.env.NEXT_PUBLIC_APP_URL ?? '').includes('admin.octively.com') ? {
    advanced: {
      crossSubDomainCookies: { enabled: true, domain: 'octively.com' },
    },
  } : {}),

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
