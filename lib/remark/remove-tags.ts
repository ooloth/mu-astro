// see: https://www.ryanfiller.com/blog/remark-and-rehype-plugins
// see: https://github.com/syntax-tree/mdast

import type { RemarkPlugin } from '@astrojs/markdown-remark'
import type { Root, Text } from 'mdast'
import { visit } from 'unist-util-visit'

/**
 * Given a string, remove all topic tags like " #post" or " #question" or "#post" at the beginning of the text string
 * (to avoid removing heading link slugs like "page#my-heading".
 *
 * TODO: add tests
 * TODO: can I move these tags to the frontmatter?
 */
const removeTags = (str: string): string => str.replaceAll(/(^|\s)#[\w|/]+/g, '').trim()

const remarkRemoveTags =
  (): RemarkPlugin =>
  (tree: Root): void => {
    // Identify the type of node I want to modify ("text" in this case) here: https://astexplorer.net
    visit(tree, 'text', (node: Text): void => {
      if (!node.value.includes('#')) return

      // Use Object.assign to replace the exact same object instead of triggering an infinite loop by creating new objects
      Object.assign(node, {
        ...node,
        value: removeTags(node.value),
      })
    })
  }

export default remarkRemoveTags
