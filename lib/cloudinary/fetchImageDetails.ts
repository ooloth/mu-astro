import cloudinary from './client'
import isCloudinaryImage from './isCloudinaryImage'

async function fetchImageDetails(publicId: string) {
  if (!isCloudinaryImage(publicId)) {
    throw Error(`${publicId} is not a Cloudinary image path.`)
  }

  const customAttributes = new URL(publicId, 'https://res.cloudinary.com').searchParams
  console.log('customAttributes', customAttributes)

  // see: https://cloudinary.com/documentation/admin_api#using_sdks_with_the_admin_api
  // see: https://cloudinary.com/documentation/admin_api#get_details_of_a_single_resource_by_public_id
  const imageDetails = await cloudinary.api
    .resource(publicId, { resource_type: 'image', type: 'upload', max_results: 1 })
    .catch(error => {
      throw Error(`Error fetching image details for "${publicId}":\n\n${error}\n`)
    })

  return imageDetails
}

export default fetchImageDetails
