import { render, type CollectionEntry } from 'astro:content'
import type { AstroComponentFactory } from 'astro/runtime/server/index.js'
// import type { MarkdownHeading } from 'astro'

// Define a generic type that adds the lastModified property to the data field
type WithLastModified<T extends { data: object }> = Omit<T, 'data'> & {
  data: T['data'] & { lastModified: string }
}

export type Writing = CollectionEntry<'writing'>

export type PostEntry = CollectionEntry<'writing'>
export type Post = WithLastModified<PostEntry>

export type TILEntry = CollectionEntry<'tils'>
export type TIL = WithLastModified<TILEntry> & {
  Content: AstroComponentFactory
}

export type DraftEntry = CollectionEntry<'drafts'>
export type Draft = WithLastModified<DraftEntry>

export type NoteEntry = CollectionEntry<'writing'>
export type Note = WithLastModified<NoteEntry>

export type BookmarkEntry = CollectionEntry<'bookmarks'>
export type Bookmark = WithLastModified<BookmarkEntry>

/**
 * Returns true if the pathname matches any slug in the collection (at any ancestry level)
 */
export const isPathnameInCollection = (
  pathname: string | undefined,
  collection: Post[] | TIL[] | Draft[] | Note[] | Bookmark[],
): boolean => {
  const removeLeadingAndTrailingSlashes = (str?: string): string => (str ? str.replace(/^\/|\/$/g, '') : '')

  return collection.some(item => removeLeadingAndTrailingSlashes(pathname) === removeLeadingAndTrailingSlashes(item.id))
}

// Define the overloads
export async function addRemarkFrontmatter(entry: PostEntry): Promise<Post>
export async function addRemarkFrontmatter(entry: DraftEntry): Promise<Draft>
export async function addRemarkFrontmatter(entry: NoteEntry): Promise<Note>
export async function addRemarkFrontmatter(entry: BookmarkEntry): Promise<Bookmark>
export async function addRemarkFrontmatter(
  entry: PostEntry | DraftEntry | NoteEntry | BookmarkEntry,
): Promise<Post | Draft | Note | Bookmark> {
  const { remarkPluginFrontmatter } = await render(entry)

  // see: https://docs.astro.build/en/recipes/modified-time/
  return { ...entry, data: { ...entry.data, lastModified: remarkPluginFrontmatter.lastModified } } as
    | Post
    | Draft
    | Note
    | Bookmark
}

/**
 * Returns entries sorted in descending order by publish date, with undefined dates sorted first.
 */
export const sortDescending = <T extends PostEntry | TIL | TILEntry | Draft>(entries: T[]): T[] => {
  const sortByDate = <T extends PostEntry | TIL | TILEntry | Draft>(a: T, b: T): number => {
    const dateA = a.data.date ? new Date(a.data.date).getTime() : -Infinity
    const dateB = b.data.date ? new Date(b.data.date).getTime() : -Infinity
    return dateB - dateA
  }

  return entries.sort(sortByDate)
}

/**
 * Returns true if an entry has a publish date and it's in the past.
 */
export const isPublished = (entry: PostEntry | TILEntry): boolean => {
  const date = entry.data.date ? new Date(entry.data.date) : null
  return date !== null && date <= new Date()
}

/**
 * Returns true if the entry is not marked private or obviously about work.
 */
export const isPublic = <T extends Note | Bookmark | Draft>(entry: T): boolean =>
  !entry.data.private && !(entry.data.tags ?? []).includes('private') && !entry.id.includes('recursion')
