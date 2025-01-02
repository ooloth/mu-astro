import { getCollection } from 'astro:content'
import {
  addLastModifiedDate,
  removePrivateInProduction,
  sortByLastModifiedDate,
  type Bookmark,
  type HasCollection,
} from './collections'

/**
 * Returns true if the entry is from the bookmarks collection.
 */
export const isBookmark = (entry: HasCollection): entry is Bookmark => entry.collection === 'bookmarks'

/**
 * Returns a list of all bookmarks (with private bookmarks removed in production), sorted by last modified date.
 */
export const getBookmarks = async (): Promise<Bookmark[]> =>
  sortByLastModifiedDate(await addLastModifiedDate(removePrivateInProduction(await getCollection('bookmarks'))))
