import { getCollection } from 'astro:content'

import { addRemarkFrontmatter, type Draft, type Writing } from './collections'

// TODO: move post definitions to src/content/config.ts?
export type Post = Writing & { data: { destination?: 'blog'; tags?: string[]; date?: string } }

type PostWithDate = Post & { data: { date: string } }

/**
 * Returns true if file is a blog post.
 */
export const isPost = (post: Writing): post is Post =>
  post.data.tags?.includes('post') || post.data.destination === 'blog'

/**
 * Returns true if file is a published blog post.
 */
const isPublished = (post: Writing): post is PostWithDate =>
  isPost(post) && post.data.date && Date.parse(post.data.date) <= Date.now()

/**
 * Sorts two drafts in ascending order by slug.
 */
// const sortBySlug = (a: Draft, b: Draft): number => a.id.localeCompare(b.id)

/**
 * Sorts two posts in descending order by publish date (or the current date if either post is a draft with no date).
 */
const sortByDate = (a: Post | Draft, b: Post | Draft): number =>
  (Date.parse(b.data.date) || Date.now()).toString().localeCompare((Date.parse(a.data.date) || Date.now()).toString())

/**
 * Returns posts sorted in descending order by publish date.
 */
const sortPosts = (posts: Post[]): Post[] => posts.sort(sortByDate)

/**
 * Returns drafts sorted in ascending order by slug, then descending order by date (so scheduled drafts appear first, followed by unscheduled drafts in alphabetical order).
 */
// const sortDrafts = (drafts: Draft[]): Draft[] => drafts.sort(sortBySlug).sort(sortByDate)

/**
 * Returns all published posts, in descending order by date (useful for RSS feed).
 */
export const getPublishedPosts = async (): Promise<PostWithDate[]> =>
  sortPosts(await getCollection('writing', isPublished))

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
