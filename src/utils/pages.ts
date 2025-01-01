import { type Bookmark, type Draft, type Note, type Post, type SinglePage, type TIL, type Writing } from './collections'

/**
 * Returns true if file is a standalone page.
 */
export const isSinglePage = (entry: Writing | Post | TIL | Draft | Note | Bookmark | SinglePage): entry is SinglePage =>
  entry.collection === 'pages'
