'use client'

import { useRef } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import {
  MessageSquare, Zap, Monitor, Palette, Cpu, Globe,
  Code2, UserPlus, BarChart3, Check, ArrowRight,
  MessageSquareX, Clock, PackageX,
} from 'lucide-react'

gsap.registerPlugin(useGSAP, ScrollTrigger)

// ─── Mini product mockup (pure CSS, no image needed) ─────────────────────────

function ProductMockup() {
  return (
    <div className="relative w-full max-w-sm mx-auto lg:mx-0">
      <div className="border border-[var(--hairline)] bg-[var(--surface)] overflow-hidden shadow-sm">
        {/* Window title bar */}
        <div className="flex items-center gap-1.5 px-3 py-2 border-b border-[var(--hairline)] bg-[var(--surface-2)]">
          <span className="w-2 h-2 rounded-full bg-[var(--of-primary)]" />
          <span className="text-[9px] text-[var(--ink-subtle)] font-medium tracking-wide">client portal · conversations</span>
        </div>
        {/* Stat row */}
        <div className="grid grid-cols-3 gap-px bg-[var(--hairline)] border-b border-[var(--hairline)]">
          {([['247', 'conversations'], ['38', 'leads'], ['1', 'bot']] as const).map(([n, l]) => (
            <div key={l} className="bg-[var(--surface)] px-3 py-3">
              <p className="text-lg font-bold text-[var(--ink)] leading-none">{n}</p>
              <p className="text-[9px] text-[var(--ink-subtle)] mt-0.5">{l}</p>
            </div>
          ))}
        </div>
        {/* Conversation list */}
        <div className="divide-y divide-[var(--hairline-soft)]">
          {[
            { name: 'Sarah K.', msg: 'What are your pricing options?', time: '2m ago',  dot: '#10B981' },
            { name: 'Ahmed R.', msg: 'I need help with the integration', time: '15m ago', dot: '#0EA5E9' },
            { name: 'Zara M.',  msg: 'Can I upgrade my plan?',          time: '1h ago',  dot: '#F59E0B' },
          ].map(({ name, msg, time, dot }) => (
            <div key={name} className="flex items-start gap-2.5 px-3 py-2.5">
              <div
                className="w-6 h-6 rounded-full shrink-0 flex items-center justify-center text-[9px] font-bold text-white"
                style={{ background: dot }}
              >
                {name[0]}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                  <p className="text-[10px] font-semibold text-[var(--ink)]">{name}</p>
                  <p className="text-[9px] text-[var(--ink-subtle)]">{time}</p>
                </div>
                <p className="text-[10px] text-[var(--ink-muted)] truncate">{msg}</p>
              </div>
            </div>
          ))}
        </div>
        {/* Lead badge */}
        <div className="px-3 py-2 border-t border-[var(--hairline)] flex items-center gap-2">
          <span className="flex items-center gap-1 text-[9px] font-medium px-2 py-0.5 bg-[#ECFDF5] text-[#059669]">
            <Check className="h-2.5 w-2.5" />
            3 new leads today
          </span>
        </div>
      </div>
      {/* Floating badge */}
      <div className="absolute -top-3 -right-3 bg-[var(--of-primary)] text-white text-[9px] font-semibold px-2.5 py-1 shadow-sm">
        White-labeled
      </div>
    </div>
  )
}

// ─── Feature bento data ───────────────────────────────────────────────────────

