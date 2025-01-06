import { getCollection, type CollectionEntry } from 'astro:content'

import {
  addContent,
  addLastModifiedDate,
  sortByLastModifiedDate,
  type HasCollection,
  type Post,
  type PostWithContent,
} from './collections'

export const FEATURED_COUNT = 5

/**
 * Returns true if the entry is from the posts collection.
 */
export const isPost = (entry: HasCollection): entry is Post => entry.collection === 'posts'

/**
 * Returns entries sorted in descending order by publish date, with undefined dates sorted first.
 */
export const sortByPublishDate = (items: CollectionEntry<'posts'>[]): CollectionEntry<'posts'>[] =>
  structuredClone(items).sort((a, b): number => b.data.date.getTime() - a.data.date.getTime())

export const isPublished = (post: CollectionEntry<'posts'> | Post | PostWithContent): boolean =>
  post.data.date <= new Date()

/**
 * Returns all posts with a publish date in the past, sorted by publish date (useful for RSS feed). Includes the
 * full rendered content of the first few so they can be shown inline on the home page.
 */
export const getPublishedPosts = async (): Promise<(Post | PostWithContent)[]> => {
  const postsToShow = sortByPublishDate(await getCollection('posts', isPublished))
  const postsToShowInline = postsToShow.slice(0, FEATURED_COUNT)
  const postsToShowInList = postsToShow.slice(FEATURED_COUNT)

  return await addLastModifiedDate([...(await addContent(postsToShowInline)), ...postsToShowInList])
}

export const isScheduled = (post: CollectionEntry<'posts'> | Post | PostWithContent): boolean =>
  post.data.date > new Date()

/**
 * Returns all posts scheduled to be published in the future, sorted by last modified date.
 */
export const getScheduledPosts = async (): Promise<Post[]> =>
  sortByLastModifiedDate(await addLastModifiedDate(await getCollection('posts', isScheduled)))

/**
 * Returns all posts with their last modified date (and the first few with their content), sorted by publish date.
 * In production, only returns published posts (i.e. no scheduled posts).
 */
export const getPosts = async (): Promise<(Post | PostWithContent)[]> =>
  sortByLastModifiedDate(await addLastModifiedDate(await getCollection('posts')))
