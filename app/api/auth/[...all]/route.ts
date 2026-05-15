import { auth } from '@/lib/auth'
import { toNextJsHandler } from 'better-auth/next-js'
import type { NextRequest } from 'next/server'

const betterAuthHandler = toNextJsHandler(auth)

const ALLOWED_ORIGINS = new Set([
  'https://owflex-chat.vercel.app',
  'https://admin.owflex.com',
  'https://app.owflex.com',
  'http://localhost:3000',
])

// Matches all preview deployments for this project regardless of deployment hash
const PREVIEW_RE =
  /^https:\/\/owflex-chat-[a-z0-9]+-owaisabdullah206-1391s-projects\.vercel\.app$/

function getCorsOrigin(req: NextRequest): string | null {
  const origin = req.headers.get('origin')
  if (!origin) return null
  return ALLOWED_ORIGINS.has(origin) || PREVIEW_RE.test(origin) ? origin : null
}

function withCors(res: Response, origin: string | null): Response {
  if (!origin) return res
  const next = new Response(res.body, res)
  next.headers.set('Access-Control-Allow-Origin', origin)
  next.headers.set('Access-Control-Allow-Credentials', 'true')
  return next
}

export async function OPTIONS(req: NextRequest) {
  const origin = getCorsOrigin(req)
  if (!origin) return new Response(null, { status: 403 })
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Max-Age': '86400',
    },
  })
}

type Ctx = { params: Promise<{ all: string[] }> }

export async function GET(req: NextRequest, ctx: Ctx) {
  return withCors(await betterAuthHandler.GET(req, ctx), getCorsOrigin(req))
}

export async function POST(req: NextRequest, ctx: Ctx) {
  return withCors(await betterAuthHandler.POST(req, ctx), getCorsOrigin(req))
}
