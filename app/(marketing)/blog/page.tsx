import type { Metadata } from 'next'
import BlogIndexView from '@/components/marketing/BlogIndexView'
import { JsonLd, breadcrumbSchema } from '@/components/shared/JsonLd'
import { getPosts } from '@/sanity/lib/queries'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'Blog — Guides for Freelancers & Agencies',
  description:
    'Practical guides on building AI chatbots for clients, pricing white-label chatbot work, and running it as a freelancer or agency.',
  alternates: { canonical: '/blog' },
  openGraph: {
    title: 'Octively Blog — Guides for Freelancers & Agencies',
    description: 'Building AI chatbots for clients, pricing the work, and running it without the busywork.',
    url: '/blog',
  },
}

export default async function Page() {
  const posts = await getPosts()
  return (
    <>
      <JsonLd schema={breadcrumbSchema('Blog', '/blog')} />
      <BlogIndexView posts={posts} />
    </>
  )
}
