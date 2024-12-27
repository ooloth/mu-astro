import { getCollection } from 'astro:content'
import { addRemarkFrontmatter, type Bookmark } from './collections'
import { cleanTags } from './tags'

/**
 * Returns true if file is a non-private bookmark.
 * TODO: add unit tests
 */
const isPublicBookmark = (bookmark: Bookmark): boolean =>
  !bookmark.data.private && !(bookmark.data.tags || []).includes('recursion')

/**
 * In production, remove all private bookmarks.
 * TODO: add unit tests
 */
const removePrivateBookmarks = (bookmarks: Bookmark[]): Bookmark[] =>
  import.meta.env.PROD ? bookmarks.filter(bookmark => isPublicBookmark(bookmark)) : bookmarks

/**
 * Returns a flat list of all tags found in all bookmarks.
 * TODO: add unit tests
 */
export const getAllTagsInBookmarks = async (): Promise<string[]> =>
  getBookmarks().then(bookmarks => cleanTags(bookmarks.flatMap(bookmark => bookmark.data.tags ?? [])))

/**
 * Returns a flat list of all notes with matching tags.
 */
export const getBookmarksWithTags = async (tags: string[]): Promise<Bookmark[]> =>
  getBookmarks().then(bookmarks =>
    bookmarks.filter(bookmark => (bookmark.data.tags || []).some(tag => tags.includes(tag))),
  )

/**
 * Returns all tags with their respective bookmarks.
 */
export const getBookmarksByTag = async (): Promise<Record<string, Bookmark[]>> => {
  const tags = await getAllTagsInBookmarks()

  const bookmarksByTagEntries = await Promise.all(
    tags.map(async tag => {
      const bookmarks = await getBookmarksWithTags([tag])
      return [tag, bookmarks]
    }),
  )

  return Object.fromEntries(bookmarksByTagEntries)
}

/**
 * Returns a flat list of all bookmarks with private bookmarks removed (in production).
 */
export const getBookmarks = async (): Promise<Bookmark[]> => {
  const bookmarksToShow = removePrivateBookmarks(await getCollection('bookmarks'))
  return Promise.all(bookmarksToShow.map(bookmark => addRemarkFrontmatter(bookmark)))
}
