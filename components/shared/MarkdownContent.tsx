'use client'

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

/**
 * Renders markdown content from bot messages.
 * Handles bold, italic, bullet lists, numbered lists, links, and line breaks.
 * Safe — no dangerouslySetInnerHTML; react-markdown uses a virtual DOM.
 */
export function MarkdownContent({
  content,
  className,
}: {
  content: string
  className?: string
}) {
  return (
    <div className={className}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // Paragraphs — no extra margin inside chat bubbles
          p: ({ children }) => <p className="mb-1 last:mb-0">{children}</p>,
          // Bold
          strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
          // Italic
          em: ({ children }) => <em className="italic">{children}</em>,
          // Bullet lists
          ul: ({ children }) => <ul className="list-disc list-inside mb-1 space-y-0.5">{children}</ul>,
          // Numbered lists
          ol: ({ children }) => <ol className="list-decimal list-inside mb-1 space-y-0.5">{children}</ol>,
          li: ({ children }) => <li className="text-sm">{children}</li>,
          // Links — open in new tab, inherit color from bubble
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-2 opacity-80 hover:opacity-100"
            >
              {children}
            </a>
          ),
          // Inline code
          code: ({ children }) => (
            <code className="px-1 py-0.5 rounded text-[0.8em] bg-black/10 font-mono">{children}</code>
          ),
          // Horizontal rule
          hr: () => <hr className="my-2 opacity-20" />,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}
