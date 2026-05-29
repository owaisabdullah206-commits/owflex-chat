import type { MetadataRoute } from 'next'
import { getPostSlugs } from '@/sanity/lib/queries'

const BASE = 'https://octively.com'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date()

  const marketing: MetadataRoute.Sitemap = [
    { url: `${BASE}/`,              lastModified: now, changeFrequency: 'weekly',  priority: 1.0 },
    { url: `${BASE}/pricing`,       lastModified: now, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${BASE}/guide`,         lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE}/blog`,          lastModified: now, changeFrequency: 'weekly',  priority: 0.8 },
    { url: `${BASE}/changelog`,     lastModified: now, changeFrequency: 'weekly',  priority: 0.8 },
    { url: `${BASE}/roadmap`,       lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE}/for-agencies`,  lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE}/for-freelancers`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE}/about`,         lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE}/contact`,       lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE}/privacy`,       lastModified: now, changeFrequency: 'yearly',  priority: 0.3 },
    { url: `${BASE}/terms`,         lastModified: now, changeFrequency: 'yearly',  priority: 0.3 },
  ]

  const slugs = await getPostSlugs()
  const blog: MetadataRoute.Sitemap = slugs.map((slug) => ({
    url: `${BASE}/blog/${slug}`,
    lastModified: now,
    changeFrequency: 'monthly',
    priority: 0.6,
  }))

  return [...marketing, ...blog]
}
