import { getCollection } from 'astro:content'
import { removePrivateInProduction, type HasCollection, type SinglePage } from './collections'

/**
 * Returns true if file is a standalone page.
 */
export const isSinglePage = (entry: HasCollection): entry is SinglePage => entry.collection === 'pages'

/**
 * Returns a list of all standalone pages (with private pages removed in production).
 */
export const getSinglePages = async (): Promise<SinglePage[]> => {
  return removePrivateInProduction(await getCollection('pages'))
}
