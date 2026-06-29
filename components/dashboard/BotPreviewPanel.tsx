'use client'

import { useEffect, useState } from 'react'
import { ExternalLink, RefreshCw } from 'lucide-react'

interface BotPreviewPanelProps {
  embedKey: string
  botName: string
}

export function BotPreviewPanel({ embedKey, botName }: BotPreviewPanelProps) {
  const [srcDoc, setSrcDoc] = useState('')
  const [key, setKey] = useState(0) // bump to force iframe reload

  function buildSrcDoc(origin: string) {
    return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Agent Preview</title>
    <style>
      *{box-sizing:border-box}
      body{margin:0;background:#f1f5f9;font-family:system-ui,-apple-system,sans-serif;min-height:100vh;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:8px}
      .hint{color:#94a3b8;font-size:12px;text-align:center;padding:0 24px;line-height:1.6}
      .label{font-size:11px;font-family:monospace;background:#e2e8f0;color:#475569;padding:2px 8px;border-radius:4px;margin-bottom:4px;display:inline-block}
    </style>
  </head>
  <body>
    <span class="label">${embedKey.slice(0, 16)}…</span>
    <div class="hint">Widget will open automatically.<br>Messages here are real and appear in Analytics.</div>
    <script src="${origin}/embed.js" data-key="${embedKey}" defer></script>
    <script>
      window.addEventListener('load',function(){
        var btn=document.getElementById('ob');
        if(btn)setTimeout(function(){btn.click();},500);
      });
    </script>
  </body>
</html>`
  }

  useEffect(() => {
    setSrcDoc(buildSrcDoc(window.location.origin))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [embedKey, key])

  return (
    <div className="space-y-4">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <div>
          <p
            className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--ink-subtle)]"
            style={{ fontFamily: 'var(--font-mono)' }}
          >
            agent · {botName}
          </p>
          <p className="text-xs text-[var(--ink-muted)] mt-0.5">
            Live widget running with your actual embed key. Conversations are real.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setKey(k => k + 1)}
            className="flex items-center gap-1.5 px-3 h-7 border border-[var(--hairline)] bg-[var(--surface-2)] hover:bg-[var(--surface)] text-[11px] text-[var(--ink-muted)] hover:text-[var(--ink)] transition-colors"
            style={{ fontFamily: 'var(--font-mono)' }}
          >
            <RefreshCw size={11} />
            reset
          </button>
          <a
            href={`/embed-test?key=${embedKey}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 h-7 border border-[var(--of-primary)]/30 bg-[var(--of-primary)]/10 hover:bg-[var(--of-primary)]/15 text-[11px] text-[var(--of-primary)] transition-colors"
            style={{ fontFamily: 'var(--font-mono)' }}
          >
            <ExternalLink size={11} />
            open in tab
          </a>
        </div>
      </div>

      {/* Iframe */}
      <div
        className="border border-[var(--hairline)] bg-[var(--surface)] overflow-hidden relative"
        style={{ height: 560 }}
      >
        {srcDoc ? (
          <iframe
            key={key}
            srcDoc={srcDoc}
            title={`Preview: ${botName}`}
            style={{ width: '100%', height: '100%', border: 'none', display: 'block' }}
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs text-[var(--ink-subtle)]" style={{ fontFamily: 'var(--font-mono)' }}>
              loading…
            </span>
          </div>
        )}
      </div>

      {/* Footer note */}
      <p className="text-[11px] text-[var(--ink-subtle)]" style={{ fontFamily: 'var(--font-mono)' }}>
        ⚠ widget auto-opens · messages consume credits · use reset to start a fresh session
      </p>
    </div>
  )
}
