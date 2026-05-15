import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { db } from '@/lib/db'
import * as schema from '@/lib/db/schema'

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

  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
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
          if (!u.role || u.role === 'developer') {
            await db.insert(schema.organizations).values({
              ownerId: u.id,
              name: `${u.name ?? u.email.split('@')[0]}'s Workspace`,
              plan: 'free',
            })
          }
        },
      },
    },
  },

  session: {
    cookieCache: { enabled: true, maxAge: 60 * 60 * 24 * 7 },
  },

  trustedOrigins: [
    'https://owflex-chat.vercel.app',
    'https://owflex-chat-m70j5jsag-owaisabdullah206-1391s-projects.vercel.app',
    'https://admin.owflex.com',
    'https://app.owflex.com',
    'http://localhost:3000',
  ],
})

export type Session = typeof auth.$Infer.Session
export type User = typeof auth.$Infer.Session.user
