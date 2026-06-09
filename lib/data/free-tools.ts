// Canonical list of the free marketing tools. Single source of truth so the
// /tools hub page, the footer, and the sitemap stay in sync.

export interface FreeTool {
  slug: string // path under the site root, e.g. /tools/... or /directory/...
  title: string
  blurb: string
  /** Show in the curated footer Free Tools column. */
  footer?: boolean
}

export const FREE_TOOLS: FreeTool[] = [
  {
    slug: '/tools/chatbot-pricing-calculator',
    title: 'Chatbot pricing calculator',
    blurb: 'Work out what to charge a client for a managed chatbot, and your margin.',
    footer: true,
  },
  {
    slug: '/tools/chatbot-roi-calculator',
    title: 'Chatbot ROI calculator',
    blurb: 'Estimate leads, support savings, and revenue impact from a website chatbot.',
    footer: true,
  },
  {
    slug: '/tools/agency-retainer-calculator',
    title: 'Agency retainer calculator',
    blurb: 'See the annual value and margin of selling chatbots as a monthly retainer.',
  },
  {
    slug: '/tools/ai-chatbot-name-generator',
    title: 'Chatbot name generator',
    blurb: 'Memorable, brand-aligned bot names by tone and industry. Generate as many as you like.',
    footer: true,
  },
  {
    slug: '/tools/chatbot-welcome-message-generator',
    title: 'Welcome message generator',
    blurb: 'Ready-to-use greeting templates by tone and goal for your chatbot.',
  },
  {
    slug: '/tools/chatbot-faq-generator',
    title: 'Chatbot FAQ generator',
    blurb: 'Turn a short business description into a ready-to-paste chatbot knowledge base.',
    footer: true,
  },
  {
    slug: '/tools/website-chatbot-readiness-checker',
    title: 'Website readiness checker',
    blurb: 'Enter a URL to see if a site is ready for a chatbot, and what to fix first.',
  },
  {
    slug: '/directory/ai-services-to-sell',
    title: 'AI services directory',
    blurb: 'A directory of AI services freelancers and agencies can sell to clients.',
  },
]

export const FOOTER_TOOLS = FREE_TOOLS.filter((t) => t.footer)
