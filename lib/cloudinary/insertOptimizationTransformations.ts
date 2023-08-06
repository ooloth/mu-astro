/**
 *
 * @param {string} cloudinaryUrl A full Cloudinary URL with no transformations (e.g. https://res.cloudinary.com/cloud_name/image/upload/version/public-id.jpg)
 * @param {number} width How wide (in pixels) this image will be displayed in the layout, ignoring DPR adjustments
 * @returns {string}
 * @see https://cloudinary.com/documentation/transformation_reference
 */
function insertOptimizationTransformations(cloudinaryUrl: string, width: number): string {
  const w = width ?? 720

  if (!cloudinaryUrl.includes('cloudinary')) {
    throw Error(`Not a cloudinary URL: ${cloudinaryUrl}`)
  }
  if (cloudinaryUrl.includes('upload/')) {
    return cloudinaryUrl.replace('upload/', `upload/c_scale,w_${w},f_auto,q_auto/`)
  }
  if (cloudinaryUrl.includes('fetch/')) {
    return cloudinaryUrl.replace('fetch/', `fetch/c_scale,w_${w},f_auto,q_auto/`)
  }
  if (cloudinaryUrl.includes('youtube/')) {
    return cloudinaryUrl.replace('youtube/', `youtube/c_scale,w_${w},f_auto,q_auto/`)
  }

  return cloudinaryUrl
}

export default insertOptimizationTransformations
