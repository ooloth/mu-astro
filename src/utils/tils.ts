import { getCollection } from 'astro:content'

import type { Draft, TIL } from './collections'

type TILWithContent = TIL & { Content: AstroComponentFactory; headings: MarkdownHeading[] }
type TILWithDate = TIL & { data: { date: string } }

export const isTIL = (til: TIL): til is TIL => til.data.tags?.includes('til')

/**
 * Returns true if TIL is published.
 */
const isPublished = (til: TIL): til is TILWithDate =>
  isTIL(til) && til.data.date && Date.parse(til.data.date) <= Date.now()

/**
 * Sorts two TILs in descending order by publish date (or the current date if either TIL has no date yet).
 */
const sortByDate = (a: TIL | Draft, b: TIL | Draft): number =>
  (Date.parse(b.data.date) || Date.now()).toString().localeCompare((Date.parse(a.data.date) || Date.now()).toString())

/**
 * Returns TILs sorted in descending order by publish date.
 */
const sortTILs = (tils: TIL[]): TILWithDate[] => tils.sort(sortByDate)

import { getEntry } from 'astro:content'
import type { MarkdownHeading } from 'astro'
import type { AstroComponentFactory } from 'astro/dist/runtime/server'

/**
 * Returns all published TILs, in descending order by date (useful for RSS feed).
 */
export const getPublishedTILs = async (): Promise<TILWithDate[]> => sortTILs(await getCollection('til', isPublished))

/**
 * Returns all TILs in development and only published posts in production, in descending order by date.
 */
export const getTILs = async (): Promise<TILWithContent[]> => {
  const tilProperties = await getCollection('til', til => (import.meta.env.PROD ? isPublished(til) : isTIL(til)))

  const tilsWithContent: TILWithContent[] = await Promise.all(
    tilProperties.map(async til => {
      const entry = await getEntry('til', til.id)
      const { Content, headings, remarkPluginFrontmatter } = await entry!.render() // TODO: make safer
      return { ...til, Content, headings, data: { ...til.data, ...remarkPluginFrontmatter } }
    }),
  )

  return tilsWithContent.sort(sortByDate)
}
