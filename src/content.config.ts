// See: https://docs.astro.build/en/guides/content-collections/

import { defineCollection, z } from 'astro:content'
import { glob, file } from 'astro/loaders'

// 3. Define your collection(s)
const albums = defineCollection({
  // See: https://globster.xyz
  loader: file('./src/content/itunes/albums.yaml'),
  schema: z.object({
    date: z.coerce.date(),
    id: z.number(),
    name: z.string(),
  }),
})

const bookmarks = defineCollection({
  // See: https://globster.xyz
  loader: glob({ pattern: '**/[^_]*.{md,mdx}', base: './src/content/bookmarks' }),
  schema: z.object({
    author: z.array(z.string()).optional().nullable(),
    date: z.coerce.date().optional().nullable(),
    tags: z.array(z.string()).optional().nullable(),
    title: z.string(),
  }),
})

const books = defineCollection({
  // See: https://docs.astro.build/en/guides/content-collections/#built-in-loaders
  // See: https://globster.xyz
  loader: file('./src/content/itunes/books.yaml'),
  schema: z.object({
    name: z.string(),
    id: z.number(),
    date: z.coerce.date(),
  }),
})

const drafts = defineCollection({
  // See: https://globster.xyz
  loader: glob({ pattern: '**/[^_]*.{md,mdx}', base: './src/content/drafts' }),
  schema: z.object({
    title: z.string().optional().nullable(),
    date: z.coerce.date().optional().nullable(),
    tags: z.array(z.string()).optional().nullable(),
  }),
})

const pages = defineCollection({
  // See: https://globster.xyz
  loader: glob({ pattern: '**/[^_]*.{md,mdx}', base: './src/content/pages' }),
  schema: z.object({
    title: z.string(),
    //   description: z.string(),
    tags: z.array(z.string()).optional().nullable(),
  }),
})

const podcasts = defineCollection({
  // See: https://globster.xyz
  loader: file('./src/content/itunes/podcasts.yaml'),
  schema: z.object({
    name: z.string(),
    id: z.number(),
    date: z.coerce.date(),
  }),
})

const tils = defineCollection({
  // See: https://globster.xyz
  loader: glob({ pattern: '**/[^_]*.{md,mdx}', base: './src/content/til' }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    tags: z.array(z.string()).optional().nullable(), // TODO: require? report?
  }),
})

// TODO: split into notes and article
const writing = defineCollection({
  // See: https://globster.xyz
  loader: glob({ pattern: '**/[^_]*.{md,mdx}', base: './src/content/writing' }),
  schema: z.object({
    title: z.string().optional().nullable(), // TODO: require for articles
    date: z.coerce.date().optional(), // TODO: require for articles
    tags: z.array(z.string()).optional().nullable(), // TODO: require? report?
  }),
})

// 4. Export a single `collections` object to register your collection(s)
export const collections = { albums, bookmarks, books, drafts, pages, podcasts, tils, writing }
