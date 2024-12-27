// see: https://docs.astro.build/en/guides/rss

import rss from '@astrojs/rss'
import type { APIContext } from 'astro'
import remarkParse from 'remark-parse'
import remarkGfm from 'remark-gfm'
import remarkSmartyPants from 'remark-smartypants'
import remarkRehype from 'remark-rehype'
import rehypeStringify from 'rehype-stringify'
import { unified, type Processor, type VFileWithOutput } from 'unified'

import { getPublishedPosts } from '../utils/posts'
import site from '../data/site'
import rehypePlugins from '../../lib/rehype/plugins'
import remarkPlugins from '../../lib/remark/plugins'

const unifiedPluginsPlusAstroDefaults = [
  remarkParse,
  remarkGfm,
  remarkSmartyPants,
  ...remarkPlugins,
  remarkRehype,
  ...rehypePlugins,
  rehypeStringify,
]

export async function GET(context: APIContext): Promise<Response> {
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
        // An alternative to calling unified().use(plugin).use(plugin).process(post.body) that leverages the arrays of shared plugins above
        const content = (await unifiedPluginsPlusAstroDefaults
          // @ts-expect-error - TS doesn't like the type of "plugin" here
          .reduce((processor: Processor, plugin): Processor => processor.use(plugin), unified())
          .process(post.body)) satisfies VFileWithOutput<string>

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
