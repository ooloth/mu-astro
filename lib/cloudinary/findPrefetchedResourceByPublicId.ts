import isCloudinaryUpload from './isCloudinaryUpload'
import readCachedCloudinaryResources from './readCachedCloudinaryResources'

const cloudinaryResources = await readCachedCloudinaryResources()

type Loading = 'lazy' | 'eager'
type Decoding = 'async' | 'sync'

/**
 * @param publicId A cloudinary public_id value, including folder name, with or without query params representing custom img attributes (e.g. 'mu/cool-pic' or 'mu/cool-pic?loading=eager')
 */
function parseAnyCustomAttributesPassedAsQueryParams(publicId: string): {
  loading: Loading
  decoding: Decoding
} {
  // Parse any custom img attributes appended to publicId as query params
  const customAttributes = new URLSearchParams(publicId.split('?')[1])

  // Set img attributes not provided by Cloudinary based on markdown query params (if any)
  const loading = (customAttributes.get('loading') as Loading) ?? 'lazy'
  const decoding = loading === 'eager' ? 'sync' : 'async'

  return { loading, decoding }
}

function findCachedResourceByPublicId(publicId: string) {
  if (!cloudinaryResources) throw new Error('Cloudinary resources have not been cached yet.')

  if (!isCloudinaryUpload(publicId)) {
    throw new Error(`${publicId} is not a Cloudinary image path.`)
  }

  const publicIdWithoutQueryParams = publicId.split('?')[0]

  const imageDetails = cloudinaryResources.find(resource => resource.public_id === publicIdWithoutQueryParams)

  if (!imageDetails) throw new Error(`No cached Cloudinary resource found for public_id "${publicId}"`)

  const { loading, decoding } = parseAnyCustomAttributesPassedAsQueryParams(publicId)

  return { ...imageDetails, loading, decoding }
}

export default findCachedResourceByPublicId
