import { defineAction } from 'astro:actions'
import { z } from 'astro:schema'

import { getBookmarks } from '../../utils/bookmarks'
import { getNotes } from '../../utils/notes'
import { getDrafts } from '../../utils/posts'
import type { Bookmark, Draft, Note } from '../../utils/collections'
import { cleanTags, filterItemsByTags, getAllTagsInEntries } from '../../utils/tags'
import type { NotesListItem } from './generateNotesPageHtml'

// TODO: move some of these to separate files and add tests?

type NotesPageEntry = Draft | Note | Bookmark

let cachedEntriesAll: NotesPageEntry[] | null = null
let cachedItemsAll: NotesListItem[] | null = null
let cachedTagsAll: string[] | null = null

const getAllNotes = async (): Promise<NotesPageEntry[]> => {
  if (!cachedEntriesAll) {
    cachedEntriesAll = [...(await getDrafts()), ...(await getNotes()), ...(await getBookmarks())]
  }

  return cachedEntriesAll
}

const getAllItems = async (): Promise<NotesListItem[]> => {
  if (!cachedItemsAll) {
    cachedItemsAll = createNotesListItems(sortDescending(await getAllNotes()))
  }

  return cachedItemsAll
}

const getAllTags = async (): Promise<string[]> => {
  if (!cachedTagsAll) {
    cachedTagsAll = getAllTagsInEntries(await getAllNotes())
  }

  return cachedTagsAll
}

const validateTags = (tagsInUrl: string[], tagsInContent: string[]): string[] => {
  return tagsInUrl.filter(tag => tagsInContent.includes(tag))
}

const sortDescending = (entries: NotesPageEntry[]): NotesPageEntry[] => {
  const sortByDate = (a: NotesPageEntry, b: NotesPageEntry): number => {
    const lastModifiedTime = (entry: NotesPageEntry): number =>
      entry.data.lastModified ? new Date(String(entry.data.lastModified)).getTime() : -Infinity

    return lastModifiedTime(b) - lastModifiedTime(a)
  }

  return entries.sort(sortByDate)
}

const getAccessibleEmojiMarkup = (emoji: string): string => {
  const getDescription = (emoji: string): string => {
    const description: Record<string, string> = {
      '📺': 'television',
      '🧰': 'toolbox',
      '💬': 'speech balloon',
      '📖': 'open book',
      '✍️': 'writing hand',
      '📝': 'memo',
    }

    return emoji in description ? description[emoji] : ''
  }

  return `<span role="img" aria-label="${getDescription(emoji)}">${emoji}</span>`
}

// TODO: return just the content string and let the frontend render it as html?
const getIconHtml = (item: NotesPageEntry): string => {
  // First choice: writing hand if draft
  if (item.collection === 'drafts') {
    return getAccessibleEmojiMarkup('✍️')
  }

  // Second choice: favicon if available
  if ('favicon' in item.data && item.data.favicon) {
    return `<img src="${item.data.favicon}" alt="" width="20" class="inline-block -mt-1 mr-[0.15rem] ml-[0.2rem]" />`
  }

  // Third choice: custom emoji based on common domain name
  if ('url' in item.data && typeof item.data.url === 'string') {
    const url = new URL(item.data.url)
    if (url.hostname.includes('youtube.com')) {
      return '📺'
    } else if (url.hostname.includes('github.com')) {
      return '🧰'
    } else if (url.hostname.includes('reddit.com')) {
      return '💬'
    } else {
      return '📖'
    }
  }

  // Default: generic emoji for notes
  return '📝'
}

const getLinkText = (item: NotesPageEntry): string => {
  const title = item.data.title || item.id
  const author = 'author' in item.data && item.data.author ? ` (${item.data.author})` : ''

  return `${title}${author}`
}

const createNotesListItems = (notes: NotesPageEntry[]): NotesListItem[] => {
  const createNotesListItem = (item: NotesPageEntry): NotesListItem => {
    const iconHtml = getIconHtml(item)
    const text = getLinkText(item)

    return {
      href: `/${item.id}/`,
      iconHtml,
      tags: cleanTags(item.data.tags),
      text,
    }
  }

  return notes.map(createNotesListItem)
}

export type FilteredNotes = {
  count: {
    all: number
    filtered: number
  }
  results: NotesListItem[]
  tags: {
    all: string[]
    filtered: string[]
    query: string[]
    valid: string[]
  }
}

export const filterNotes = defineAction({
  input: z.object({
    tags: z.array(z.string()),
  }),
  handler: async (input): Promise<FilteredNotes> => {
    const allItems = await getAllItems() // cached
    const allTags = await getAllTags() // cached
    const validTags = validateTags(input.tags, allTags)
    const filteredNotes = filterItemsByTags(allItems, validTags)

    return {
      count: {
        all: allItems.length,
        filtered: filteredNotes.length,
      },
      results: filteredNotes,
      tags: {
        all: allTags,
        filtered: getAllTagsInEntries(filteredNotes),
        query: input.tags,
        valid: validTags,
      },
    }
  },
})
