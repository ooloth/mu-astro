// see: https://www.ryanfiller.com/blog/remark-and-rehype-plugins
// see: https://github.com/bradgarropy/rehype-cloudinary-image-size/blob/master/src/rehypeCloudinaryImageSize.ts
// see: https://github.com/bradgarropy/rehype-cloudinary-image-size/blob/master/example/index.js

import type { Properties } from 'hast'
import { isElement } from 'hast-util-is-element'
import type { Element } from 'hast'
import { CONTINUE, SKIP, visit } from 'unist-util-visit'
import type { Node } from 'unist'

import fetchImageDetails from '../cloudinary/fetchImageDetails'
import isCloudinaryImage from '../cloudinary/isCloudinaryImage'
import insertOptimizationTransformations from '../cloudinary/insertOptimizationTransformations'

interface Image extends Element {
  properties: Properties
}

const rehypeCloudinaryImageAttributes = () => {
  const images: Image[] = []

  const visitor = (node: Element) => {
    if (
      isElement(node, 'img') &&
      node.properties !== undefined &&
      typeof node.properties.src === 'string' &&
      isCloudinaryImage(node.properties.src)
    ) {
      images.push(node as Image)
      return SKIP
    }

    return CONTINUE
  }

  const transformer = async (tree: Node) => {
    visit(tree, 'element', visitor)

    const promises = images.map(image => fetchImageDetails(image.properties?.src as string))

    const details = await Promise.all(promises)

    const widths = [
      350, // image layout width on phone at 1x DPR
      700, // image layout width on phone at 2x DPR
      850,
      1020,
      1200, // image layout width on phone at 3x DPR
      1440, // max image layout width at 2x DPR (skipped 1x since 700px is already included above)
      1680,
      1920,
      2160, // max image layout width at 3x DPR
    ]

    // For blog posts and notes, image layout size currently maxes out when browser hits 768px
    // NOTE: browser takes first media query that's true, so be careful about the order
    const sizes = '(min-width: 768px) 768px, 100vw'

    images.forEach((image, index) => {
      const imageDetails = details[index]

      image.properties.src = insertOptimizationTransformations(imageDetails.secure_url, 1440)
      image.properties.srcset = widths
        .map(width => `${insertOptimizationTransformations(imageDetails.secure_url, width)} ${width}w`)
        .join(', ')
      image.properties.sizes = sizes
      image.properties.alt = imageDetails?.context?.custom?.alt ?? ' ' // comes from "Description" field in contextual metadata
      image.properties.width = imageDetails.width
      image.properties.height = imageDetails.height
      image.properties.loading = imageDetails.loading
      image.properties.decoding = imageDetails.decoding

      // TODO: conditionally add figure + figcaption
      // const caption = imageDetails?.context?.custom?.caption // comes from "Title" field in contextual metadata

      // const img = `<img src="${src}" srcset="${srcset}" sizes="${sizes}" alt="${alt}" width="${imageDetails.width}" height="${imageDetails.height}" loading="${loading}" decoding="${decoding}" />`

      // return caption ? `<figure>${img}<figcaption>${caption}</figcaption></figure>` : img
    })
  }

  return transformer
}

export default rehypeCloudinaryImageAttributes
