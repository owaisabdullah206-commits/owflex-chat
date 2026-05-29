import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import BlogPostView from '@/components/marketing/BlogPostView'
import { JsonLd, articleSchema, breadcrumbSchema, faqSchema } from '@/components/shared/JsonLd'
import { getPost, getPosts, getPostSlugs } from '@/sanity/lib/queries'
import { urlForImage } from '@/sanity/lib/image'

export const revalidate = 3600
export const dynamicParams = true

export async function generateStaticParams() {
  const slugs = await getPostSlugs()
  return slugs.map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const post = await getPost(slug)
  if (!post) return {}
  return {
    title: { absolute: `${post.title} — Octively` },
    description: post.description,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      type: 'article',
      title: post.title,
      description: post.description,
      url: `/blog/${post.slug}`,
      publishedTime: post.publishedAt,
      ...(post.coverImage && {
        images: [{ url: urlForImage(post.coverImage, 1200) ?? '', width: 1200, alt: post.title }],
      }),
    },
  }
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const [post, allPosts] = await Promise.all([getPost(slug), getPosts()])
  if (!post) notFound()

  const relatedPosts = allPosts.filter((p) => p.slug !== slug).slice(0, 2)

  return (
    <>
      <JsonLd
        schema={articleSchema({
          title: post.title,
          description: post.description,
          slug: post.slug,
          datePublished: post.publishedAt,
          dateModified: post._updatedAt,
        })}
      />
      <JsonLd schema={breadcrumbSchema(post.title, `/blog/${post.slug}`)} />
      {post.faq && post.faq.length > 0 && <JsonLd schema={faqSchema(post.faq)} />}
      <BlogPostView post={post} relatedPosts={relatedPosts} />
    </>
  )
}
