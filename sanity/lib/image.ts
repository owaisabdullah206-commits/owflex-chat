import imageUrlBuilder from '@sanity/image-url'
import type { SanityImageSource } from '@sanity/image-url/lib/types/types'
import { dataset, projectId } from '../env'

const builder = projectId ? imageUrlBuilder({ projectId, dataset }) : null

export function urlForImage(source: SanityImageSource): string | null {
  if (!builder || !source) return null
  return builder.image(source).auto('format').fit('max').url()
}
