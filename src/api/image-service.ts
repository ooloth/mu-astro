// see: https://docs.astro.build/en/reference/image-service-reference/#external-services
/* eslint-disable @typescript-eslint/no-unused-vars */

import type { ExternalImageService, ImageTransform } from 'astro'

const service: ExternalImageService = {
  validateOptions(options: ImageTransform, serviceConfig: Record<string, unknown>) {
    // Enforce the user set max width.
    if (
      typeof options.width === 'number' &&
      typeof serviceConfig.maxWidth === 'number' &&
      options.width > serviceConfig.maxWidth
    ) {
      console.warn(
        `Image width ${options.width} exceeds max width ${serviceConfig.maxWidth}. Falling back to max width.`,
      )
      options.width = serviceConfig.maxWidth
    }

    return options
  },

  getURL(options: ImageTransform, serviceConfig: Record<string, unknown>): string {
    return `https://mysupercdn.com/${options.src}?q=${options.quality}&w=${options.width}&h=${options.height}`
  },

  getHTMLAttributes(options: ImageTransform, serviceConfig: Record<string, unknown>) {
    const { src, format, quality, ...attributes } = options

    return {
      ...attributes,
      loading: options.loading ?? 'lazy',
      decoding: options.decoding ?? 'async',
    }
  },
}

export default service
