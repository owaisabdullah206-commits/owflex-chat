import { createClient, type SanityClient } from 'next-sanity'
import { apiVersion, dataset, projectId, isSanityConfigured } from '../env'

// Returns null when Sanity is not configured, so callers can degrade gracefully
// (empty blog) instead of crashing the build.
export function getClient(): SanityClient | null {
  if (!isSanityConfigured) return null
  return createClient({
    projectId,
    dataset,
    apiVersion,
    useCdn: process.env.NODE_ENV === 'production',
  })
}

// Tag-aware fetch helper. When tags are passed, Next caches indefinitely and we
// rely on on-demand revalidation (webhook); otherwise time-based ISR applies.
export async function sanityFetch<T>({
  query,
  params = {},
  revalidate = 3600,
  tags = [],
}: {
  query: string
  params?: Record<string, unknown>
  revalidate?: number | false
  tags?: string[]
}): Promise<T | null> {
  const client = getClient()
  if (!client) return null
  return client.fetch<T>(query, params, {
    next: { revalidate: tags.length ? false : revalidate, tags },
  })
}
