import imageUrlBuilder from '@sanity/image-url'
import { dataset, projectId } from '../env'

// Derive the source type from the builder rather than importing a deep path
// that doesn't exist in all versions of @sanity/image-url.
type SanityImageSource = Parameters<ReturnType<typeof imageUrlBuilder>['image']>[0]

const builder = projectId ? imageUrlBuilder({ projectId, dataset }) : null

export function urlForImage(source: SanityImageSource, width?: number): string | null {
  if (!builder || !source) return null
  const img = builder.image(source).auto('format').fit('max')
  return (width ? img.width(width) : img).url()
}
