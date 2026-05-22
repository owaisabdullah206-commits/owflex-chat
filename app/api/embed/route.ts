import { NextResponse } from 'next/server'
import { readFileSync } from 'fs'
import { join } from 'path'

// Canonical embed script endpoint — no .js extension so Vercel's CDN layer
// never intercepts this as a static asset; always reaches the Node function.
export async function GET() {
  const content = readFileSync(join(process.cwd(), 'embed', 'src', 'embed.js'), 'utf-8')
  return new NextResponse(content, {
    headers: {
      'Content-Type': 'application/javascript; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET',
    },
  })
}
