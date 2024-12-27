import { type MarkdownHeading } from 'astro'
import { type AstroComponentFactory } from 'astro/runtime/server/index.js'
import { getCollection, render } from 'astro:content'

import { type Draft, type TIL } from './collections'

type TILWithContent = TIL & { Content: AstroComponentFactory; headings: MarkdownHeading[] }

export const isTIL = (til: TIL): til is TIL => (til.data.tags ?? []).includes('til')

/**
 * Returns true if TIL is published.
 */
const isPublished = (til: TIL): boolean => isTIL(til) && til.data.date && til.data.date.getTime() <= Date.now()

/**
 * Sorts two TILs in descending order by publish date (or the current date if either TIL has no date yet).
 */
const sortByDate = (a: TIL | Draft, b: TIL | Draft): number =>
  (b.data.date || Date.now()).toString().localeCompare((a.data.date || Date.now()).toString())

/**
 * Returns TILs sorted in descending order by publish date.
 */
const sortTILs = (tils: TIL[]): TIL[] => tils.sort(sortByDate)

/**
 * Returns all published TILs, in descending order by date (useful for RSS feed).
 */
export const getPublishedTILs = async (): Promise<TIL[]> => sortTILs(await getCollection('tils', isPublished))

/**
 * Returns all TILs in development and only published posts in production, in descending order by date.
 */
export const getTILs = async (): Promise<TILWithContent[]> => {
  const tilProperties = await getCollection('tils', til => (import.meta.env.PROD ? isPublished(til) : isTIL(til)))

  const tilsWithContent: TILWithContent[] = await Promise.all(
    tilProperties.map(async til => {
      const { Content, headings, remarkPluginFrontmatter } = await render(til) // TODO: make safer
      return { ...til, Content, headings, data: { ...til.data, ...remarkPluginFrontmatter } }
    }),
  )

  return tilsWithContent.sort(sortByDate)
}
