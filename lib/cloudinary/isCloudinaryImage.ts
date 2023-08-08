/**
 * Returns true if the image path includes includes "cloudinary" or "mu/".
 */
function isCloudinaryImage(src: string): boolean {
  return src.includes('cloudinary') || src.includes('mu/')
}

export default isCloudinaryImage
