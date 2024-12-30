// @astrojs/sitemap doesn't allow filtering content collection items by their data properties, so I wrote this simple static file endpoint instead.
// see: https://docs.astro.build/en/core-concepts/endpoints/#static-file-endpoints

import { getPosts } from '../utils/posts'
import { getNotes } from '../utils/notes'
import { getTILs } from '../utils/tils'
import { getBookmarks } from '../utils/bookmarks'

export async function GET(): Promise<Response> {
  const pages = ['/', '/til/', '/notes/', '/about/', '/likes/'] // static pages statically output by src/pages
  const posts = await getPosts() // posts dynamically output by src/pages/[slug].astro
  const tils = await getTILs() // notes dynamically output by src/pages/[slug].astro
  const notes = await getNotes() // notes dynamically output by src/pages/[slug].astro
  const bookmarks = await getBookmarks() // notes dynamically output by src/pages/[slug].astro

  // all paths in /[slug]/ format
  const allPaths = [
    ...pages,
    ...posts.map(post => `/${post.id}/`),
    ...tils.map(til => `/${til.id}/`),
    ...notes.map(note => `/${note.id}/`),
    ...bookmarks.map(bookmark => `/${bookmark.id}/`),
  ]

  const xml = `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${allPaths
    .map(path => `<url><loc>${`https://michaeluloth.com${path}`}</loc></url>`)
    .join('')}</urlset>`

  return new Response(xml)
}
