// see: //docs.astro.build/en/guides/rss

import rss from '@astrojs/rss'
import { getCollection } from 'astro:content'
import sanitizeHtml from 'sanitize-html'

const parser = new MarkdownIt()

export async function get(context) {
  const writing = await getCollection('writing')

  return rss({
    title: 'Michael Uloth',
    description: 'A humble Astronaut’s guide to the stars',
    // see: https://docs.astro.build/en/reference/api-reference/#contextsite
    site: context.site,
    // Array of `<item>`s in output xml
    // See "Generating items" section for examples using content collections and glob imports
    items: writing.map(post => ({
      title: post.data.title,
      pubDate: post.data.pubDate,
      description: post.data.description,
      customData: post.data.customData,
      // Compute RSS link from post `slug`
      // This example assumes all posts are rendered as `/blog/[slug]` routes
      link: `/blog/${post.slug}/`,
      content: sanitizeHtml(parser.render(post.body)),
    })),
    customData: `<language>en-ca</language>`,
  })
}
