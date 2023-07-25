// see: https://docs.astro.build/en/guides/rss

import rss from '@astrojs/rss'
import MarkdownIt from 'markdown-it'
import sanitizeHtml from 'sanitize-html'
import type { APIContext } from 'astro'

import { getPublishedPosts } from '../utils/posts'

const parser = new MarkdownIt()

export async function get(context: APIContext) {
  const publishedBlogPosts = await getPublishedPosts()

  return rss({
    title: 'Michael Uloth',
    description: 'Blog posts by Michael Uloth',
    // see: https://docs.astro.build/en/reference/api-reference/#contextsite
    site: context.site as unknown as string,
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
