/**
 * Returns true if the image path starts with "mu/".
 */
function isCloudinaryMuImage(src: unknown): boolean {
  return typeof src === 'string' && src.startsWith('mu/')
}

export default isCloudinaryMuImage
