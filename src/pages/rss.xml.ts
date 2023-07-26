// see: https://docs.astro.build/en/guides/rss

import rss from '@astrojs/rss'
import MarkdownIt from 'markdown-it'
import sanitizeHtml from 'sanitize-html'
import type { APIContext } from 'astro'

import { getPublishedPosts } from '../utils/posts'
import site from '../data/site'

const parser = new MarkdownIt()

export async function get(context: APIContext): Promise<{ body: string }> {
  const publishedBlogPosts = await getPublishedPosts()

  return rss({
    // see: https://docs.astro.build/en/reference/api-reference/#contextsite
    site: context.site as unknown as string,
    title: site.title,
    description: site.description.rss,
    customData: `<language>en-ca</language>`,
    items: publishedBlogPosts.map(post => ({
      title: post.data.title,
      pubDate: post.data.date,
      description: post.data.description,
      link: `/${post.slug}/`,
      content: sanitizeHtml(parser.render(post.body)),
    })),
  })
}
