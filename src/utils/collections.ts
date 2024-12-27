import { render, type CollectionEntry, type InferEntrySchema } from 'astro:content'

export type Bookmark = CollectionEntry<'bookmarks'>
export type Draft = CollectionEntry<'drafts'>
export type TIL = CollectionEntry<'tils'>
export type Writing = CollectionEntry<'writing'>

export type Post = Writing
export type Note = Omit<Writing, 'data'> & {
  data: InferEntrySchema<'writing'> & {
    children?: Note[]
  }
}

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
      pathnameMatchesSlug(item.id) ||
      (item.data.children ?? []).some((child: Writing | Draft | TIL | Bookmark | Note): boolean =>
        pathnameMatchesSlug(child.id),
      ),
  )
}

export async function addRemarkFrontmatter<T extends Writing | TIL | Bookmark | Draft | Note>(entry: T): Promise<T> {
  const { remarkPluginFrontmatter } = await render(entry)

  // see: https://docs.astro.build/en/recipes/modified-time/
  const entryWithRemarkFrontmatter = { ...entry, data: { ...entry.data, ...remarkPluginFrontmatter } }

  return entryWithRemarkFrontmatter
}
