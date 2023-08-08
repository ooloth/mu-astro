import cloudinary from './client'
import isCloudinaryImage from './isCloudinaryImage'

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

async function fetchImageDetails(publicId: string) {
  if (!isCloudinaryImage(publicId)) {
    throw Error(`${publicId} is not a Cloudinary image path.`)
  }

  const publicIdWithoutQueryParams = publicId.split('?')[0]

  // see: https://cloudinary.com/documentation/admin_api#using_sdks_with_the_admin_api
  // see: https://cloudinary.com/documentation/admin_api#get_details_of_a_single_resource_by_public_id
  const imageDetails = await cloudinary.api
    .resource(publicIdWithoutQueryParams, { resource_type: 'image', type: 'upload', max_results: 1 })
    .catch(error => {
      throw Error(`Error fetching image details for "${publicId}":\n\n${error}\n`)
    })

  const { loading, decoding } = parseAnyCustomAttributesPassedAsQueryParams(publicId)

  return { ...imageDetails, loading, decoding }
}

export default fetchImageDetails
