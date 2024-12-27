import { getCollection } from 'astro:content'

import { addRemarkFrontmatter, type Draft, type Post, type Writing } from './collections'

/**
 * Returns true if file is a blog post.
 */
export const isPost = (post: Writing): boolean => (post.data.tags ?? []).includes('post')

/**
 * Returns true if file is a published blog post.
 */
const isPublished = (post: Writing): boolean =>
  isPost(post) && !!post.data.date && Date.parse(String(post.data.date)) <= Date.now()

/**
 * Sorts two posts in descending order by publish date (or the current date if either post is a draft with no date).
 */
const sortByDate = (a: Post | Draft, b: Post | Draft): number =>
  (Date.parse(String(b.data.date)) || Date.now())
    .toString()
    .localeCompare((Date.parse(String(a.data.date)) || Date.now()).toString())

/**
 * Returns posts sorted in descending order by publish date.
 */
const sortPosts = (posts: Post[]): Post[] => posts.sort(sortByDate)

/**
 * Returns all published posts, in descending order by date (useful for RSS feed).
 */
export const getPublishedPosts = async (): Promise<Post[]> => sortPosts(await getCollection('writing', isPublished))

/**
 * Returns all posts in development and only published posts in production, in descending order by date, with last modified date added.
 */
export const getPosts = async (): Promise<Post[]> => {
  const postsToShow = sortPosts(
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
