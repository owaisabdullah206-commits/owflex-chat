// Sanity environment config. Values come from env vars — never hardcoded.
// The marketing blog reads these; if the project ID is absent the client layer
// degrades gracefully (empty content) so the rest of the site still builds.

export const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-01-01'
export const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'
export const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || ''

// Studio mount path — deliberately not the common "/studio".
export const studioBasePath = '/content-studio'

export const isSanityConfigured = projectId.length > 0
