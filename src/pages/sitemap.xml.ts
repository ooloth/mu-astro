// @astrojs/sitemap doesn't allow filtering content collection items by their data properties, so I wrote this simple static file endpoint instead.
// see: https://docs.astro.build/en/core-concepts/endpoints/#static-file-endpoints

import type { APIRoute } from 'astro'

import { getPosts } from '../utils/posts'
import { getNotes } from '../utils/notes'

export const get: APIRoute = async (): Promise<{ body: string }> => {
  const pages = ['/', '/notes/', '/about/', '/likes/'] // static pages statically output by src/pages
  const posts = await getPosts() // posts dynamically output by src/pages/[slug].astro (excluding drafts in production)
  const notes = await getNotes() // notes dynamically output by src/pages/[slug].astro (excluding private notes in production)

  // all paths in /[slug]/ format
  const allPaths = [...pages, ...posts.map(post => `/${post.slug}/`), ...notes.map(note => `/${note.slug}/`)]

  return {
    body: `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${allPaths
      .map(path => `<url><loc>${`https://michaeluloth.com${path}`}</loc></url>`)
      .join('')}</urlset>`,
  }
}
