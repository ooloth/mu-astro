import { getCollection } from 'astro:content'
import { addRemarkFrontmatter, isPublic, type Note, type Writing } from './collections'
import { isPost } from './posts'

/**
 * Returns true if file is a note.
 */
const isNote = (note: Writing): note is Note => !isPost(note)

/**
 * In production, remove all private notes from all levels of the nested notes tree.
 */
const removePrivateNotes = (notes: Note[]): Note[] =>
  import.meta.env.PROD ? notes.filter(note => isPublic(note)) : notes

/**
 * Returns a flat list of all notes with private notes removed (in production) and sorted by last modified date.
 */
export const getNotes = async (): Promise<Note[]> => {
  const notesToShow = removePrivateNotes(await getCollection('writing', (note: Writing): note is Note => isNote(note)))
  return Promise.all(notesToShow.map(note => addRemarkFrontmatter(note)))
}
