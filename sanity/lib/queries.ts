import { cache } from 'react'
import { sanityFetch } from './client'

export interface SanityPost {
  _id: string
  title: string
  slug: string
  description: string
  keyword?: string
  publishedAt: string
  _updatedAt?: string
  readingMinutes?: number
  body: string
  coverImage?: { asset?: { _ref?: string } }
}

const POST_FIELDS = `
  _id,
  title,
  "slug": slug.current,
  description,
  keyword,
  publishedAt,
  _updatedAt,
  readingMinutes,
  body,
  coverImage
`

// List for the blog index — newest first.
export const getPosts = cache(async (): Promise<SanityPost[]> => {
  const data = await sanityFetch<SanityPost[]>({
    query: `*[_type == "post" && defined(slug.current)] | order(publishedAt desc) { ${POST_FIELDS} }`,
    tags: ['post'],
  })
  return data ?? []
})

// Single post by slug.
export const getPost = cache(async (slug: string): Promise<SanityPost | null> => {
  const data = await sanityFetch<SanityPost | null>({
    query: `*[_type == "post" && slug.current == $slug][0] { ${POST_FIELDS} }`,
    params: { slug },
    tags: ['post'],
  })
  return data ?? null
})

// Slugs for generateStaticParams / sitemap.
export const getPostSlugs = cache(async (): Promise<string[]> => {
  const data = await sanityFetch<{ slug: string }[]>({
    query: `*[_type == "post" && defined(slug.current)]{ "slug": slug.current }`,
    tags: ['post'],
  })
  return (data ?? []).map((d) => d.slug)
})
