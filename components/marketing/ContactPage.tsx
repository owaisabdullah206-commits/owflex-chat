'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowRight, MessageCircle, Mail, Clock } from 'lucide-react'
import { MarketingNav } from './MarketingNav'
import MarketingFooter from './MarketingFooter'
import { useDarkMode } from './useDarkMode'

const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? ''
const WHATSAPP_URL = WHATSAPP_NUMBER
  ? `https://wa.me/${WHATSAPP_NUMBER.replace(/\D/g, '')}`
  : 'https://wa.me/'

const FAQS = [
  {
    q: 'How long does setup take?',
    a: 'Most developers are live in under an hour. Sign up, create a bot, copy the embed script, invite your client — done.',
  },
  {
    q: 'Can I use my own domain for the client portal?',
    a: 'Custom domains are on the roadmap. For now, client portals are served from app.octively.com with your branding applied.',
  },
  {
    q: 'Which AI models can my bots use?',
    a: 'Any leading AI model — GPT-4o, Claude, Gemini, Mistral, and more. You can pick a different model per bot from your dashboard.',
  },
  {
    q: 'What happens when I hit my plan limits?',
    a: "New conversations are paused until the next billing cycle. You'll get a warning at 80% so you're never caught off-guard.",
  },
]

export default function ContactPage() {
  const { dark, toggleDark } = useDarkMode()
  const [submitted, setSubmitted] = useState(false)

  return (
    <div className={`marketing${dark ? ' dark' : ''}`} style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--ink)' }}>
      <MarketingNav dark={dark} onToggleDark={toggleDark} />

      {/* Hero */}
      <section style={{ paddingBlock: '72px 0', textAlign: 'center', borderBottom: '1px solid var(--hairline)' }}>
        <div style={{ maxWidth: 600, margin: '0 auto', padding: '0 24px 56px' }}>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--of-primary)', marginBottom: 16 }}>Get in touch</p>
          <h1 style={{ fontSize: 44, fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 1.1, marginBottom: 16 }}>Talk to us</h1>
          <p style={{ fontSize: 17, color: 'var(--ink-muted)', lineHeight: 1.6 }}>
            Questions about pricing, the platform, or a custom setup? We reply within 24 hours.
          </p>
        </div>
      </section>

      {/* Contact grid */}
      <section style={{ paddingBlock: 72 }}>
        <div className="mkt-grid-2" style={{ maxWidth: 1000, margin: '0 auto', padding: '0 24px', display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: 56 }}>

          {/* Left — direct channels */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'flex', alignItems: 'center', gap: 14,
                padding: '20px 24px',
                background: '#25D366',
                borderRadius: 8,
                textDecoration: 'none',
                color: 'white',
              }}
            >
              <MessageCircle size={22} />
              <div>
                <p style={{ fontWeight: 600, fontSize: 15, margin: 0 }}>WhatsApp</p>
                <p style={{ fontSize: 13, margin: 0, opacity: 0.85 }}>Fastest response, usually within the hour</p>
              </div>
              <ArrowRight size={16} style={{ marginLeft: 'auto' }} />
            </a>

            <a
              href="mailto:hello@octively.com"
              style={{
                display: 'flex', alignItems: 'center', gap: 14,
                padding: '20px 24px',
                border: '1px solid var(--hairline)',
                background: 'var(--surface)',
                borderRadius: 8,
                textDecoration: 'none',
                color: 'var(--ink)',
              }}
            >
              <Mail size={20} style={{ color: 'var(--of-primary)' }} />
              <div>
                <p style={{ fontWeight: 600, fontSize: 15, margin: 0 }}>Email</p>
                <p style={{ fontSize: 13, color: 'var(--ink-muted)', margin: 0 }}>hello@octively.com</p>
              </div>
            </a>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '16px', border: '1px solid var(--hairline)', borderRadius: 10, background: 'var(--surface-2)' }}>
              <Clock size={16} style={{ color: 'var(--ink-subtle)', marginTop: 2, flexShrink: 0 }} />
              <div>
                <p style={{ fontWeight: 500, fontSize: 13, margin: '0 0 4px' }}>Response time</p>
                <p style={{ fontSize: 13, color: 'var(--ink-muted)', margin: 0, lineHeight: 1.5 }}>
                  WhatsApp: within the hour (PKT business hours)<br />
                  Email: within 24 hours
                </p>
              </div>
            </div>
          </div>

          {/* Right — contact form */}
          <div style={{ border: '1px solid var(--hairline)', borderRadius: 16, background: 'var(--surface)', padding: 32 }}>
            {submitted ? (
              <div style={{ textAlign: 'center', padding: '32px 0' }}>
                <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--of-primary-soft)', display: 'grid', placeItems: 'center', margin: '0 auto 16px', color: 'var(--of-primary)' }}>
                  ✓
                </div>
                <h3 style={{ fontWeight: 600, fontSize: 18, marginBottom: 8 }}>Message sent</h3>
                <p style={{ fontSize: 14, color: 'var(--ink-muted)' }}>We&apos;ll get back to you within 24 hours.</p>
              </div>
            ) : (
              <form
                onSubmit={(e) => { e.preventDefault(); setSubmitted(true) }}
                style={{ display: 'flex', flexDirection: 'column', gap: 16 }}
              >
                <h3 style={{ fontWeight: 600, fontSize: 17, marginBottom: 4 }}>Send a message</h3>
                <div className="mkt-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <Field label="Name" name="name" placeholder="Your name" required />
                  <Field label="Email" name="email" type="email" placeholder="you@agency.com" required />
                </div>
                <Field label="Subject" name="subject" placeholder="Question about the Agency plan" />
                <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--ink-muted)' }}>Message</span>
                  <textarea
                    name="message"
                    required
                    rows={5}
                    placeholder="Tell us what you're working on..."
                    style={{
                      background: 'var(--bg)', border: '1px solid var(--hairline)',
                      borderRadius: 6, padding: '8px 12px',
                      fontSize: 14, color: 'var(--ink)',
                      resize: 'vertical', fontFamily: 'inherit',
                    }}
                  />
                </label>
                <button
                  type="submit"
                  style={{
                    height: 40, background: 'var(--of-primary)', color: 'white',
                    border: 'none', borderRadius: 6, fontSize: 14, fontWeight: 500,
                    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                  }}
                >
                  Send message <ArrowRight size={14} />
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section style={{ paddingBlock: 72, borderTop: '1px solid var(--hairline)', background: 'var(--surface-2)' }}>
        <div style={{ maxWidth: 760, margin: '0 auto', padding: '0 24px' }}>
          <h2 style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 40, textAlign: 'center' }}>Common questions</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {FAQS.map(({ q, a }) => (
              <div key={q} style={{ padding: '24px 0', borderBottom: '1px solid var(--hairline)' }}>
                <p style={{ fontWeight: 600, fontSize: 15, marginBottom: 8 }}>{q}</p>
                <p style={{ fontSize: 14, color: 'var(--ink-muted)', lineHeight: 1.65, margin: 0 }}>{a}</p>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 32, textAlign: 'center' }}>
            <p style={{ fontSize: 14, color: 'var(--ink-muted)' }}>
              Still have questions?{' '}
              <Link href="/guide" style={{ color: 'var(--of-primary)' }}>Read the guide</Link>
              {' '}or{' '}
              <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--of-primary)' }}>chat on WhatsApp</a>.
            </p>
          </div>
        </div>
      </section>

      <MarketingFooter />
    </div>
  )
}

function Field({ label, name, type = 'text', placeholder, required }: { label: string; name: string; type?: string; placeholder?: string; required?: boolean }) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--ink-muted)' }}>{label}</span>
      <input
        type={type}
        name={name}
        placeholder={placeholder}
        required={required}
        style={{
          height: 36, background: 'var(--bg)', border: '1px solid var(--hairline)',
          borderRadius: 6, padding: '0 12px', fontSize: 14, color: 'var(--ink)',
        }}
      />
    </label>
  )
}
