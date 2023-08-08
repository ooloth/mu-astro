// see: https://docs.astro.build/en/guides/rss

import rss from '@astrojs/rss'
import type { APIContext } from 'astro'
import remarkParse from 'remark-parse'
import remarkGfm from 'remark-gfm'
import remarkSmartyPants from 'remark-smartypants'
import remarkRehype from 'remark-rehype'
import rehypeStringify from 'rehype-stringify'
import { unified } from 'unified'

import { getPublishedPosts } from '../utils/posts'
import site from '../data/site'
import rehypeCloudinaryImageAttributes from '../../lib/rehype/cloudinary-image-attributes'

export async function get(context: APIContext): Promise<{ body: string }> {
  const publishedBlogPosts = await getPublishedPosts()

  return rss({
    // see: https://docs.astro.build/en/reference/api-reference/#contextsite
    site: context.site as unknown as string,
    title: site.title,
    description: site.description.rss,
    customData: `<language>en-ca</language>`,
    items: await Promise.all(
      publishedBlogPosts.map(async post => {
        const content = await unified()
          .use(remarkParse)
          .use(remarkGfm)
          .use(remarkSmartyPants)
          .use(remarkRehype)
          .use(rehypeCloudinaryImageAttributes)
          .use(rehypeStringify)
          .process(post.body)

        return {
          title: post.data.title,
          pubDate: post.data.date,
          description: post.data.description,
          link: `/${post.slug}/`,
          content: String(content.value),
        }
      }),
    ),
  })
}
