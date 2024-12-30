import { getCollection } from 'astro:content'
import { addRemarkFrontmatter, isPublic, type Bookmark, type BookmarkEntry } from './collections'

/**
 * In production, remove all private bookmarks.
 * TODO: add unit tests
 */
const removePrivateBookmarks = (bookmarks: BookmarkEntry[]): BookmarkEntry[] =>
  import.meta.env.PROD ? bookmarks.filter(bookmark => isPublic(bookmark)) : bookmarks

/**
 * Returns a flat list of all notes with matching tags.
 */
// export const getBookmarksWithTags = async (tags: string[]): Promise<Bookmark[]> =>
//   getBookmarks().then(bookmarks =>
//     bookmarks.filter(bookmark => (bookmark.data.tags || []).some(tag => tags.includes(tag))),
//   )

/**
 * Returns all tags with their respective bookmarks.
 */
// export const getBookmarksByTag = async (): Promise<Record<string, Bookmark[]>> => {
//   const tags = await getAllTagsInBookmarks()

//   const bookmarksByTagEntries = await Promise.all(
//     tags.map(async tag => {
//       const bookmarks = await getBookmarksWithTags([tag])
//       return [tag, bookmarks]
//     }),
//   )

//   return Object.fromEntries(bookmarksByTagEntries)
// }

/**
 * Returns a flat list of all bookmarks with private bookmarks removed (in production).
 */
export const getBookmarks = async (): Promise<Bookmark[]> => {
  const bookmarksToShow = removePrivateBookmarks(await getCollection('bookmarks'))
  return Promise.all(bookmarksToShow.map(bookmark => addRemarkFrontmatter(bookmark)))
}
