import isCloudinaryImage from './isCloudinaryImage'

/**
 * @param {string} publicId The name of the image in Cloudinary, including all folder names (e.g. mu/cool-pic)
 * @see https://cloudinary.com/documentation/admin_api#get_details_of_a_single_resource_by_public_id
 */
function getDetailsUrlFromPublicId(publicId: string): string {
  return `https://${process.env.CLOUDINARY_API_KEY}:${process.env.CLOUDINARY_API_SECRET}@api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/resources/image/upload/${publicId}`
}

// TODO: handle no id param
// TODO: handle id param missing folder prefix in public_id

async function fetchImageDetails(publicId: string): Promise<unknown> {
  if (!isCloudinaryImage(publicId)) {
    throw Error(`${publicId} is not a Cloudinary image path.`)
  }

  const detailsUrl = getDetailsUrlFromPublicId(publicId)

  const imageDetails = await fetch(detailsUrl).catch(error => {
    throw Error(`Error fetching image details for "${publicId}" using the URL "${detailsUrl}":\n\n${error}\n`)
  })

  return imageDetails
}

export default fetchImageDetails
