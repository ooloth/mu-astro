// see: https://docs.astro.build/en/guides/rss

import rss from '@astrojs/rss'
import type { APIContext } from 'astro'
import remarkParse from 'remark-parse'
import remarkGfm from 'remark-gfm'
import remarkSmartyPants from 'remark-smartypants'
import remarkRehype from 'remark-rehype'
import remarkUnwrapImages from 'remark-unwrap-images'
import rehypePrettyCode from 'rehype-pretty-code'
import rehypeStringify from 'rehype-stringify'
import { unified } from 'unified'

import { getPublishedPosts } from '../utils/posts'
import site from '../data/site'
import rehypeCloudinaryImageAttributes from '../../lib/rehype/cloudinary-image-attributes'
import remarkRemoveTags from '../../lib/remark/remove-tags'
import { remarkWikiLink } from '@portaljs/remark-wiki-link'

export async function get(context: APIContext): Promise<{ body: string }> {
  // Only include published posts, even in development
  const publishedBlogPosts = await getPublishedPosts()

  return rss({
    // see: https://www.rssboard.org/rss-specification
    // see: https://docs.astro.build/en/reference/api-reference/#contextsite
    site: context.site as unknown as string,
    title: site.title,
    description: site.description.rss,
    customData: `<language>en-ca</language><lastBuildDate>${new Date().toUTCString()}</lastBuildDate>`,
    items: await Promise.all(
      publishedBlogPosts.map(async post => {
        // Match the remark and rehype plugins used in astro.config.mjs
        const content = await unified()
          .use(remarkParse)
          .use(remarkGfm)
          .use(remarkSmartyPants)
          .use(remarkRemoveTags)
          .use(remarkUnwrapImages)
          .use(remarkWikiLink, {
            // see: https://github.com/datopian/portaljs/tree/main/packages/remark-wiki-link
            // see: https://stackoverflow.com/a/76897910/8802485
            pathFormat: 'obsidian-absolute',
            wikiLinkResolver: slug => [`${slug}/`], // expects all pages to have root-level paths
          })
          .use(remarkRehype)
          .use(rehypeCloudinaryImageAttributes) // mine
          .use(rehypePrettyCode, {
            // see: https://rehype-pretty-code.netlify.app
            tokensMap: {
              fn: 'entity.name.function',
              kw: 'keyword',
              key: 'meta.object-literal.key',
              pm: 'variable.parameter',
              obj: 'variable.other.object',
              str: 'string',
            },
          })
          .use(rehypeStringify)
          .process(post.body)

        const slug = `${post.slug}/`
        const permalink = post.data.feedId || `${site.url}${slug}`

        return {
          title: post.data.title,
          link: slug,
          description: post.data.description,
          pubDate: post.data.date,
          customData: `<guid permalink="true">${permalink}</guid><author>${site.author.email})</author>`,
          content: String(content.value),
        }
      }),
    ),
  })
}
