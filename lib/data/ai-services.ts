/**
 * AI services a Pakistani freelancer or agency can sell to SMB clients.
 * Pricing and data sourced from: skillmentor.pk, hustleheroes.org,
 * tekkpak.com, botsify.com, NexPrime Agency public rates, Upwork Pakistan
 * profiles, Facebook freelancer community posts, and Contra global benchmarks.
 *
 * Display USD figures are derived from the PKR values at runtime using the
 * shared rate in lib/currency.ts (1 USD = 300 PKR, approximate).
 */

export type Difficulty = 'Beginner' | 'Intermediate' | 'Advanced'

export type Category =
  | 'Chatbots & Automation'
  | 'Content & Copywriting'
  | 'Lead Generation'
  | 'Customer Support'
  | 'SEO & Traffic'
  | 'Social Media'
  | 'Design & Visuals'
  | 'Data & Analytics'
  | 'Productivity & Operations'

export interface AIService {
  slug: string
  name: string
  category: Category
  tagline: string
  what: string
  howToDeliver: string
  toolsUsed: string[]
  whereToFindClients: string[]
  monthlyRetainerPkr: [number, number]
  monthlyRetainerUsd: [number, number]
  setupFeePkr: [number, number] | null
  profitMarginPct: [number, number]
  difficulty: Difficulty
  octivelyLink: boolean
}

