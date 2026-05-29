'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowRight, Copy, Check as CheckIcon } from 'lucide-react'
import { MarketingNav } from './MarketingNav'
import MarketingFooter from './MarketingFooter'
import { useDarkMode } from './useDarkMode'
import { OctivelyButton } from '@/components/brand/OctivelyButton'
import { JsonLd } from '@/components/shared/JsonLd'

// FAQ content — also used to build the FAQPage JSON-LD below.
const FAQ_ITEMS = [
  {
    q: 'Do I need to know how to code to use Octively?',
    a: 'No. You build, train, and manage AI chatbots entirely through a visual dashboard — no coding required. The only technical step is adding a one-line embed script to your client\'s website, and step-by-step guides plus video walkthroughs cover every platform.',
  },
  {
    q: 'Which website platforms does the embed work on?',
    a: 'The embed script works on any website — WordPress, Webflow, Shopify, Wix, Squarespace, and plain HTML sites. You paste one script tag before the closing body tag, or use the platform\'s custom-code / footer section.',
  },
  {
    q: 'How long does setup take?',
    a: 'Under five minutes. Create an account, build a bot and pick an AI model, copy the embed script onto your client\'s site, and invite the client to their portal. No servers or infrastructure to configure.',
  },
  {
    q: 'How do my clients log in to their portal?',
    a: 'You invite each client by email from the Clients page. They receive a link to set a password, then log into their own branded portal where they can view their chatbot\'s conversations, captured leads, and analytics.',
  },
  {
    q: 'Can I customise the widget appearance?',
    a: 'Yes. Bot settings let you change the accent colour, widget position, and greeting message. On Agency and higher plans you can upload a custom logo and fully white-label the client portal.',
  },
  {
    q: 'How are credits consumed?',
    a: 'Each AI response costs credits proportional to the length of the conversation. Credits are deducted before each call. Your monthly plan includes a credit allowance, and additional packs are available on the Billing page.',
  },
]

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: FAQ_ITEMS.map(({ q, a }) => ({
    '@type': 'Question',
    name: q,
    acceptedAnswer: { '@type': 'Answer', text: a },
  })),
}

const SIDEBAR = [
  { id: 'getting-started', label: 'Getting started' },
  { id: 'embed-guide', label: 'Embed guide' },
  { id: 'api', label: 'API reference' },
  { id: 'models', label: 'AI models' },
  { id: 'faq', label: 'FAQ' },
]

const EMBED_SNIPPET = `<script
  src="https://app.octively.com/embed.js"
  data-bot-key="bot_XXXXXXXXXXXX"
  defer
></script>`

const API_ENDPOINTS = [
  { method: 'GET', path: '/api/v1/bots', desc: 'List all bots in your workspace' },
  { method: 'GET', path: '/api/v1/bots/:id', desc: 'Get a single bot by ID' },
  { method: 'GET', path: '/api/v1/bots/:id/conversations', desc: 'List conversations for a bot' },
  { method: 'GET', path: '/api/v1/bots/:id/leads', desc: 'List captured leads for a bot' },
  { method: 'POST', path: '/api/v1/bots/:id/message', desc: 'Send a message via a bot (server-side)' },
  { method: 'GET', path: '/api/v1/usage', desc: 'Get credit usage for the current billing period' },
]

