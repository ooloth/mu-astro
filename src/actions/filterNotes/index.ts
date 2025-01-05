import { defineAction } from 'astro:actions'
import { z } from 'astro:schema'

import { getBookmarks } from '../../utils/bookmarks'
import { getNotes } from '../../utils/notes'
import {
  sortByLastModifiedDate,
  type Bookmark,
  type Draft,
  type Note,
  type Post,
  type SinglePage,
} from '../../utils/collections'
import { cleanTags, filterItemsByTags, getAllTagsInItems } from '../../utils/tags'
import type { NotesListItem } from './generateNotesPageHtml'
import { getDrafts } from '../../utils/drafts'
import { getScheduledPosts } from '../../utils/posts'

// TODO: move some of these to separate files and add tests?

type NotesPageEntry = Post | Draft | Note | Bookmark // scheduled posts appear on the notes page like drafts

let cachedItemsAll: NotesListItem[] | null = null
let cachedTagsAll: string[] | null = null

const getAllItems = async (): Promise<NotesListItem[]> => {
  if (!cachedItemsAll) {
    const allEntries = [
      ...(await getScheduledPosts()),
      ...(await getDrafts()),
      ...(await getNotes()),
      ...(await getBookmarks()),
    ]
    cachedItemsAll = createNotesListItems(sortByLastModifiedDate(allEntries))
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

export const getIconHtml = (item: NotesPageEntry | Post | Draft | Note | Bookmark | SinglePage): string => {
  if (item.collection === 'drafts') {
    return getAccessibleEmojiMarkup('✍️')
  }

  if (item.collection === 'bookmarks') {
    if (item.data.favicon) {
      return `<img src="${item.data.favicon}" alt="" width="20" class="inline-block !-mt-[0.2rem] !mb-0 mr-[0.15rem] ml-[0.2rem]" />`
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
