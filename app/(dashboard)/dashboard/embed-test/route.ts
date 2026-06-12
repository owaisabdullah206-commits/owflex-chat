import { NextRequest } from 'next/server'

export async function GET(req: NextRequest) {
  const key    = req.nextUrl.searchParams.get('key') ?? ''
  const origin = new URL(req.url).origin

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Bot Preview</title>
  <style>
    *{box-sizing:border-box}
    body{margin:0;background:#f1f5f9;min-height:100vh;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:8px;font-family:system-ui,-apple-system,sans-serif}
    .hint{color:#94a3b8;font-size:13px;margin:0}
    .key{font-family:monospace;font-size:11px;color:#64748b;background:#e2e8f0;padding:2px 8px;border-radius:4px}
  </style>
</head>
<body>
  <p class="hint">Click the chat bubble to test your bot</p>
  <span class="key">${key ? key.slice(0, 16) + '…' : 'No embed key provided'}</span>
  ${key ? `<script src="${origin}/embed.js" data-key="${key}"></script>` : ''}
</body>
</html>`

  return new Response(html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  })
}
