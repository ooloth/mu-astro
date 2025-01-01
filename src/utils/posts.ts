import { getCollection, render } from 'astro:content'

import {
  addRemarkFrontmatter,
  isPublished,
  sortByPublishDate,
  type Bookmark,
  type Draft,
  type DraftEntry,
  type Note,
  type Post,
  type PostEntry,
  type TIL,
  type Writing,
} from './collections'

/**
 * Returns true if file is a blog post.
 */
export const isPost = (entry: Writing | Post | TIL | Draft | Note | Bookmark): boolean =>
  entry.collection === 'writing' && (entry.data.tags ?? []).includes('post')

/**
 * Returns all published posts, in descending order by date (useful for RSS feed).
 */
export const getPublishedPosts = async (): Promise<PostEntry[]> =>
  sortByPublishDate(await getCollection('writing', isPublished))

/**
 * Returns all posts in development and only published posts in production, in descending order by date, with last modified date added.
 * TODO: continue showing scheduled posts on notes page as drafts (even if moved out of drafts folder and date added)?
 */
export const getPosts = async (): Promise<Post[]> => {
  const postsToShow = sortByPublishDate(
    await getCollection('writing', (post: Writing) => (import.meta.env.PROD ? isPublished(post) : isPost(post))),
  )

  const postsWithContent = await Promise.all(
    postsToShow.map(async post => {
      const { Content, remarkPluginFrontmatter } = await render(post)
      return { ...post, Content, data: { ...post.data, lastModified: remarkPluginFrontmatter.lastModified } }
    }),
  )

  return postsWithContent
}

/**
 * Returns true if file is a blog post.
 */
export const isDraft = (entry: Post | Draft): boolean => entry.collection === 'drafts'

/**
 * Returns all drafts in both development and production, with last modified date added.
 */
export const getDrafts = async (): Promise<Draft[]> => {
  const draftsToShow = await getCollection('drafts')
  return Promise.all(draftsToShow.map((draft: DraftEntry) => addRemarkFrontmatter(draft)))
}
