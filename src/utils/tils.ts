import { getCollection, render } from 'astro:content'

import { isPublished, sortDescending, type TIL, type TILEntry } from './collections'

/**
 * Returns all published TILs, in descending order by date (useful for RSS feed).
 */
export const getPublishedTILs = async (): Promise<TILEntry[]> =>
  sortDescending(await getCollection('tils', isPublished))

/**
 * Returns all TILs in development and only published posts in production, in descending order by date.
 * Adds the rendered content to each TIL so it can be displayed directly on the TIL page.
 */
export const getTILs = async (): Promise<TIL[]> => {
  const tilProperties: TILEntry[] = await getCollection('tils', til => (import.meta.env.PROD ? isPublished(til) : true))

  const tilsWithContent: TIL[] = await Promise.all(
    tilProperties.map(async til => {
      const { Content, remarkPluginFrontmatter } = await render(til)
      return { ...til, Content, data: { ...til.data, lastModified: remarkPluginFrontmatter.lastModified } }
    }),
  )

  return sortDescending(tilsWithContent)
}
