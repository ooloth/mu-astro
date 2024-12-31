import { defineAction } from 'astro:actions'
import { z } from 'astro:schema'

import { getBookmarks } from '../../utils/bookmarks'
import { getNotes } from '../../utils/notes'
import { getDrafts } from '../../utils/posts'
import type { Bookmark, Draft, Note } from '../../utils/collections'
import { cleanTags, filterItemsByTags, getAllTagsInItems } from '../../utils/tags'
import type { NotesListItem } from './generateNotesPageHtml'

// TODO: move some of these to separate files and add tests?

type NotesPageEntry = Draft | Note | Bookmark

let cachedItemsAll: NotesListItem[] | null = null
let cachedTagsAll: string[] | null = null

const getAllItems = async (): Promise<NotesListItem[]> => {
  if (!cachedItemsAll) {
    const allEntries = [...(await getDrafts()), ...(await getNotes()), ...(await getBookmarks())]
    cachedItemsAll = createNotesListItems(sortDescending(allEntries))
  }

  return cachedItemsAll
}

const getAllTags = async (): Promise<string[]> => {
  if (!cachedTagsAll) {
    cachedTagsAll = getAllTagsInItems(await getAllItems())
  }

  return cachedTagsAll
}

const validateTags = (tagsInUrl: string[], tagsInContent: string[]): string[] => {
  return tagsInUrl.filter(tag => tagsInContent.includes(tag))
}

type HasLastModified = {
  lastModified?: string
  data?: {
    lastModified?: string
  }
}

const sortDescending = <T extends HasLastModified>(entries: T[]): T[] => {
  const sortByDate = (a: T, b: T): number => {
    const lastModifiedTime = (entry: T): number => {
      const lastModified = entry.data?.lastModified ?? entry.lastModified
      return lastModified ? new Date(String(lastModified)).getTime() : -Infinity
    }

    return lastModifiedTime(b) - lastModifiedTime(a)
  }

  return entries.sort(sortByDate)
}

const getAccessibleEmojiMarkup = (emoji: string): string => {
  const getEmojiDescription = (emoji: string): string => {
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

  return `<span role="img" aria-label="${getEmojiDescription(emoji)}">${emoji}</span>`
}

// TODO: return just the content string and let the frontend render it as html?
const getIconHtml = (item: NotesPageEntry): string => {
  if (item.collection === 'drafts') {
    return getAccessibleEmojiMarkup('✍️')
  }

  if (item.collection === 'bookmarks') {
    if (item.data.favicon) {
      return `<img src="${item.data.favicon}" alt="" width="20" class="inline-block -mt-1 mr-[0.15rem] ml-[0.2rem]" />`
    }

    if (item.data.source) {
      const emojiByHostname = {
        'github.com': '🧰',
        'reddit.com': '💬',
        'stackoverflow.com': '💬',
        'youtube.com': '📺',
      } as const

      const isKnownHostname = (hostname: string): hostname is keyof typeof emojiByHostname =>
        hostname in emojiByHostname

      const hostname = new URL(item.data.source).hostname

      return getAccessibleEmojiMarkup(isKnownHostname(hostname) ? emojiByHostname[hostname] : '📖')
    }
  }

  // Generic note emoji as default
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
    const filteredItems = filterItemsByTags(allItems, validTags)

    return {
      count: {
        all: allItems.length,
        filtered: filteredItems.length,
      },
      results: filteredItems,
      tags: {
        all: allTags,
        filtered: getAllTagsInItems(filteredItems),
        query: input.tags,
        valid: validTags,
      },
    }
  },
})
