import cloudinary from './client'
import isCloudinaryImage from './isCloudinaryImage'

// TODO: handle no publicId param
// TODO: handle missing folder prefix in publicId
async function fetchImageDetails(publicId: string): Promise<unknown> {
  if (!isCloudinaryImage(publicId)) {
    throw Error(`${publicId} is not a Cloudinary image path.`)
  }

  // see: https://cloudinary.com/documentation/admin_api#using_sdks_with_the_admin_api
  // see: https://cloudinary.com/documentation/admin_api#get_details_of_a_single_resource_by_public_id
  const imageDetails = await cloudinary.api
    .resource(publicId, { resource_type: 'image', type: 'upload', max_results: 1 })
    .catch(error => {
      throw Error(`Error fetching image details for "${publicId}":\n\n${error}\n`)
    })

  console.log('imageDetails', imageDetails)
  return imageDetails
}

export default fetchImageDetails
