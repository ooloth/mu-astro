import { getCollection } from 'astro:content'
import {
  addLastModifiedDate,
  removePrivateInProduction,
  sortByLastModifiedDate,
  type HasCollection,
  type Note,
} from './collections'

/**
 * Returns true if the entry is a note.
 */
export const isNote = (entry: HasCollection): entry is Note => entry.collection === 'notes'

/**
 * Returns a list of all notes (with private notes removed in production), sorted by last modified date.
 */
export const getNotes = async (): Promise<Note[]> => {
  return sortByLastModifiedDate(await addLastModifiedDate(removePrivateInProduction(await getCollection('notes'))))
}
