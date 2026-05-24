// app/proxy.ts — Next.js 16 replaces middleware.ts with proxy.ts
// Subdomain routing: admin.octively.com → /dashboard, app.octively.com → /portal
import { NextRequest, NextResponse } from 'next/server'

export function proxy(request: NextRequest) {
  const host = request.headers.get('host') ?? ''
  const url  = request.nextUrl.clone()

  if (host.startsWith('admin.')) {
    // admin.octively.com → /dashboard/*
    if (
      !url.pathname.startsWith('/dashboard') &&
      !url.pathname.startsWith('/api') &&
      !url.pathname.startsWith('/_next')
    ) {
      url.pathname = `/dashboard${url.pathname === '/' ? '' : url.pathname}`
      return NextResponse.rewrite(url)
    }
  } else if (host.startsWith('app.')) {
    // app.octively.com → /portal/*
    if (
      !url.pathname.startsWith('/portal') &&
      !url.pathname.startsWith('/api') &&
      !url.pathname.startsWith('/_next')
    ) {
      url.pathname = `/portal${url.pathname === '/' ? '' : url.pathname}`
      return NextResponse.rewrite(url)
    }
  }

  // octively.com → marketing (no rewrite)
  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon\\.ico|icon\\.svg).*)'],
}