const BENTO_TILES = [
  {
    icon: MessageSquare,
    title: 'Conversation management',
    desc: 'Every client message, threaded and searchable. Filter by date, keyword, or outcome.',
    span: 'lg:col-span-3 lg:row-span-2',
    large: true,
  },
  {
    icon: Zap,
    title: 'Lead capture',
    desc: 'Name, email, and phone — captured before the first message.',
    span: 'lg:col-span-2',
    large: false,
  },
  {
    icon: Monitor,
    title: 'Client portal',
    desc: 'Your clients log in at app.owflex.com. No setup required.',
    span: 'lg:col-span-1',
    large: false,
  },
  {
    icon: Palette,
    title: 'White-label branding',
    desc: 'Replace "Powered by OwFlex" with your agency name on every widget.',
    span: 'lg:col-span-3',
    large: false,
  },
  {
    icon: Cpu,
    title: 'AI model control',
    desc: 'Switch models per bot — DeepSeek, GPT-4o, Claude. Users never see costs.',
    span: 'lg:col-span-4',
    large: false,
  },
  {
    icon: Globe,
    title: 'Any chatbot platform',
    desc: 'One embed script works on any site or chatbot integration.',
    span: 'lg:col-span-2',
    large: false,
  },
]

// ─── Main export ──────────────────────────────────────────────────────────────

