import { NextResponse } from 'next/server'
import { readFileSync } from 'fs'
import { join } from 'path'

// Serve the embed widget script with cross-origin headers.
// This route takes precedence over public/embed.js (App Router > public).
export async function GET() {
  const content = readFileSync(join(process.cwd(), 'embed', 'src', 'embed.js'), 'utf-8')
  return new NextResponse(content, {
    headers: {
      'Content-Type': 'application/javascript; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
      'Access-Control-Allow-Origin': '*',
    },
  })
}
