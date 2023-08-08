/**
 * Returns true if the image path includes includes "cloudinary" or "mu/".
 */
function isCloudinaryUpload(src: string): boolean {
  return src.includes('mu/')
}

export default isCloudinaryUpload
