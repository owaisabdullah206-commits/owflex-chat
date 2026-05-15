import { NextRequest, NextResponse } from 'next/server'

export function proxy(req: NextRequest) {
  const host = req.headers.get('host') ?? ''
  const url = req.nextUrl.clone()

  if (host.startsWith('admin.')) {
    url.pathname = `/dashboard${url.pathname}`
    return NextResponse.rewrite(url)
  }

  if (host.startsWith('app.')) {
    url.pathname = `/portal${url.pathname}`
    return NextResponse.rewrite(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next|_static|favicon.ico).*)'],
}
