import type { CollectionEntry } from 'astro:content'

export type Draft = CollectionEntry<'drafts'>
export type Writing = CollectionEntry<'writing'>

/**
 * Returns true if the pathname matches any slug in the collection (at any ancestry level)
 */
export const isPathnameInCollection = (pathname: string, collection: Writing[] | Draft[]): boolean => {
  const pathnameMatchesSlug = (slug: string): boolean => pathname === `/${slug}/`

  return collection.some(
    item =>
      pathnameMatchesSlug(item.slug) ||
      (item.data.children || []).some((child: Writing): boolean => pathnameMatchesSlug(child.slug)),
  )
}