export default function MarketingHome() {
  const heroRef  = useRef<HTMLDivElement>(null)
  const stepsRef = useRef<HTMLDivElement>(null)
  const bentoRef = useRef<HTMLDivElement>(null)

  useGSAP(() => {
    gsap.from('.hero-stagger', {
      opacity: 0,
      y: 24,
      duration: 0.65,
      stagger: 0.09,
      ease: 'power2.out',
    })
  }, { scope: heroRef })

  useGSAP(() => {
    gsap.from('.step-card', {
      opacity: 0,
      y: 32,
      duration: 0.55,
      stagger: 0.14,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: stepsRef.current,
        start: 'top 82%',
        toggleActions: 'play none none none',
      },
    })
  }, { scope: stepsRef })

  useGSAP(() => {
    gsap.from('.bento-tile', {
      opacity: 0,
      y: 28,
      duration: 0.5,
      stagger: 0.07,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: bentoRef.current,
        start: 'top 78%',
        toggleActions: 'play none none none',
      },
    })
  }, { scope: bentoRef })

  return (
    <div className="marketing min-h-screen bg-[var(--bg)]">

      {/* ── Nav ──────────────────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-20 bg-[var(--bg)]/90 backdrop-blur-sm border-b border-[var(--hairline)]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[var(--of-primary)]" />
            <span className="text-sm font-semibold text-[var(--ink)] tracking-tight">owflex</span>
          </a>
          <div className="flex items-center gap-4">
            <a href="/pricing" className="text-sm text-[var(--ink-muted)] hover:text-[var(--ink)] transition-colors hidden sm:block">Pricing</a>
            <a href="/dashboard/login" className="text-sm text-[var(--ink-muted)] hover:text-[var(--ink)] transition-colors hidden sm:block">Log in</a>
            <a
              href="/dashboard/signup"
              className="text-xs font-semibold px-4 py-2 bg-[var(--of-primary)] text-white hover:bg-[var(--of-primary-hover)] transition-colors"
            >
              Start free
            </a>
          </div>
        </div>
      </nav>

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section ref={heroRef} className="max-w-6xl mx-auto px-4 sm:px-6 pt-20 pb-24">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="hero-stagger inline-flex items-center gap-2 text-[11px] font-semibold text-[var(--of-primary)] uppercase tracking-[0.1em] mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--of-primary)]" />
              For web developers &amp; agencies
            </div>
            <h1 className="hero-stagger text-5xl sm:text-6xl font-bold text-[var(--ink)] tracking-tight leading-[1.08]">
              Give every client<br />
              their own chatbot<br />
              <span className="text-[var(--of-primary)]">portal.</span>
            </h1>
            <p className="hero-stagger mt-6 text-lg text-[var(--ink-muted)] leading-relaxed max-w-lg">
              Add one embed script. Your clients get a branded dashboard to track conversations, leads, and engagement — no backend work needed.
            </p>
            <div className="hero-stagger flex flex-wrap items-center gap-3 mt-8">
              <a
                href="/dashboard/signup"
                className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold bg-[var(--of-primary)] text-white hover:bg-[var(--of-primary-hover)] transition-colors"
              >
                Start for free
                <ArrowRight className="h-4 w-4" />
              </a>
              <a
                href="/pricing"
                className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium border border-[var(--hairline)] text-[var(--ink-muted)] hover:border-[var(--ink-subtle)] hover:text-[var(--ink)] transition-colors"
              >
                See pricing
              </a>
            </div>
            <div className="hero-stagger flex items-center gap-6 mt-8">
              {([['₨0', 'to start'], ['1 script', 'to embed'], ['200+', 'bots deployed']] as const).map(([n, l]) => (
                <div key={l}>
                  <p className="text-base font-bold text-[var(--ink)]">{n}</p>
                  <p className="text-xs text-[var(--ink-subtle)]">{l}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="hero-stagger">
            <ProductMockup />
          </div>
        </div>
      </section>

      {/* ── Problem strip ────────────────────────────────────────────────── */}
      <section className="bg-[var(--surface-2)] py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--ink-subtle)] mb-8 text-center">The problem</p>
          <div className="grid sm:grid-cols-3 gap-6">
            {[
              { icon: MessageSquareX, title: "Clients can't see their chatbot data", desc: "You built the bot. They have no idea if it's working." },
              { icon: Clock,          title: 'A custom portal takes weeks',           desc: "Auth, database, deployment — just to show a conversation list." },
              { icon: PackageX,       title: 'Every new client means rebuilding',     desc: "Copy-pasting dashboards for each project doesn't scale." },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex gap-4">
                <div className="w-8 h-8 shrink-0 flex items-center justify-center border border-[var(--hairline)] bg-[var(--surface)] mt-0.5">
                  <Icon className="h-4 w-4 text-[var(--ink-muted)]" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[var(--ink)] leading-snug">{title}</p>
                  <p className="mt-1 text-xs text-[var(--ink-muted)] leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────────────────────── */}
      <section ref={stepsRef} className="max-w-6xl mx-auto px-4 sm:px-6 py-24">
        <div className="text-center mb-14">
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--of-primary)] mb-3">How it works</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-[var(--ink)] tracking-tight">Live in three steps</h2>
        </div>
        <div className="grid sm:grid-cols-3 gap-6 relative">
          <div className="hidden sm:block absolute top-10 left-[16.66%] right-[16.66%] h-px bg-[var(--hairline)] z-0" />
          {[
            { icon: Code2,     n: '01', title: 'Drop in the embed script', desc: 'Copy one line of JavaScript. Add it to any webpage or chatbot integration.' },
            { icon: UserPlus,  n: '02', title: 'Invite your client',       desc: 'Send an email invite. They set a password and see their portal instantly.' },
            { icon: BarChart3, n: '03', title: 'They track results live',  desc: 'Conversations, leads, and engagement — updated in real time.' },
          ].map(({ icon: Icon, n, title, desc }) => (
            <div key={n} className="step-card relative z-10 border border-[var(--hairline)] bg-[var(--surface)] p-6">
              <div className="w-8 h-8 flex items-center justify-center bg-[var(--bg)] border border-[var(--hairline)] mb-4">
                <Icon className="h-4 w-4 text-[var(--ink-muted)]" />
              </div>
              <p className="text-[10px] font-semibold text-[var(--ink-subtle)] mb-1">{n}</p>
              <p className="text-sm font-semibold text-[var(--ink)] mb-2">{title}</p>
              <p className="text-xs text-[var(--ink-muted)] leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Feature bento ────────────────────────────────────────────────── */}
      <section ref={bentoRef} className="bg-[var(--surface-2)] py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--of-primary)] mb-3">Everything included</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-[var(--ink)] tracking-tight">Built for developers who sell chatbots</h2>
            <p className="mt-4 text-base text-[var(--ink-muted)] max-w-xl mx-auto">
              Every feature your clients need. Every control you need as a developer.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 auto-rows-fr gap-3">
            {BENTO_TILES.map(({ icon: Icon, title, desc, span, large }) => (
              <div
                key={title}
                className={`bento-tile border border-[var(--hairline)] bg-[var(--surface)] p-6 flex flex-col gap-4 ${span}`}
              >
                <div className="w-8 h-8 flex items-center justify-center border border-[var(--hairline)] bg-[var(--surface-2)]">
                  <Icon className="h-4 w-4 text-[var(--ink-muted)]" />
                </div>
                <div>
                  <p className={`font-semibold text-[var(--ink)] leading-snug ${large ? 'text-base' : 'text-sm'}`}>{title}</p>
                  <p className="mt-1.5 text-xs text-[var(--ink-muted)] leading-relaxed">{desc}</p>
                </div>
                {large && (
                  <div className="flex-1 mt-2 border border-[var(--hairline)] bg-[var(--bg)] p-3 space-y-2">
                    {[
                      { side: 'user', text: "What are your hours?" },
                      { side: 'bot',  text: "We're open 9am–6pm Mon–Sat." },
                      { side: 'user', text: "Do you offer refunds?" },
                    ].map(({ side, text }, i) => (
                      <div key={i} className={`flex ${side === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <span className={`text-[10px] px-2 py-1 max-w-[80%] leading-relaxed ${
                          side === 'user'
                            ? 'bg-[var(--of-primary)] text-white'
                            : 'bg-[var(--surface)] border border-[var(--hairline)] text-[var(--ink-muted)]'
                        }`}>
                          {text}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing teaser ───────────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-24">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-[var(--ink)] tracking-tight">Simple pricing</h2>
          <p className="mt-3 text-sm text-[var(--ink-muted)]">Pay in PKR or USD. Cancel any time.</p>
        </div>
        <div className="grid sm:grid-cols-3 gap-3 max-w-3xl mx-auto">
          {[
            { plan: 'Free',    price: '₨0',     suffix: '',    features: ['1 bot', '200 conversations', '15 leads/mo'],           cta: 'Start free',  href: '/dashboard/signup',                            featured: false },
            { plan: 'Starter', price: '₨2,500', suffix: '/mo', features: ['2 bots', '3,000 conversations', 'Full customization'], cta: 'Get Starter', href: '/api/billing/payfast-plan-url?plan=starter',   featured: false },
            { plan: 'Pro',     price: '₨7,500', suffix: '/mo', features: ['8 bots', '15,000 conversations', 'Email digest'],       cta: 'Get Pro →',   href: '/api/billing/payfast-plan-url?plan=pro',       featured: true },
          ].map(({ plan, price: p, suffix, features, cta, href, featured }) => (
            <div
              key={plan}
              className={`p-5 flex flex-col gap-4 ${featured ? 'bg-[var(--ink)] text-white' : 'border border-[var(--hairline)] bg-[var(--surface)]'}`}
            >
              <div>
                <p className={`text-[10px] font-semibold uppercase tracking-[0.1em] mb-1 ${featured ? 'text-white/50' : 'text-[var(--ink-subtle)]'}`}>{plan}</p>
                <p className={`text-3xl font-bold tracking-tight ${featured ? 'text-white' : 'text-[var(--ink)]'}`}>
                  {p}<span className={`text-sm font-normal ml-0.5 ${featured ? 'text-white/40' : 'text-[var(--ink-subtle)]'}`}>{suffix}</span>
                </p>
              </div>
              <ul className="space-y-1.5 flex-1">
                {features.map((f) => (
                  <li key={f} className={`flex items-center gap-2 text-xs ${featured ? 'text-white/70' : 'text-[var(--ink-muted)]'}`}>
                    <Check className={`h-3 w-3 shrink-0 ${featured ? 'text-[var(--of-primary)]' : 'text-[var(--of-success)]'}`} />
                    {f}
                  </li>
                ))}
              </ul>
              <a
                href={href}
                className={`block text-center py-2 text-xs font-semibold transition-colors ${
                  featured
                    ? 'bg-[var(--of-primary)] text-white hover:bg-[var(--of-primary-hover)]'
                    : 'border border-[var(--hairline)] text-[var(--ink-muted)] hover:border-[var(--ink-subtle)] hover:text-[var(--ink)]'
                }`}
              >
                {cta}
              </a>
            </div>
          ))}
        </div>
        <p className="text-center mt-6 text-xs text-[var(--ink-subtle)]">
          Need more?{' '}
          <a href="/pricing" className="text-[var(--of-primary)] hover:underline">
            See all plans including Agency &amp; Enterprise →
          </a>
        </p>
      </section>

      {/* ── Testimonial strip ────────────────────────────────────────────── */}
      <section className="bg-[#111111] py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-white/30 mb-10 text-center">What developers say</p>
          <div className="grid sm:grid-cols-3 gap-8">
            {[
              { quote: "My clients used to email me asking about leads. Now they just log in. Saved me hours every week.", name: 'Owais A.', role: 'Freelance developer', initial: 'O' },
              { quote: "White-label branding on the Agency plan means my clients see my agency, not OwFlex. That's huge for positioning.", name: 'Fatima R.', role: 'Digital agency owner', initial: 'F' },
              { quote: "Set up a bot, embedded the script, invited the client — done in under an hour. The free plan is actually useful.", name: 'Bilal K.', role: 'Web developer', initial: 'B' },
            ].map(({ quote, name, role, initial }) => (
              <div key={name} className="flex flex-col gap-4">
                <p className="text-sm text-white/60 leading-relaxed">&ldquo;{quote}&rdquo;</p>
                <div className="flex items-center gap-3 mt-auto">
                  <div className="w-7 h-7 rounded-full bg-[var(--of-primary)] flex items-center justify-center text-[11px] font-bold text-white shrink-0">
                    {initial}
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-white">{name}</p>
                    <p className="text-[10px] text-white/40">{role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA banner ───────────────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-24">
        <div className="border border-[var(--hairline)] bg-[var(--surface)] py-16 px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-[var(--ink)] tracking-tight">
            Start free in 60 seconds.<br className="hidden sm:block" /> No credit card.
          </h2>
          <p className="mt-4 text-sm text-[var(--ink-muted)]">Pay in PKR or USD · Cancel any time · Free plan, always</p>
          <a
            href="/dashboard/signup"
            className="inline-flex items-center gap-2 mt-8 px-8 py-3.5 text-sm font-semibold bg-[var(--of-primary)] text-white hover:bg-[var(--of-primary-hover)] transition-colors"
          >
            Create your first bot portal
            <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      <footer className="border-t border-[var(--hairline)] py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid sm:grid-cols-4 gap-8 mb-10">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="w-2 h-2 rounded-full bg-[var(--of-primary)]" />
                <span className="text-sm font-semibold text-[var(--ink)]">owflex</span>
              </div>
              <p className="text-xs text-[var(--ink-muted)] leading-relaxed max-w-[180px]">
                The client portal layer for AI chatbot developers.
              </p>
            </div>
            {[
              { heading: 'Product',    links: [['Features', '#'],                          ['Pricing', '/pricing'],              ['Changelog', '#']] },
              { heading: 'Developers', links: [['Embed guide', '#'],                       ['API docs', '#'],                    ['GitHub', '#']] },
              { heading: 'Company',    links: [['About', '#'],                             ['Blog', '#'],                        ['Contact', 'mailto:hello@owflex.com']] },
            ].map(({ heading, links }) => (
              <div key={heading}>
                <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--ink-subtle)] mb-3">{heading}</p>
                <ul className="space-y-2">
                  {links.map(([label, href]) => (
                    <li key={label}>
                      <a href={href} className="text-xs text-[var(--ink-muted)] hover:text-[var(--ink)] transition-colors">{label}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="border-t border-[var(--hairline)] pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px] text-[var(--ink-subtle)]">
            <span>© {new Date().getFullYear()} OwFlex. All rights reserved.</span>
            <span>Pay in PKR or USD · Made for Pakistani developers</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
