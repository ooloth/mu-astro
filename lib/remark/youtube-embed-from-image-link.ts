// Obsidian uses ![](<video link>) for embedding videos responsively, so I need to convert those to YouTube embeds.
// see: https://www.ryanfiller.com/blog/remark-and-rehype-plugins
// see: https://github.com/syntax-tree/mdast

import type { RemarkPlugin } from '@astrojs/markdown-remark'
import type { Data, Image } from 'mdast'
import { visit } from 'unist-util-visit'
import type { Node } from 'unist'

/**
 * Convert markdown image link containing a YouTube video link to a YouTube iFrame embed.
 */
const convertImageLinkToIframe = (url: string): string => {
  const videoId = url.split('v=')[1]
  const embedUrl = `https://www.youtube.com/embed/${videoId}`
  return `<iframe width="560" height="315" src="${embedUrl}" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>`
}

type Transformer = (tree: Node<Data>) => Promise<void>

/**
 * Convert markdown image links containing Youtube video links to YouTube embeds.
 */
const remarkYouTubeEmbedFromImageLink: RemarkPlugin =
  (): Transformer =>
  async (tree: Node<Data>): Promise<void> => {
    // Identify the type of node I want to modify ("text" in this case) here: https://astexplorer.net
    visit(tree, 'image', (node: Image) => {
      if (!node.url.includes('youtube.com')) return

      // Use Object.assign to replace the exact same object instead of triggering an infinite loop by creating new objects
      Object.assign(node, {
        type: 'html',
        value: convertImageLinkToIframe(node.url),
        position: node.position,
      })
    })
  }

export default remarkYouTubeEmbedFromImageLink
