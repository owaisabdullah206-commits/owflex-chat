import type { Config } from 'drizzle-kit'
import { readFileSync } from 'fs'

// drizzle-kit CLI doesn't load Next.js env files — load .env.local manually
try {
  const lines = readFileSync('.env.local', 'utf-8').split('\n')
  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eq = trimmed.indexOf('=')
    if (eq === -1) continue
    const key = trimmed.slice(0, eq).trim()
    const val = trimmed.slice(eq + 1).trim()
    if (key && !process.env[key]) process.env[key] = val
  }
} catch {
  // .env.local is optional (CI/CD sets env vars directly)
}

export default {
  schema: './lib/db/schema.ts',
  out: './lib/db/migrations',
  dialect: 'postgresql',
  dbCredentials: { url: process.env.DATABASE_URL! },
} satisfies Config
