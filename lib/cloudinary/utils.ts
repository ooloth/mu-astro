function transformCloudinaryImage(url: string, width: number) {
  if (url.includes('cloudinary')) {
    if (url.includes('upload/')) {
      return url.replace('upload/', `upload/w_${width},f_auto,q_auto,dpr_2.0/`)
    }
    if (url.includes('fetch/')) {
      return url.replace('fetch/', `fetch/w_${width},f_auto,q_auto,dpr_2.0/`)
    }
    if (url.includes('youtube/')) {
      return url.replace('youtube/', `youtube/w_${width},f_auto,q_auto,dpr_2.0/`)
    }
  }

  return url
}

export { transformCloudinaryImage }
