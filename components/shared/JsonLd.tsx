// Renders a Schema.org JSON-LD <script> block. Server component — no client JS.
// Usage: <JsonLd schema={organizationSchema} /> or pass an array via @graph.

export const SITE_URL = 'https://octively.com'

type JsonLdValue = Record<string, unknown> | Record<string, unknown>[]

export function JsonLd({ schema }: { schema: JsonLdValue }) {
  return (
    <script
      type="application/ld+json"
      // JSON.stringify output is safe here — values are author-controlled, not user input.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

// Sitewide Organization + WebSite graph — rendered once in the root layout.
export const organizationSchema = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': `${SITE_URL}#organization`,
      name: 'Octively',
      url: SITE_URL,
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_URL}/icon.svg`,
      },
      description:
        'White-label AI chatbot platform for freelancers and agencies. Build AI chatbots for your SMB clients and give each client a branded portal to view conversations, leads, and analytics.',
      foundingDate: '2024',
      areaServed: 'Worldwide',
      sameAs: ['https://github.com/MrOwaisAbdullah/Owflex-Chatbot-Saas'],
    },
    {
      '@type': 'WebSite',
      '@id': `${SITE_URL}#website`,
      url: SITE_URL,
      name: 'Octively',
      publisher: { '@id': `${SITE_URL}#organization` },
    },
  ],
}

// BreadcrumbList builder — pass the page label + path; Home is prepended automatically.
export function breadcrumbSchema(label: string, path: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: label, item: `${SITE_URL}${path}` },
    ],
  }
}

// Article schema — rendered on each blog post.
export function articleSchema(opts: {
  title: string
  description: string
  slug: string
  datePublished: string
  dateModified?: string
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: opts.title,
    description: opts.description,
    url: `${SITE_URL}/blog/${opts.slug}`,
    datePublished: opts.datePublished,
    dateModified: opts.dateModified ?? opts.datePublished,
    author: { '@type': 'Organization', name: 'Octively', url: SITE_URL },
    publisher: { '@id': `${SITE_URL}#organization` },
    mainEntityOfPage: { '@type': 'WebPage', '@id': `${SITE_URL}/blog/${opts.slug}` },
  }
}

// SoftwareApplication schema — rendered on the pricing page.
export const softwareApplicationSchema = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Octively',
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web',
  url: SITE_URL,
  description:
    'White-label AI chatbot platform for freelancers and agencies. Build bots, deploy them to client websites, and give clients a branded portal for conversations, leads, and analytics.',
  // PKR pricing applies to Pakistan; USD pricing applies internationally (set a little higher).
  offers: [
    { '@type': 'Offer', name: 'Free', price: '0', priceCurrency: 'USD', description: 'Free plan — 1 bot' },
    { '@type': 'Offer', name: 'Starter', price: '15', priceCurrency: 'USD', description: 'International pricing' },
    { '@type': 'Offer', name: 'Pro', price: '29', priceCurrency: 'USD', description: 'International pricing' },
    { '@type': 'Offer', name: 'Agency', price: '79', priceCurrency: 'USD', description: 'International pricing — unlimited client portals' },
    { '@type': 'Offer', name: 'Starter (Pakistan)', price: '2500', priceCurrency: 'PKR', description: 'Pakistan pricing' },
    { '@type': 'Offer', name: 'Pro (Pakistan)', price: '7500', priceCurrency: 'PKR', description: 'Pakistan pricing' },
    { '@type': 'Offer', name: 'Agency (Pakistan)', price: '20000', priceCurrency: 'PKR', description: 'Pakistan pricing — unlimited client portals' },
  ],
}
