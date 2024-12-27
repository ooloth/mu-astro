import { getCollection } from 'astro:content'

import { addRemarkFrontmatter, isPublished, sortDescending, type Draft, type Post, type Writing } from './collections'

/**
 * Returns true if file is a blog post.
 */
export const isPost = (post: Writing): boolean => (post.data.tags ?? []).includes('post')

/**
 * Returns all published posts, in descending order by date (useful for RSS feed).
 */
export const getPublishedPosts = async (): Promise<Post[]> =>
  sortDescending(await getCollection('writing', isPublished))

/**
 * Returns all posts in development and only published posts in production, in descending order by date, with last modified date added.
 */
export const getPosts = async (): Promise<Post[]> => {
  const postsToShow = sortDescending(
    await getCollection('writing', post => (import.meta.env.PROD ? isPublished(post) : isPost(post))),
  )
  return Promise.all(postsToShow.map(post => addRemarkFrontmatter(post)))
}

/**
 * Returns all drafts in both development and production, with last modified date added.
 */
export const getDrafts = async (): Promise<Draft[]> => {
  const draftsToShow = await getCollection('drafts')
  return Promise.all(draftsToShow.map(draft => addRemarkFrontmatter(draft)))
}
