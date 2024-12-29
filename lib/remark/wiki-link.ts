/* eslint-disable no-useless-escape */
// see: https://www.ryanfiller.com/blog/remark-and-rehype-plugins
// see: https://github.com/syntax-tree/mdast

import type { RemarkPlugin } from '@astrojs/markdown-remark'
import type { Data, Paragraph, PhrasingContent } from 'mdast'
import { u } from 'unist-builder'
import { visit } from 'unist-util-visit'
import type { Node } from 'unist'
import { slug as githubSlug } from 'github-slugger'

/**
 * Convert text containing one or more Obsidian wiki links to anchor links with slugs matching Astro's generated content slugs.
 *
 * TODO: in media server jobs, audit all the rendered output to confirm all wiki links were found
 * TODO: unit test this!
 * TODO: could a wiki link appear inside a different PhrasingContent node? Emphasis, Strong, etc? Handle?
 *
 * Examples of wiki links:
 *
 * [[file name]]
 * [[file-name]]
 * [[file name|custom text]]
 * [[file-name#heading-slug]]
 * [[file name#heading-slug|custom text]]
 *
 */
const convertWikiLinksToMarkdownLinks = (textNodeValue: string): PhrasingContent[] => {
  // Capture the slug and optional link text in a wiki link
  const wikiLinkRegex = /\[\[(?<slug>[^\|\]]+)(\|(?<optionalLinkText>[^\]]+))?\]\]/g

  // We'll be splitting the text node value string into an array of Text and Link nodes
  const segments: PhrasingContent[] = []
  let lastIndex = 0

  textNodeValue.replace(
    wikiLinkRegex,
    (
      match: string,
      slug: string,
      _optionalSeparatorAndLinkText: string,
      optionalLinkText: string,
      offset: number,
    ): string => {
      // Add the text before the match as a Text node
      if (offset > lastIndex) {
        segments.push(u('text', textNodeValue.slice(lastIndex, offset)))
      }

      // Add the matched link as a link node
      const linkText = optionalLinkText || slug

      // I only create root-level paths, so any "/" should represent an obsidian folder, which I can discard
      const slugAfterLastSlash = slug.split('/').at(-1)!

      // Some slugs may link to a heading with a "#", which githubSlug will discard by default
      // There may or may not be a hashtag in the slug
      // If there's no hashtag, "slugBeforeHastag" will contain the entire slug
      const [pageSlug, optionalHeadingSlug] = slugAfterLastSlash.split('#')

      // Astro uses githubSlug to generate slugs, so we'll use it here to match
      // See: https://github.com/withastro/astro/blob/main/packages/astro/src/content/utils.ts#L406
      // See: https://github.com/Flet/github-slugger
      const linkSlug = `/${githubSlug(pageSlug)}/${optionalHeadingSlug ? `#${githubSlug(optionalHeadingSlug)}` : ''}`

      segments.push(u('link', { url: `${linkSlug}` }, [u('text', linkText)]))

      lastIndex = offset + match.length
      // console.log('segments:', JSON.stringify(segments, null, 2))

      // What matters is the segments array we've populated, so we just return the match unchanged
      return match
    },
  )

  // Add the remaining text as a Text node
  if (lastIndex < textNodeValue.length) {
    segments.push(u('text', textNodeValue.slice(lastIndex)))
  }

  return segments
}

type Transformer = (tree: Node<Data>) => Promise<void>

/**
 * Convert Obsidian wiki links to Markdown links.
 */
const remarkWikiLink: RemarkPlugin =
  (): Transformer =>
  async (tree: Node<Data>): Promise<void> => {
    // Identify the type of node I want to modify ("paragraph" in this case) here: https://astexplorer.net
    visit(tree, 'paragraph', (node: Paragraph) => {
      const newChildren: PhrasingContent[] = []

      node.children.forEach(child => {
        if (child.type === 'text') {
          newChildren.push(...convertWikiLinksToMarkdownLinks(child.value))
        } else {
          newChildren.push(child)
        }
      })

      node.children = newChildren
    })
  }

export default remarkWikiLink
