/**
 * Returns true if the image path includes "mu/".
 */
function isCloudinaryImage(src: string): boolean {
  return src.includes('mu/')
}

export default isCloudinaryImage
