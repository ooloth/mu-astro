import type { CollectionEntry } from 'astro:content'

// TODO: add Note? put in dedicated folder?
export type Bookmark = CollectionEntry<'bookmarks'>
export type Draft = CollectionEntry<'drafts'>
export type TIL = CollectionEntry<'til'>
export type Writing = CollectionEntry<'writing'>

/**
 * Returns true if the pathname matches any slug in the collection (at any ancestry level)
 */
export const isPathnameInCollection = (
  pathname: string | undefined,
  collection: Writing[] | Draft[] | TIL[] | Bookmark[],
): boolean => {
  const removeLeadingAndTrailingSlashes = (str?: string): string => (str ? str.replace(/^\/|\/$/g, '') : '')

  const pathnameMatchesSlug = (slug: string): boolean =>
    removeLeadingAndTrailingSlashes(pathname) === removeLeadingAndTrailingSlashes(slug)

  return collection.some(
    item =>
      pathnameMatchesSlug(item.slug) ||
      (item.data.children || []).some((child: Writing): boolean => pathnameMatchesSlug(child.slug)),
  )
}
