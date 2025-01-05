import type { Bookmark, Draft, Note, Post, SinglePage } from './collections'

type HasTags = {
  tags?: string[] | null
  data?: {
    tags?: string[] | null
  }
}

/**
 * Remove unwanted tags and tag segmeents from a list of tags. Ensure kebab case to avoid URL query param issues.
 */
export const cleanTags = (tags?: string[] | null): string[] =>
  [
    ...new Set(
      (tags ?? [])
        .filter(Boolean)
        .filter(tag => !['bookmark', 'note', 'post', 'til'].includes(tag))
        .map(tag => tag.replace('s/', ''))
        .map(tag => tag.replace('t/', ''))
        .map(tag => tag.replace('topic/', ''))
        .map(tag => tag.replaceAll(' ', '-')),
    ),
  ].sort()

/**
 * Returns items that include ALL of the given tags.
 */
export const filterItemsByTags = <T extends HasTags>(items: T[], tags: string[]): T[] => {
  if (tags.length === 0) {
    return items
  }

  return items.filter(item => {
    return cleanTags(tags).every(tag => cleanTags(item.data?.tags ?? item.tags).includes(tag))
  })
}

/**
 * Returns a mapping of the entry's tags to lists of other content entries with that tag.
 */
export const getAllEntriesWithSameTagsAsEntry = <T extends Post | Draft | Note | Bookmark | SinglePage>(
  entry: T,
  collections: T[],
): Record<string, T[]> => {
  const relatedEntries: Set<T> = new Set()
  const relatedByTag: Record<string, T[]> = {}

  // Find all entries that share at least one tag with the current entry
  for (const item of collections) {
    for (const tag of cleanTags(entry.data.tags ?? [])) {
      if ((item.data.tags ?? []).includes(tag)) {
        if (item.id !== entry.id) {
          relatedEntries.add(item)
        }
      }
    }
  }

  for (const entry of relatedEntries) {
    for (const tag of cleanTags(entry.data.tags ?? [])) {
      if (!relatedByTag[tag]) {
        relatedByTag[tag] = []
      }

      relatedByTag[tag].push(entry)
    }
  }

  return relatedByTag
}

/**
 * Returns a deduplicated list of all tags found in the given items.
 *
 * TODO: return a set instead?
 */
export const getAllTagsInItems = <T extends HasTags>(items: T[]): string[] => {
  const allTags = items.flatMap(item => item.data?.tags ?? item.tags ?? [])
  return cleanTags([...new Set(allTags)])
}
