import { render, type CollectionEntry, type InferEntrySchema } from 'astro:content'
import type { AstroComponentFactory } from 'astro/runtime/server/index.js'
// import type { MarkdownHeading } from 'astro'

export type Writing = CollectionEntry<'writing'>
export type Post = Writing

export type TILEntry = CollectionEntry<'tils'>
export type TIL = TILEntry & { Content: AstroComponentFactory }

export type Draft = CollectionEntry<'drafts'>

export type Note = Omit<Writing, 'data'> & {
  data: InferEntrySchema<'writing'> & {
    children: Note[]
  }
}

export type Bookmark = CollectionEntry<'bookmarks'>

/**
 * Returns true if the pathname matches any slug in the collection (at any ancestry level)
 */
export const isPathnameInCollection = (
  pathname: string | undefined,
  collection: Writing[] | Draft[] | TIL[] | Bookmark[] | Note[],
): boolean => {
  const removeLeadingAndTrailingSlashes = (str?: string): string => (str ? str.replace(/^\/|\/$/g, '') : '')

  const pathnameMatchesSlug = (slug: string): boolean =>
    removeLeadingAndTrailingSlashes(pathname) === removeLeadingAndTrailingSlashes(slug)

  return collection.some(
    item =>
      pathnameMatchesSlug(item.id) || ('children' in item.data && isPathnameInCollection(pathname, item.data.children)),
    // (item.data.children ?? []).some((child: Note): boolean => pathnameMatchesSlug(child.id)),
  )
}

export async function addRemarkFrontmatter<T extends Post | TIL | Draft | Note | Bookmark>(entry: T): Promise<T> {
  const { remarkPluginFrontmatter } = await render(entry)

  // see: https://docs.astro.build/en/recipes/modified-time/
  const entryWithRemarkFrontmatter = { ...entry, data: { ...entry.data, ...remarkPluginFrontmatter } }

  return entryWithRemarkFrontmatter
}

/**
 * Returns entries sorted in descending order by publish date, with undefined dates sorted first.
 */
export const sortDescending = <T extends Post | TIL | TILEntry | Draft>(entries: T[]): T[] => {
  const sortByDate = <T extends Post | TIL | TILEntry | Draft>(a: T, b: T): number => {
    const dateA = a.data.date ? new Date(a.data.date).getTime() : -Infinity
    const dateB = b.data.date ? new Date(b.data.date).getTime() : -Infinity
    return dateB - dateA
  }

  return entries.sort(sortByDate)
}

/**
 * Returns true if an entry has a publish date and it's in the past.
 */
export const isPublished = (entry: Post | TILEntry): boolean => {
  const date = entry.data.date ? new Date(entry.data.date) : null
  return date !== null && date <= new Date()
}

/**
 * Returns true if the entry is not marked private or obviously about work.
 */
export const isPublic = <T extends Note | Bookmark | Draft>(entry: T): boolean =>
  !entry.data.private && !(entry.data.tags ?? []).includes('private') && !entry.id.includes('recursion')