export default function GuidePage() {
  const { dark, toggleDark } = useDarkMode()
  const [copied, setCopied] = useState(false)

  function copySnippet() {
    navigator.clipboard.writeText(EMBED_SNIPPET).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div className={`marketing${dark ? ' dark' : ''}`} style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--ink)' }}>
      <JsonLd schema={faqSchema} />
      <MarketingNav dark={dark} onToggleDark={toggleDark} />

      <div className="mkt-legal-grid" style={{ maxWidth: 1200, margin: '0 auto', padding: '48px 24px 80px', display: 'grid', gridTemplateColumns: '210px 1fr', gap: 56, alignItems: 'start' }}>

        {/* Sidebar */}
        <nav className="mkt-legal-sidebar" style={{ position: 'sticky', top: 88 }}>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--ink-subtle)', marginBottom: 12 }}>Documentation</p>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
            {SIDEBAR.map(({ id, label }) => (
              <li key={id}>
                <a
                  href={`#${id}`}
                  style={{
                    display: 'block', padding: '6px 10px', fontSize: 13.5,
                    color: 'var(--ink-muted)', textDecoration: 'none', borderRadius: 6,
                  }}
                >
                  {label}
                </a>
              </li>
            ))}
          </ul>
          <div style={{ marginTop: 32, padding: '16px', border: '1px solid var(--hairline)', borderRadius: 10, background: 'var(--surface-2)' }}>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--ink-subtle)', marginBottom: 10 }}>Get started</p>
            <Link
              href="/dashboard/signup"
              style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--of-primary)', textDecoration: 'none', fontWeight: 500 }}
            >
              Create free account <ArrowRight size={12} />
            </Link>
          </div>
        </nav>

        {/* Main content */}
        <div style={{ maxWidth: 720, minWidth: 0 }}>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--of-primary)', marginBottom: 8 }}>v1.1.0</p>
          <h1 style={{ fontSize: 38, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 12 }}>Octively Developer Docs</h1>
          <p style={{ fontSize: 16, color: 'var(--ink-muted)', lineHeight: 1.65, marginBottom: 48 }}>
            Everything you need to add a client chatbot portal to your project — from embed script to API calls.
          </p>

          <DocSection id="getting-started" title="Getting started">
            <p style={{ fontSize: 14.5, color: 'var(--ink-muted)', lineHeight: 1.7, marginBottom: 24 }}>Four steps from zero to a fully working client portal:</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {[
                { n: '01', title: 'Create an account', body: 'Sign up at Octively.com — free plan, no card required. A workspace is created automatically.' },
                { n: '02', title: 'Create your first bot', body: 'Go to Dashboard → Bots → New bot. Give it a name and choose an AI model. Save to get your embed key.' },
                { n: '03', title: 'Add the embed script', body: 'Copy the <script> tag from the bot settings page and paste it before the </body> tag on your client\'s site.' },
                { n: '04', title: 'Invite the client', body: 'Go to Clients → Invite. Enter your client\'s email. They get a link to set a password and access their portal.' },
              ].map(({ n, title, body }) => (
                <div key={n} style={{ display: 'flex', gap: 16, padding: '20px', border: '1px solid var(--hairline)', borderRadius: 10, background: 'var(--surface)' }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--of-primary)', fontWeight: 600, flexShrink: 0 }}>{n}</span>
                  <div>
                    <p style={{ fontWeight: 600, fontSize: 15, marginBottom: 6 }}>{title}</p>
                    <p style={{ fontSize: 14, color: 'var(--ink-muted)', margin: 0, lineHeight: 1.6 }}>{body}</p>
                  </div>
                </div>
              ))}
            </div>
          </DocSection>

          <DocSection id="embed-guide" title="Embed guide">
            <p style={{ fontSize: 14.5, color: 'var(--ink-muted)', lineHeight: 1.7, marginBottom: 20 }}>
              Add the following script to any HTML page. Replace <code style={{ fontFamily: 'var(--font-mono)', fontSize: 12, background: 'var(--surface-2)', padding: '1px 5px', borderRadius: 3 }}>bot_XXXX</code> with your bot&apos;s embed key from the Dashboard.
            </p>
            <div style={{ position: 'relative', border: '1px solid var(--hairline)', borderRadius: 10, background: 'var(--surface-2)', overflow: 'hidden' }}>
              <pre style={{ fontFamily: 'var(--font-mono)', fontSize: 13, padding: '20px 24px', margin: 0, overflowX: 'auto', lineHeight: 1.6, color: 'var(--ink)' }}>
                {EMBED_SNIPPET}
              </pre>
              <button
                onClick={copySnippet}
                style={{
                  position: 'absolute', top: 12, right: 12,
                  display: 'flex', alignItems: 'center', gap: 5,
                  padding: '5px 10px', border: '1px solid var(--hairline)',
                  background: 'var(--bg)', borderRadius: 5,
                  fontSize: 11, color: 'var(--ink-muted)', cursor: 'pointer',
                  fontFamily: 'var(--font-mono)',
                }}
              >
                {copied ? <><CheckIcon size={12} /> Copied</> : <><Copy size={12} /> Copy</>}
              </button>
            </div>
            <p style={{ fontSize: 13, color: 'var(--ink-muted)', marginTop: 12, lineHeight: 1.6 }}>
              The widget initialises asynchronously and does not block page load. It adds a floating chat button to the bottom-right corner of your page.
            </p>
          </DocSection>

          <DocSection id="api" title="API reference">
            <p style={{ fontSize: 14.5, color: 'var(--ink-muted)', lineHeight: 1.7, marginBottom: 20 }}>
              All API endpoints require a Bearer token from your workspace settings. Base URL: <code style={{ fontFamily: 'var(--font-mono)', fontSize: 12, background: 'var(--surface-2)', padding: '1px 5px', borderRadius: 3 }}>https://Octively.com/api/v1</code>
            </p>
            <div style={{ border: '1px solid var(--hairline)', borderRadius: 10, overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 480 }}>
                <thead>
                  <tr style={{ background: 'var(--surface-2)', borderBottom: '1px solid var(--hairline)' }}>
                    <th style={{ textAlign: 'left', padding: '10px 16px', fontWeight: 600, fontFamily: 'var(--font-mono)', fontSize: 11 }}>Method</th>
                    <th style={{ textAlign: 'left', padding: '10px 16px', fontWeight: 600, fontFamily: 'var(--font-mono)', fontSize: 11 }}>Path</th>
                    <th style={{ textAlign: 'left', padding: '10px 16px', fontWeight: 600, fontFamily: 'var(--font-mono)', fontSize: 11 }}>Description</th>
                  </tr>
                </thead>
                <tbody>
                  {API_ENDPOINTS.map(({ method, path, desc }) => (
                    <tr key={path} style={{ borderBottom: '1px solid var(--hairline)' }}>
                      <td style={{ padding: '11px 16px' }}>
                        <span style={{
                          fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 600,
                          color: method === 'GET' ? 'var(--of-success)' : 'var(--of-primary)',
                        }}>{method}</span>
                      </td>
                      <td style={{ padding: '11px 16px', fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--ink)' }}>{path}</td>
                      <td style={{ padding: '11px 16px', color: 'var(--ink-muted)' }}>{desc}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </DocSection>

          <DocSection id="models" title="Supported AI models">
            <p style={{ fontSize: 14.5, color: 'var(--ink-muted)', lineHeight: 1.7, marginBottom: 16 }}>
              Choose the model that best fits each bot — from fast and budget-friendly to frontier-class. Select per bot from the bot settings page.
            </p>
            <div className="mkt-grid-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
              {[
                { provider: 'OpenAI', name: 'GPT-4o' },
                { provider: 'OpenAI', name: 'GPT-4o Mini' },
                { provider: 'Anthropic', name: 'Claude 3.5 Sonnet' },
                { provider: 'Anthropic', name: 'Claude 3 Haiku' },
                { provider: 'Google', name: 'Gemini 2.0 Flash' },
                { provider: 'Mistral', name: 'Mistral Large' },
              ].map(({ provider, name }) => (
                <div key={name} style={{ padding: '10px 12px', background: 'var(--surface-2)', border: '1px solid var(--hairline)', borderRadius: 8 }}>
                  <p style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--ink-subtle)', margin: '0 0 4px' }}>{provider}</p>
                  <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--ink)', margin: 0 }}>{name}</p>
                </div>
              ))}
            </div>
            <p style={{ fontSize: 13, color: 'var(--ink-muted)', marginTop: 12 }}>
              More models available. All inference is routed through a unified gateway — switch models without changing your embed code.
            </p>
          </DocSection>

          <DocSection id="faq" title="FAQ">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              {FAQ_ITEMS.map(({ q, a }) => (
                <div key={q}>
                  <p style={{ fontWeight: 600, fontSize: 14, marginBottom: 6 }}>{q}</p>
                  <p style={{ fontSize: 14, color: 'var(--ink-muted)', margin: 0, lineHeight: 1.65 }}>{a}</p>
                </div>
              ))}
            </div>
          </DocSection>

          {/* CTA */}
          <div style={{ marginTop: 56, padding: '32px', border: '1px solid var(--of-primary)', borderRadius: 14, background: 'var(--of-primary-soft)', display: 'flex', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'space-between', gap: 16 }}>
            <div>
              <p style={{ fontWeight: 600, fontSize: 16, marginBottom: 4 }}>Ready to build?</p>
              <p style={{ fontSize: 14, color: 'var(--ink-muted)', margin: 0 }}>Get your embed key — free plan, no card required.</p>
            </div>
            <OctivelyButton href="/dashboard/signup" size="md">
              Start free
            </OctivelyButton>
          </div>
        </div>
      </div>

      <MarketingFooter />
    </div>
  )
}

function DocSection({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} style={{ marginBottom: 60, scrollMarginTop: 88 }}>
      <h2 style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.01em', marginBottom: 20, paddingBottom: 14, borderBottom: '2px solid var(--hairline)' }}>{title}</h2>
      {children}
    </section>
  )
}
