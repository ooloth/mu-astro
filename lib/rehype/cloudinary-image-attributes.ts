// see: https://www.ryanfiller.com/blog/remark-and-rehype-plugins
// see: https://github.com/bradgarropy/rehype-cloudinary-image-size/blob/master/src/rehypeCloudinaryImageSize.ts
// see: https://github.com/bradgarropy/rehype-cloudinary-image-size/blob/master/example/index.js

import type { Properties } from 'hast'
import { isElement } from 'hast-util-is-element'
import type { Element } from 'hast'
import { CONTINUE, SKIP, visit } from 'unist-util-visit'
import type { Node } from 'unist'

import isCloudinaryUpload from '../cloudinary/isCloudinaryUpload'
import cloudinary from '../cloudinary/client'
import findCachedResourceByPublicId from '../cloudinary/findPrefetchedResourceByPublicId'

interface Image extends Element {
  properties: Properties
}

const rehypeCloudinaryImageAttributes = () => {
  const htmlImages: Image[] = []

  const visitor = (node: Element) => {
    if (
      isElement(node, 'img') &&
      node.properties !== undefined &&
      typeof node.properties.src === 'string' &&
      isCloudinaryUpload(node.properties.src)
    ) {
      htmlImages.push(node as Image)
      return SKIP
    }

    return CONTINUE
  }

  const transformer = async (tree: Node) => {
    visit(tree, 'element', visitor)

    const cloudinaryImageDetails = htmlImages.map(htmlImage =>
      findCachedResourceByPublicId(htmlImage.properties?.src as string),
    )

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

    // Mutate the image nodes with the image details
    htmlImages.forEach((htmlImage, index) => {
      const cloudinaryDetails = cloudinaryImageDetails[index]

      htmlImage.properties.src = cloudinary.url(cloudinaryDetails.public_id, {
        crop: 'scale',
        fetch_format: 'auto',
        quality: 'auto',
        width: 1440,
      })

      htmlImage.properties.srcset = widths
        .map(
          width =>
            `${cloudinary.url(cloudinaryDetails.public_id, {
              crop: 'scale',
              fetch_format: 'auto',
              quality: 'auto',
              width,
            })} ${width}w`,
        )
        .join(', ')

      // For blog posts and notes, image layout size currently maxes out when browser hits 768px
      // NOTE: browser takes first media query that's true, so be careful about the order
      htmlImage.properties.sizes = '(min-width: 768px) 768px, 100vw'

      // @ts-expect-error: "custom" property currently defined as type "object"
      htmlImage.properties.alt = cloudinaryDetails?.context?.custom?.alt ?? ' ' // comes from "Description" field in contextual metadata
      htmlImage.properties.width = cloudinaryDetails.width
      htmlImage.properties.height = cloudinaryDetails.height
      htmlImage.properties.loading = cloudinaryDetails.loading
      htmlImage.properties.decoding = cloudinaryDetails.decoding

      // @ts-expect-error: "custom" property currently defined as type "object"
      const caption = cloudinaryDetails?.context?.custom?.caption // comes from "Title" field in contextual metadata

      if (caption) {
        // see: https://github.com/syntax-tree/hast#element
        const figure = {
          type: 'element',
          tagName: 'figure',
          properties: {},
          children: [
            { ...htmlImage },
            {
              type: 'element',
              tagName: 'figcaption',
              children: [{ type: 'text', value: caption }],
            },
          ],
        }

        // If a caption exists, replace the image with a figure that contains the img + figcaption
        // Use Object.assign to replace the exact same object instead of triggering an infinite loop by creating new objects
        Object.assign(htmlImage, figure)
      }
    })
  }

  return transformer
}

export default rehypeCloudinaryImageAttributes
