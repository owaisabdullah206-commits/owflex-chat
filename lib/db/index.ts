import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import type { NeonHttpDatabase } from 'drizzle-orm/neon-http'
import * as schema from './schema'

type DB = NeonHttpDatabase<typeof schema>

// Lazy singleton — neon() only called on first request, not at module load.
// This prevents build errors when DATABASE_URL is not set in the build env.
let _db: DB | undefined

function getDb(): DB {
  if (_db) return _db
  const sql = neon(process.env.DATABASE_URL!)
  _db = drizzle(sql, { schema })
  return _db
}

export const db = new Proxy({} as DB, {
  get: (_, prop: string | symbol) => getDb()[prop as keyof DB],
})

export { schema }
