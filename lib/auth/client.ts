'use client'
import { createAuthClient } from 'better-auth/react'

// No baseURL — BetterAuth defaults to the current origin, so every
// deployment (production or preview) calls its own /api/auth/* endpoint.
// This eliminates cross-origin auth requests entirely.
export const authClient = createAuthClient()

export const { signIn, signUp, signOut, useSession } = authClient
