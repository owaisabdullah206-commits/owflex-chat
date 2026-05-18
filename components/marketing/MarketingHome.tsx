export default function MarketingHome() {
  return (
    <div className="marketing min-h-screen bg-[var(--bg)]">
      {/* Nav */}
      <nav className="sticky top-0 z-10 bg-[var(--bg)]/90 backdrop-blur border-b border-[var(--hairline)]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <span className="text-base font-semibold text-[var(--ink)]">OwFlex</span>
          <div className="flex items-center gap-3">
            <a
              href="/dashboard"
              className="text-sm text-[var(--ink-muted)] hover:text-[var(--ink)] transition-colors"
            >
              Sign in
            </a>
            <a
              href="/dashboard"
              className="text-sm font-medium px-4 py-1.5 rounded-lg bg-[#0EA5E9] text-white hover:bg-[#0284C7] transition-colors"
            >
              Start free
            </a>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-20 pb-24 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[var(--hairline)] bg-[var(--surface)] text-xs text-[var(--ink-muted)] mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-[#0EA5E9]" />
          Now in beta — free during launch
        </div>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-[var(--ink)] leading-tight tracking-tight max-w-3xl mx-auto">
          The client dashboard for your AI chatbots
        </h1>
        <p className="mt-5 text-lg sm:text-xl text-[var(--ink-muted)] max-w-2xl mx-auto leading-relaxed">
          Add OwFlex to any chatbot. Give clients a clean portal — without building it yourself.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <a
            href="/dashboard"
            className="w-full sm:w-auto text-sm font-semibold px-6 py-3 rounded-xl bg-[#0EA5E9] text-white hover:bg-[#0284C7] transition-colors shadow-sm"
          >
            Start free — no credit card
          </a>
          <a
            href="/pricing"
            className="w-full sm:w-auto text-sm font-medium px-6 py-3 rounded-xl border border-[var(--hairline)] text-[var(--ink-muted)] hover:border-[var(--ink-subtle)] hover:text-[var(--ink)] transition-colors"
          >
            View pricing →
          </a>
        </div>
        <p className="mt-4 text-xs text-[var(--ink-subtle)]">
          Free plan: 1 bot · 200 conversations/mo · 15 leads
        </p>
      </section>

      {/* Social proof strip */}
      <section className="border-y border-[var(--hairline)] bg-[var(--surface-2)] py-4">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-wrap items-center justify-center gap-6 text-xs text-[var(--ink-subtle)]">
          <span>✓ No chatbot replacement — works alongside your stack</span>
          <span>✓ Pakistani businesses: pay in PKR via PayFast</span>
          <span>✓ White-label on Agency plan</span>
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-20">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-[var(--ink)]">Up and running in 10 minutes</h2>
          <p className="mt-2 text-[var(--ink-muted)]">Three steps from zero to a client-ready portal.</p>
        </div>
        <div className="grid sm:grid-cols-3 gap-6">
          {[
            {
              step: '01',
              title: 'Create a bot',
              desc: 'Add your chatbot to OwFlex. Write a system prompt, set lead capture fields, pick a model.',
            },
            {
              step: '02',
              title: 'Embed the script',
              desc: "Copy one <script> tag into your client's site. OwFlex intercepts conversations automatically.",
            },
            {
              step: '03',
              title: 'Invite your client',
              desc: 'Send the client a portal link. They log in and see conversations, leads, and analytics — nothing else.',
            },
          ].map(({ step, title, desc }) => (
            <div
              key={step}
              className="rounded-2xl border border-[var(--hairline)] bg-[var(--surface)] p-6 flex flex-col gap-3"
            >
              <span className="text-xs font-semibold text-[#0EA5E9] tracking-widest">{step}</span>
              <h3 className="text-base font-semibold text-[var(--ink)]">{title}</h3>
              <p className="text-sm text-[var(--ink-muted)] leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Feature highlights */}
      <section className="bg-[var(--surface-2)] border-y border-[var(--hairline)]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: '💬', title: 'Conversation history', desc: 'Full chat logs per client, searchable and filterable.' },
              { icon: '📋', title: 'Lead capture', desc: 'Name and contact fields auto-collected, exportable.' },
              { icon: '📊', title: 'Analytics', desc: 'Conversation counts, lead volume, and model usage at a glance.' },
              { icon: '🎨', title: 'Widget branding', desc: 'Color, position, greeting — fully customizable per bot.' },
            ].map(({ icon, title, desc }) => (
              <div key={title} className="flex flex-col gap-2">
                <span className="text-2xl">{icon}</span>
                <h3 className="text-sm font-semibold text-[var(--ink)]">{title}</h3>
                <p className="text-sm text-[var(--ink-muted)] leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA banner */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-20 text-center">
        <div className="rounded-3xl bg-[var(--surface)] border border-[var(--hairline)] px-6 py-14 flex flex-col items-center gap-5">
          <h2 className="text-2xl sm:text-3xl font-bold text-[var(--ink)] max-w-xl">
            Your next client project ships faster with OwFlex
          </h2>
          <p className="text-[var(--ink-muted)] max-w-md">
            Stop building bespoke dashboards. Start on the free plan today — upgrade when you need more bots.
          </p>
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <a
              href="/dashboard"
              className="text-sm font-semibold px-6 py-3 rounded-xl bg-[#0EA5E9] text-white hover:bg-[#0284C7] transition-colors shadow-sm"
            >
              Get started free
            </a>
            <a
              href="/pricing"
              className="text-sm font-medium text-[var(--ink-muted)] hover:text-[var(--ink)] transition-colors"
            >
              Compare plans →
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[var(--hairline)] py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[var(--ink-subtle)]">
          <span>© {new Date().getFullYear()} OwFlex. All rights reserved.</span>
          <div className="flex items-center gap-4">
            <a href="/pricing" className="hover:text-[var(--ink)] transition-colors">Pricing</a>
            <a href="mailto:hello@owflex.com" className="hover:text-[var(--ink)] transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
