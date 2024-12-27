import { getCollection } from 'astro:content'
import { addRemarkFrontmatter, type Writing } from './collections'
import { isPost } from './posts'
import { cleanTags } from './tags'

/**
 * Given an array of collection items, returns the array with child items nested under their parents.
 */
function nestChildren(collection: Writing[]): Writing[] {
  // Step 1: Create a mapping from item slugs to their respective item data
  const slugToNodeMap = collection.reduce(
    (nodesBySlug, item): Record<string, Writing> => {
      // Append an empty children array to the item data
      nodesBySlug[item.id.toLowerCase()] = { ...item, data: { ...item.data, children: [] } }
      return nodesBySlug
    },
    {} as Record<string, Writing>,
  )

  // Step 2: Build the item tree
  const tree = collection.reduce((roots, item): Writing[] => {
    // Find the node matching the current collection item
    const node = slugToNodeMap[item.id.toLowerCase()]

    if (item.data.parent) {
      const parentNode = slugToNodeMap[item.data.parent.toLowerCase()]

      if (parentNode) {
        // If the note has a parent, add the item's data to the parent's children array
        parentNode.data.children.push(node)
      } else {
        console.error(`Parent slug "${item.data.parent}" not found (this should never happen).`)
      }
    } else {
      // If the item has no parent, treat it as a new root-level note
      roots.push(node)
    }

    // Return the update tree
    return roots
  }, [] as Writing[])

  return tree
}

/**
 * Returns true if file is a note.
 */
const isNote = (note: Writing): boolean => !isPost(note)

/**
 * Returns true if file is a non-private note.
 */
const isPublicNote = (note: Writing): boolean => isNote(note) && !note.data.private && !note.id.includes('recursion')

/**
 * In production, remove all private notes from all levels of the nested notes tree.
 */
const removePrivateNotes = (notes: Writing[]): Writing[] =>
  import.meta.env.PROD
    ? notes
        // Remove private notes from the current nesting level (starting with the root)
        .filter(note => isPublicNote(note))
        // Remove private notes from the children of remaining notes (and so on, recursively)
        .map(note => {
          return note.data?.children?.length
            ? { ...note, data: { ...note.data, children: removePrivateNotes(note.data.children) } }
            : note
        })
    : notes

/**
 * Given an array of nested collection items, returns the array with related items added to each parent and child.
 * TODO: based on parent-child relationships? Tags?
 */
// function addRelated(collection: Writing[]): Writing[] {
//   return collection
// }

/**
 * Returns a flat list of all tags found in all notes.
 */
export const getAllTagsInNotes = async (): Promise<string[]> =>
  getNotes().then(notes => cleanTags(notes.flatMap(note => note.data.tags)))

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
export const getNotes = async (): Promise<Writing[]> => {
  const notesToShow = removePrivateNotes(await getCollection('writing', note => isNote(note)))
  return Promise.all(notesToShow.map(note => addRemarkFrontmatter(note)))
}

/**
 * Returns all notes with child notes nested under their parents (always) and private notes removed (in production).
 */
export const getNestedNotes = async (): Promise<Writing[]> =>
  removePrivateNotes(nestChildren(await getCollection('writing', note => isNote(note))))
