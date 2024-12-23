import type { Bookmark, Draft, TIL, Writing } from './collections'
import type { Post } from './posts'

export const cleanTags = (tags?: string[]): string[] =>
  Array.from(
    new Set(
      (tags ?? [])
        .filter(Boolean)
        .filter(tag => !['bookmark', 'note', 'post', 'til'].includes(tag))
        .map(tag => tag.replace('s/', ''))
        .map(tag => tag.replace('t/', ''))
        .map(tag => tag.replace('topic/', ''))
        .map(tag => tag.replaceAll('-', ' ')),
    ),
  ).sort()

/**
 * Returns a mapping of the entry's tags to lists of other content entries with that tag.
 */
export const getEntriesWithTags = async (
  entry: Bookmark | Draft | TIL | Post | Writing,
  collections: (Bookmark | Draft | TIL | Post | Writing)[],
): Promise<Record<string, (Bookmark | Draft | TIL | Post | Writing)[]>> => {
  const relatedByTag: Record<string, (Bookmark | Draft | TIL | Post | Writing)[]> = {}

  for (const item of collections) {
    // Go in order of the entry's tags, which are presumably sorted from most to least relevant
    for (const tag of cleanTags(entry.data.tags) ?? []) {
      if ((item.data.tags ?? []).includes(tag)) {
        if (item.data.title === entry.data.title) {
          continue
        }

        if (!relatedByTag[tag]) {
          relatedByTag[tag] = []
        }

        relatedByTag[tag].push(item)
      }
    }
  }

  return relatedByTag
}
