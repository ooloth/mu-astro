import { getCollection, type CollectionEntry } from 'astro:content'
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
const sortByParent = (collection: Writing[]): Writing[] => {
  type WritingWithChildren = (Writing & { data: { children: Writing[] } })[]

  const tree: Record<string, Writing> = {}
  const roots: WritingWithChildren = []

  // TODO: rewrite as a single map or reduce?

  // Prep by adding a "children" property to each item and indexing all file names
  collection.forEach(item => {
    item.data.children = [] // Add an empty array for the children if it does not already exist
    tree[item.slug.toLowerCase()] = item // Index each item by its lowercase slug
  })

  // Connect children with their parents and separate the roots
  collection.forEach(item => {
    if (!item.data.parent) {
      roots.push(item) // If the item has no parent, it's a root (a.k.a. parent)
      return
    }

    // Get the lowercase version of the parent name
    const parent = item.data.parent.toLowerCase()

    // Handle not finding the parent name in the tree
    if (!tree[parent]) {
      // TODO: throw an error to avoid hiding the page link indefinitely?
      console.log(`tree does not contain ${item.data.parent}`)
    }

    // Add the current item to the parent's children array
    tree[parent].data.children.push(item)
  })

  return roots
}

/**
 * Returns all notes with child notes nested under their parents.
 */
export const getNotes = async (): Promise<Writing[]> =>
  sortByParent(
    await getCollection('writing', note => isNote(note) && (import.meta.env.PROD ? isPublicNote(note) : true)),
  )
