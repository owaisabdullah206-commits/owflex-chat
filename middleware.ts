import { NextRequest, NextResponse } from 'next/server'

// Matches all Vercel preview deployments for this project regardless of deployment hash
const VERCEL_PREVIEW_RE =
  /^https:\/\/owflex-chat-[a-z0-9]+-owaisabdullah206-1391s-projects\.vercel\.app$/

const ALWAYS_ALLOWED = new Set([
  'https://owflex-chat.vercel.app',
  'https://admin.owflex.com',
  'https://app.owflex.com',
  'http://localhost:3000',
])

function isAllowedOrigin(origin: string | null): boolean {
  if (!origin) return false
  return ALWAYS_ALLOWED.has(origin) || VERCEL_PREVIEW_RE.test(origin)
}

const CORS_HEADERS = {
  'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Credentials': 'true',
  'Access-Control-Max-Age': '86400',
}

export function middleware(req: NextRequest) {
  const origin = req.headers.get('origin')

  if (!isAllowedOrigin(origin)) {
    return NextResponse.next()
  }

  // Handle CORS preflight — return early so BetterAuth never sees it
  if (req.method === 'OPTIONS') {
    return new NextResponse(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': origin!,
        ...CORS_HEADERS,
      },
    })
  }

  // Pass through to BetterAuth; attach origin header to the response
  const res = NextResponse.next()
  res.headers.set('Access-Control-Allow-Origin', origin!)
  res.headers.set('Access-Control-Allow-Credentials', 'true')
  return res
}

export const config = {
  matcher: '/api/auth/:path*',
}
