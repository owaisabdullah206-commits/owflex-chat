// Robust base-URL resolution for absolute links in emails and redirects.
//
// Why this exists: `process.env.NEXT_PUBLIC_X ?? 'fallback'` only catches
// undefined/null — an EMPTY string slips through and produces hostless URLs
// like `http:///portal/invite?...`. NEXT_PUBLIC_* vars are also inlined at
// BUILD time, so if a Docker build doesn't receive them they bake in as "".
// These helpers treat empty/whitespace as missing, allow a non-public runtime
// override (PORTAL_URL / APP_URL — settable without a rebuild), and always
// return a valid origin with a host.

function clean(v: string | undefined | null): string | null {
  if (!v) return null
  const trimmed = v.trim().replace(/\/+$/, '')
  if (!trimmed) return null
  try {
    const u = new URL(trimmed)
    if (!u.host) return null
    return u.origin
  } catch {
    return null
  }
}

/** Admin dashboard base URL (admin.octively.com). */
export function getAppBaseUrl(): string {
  return (
    clean(process.env.NEXT_PUBLIC_APP_URL) ??
    clean(process.env.APP_URL) ??
    clean(process.env.BETTER_AUTH_URL) ??
    'https://admin.octively.com'
  )
}

/** Client portal base URL (app.octively.com) — used for invitation links. */
export function getPortalBaseUrl(): string {
  const explicit = clean(process.env.NEXT_PUBLIC_PORTAL_URL) ?? clean(process.env.PORTAL_URL)
  if (explicit) return explicit

  // No explicit portal URL — derive it from the app URL.
  const app = clean(process.env.NEXT_PUBLIC_APP_URL) ?? clean(process.env.APP_URL) ?? clean(process.env.BETTER_AUTH_URL)
  if (app) {
    try {
      const u = new URL(app)
      // Local dev: dashboard and portal share one origin.
      if (u.hostname === 'localhost' || u.hostname === '127.0.0.1') return u.origin
      // Production: swap the admin. subdomain for app.
      if (u.hostname.startsWith('admin.')) {
        u.hostname = 'app.' + u.hostname.slice('admin.'.length)
        return u.origin
      }
      return u.origin
    } catch {
      /* fall through */
    }
  }

  return 'https://app.octively.com'
}