export const AI_SERVICES: AIService[] = [
  // ─── Chatbots & Automation ────────────────────────────────────────────────
  {
    slug: 'ai-chatbot-for-client-website',
    name: 'AI chatbot for client websites',
    category: 'Chatbots & Automation',
    tagline: 'Add a 24/7 chatbot to any client site and give them a branded dashboard to track conversations and leads.',
    what: 'You build a custom AI chatbot trained on your client\'s business (FAQs, products, services), embed it on their website with one script tag, and give them a portal where they can see conversations, captured leads, and basic analytics. The client does not need to contact you for daily updates. Target industries: restaurants, clinics, clothing stores, real estate agencies, car dealerships.',
    howToDeliver: 'Create the bot in Octively\'s no-code dashboard. Train it on the client\'s website content and any documents they provide. Copy the one-line embed script and add it to their WordPress, Webflow, or Shopify site. Invite the client to their own branded portal. Monthly work: review low-rated answers, update the knowledge base if the business changes.',
    toolsUsed: ['Octively', 'ChatGPT (for initial FAQ drafting)', 'Loom (for client handoff recording)'],
    whereToFindClients: [
      'Your existing web design or digital marketing clients',
      'Facebook: "Pakistan Freelancers Network", "Entrepreneurs Pakistan"',
      'Walk-in live demo to local restaurants, clinics, and salons',
      'LinkedIn outreach to SMB owners in Karachi, Lahore, Islamabad',
      'Upwork (AI chatbot gigs)',
    ],
    monthlyRetainerPkr: [15000, 45000],
    monthlyRetainerUsd: [55, 160],
    setupFeePkr: [30000, 80000],
    profitMarginPct: [70, 85],
    difficulty: 'Beginner',
    octivelyLink: true,
  },
  {
    slug: 'lead-capture-bot',
    name: 'AI lead capture bot',
    category: 'Lead Generation',
    tagline: 'A bot that starts conversations, qualifies prospects, and saves contact details to a live dashboard.',
    what: 'A chatbot configured to ask qualifying questions (name, phone, need, budget) and store every response as a lead. The client\'s sales team gets a live list of hot prospects without anyone filling out a web form. Best fit for real estate agencies, car dealerships, private schools, and clinics.',
    howToDeliver: 'Enable lead capture in Octively and configure qualifying questions for the client\'s sales process. Optionally connect to Google Sheets or a CRM via Zapier for the client\'s team. Set up email or WhatsApp alerts when a lead is captured. Deliver a brief weekly lead summary.',
    toolsUsed: ['Octively', 'Zapier or Make (CRM push)', 'Google Sheets', 'Notion (reporting)'],
    whereToFindClients: [
      'Real estate Facebook groups (DHA, Bahria Town communities)',
      'LinkedIn: real estate agents and private school admins',
      'Car dealerships and diagnostic center managers',
      'Cold outreach: any business that pays for Google or Facebook ads',
    ],
    monthlyRetainerPkr: [20000, 55000],
    monthlyRetainerUsd: [70, 200],
    setupFeePkr: [35000, 90000],
    profitMarginPct: [72, 82],
    difficulty: 'Beginner',
    octivelyLink: true,
  },
  {
    slug: 'whatsapp-chatbot-service',
    name: 'WhatsApp chatbot service',
    category: 'Chatbots & Automation',
    tagline: 'The highest-demand AI service in Pakistan. Automate customer queries directly on WhatsApp Business.',
    what: 'Build a chatbot on the WhatsApp Business API that handles the most common customer messages automatically: product queries, order status, appointment bookings, and FAQ answers. WhatsApp is the primary business communication channel for Pakistani SMBs, so this converts faster than any other AI service. Target industries: restaurants, clinics, clothing stores, real estate agencies, salons.',
    howToDeliver: 'Connect the client\'s WhatsApp Business number to the API via Postabi (Pakistan-based provider, ₨3,000/month) or Botpress free cloud. Build conversation flows covering the 20 most common customer messages. Test with real message scenarios. Train staff on handoff (bot escalates to human when needed). Monthly maintenance: add new intents, refresh FAQs, monitor API usage.',
    toolsUsed: ['Botpress (free cloud)', 'Meta WhatsApp Business API', 'Postabi (Pakistan API provider, ₨3,000/mo)', 'Google Sheets (lead log)'],
    whereToFindClients: [
      'Walk-in live demo to restaurants and clinics — closes on the spot',
      'Facebook: "Restaurant Owners Pakistan", "Karachi Business Network"',
      'Facebook: "Pakistan Real Estate", "AI Automation Agency"',
      'LinkedIn outreach to local business owners',
      'Upwork (WhatsApp automation gigs)',
    ],
    monthlyRetainerPkr: [15000, 50000],
    monthlyRetainerUsd: [55, 180],
    setupFeePkr: [30000, 150000],
    profitMarginPct: [72, 85],
    difficulty: 'Intermediate',
    octivelyLink: false,
  },
  {
    slug: 'faq-support-bot',
    name: 'AI FAQ and support bot',
    category: 'Customer Support',
    tagline: 'Replace repetitive customer queries with a bot that answers instantly, 24/7.',
    what: 'Train a bot on the client\'s 30 to 50 most common support questions: delivery times, return policy, product availability, store hours, and pricing. The bot handles these 24/7. Staff only deal with unusual or escalated requests. Best fit for ecommerce stores, courier services, and telecom resellers.',
    howToDeliver: 'Collect the top support questions from the client\'s team or WhatsApp history. Add them as FAQs and documents in Octively. Enable strict mode so the bot only answers what it knows and escalates everything else. Review unanswered questions each month and expand the knowledge base.',
    toolsUsed: ['Octively (knowledge base + strict mode)', 'Google Docs (FAQ collection)'],
    whereToFindClients: [
      'Daraz sellers and Instagram shop owners',
      'Facebook: "Daraz Sellers Pakistan", "E-commerce Pakistan"',
      'Telecom resellers and courier service managers',
      'Any business whose staff spends hours answering the same questions',
    ],
    monthlyRetainerPkr: [10000, 30000],
    monthlyRetainerUsd: [35, 110],
    setupFeePkr: [20000, 50000],
    profitMarginPct: [75, 88],
    difficulty: 'Beginner',
    octivelyLink: true,
  },

  // ─── Content & Copywriting ────────────────────────────────────────────────
  {
    slug: 'ai-blog-writing-service',
    name: 'AI blog writing and publishing',
    category: 'Content & Copywriting',
    tagline: 'Publish 4 to 8 SEO blog posts a month using AI, edited for accuracy and brand voice.',
    what: 'Use AI to draft blog posts on keywords the client wants to rank for. You research the keyword, generate the draft, fact-check and humanize it, optimize on-page SEO, add images, and publish. Clients get consistent content without hiring a full-time writer. Best fit for law firms, medical practices, real estate agencies, and IT companies.',
    howToDeliver: 'Agree on a keyword list and posting schedule. Use Claude or ChatGPT with a brand-voice prompt to draft each post. Run it through a humanizer to remove AI writing patterns. Fact-check any claims, add a real example or case study, and publish via the client\'s CMS. Report on traffic and rankings monthly.',
    toolsUsed: ['ChatGPT Plus or Claude', 'SurferSEO or NeuronWriter (optional)', 'Google Docs', 'WordPress'],
    whereToFindClients: [
      'Existing web design clients who want blog content',
      'Law firms, clinics, and financial advisors via LinkedIn',
      'Facebook: "Digital Marketing Pakistan"',
      'Upwork (content writing gigs)',
    ],
    monthlyRetainerPkr: [15000, 40000],
    monthlyRetainerUsd: [55, 145],
    setupFeePkr: [5000, 15000],
    profitMarginPct: [80, 90],
    difficulty: 'Beginner',
    octivelyLink: false,
  },
  {
    slug: 'ai-social-media-calendar',
    name: 'AI social media content calendar',
    category: 'Social Media',
    tagline: 'Generate, design, schedule, and post 20 to 30 pieces of content per month with AI tools.',
    what: 'Use AI to create platform-native captions (Instagram, Facebook, LinkedIn) for the client. You handle the brief, generation, editing, graphic design, and scheduling. The client approves batches weekly. Best fit for restaurants, clothing brands, salons, gyms, and real estate agencies.',
    howToDeliver: 'Build a monthly content calendar in Notion with themes from the client\'s business. Use ChatGPT with the brand voice prompt to draft captions. Create graphics in Canva with the brand kit. Schedule in Buffer or Metricool. Deliver a performance report on day 1 of each month.',
    toolsUsed: ['ChatGPT Plus', 'Canva Pro (₨3,300/mo)', 'Buffer or Metricool (free tier)', 'Notion'],
    whereToFindClients: [
      'Facebook: "Women Entrepreneurs Pakistan", "Entrepreneurs Pakistan"',
      'Instagram DM outreach to restaurant and salon owners',
      'Lahore and Karachi local business WhatsApp groups',
      'Upwork (social media management gigs)',
    ],
    monthlyRetainerPkr: [18000, 50000],
    monthlyRetainerUsd: [65, 180],
    setupFeePkr: [10000, 25000],
    profitMarginPct: [75, 85],
    difficulty: 'Beginner',
    octivelyLink: false,
  },
  {
    slug: 'ai-product-descriptions',
    name: 'AI product description writing',
    category: 'Content & Copywriting',
    tagline: 'Write SEO-optimized product descriptions for ecommerce stores in bulk.',
    what: 'Use AI to write unique, keyword-optimized product descriptions for Daraz, WooCommerce, or Shopify stores. For stores with large catalogs, this is faster and cheaper than hiring a copywriter. You deliver in bulk, formatted for direct upload.',
    howToDeliver: 'Get a product export (CSV) from the client. Build a structured prompt template matching the brand voice and target keywords. Generate descriptions in batches in ChatGPT. Review for accuracy, add any missing specifications. Deliver as CSV for direct upload to their store.',
    toolsUsed: ['ChatGPT Plus', 'Claude', 'Shopify/WooCommerce CSV upload', 'Airtable'],
    whereToFindClients: [
      'Facebook: "Daraz Sellers Pakistan", "E-commerce Pakistan"',
      'Karachi and Lahore clothing brand Instagram outreach',
      'Local wholesalers moving products online',
      'Upwork (ecommerce content gigs)',
    ],
    monthlyRetainerPkr: [12000, 35000],
    monthlyRetainerUsd: [43, 125],
    setupFeePkr: [8000, 20000],
    profitMarginPct: [82, 92],
    difficulty: 'Beginner',
    octivelyLink: false,
  },

  // ─── SEO & Traffic ────────────────────────────────────────────────────────
  {
    slug: 'ai-seo-audit',
    name: 'AI SEO audit and optimization',
    category: 'SEO & Traffic',
    tagline: 'Run a technical and content audit and deliver a prioritized action plan using AI tools.',
    what: 'Use AI to interpret crawl data and generate a plain-English audit report with prioritized fixes. You implement quick wins (title tags, meta descriptions, heading structure) and give the client a monthly roadmap. NexPrime Agency (Pakistan) publishes SEO packages starting at ₨84,000/month for full-service; an audit-and-recommendations retainer without link building is the freelancer entry point.',
    howToDeliver: 'Run a site crawl with Screaming Frog (free up to 500 URLs) and pull keyword data from Google Search Console. Feed the export to Claude and ask for a prioritized issue list. Fix on-page items. Deliver a branded PDF report. Track rankings monthly in Search Console.',
    toolsUsed: ['Screaming Frog (free)', 'Google Search Console', 'Ahrefs or Semrush (optional)', 'Claude (report narrative)', 'Canva (PDF design)'],
    whereToFindClients: [
      'Existing web design clients who have never done SEO',
      'Local IT companies and educational institutes via LinkedIn',
      'Clutch.co Pakistan business listings',
      'Upwork (SEO audit gigs)',
    ],
    monthlyRetainerPkr: [25000, 70000],
    monthlyRetainerUsd: [90, 250],
    setupFeePkr: [20000, 50000],
    profitMarginPct: [65, 78],
    difficulty: 'Intermediate',
    octivelyLink: false,
  },

  // ─── Design & Visuals ────────────────────────────────────────────────────
  {
    slug: 'ai-image-generation',
    name: 'AI image and graphics service',
    category: 'Design & Visuals',
    tagline: 'Create on-brand product photos, social graphics, and ad creatives with AI image tools.',
    what: 'Use Midjourney or Adobe Firefly to generate branded images for clients: product mockups, social media visuals, blog hero images, and ad creatives. You handle prompting, selection, resizing, and delivery in the right formats. Best fit for fashion brands, restaurants, and businesses running Facebook or Instagram ads.',
    howToDeliver: 'Get the client\'s brand kit (logo, colors, reference images). Build a standard prompt template using those guidelines. Generate 20 to 50 images per month. Post-process in Canva (add brand elements, resize for each platform). Deliver in an organized Google Drive folder. Include two revision rounds.',
    toolsUsed: ['Midjourney ($10–$30/mo)', 'Canva Pro (₨3,300/mo)', 'Adobe Firefly (optional)', 'Google Drive'],
    whereToFindClients: [
      'Instagram outreach to fashion and clothing brands',
      'Facebook: "Graphic Design Pakistan"',
      'Businesses that already run Meta ads (upsell creative refreshes)',
      'Referrals from existing social media management clients',
    ],
    monthlyRetainerPkr: [15000, 42000],
    monthlyRetainerUsd: [55, 150],
    setupFeePkr: [8000, 20000],
    profitMarginPct: [78, 88],
    difficulty: 'Intermediate',
    octivelyLink: false,
  },

  // ─── Data & Analytics ────────────────────────────────────────────────────
  {
    slug: 'ai-analytics-reporting',
    name: 'AI monthly analytics reporting',
    category: 'Data & Analytics',
    tagline: 'Turn raw GA4 and ad data into a plain-English monthly report using AI — in under an hour.',
    what: 'Pull data from GA4, Facebook Ads, or Google Ads. Feed it to Claude with a standard prompt and get a narrative summary with insights and recommendations. Format it as a PDF and send to the client each month. Takes 30 to 60 minutes per client. Best for businesses running paid ads that want to understand their numbers without hiring a data analyst.',
    howToDeliver: 'Get read-only access to the client\'s analytics and ad accounts. Export key metrics. Feed the export to Claude asking for a plain-English summary and top three recommendations. Add a cover page in Canva. Send as PDF. Upsell implementation of the top recommendation as an additional service.',
    toolsUsed: ['Google Analytics 4', 'Looker Studio (free) or AgencyAnalytics (~₨16,500/mo for 5 clients)', 'Claude (narrative)', 'Canva (report cover)'],
    whereToFindClients: [
      'Upsell to existing social media or ad management clients',
      'LinkedIn outreach to business owners running paid ads',
      'Ecommerce brands tracking Daraz or Shopify sales',
      'Upwork (analytics reporting gigs)',
    ],
    monthlyRetainerPkr: [12000, 35000],
    monthlyRetainerUsd: [43, 125],
    setupFeePkr: [15000, 35000],
    profitMarginPct: [70, 80],
    difficulty: 'Intermediate',
    octivelyLink: false,
  },

  // ─── Productivity & Operations ────────────────────────────────────────────
  {
    slug: 'ai-email-newsletter',
    name: 'AI email newsletter service',
    category: 'Productivity & Operations',
    tagline: 'Write, design, and send monthly email newsletters for clients using AI — near-zero tool cost.',
    what: 'Use AI to draft a monthly newsletter: a short editorial, a product or service highlight, and a CTA. You handle writing, editing, building in Brevo or Mailchimp, and sending. The client approves the draft before it goes out. Tool cost is near zero (Mailchimp free for under 500 contacts; Brevo free for up to 300 emails per day).',
    howToDeliver: 'Get the client\'s topics for the month. Use Claude to write the newsletter in the brand voice. Review, humanize it (no AI-sounding phrases), add images from Canva. Build in Brevo or Mailchimp. Client approves. Send and share the open-rate report.',
    toolsUsed: ['Claude or ChatGPT', 'Mailchimp (free up to 500 contacts) or Brevo (free 300/day)', 'Canva (graphics)'],
    whereToFindClients: [
      'Upsell to existing digital marketing clients',
      'Clinics, coaching businesses, and online course creators',
      'Facebook: "E-commerce Pakistan"',
      'Upwork (email marketing gigs)',
    ],
    monthlyRetainerPkr: [10000, 28000],
    monthlyRetainerUsd: [36, 100],
    setupFeePkr: [8000, 18000],
    profitMarginPct: [80, 90],
    difficulty: 'Beginner',
    octivelyLink: false,
  },
  {
    slug: 'ai-onboarding-automation',
    name: 'Client onboarding automation',
    category: 'Productivity & Operations',
    tagline: 'Automate welcome emails, intake forms, and first-week follow-ups with AI and no-code tools.',
    what: 'Set up an automated onboarding sequence for a client\'s new customers using Make or Zapier and an email tool. A new customer signs up or buys, and they automatically get a welcome email, a setup checklist, a Calendly link for a kickoff call, and a follow-up on day 3. AI writes the copy. This is especially in demand from Pakistan\'s growing SaaS and coaching businesses.',
    howToDeliver: 'Discovery call to map the client\'s current manual onboarding steps. Use AI to write the email sequence. Build the automation in Make.com (starts at ₨4,500/month) or Zapier. Test with three dummy customers. Hand over a short video walkthrough so the client can update content. Monthly retainer covers edits and monitoring.',
    toolsUsed: ['Make.com (~₨4,500/mo) or Zapier', 'Notion or Airtable', 'Calendly', 'Google Workspace', 'Claude (copywriting)'],
    whereToFindClients: [
      'LinkedIn: tech startup founders in Karachi and Lahore',
      'Facebook: "Women Entrepreneurs Pakistan" (documented requests for this exact service)',
      'Facebook: "AI Automation Agency"',
      'Upwork (Make.com / n8n automation gigs)',
    ],
    monthlyRetainerPkr: [25000, 70000],
    monthlyRetainerUsd: [90, 250],
    setupFeePkr: [40000, 120000],
    profitMarginPct: [65, 78],
    difficulty: 'Intermediate',
    octivelyLink: false,
  },
]

export const CATEGORIES = [...new Set(AI_SERVICES.map((s) => s.category))] as Category[]
