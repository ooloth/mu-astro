// See: https://docs.astro.build/en/guides/content-collections/
// See: https://docs.astro.build/en/guides/content-collections/#built-in-loaders
// See: https://www.digitalocean.com/community/tools/glob
// See: https://globster.xyz

// NOTE: zod requires strictNullChecks to be enabled in tsconfig.json (which is the default when strict is enabled)
// See: https://github.com/colinhacks/zod/issues/121

import { defineCollection, z } from 'astro:content'
import { glob, file } from 'astro/loaders'

// TODO: posts/tils from "posts", drafts from "drafts", pages from "pages", bookmarks from "bookmarks", notes from "notes"
// TODO: update obsidian on mac and phone to create new notes in the right folders

/*********
 * POSTS *
 *********/

const post = z.object({
  date: z.coerce.date(),
  // description: z.string().optional().nullable(),
  devLink: z.string().optional().nullable(),
  feedId: z.string().optional().nullable(),
  hackerNewsLink: z.string().optional().nullable(),
  linkSharedOnTwitter: z.string().optional().nullable(),
  ogImage: z.string().optional().nullable(),
  // parent: z.string().optional().nullable(), // TODO: remove? (will be ignored); legacy from when collection was shared with notes, which were nested
  redditLink: z.string().optional().nullable(),
  tags: z.array(z.string()).optional().nullable(), // TODO: require? report when < 2?
  title: z.string().nonempty(),
  // youtubeId: z.string().optional().nullable(), // TODO: remove? (will be ignored)
})

const posts = defineCollection({
  loader: glob({ pattern: '**/[^_]*.{md,mdx}', base: './src/content/posts' }),
  schema: post,
})

/*********
 * NOTES *
 *********/

const drafts = defineCollection({
  loader: glob({ pattern: '**/[^_]*.{md,mdx}', base: './src/content/drafts' }),
  schema: z.object({
    ...post.shape,
    date: z.coerce.date().optional().nullable(),
    private: z.boolean().optional().nullable(),
    title: z.string().optional().nullable(),
  }),
})

const notes = defineCollection({
  loader: glob({ pattern: '**/[^_]*.{md,mdx}', base: './src/content/notes' }),
  schema: z.object({
    // description: z.string().optional().nullable(),
    ogImage: z.string().optional().nullable(),
    // parent: z.string().optional().nullable(), // TODO: remove? (will be ignored); legacy from when notes were nested; still useful for determining which notes are related?
    private: z.boolean().optional().nullable(), // TODO: remove from articles
    tags: z.array(z.string()).optional().nullable(), // TODO: require? report?
    title: z.string().optional().nullable(),
  }),
})

const bookmarks = defineCollection({
  loader: glob({ pattern: '**/[^_]*.{md,mdx}', base: './src/content/bookmarks' }),
  schema: z.object({
    author: z.array(z.string()).optional().nullable(),
    captured: z.coerce.date(),
    date: z.coerce.date().optional().nullable(),
    description: z.string().optional().nullable(),
    favicon: z.string().optional().nullable(),
    image: z.string().optional().nullable(),
    private: z.boolean().optional().nullable(),
    slug: z.string().nonempty(),
    source: z.string().nonempty(),
    tags: z.array(z.string()).optional().nullable(), // TODO: report when < 2 tags?
    title: z.string().nonempty(),
  }),
})

/*********
 * PAGES *
 *********/

const pages = defineCollection({
  loader: glob({ pattern: '**/[^_]*.{md,mdx}', base: './src/content/pages' }),
  schema: z.object({
    ogImage: z.string().optional().nullable(),
    private: z.boolean().optional().nullable(),
    title: z.string().nonempty(),
    tags: z.array(z.string()).optional().nullable(),
  }),
})

/*********
 * LIKES *
 *********/

const iTunesItem = z.object({
  date: z.coerce.date(),
  id: z.number().nonnegative(), // see path after https://music.apple.com/ca, https://books.apple.com/ca, or https://podcasts.apple.com/ca
  name: z.string().nonempty(),
})

const albums = defineCollection({
  loader: file('./src/content/itunes/albums.yaml'),
  schema: iTunesItem,
})

const books = defineCollection({
  loader: file('./src/content/itunes/books.yaml'),
  schema: iTunesItem,
})

const podcasts = defineCollection({
  loader: file('./src/content/itunes/podcasts.yaml'),
  schema: iTunesItem,
})

// Export a single `collections` object to register your collection(s)
export const collections = { posts, drafts, notes, bookmarks, pages, albums, books, podcasts }
