// proxy.ts — Next.js 16 root-level routing proxy (converted to Netlify Edge Function by @netlify/plugin-nextjs)
// Subdomain routing: admin.octively.com → /dashboard, app.octively.com → /portal
// Main domain redirect: octively.com/dashboard/* → admin.octively.com/*, octively.com/portal/* → app.octively.com/*
import { NextRequest, NextResponse } from 'next/server'

const ADMIN_ORIGIN = 'https://admin.octively.com'
const PORTAL_ORIGIN = 'https://app.octively.com'

export function proxy(request: NextRequest) {
  const host = request.headers.get('host') ?? ''
  const url  = request.nextUrl.clone()

  // Static public assets (e.g. /google-logo.png, /robots.txt) live at the app
  // root, not under /dashboard or /portal. Without this guard the subdomain
  // rewrites prefix them (/dashboard/google-logo.png → 404), so any public file
  // referenced by an absolute path breaks on admin/app. Skip anything with a
  // file extension in its last path segment.
  const isStaticAsset = /\.[a-zA-Z0-9]+$/.test(url.pathname)

  if (host.startsWith('admin.')) {
    // admin.octively.com → /dashboard/*
    // Guard: only rewrite if the path doesn't already start with /dashboard.
    // Without this guard, /dashboard/login rewrites to /dashboard/dashboard/login → 404.
    if (
      !url.pathname.startsWith('/dashboard') &&
      !url.pathname.startsWith('/api') &&
      !url.pathname.startsWith('/_next') &&
      !isStaticAsset
    ) {
      url.pathname = `/dashboard${url.pathname === '/' ? '' : url.pathname}`
      return NextResponse.rewrite(url)
    }
  } else if (host.startsWith('app.')) {
    // app.octively.com → /portal/*
    if (
      !url.pathname.startsWith('/portal') &&
      !url.pathname.startsWith('/api') &&
      !url.pathname.startsWith('/_next') &&
      !isStaticAsset
    ) {
      url.pathname = `/portal${url.pathname === '/' ? '' : url.pathname}`
      return NextResponse.rewrite(url)
    }
  } else if (host === 'octively.com') {
    // Main production domain: redirect /dashboard/* and /portal/* to their canonical subdomains.
    // Preserves query strings. Skips /api/* (OAuth callbacks) and /_next/* (assets).
    if (!url.pathname.startsWith('/api') && !url.pathname.startsWith('/_next')) {
      // Bare /signup and /login are aliases for the developer auth pages.
      // Send them to the canonical admin URLs so they never resolve to a stale
      // or missing marketing route.
      if (url.pathname === '/signup' || url.pathname === '/login') {
        return NextResponse.redirect(new URL(url.pathname + url.search, ADMIN_ORIGIN))
      }
      if (url.pathname.startsWith('/dashboard')) {
        const cleanPath = url.pathname.slice('/dashboard'.length) || '/'
        return NextResponse.redirect(new URL(cleanPath + url.search, ADMIN_ORIGIN))
      }
      if (url.pathname.startsWith('/portal')) {
        const cleanPath = url.pathname.slice('/portal'.length) || '/'
        return NextResponse.redirect(new URL(cleanPath + url.search, PORTAL_ORIGIN))
      }
    }
  }

  // octively.com (non-dashboard/portal paths) → marketing site
  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon\\.ico|icon\\.svg).*)'],
}
