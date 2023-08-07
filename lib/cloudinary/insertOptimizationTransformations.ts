// TODO: use the node or js sdk to do what I'm doing here so I don't need to construct URLs?

import { TRANSFORMATIONS } from './const'

/**
 *
 * @param {string} cloudinaryUrl A full Cloudinary URL with no transformations (e.g. https://res.cloudinary.com/cloud_name/image/upload/version/public-id.jpg)
 * @param {number} width How wide (in pixels) this image will be displayed in the layout, ignoring DPR adjustments
 * @returns {string}
 * @see https://cloudinary.com/documentation/transformation_reference
 */
function insertOptimizationTransformations(cloudinaryUrl: string, width: number): string {
  if (!cloudinaryUrl.includes('cloudinary')) {
    throw Error(`Not a cloudinary URL: ${cloudinaryUrl}`)
  }

  const w = width ?? 720
  const transformationsPathSegment = `${TRANSFORMATIONS},w_${w}/`

  if (cloudinaryUrl.includes('upload/')) {
    return cloudinaryUrl.replace('upload/', `upload/${transformationsPathSegment}/`)
  }
  if (cloudinaryUrl.includes('fetch/')) {
    return cloudinaryUrl.replace('fetch/', `fetch/${transformationsPathSegment}/`)
  }
  if (cloudinaryUrl.includes('youtube/')) {
    return cloudinaryUrl.replace('youtube/', `youtube/${transformationsPathSegment}/`)
  }

  return cloudinaryUrl
}

export default insertOptimizationTransformations
