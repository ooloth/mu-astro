import { getCollection } from 'astro:content'
import type { Writing } from './collections'
import { isPost } from './posts'

/**
 * Given an array of collection items, returns the array with child items nested under their parents.
 */
function nestChildren(collection: Writing[]): Writing[] {
  // Step 1: Create a mapping from item slugs to their respective item data
  const slugToNodeMap = collection.reduce(
    (nodesBySlug, item): Record<string, Writing> => {
      // Append an empty children array to the item data
      nodesBySlug[item.slug.toLowerCase()] = { ...item, data: { ...item.data, children: [] } }
      return nodesBySlug
    },
    {} as Record<string, Writing>,
  )

  // Step 2: Build the item tree
  const tree = collection.reduce((roots, item): Writing[] => {
    // Find the node matching the current collection item
    const node = slugToNodeMap[item.slug.toLowerCase()]

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
const isPublicNote = (note: Writing): boolean => isNote(note) && !note.data.private && !note.slug.includes('recursion')

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
 * Returns a flat list of all notes with private notes removed (in production).
 */
export const getNotes = async (): Promise<Writing[]> =>
  removePrivateNotes(await getCollection('writing', note => isNote(note)))

/**
 * Returns all notes with child notes nested under their parents (always) and private notes removed (in production).
 */
export const getNestedNotes = async (): Promise<Writing[]> =>
  removePrivateNotes(nestChildren(await getCollection('writing', note => isNote(note))))
