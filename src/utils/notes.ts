import { getCollection } from 'astro:content'
import type { Writing } from './collections'

/**
 * Returns true if file is a note.
 */
const isNote = (note: Writing): boolean => note.data.destination !== 'blog'

/**
 * Returns true if file is a non-private note.
 */
const isPublicNote = (note: Writing): boolean => isNote(note) && !note.data.private

/**
 * Given an array of collection items, returns the array with child items nested under their parents.
 */
const nestChildren = (collection: Writing[]): Writing[] => {
  // Step 1: Create a mapping from slugs to their respective objects
  const slugToNodeMap = collection.reduce(
    (nodesBySlug, item) => {
      nodesBySlug[item.slug.toLowerCase()] = { ...item, data: { ...item.data, children: [] } }
      return nodesBySlug
    },
    {} as Record<string, Writing>,
  )

  // Step 2: Build the tree
  const tree = collection.reduce((roots, item): Writing[] => {
    // Find the node for the current item
    const node = slugToNodeMap[item.slug.toLowerCase()]

    // If the item has a parent, add the node to the parent's children array
    if (item.data.parent) {
      const parentNode = slugToNodeMap[item.data.parent.toLowerCase()]

      if (parentNode) {
        parentNode.data.children.push(node)
      } else {
        console.error(`Parent title "${item.data.parent}" not found.`)
      }
    } else {
      // If the item doesn't have a parent, it is a root item, so add it to the accumulator (tree)
      roots.push(node)
    }

    // Return the accumulator for the next iteration
    return roots
  }, [] as Writing[])

  return tree
}

/**
 * Returns all notes with child notes nested under their parents.
 */
export const getNotes = async (): Promise<Writing[]> =>
  nestChildren(
    await getCollection('writing', note => isNote(note) && (import.meta.env.PROD ? isPublicNote(note) : true)),
  )
