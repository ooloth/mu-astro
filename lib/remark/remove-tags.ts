// see: https://www.ryanfiller.com/blog/remark-and-rehype-plugins
// see: https://github.com/syntax-tree/mdast

import type { RemarkPlugin } from '@astrojs/markdown-remark'
import type { Data, Text } from 'mdast'
import { visit } from 'unist-util-visit'
import type { Node } from 'unist'

/**
 * Given a string, remove all topic tags like " #post" or " #question"
 * TODO: can I move these tags to the frontmatter?
 */
const removeTags = (str: string): string => str.replaceAll(/\s#[\w|/]+/g, '')

type Transformer = (tree: Node<Data>) => Promise<void>

const remarkRemoveTags: RemarkPlugin =
  (): Transformer =>
  async (tree: Node<Data>): Promise<void> => {
    // identify the type of node I want to modify ("text" in this case) here: https://astexplorer.net
    visit(tree, 'text', (node: Text) => {
      if (!node.value.includes(' #')) return

      // Use Object.assign to replace the exact same object instead of triggering an infinite loop by creating new objects
      Object.assign(node, {
        ...node,
        value: removeTags(node.value),
      })
    })
  }

export default remarkRemoveTags
