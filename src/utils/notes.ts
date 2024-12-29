import { getCollection } from 'astro:content'
import { addRemarkFrontmatter, isPublic, type Note, type Writing } from './collections'
import { isPost } from './posts'
import { cleanTags } from './tags'

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
 * Returns a flat list of all tags found in all notes.
 */
export const getAllTagsInNotes = async (): Promise<string[]> =>
  getNotes().then(notes => cleanTags(notes.flatMap(note => note.data.tags ?? [])))

/**
 * Returns a flat list of all notes with matching tags.
 */
export const getNotesWithTags = async (tags: string[]): Promise<Writing[]> =>
  getNotes().then(notes => notes.filter(note => (note.data.tags ?? []).some(tag => tags.includes(tag))))

/**
 * Returns all tags with their respective notes.
 */
export const getNotesByTag = async (): Promise<Record<string, Writing[]>> => {
  const tags = await getAllTagsInNotes()

  const notesByTagEntries = await Promise.all(
    tags.map(async tag => {
      const notes = await getNotesWithTags([tag])
      return [tag, notes]
    }),
  )

  return Object.fromEntries(notesByTagEntries)
}

/**
 * Returns a flat list of all notes with private notes removed (in production) and sorted by last modified date.
 */
export const getNotes = async (): Promise<Note[]> => {
  const notesToShow = removePrivateNotes(await getCollection('writing', note => isNote(note)))
  return Promise.all(notesToShow.map(note => addRemarkFrontmatter(note)))
}
