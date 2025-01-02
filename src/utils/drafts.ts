import { getCollection } from 'astro:content'

import {
  addLastModifiedDate,
  removePrivateInProduction,
  sortByLastModifiedDate,
  type Draft,
  type HasCollection,
} from './collections'

/**
 * Returns true if the entry is from the drafts collection.
 */
export const isDraft = (entry: HasCollection): entry is Draft => entry.collection === 'drafts'

/**
 * Returns a list of all drafts (with private drafts removed in production), sorted by last modified date.
 */
export const getDrafts = async (): Promise<Draft[]> =>
  sortByLastModifiedDate(await addLastModifiedDate(removePrivateInProduction(await getCollection('drafts'))))
