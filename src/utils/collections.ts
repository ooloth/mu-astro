import { getCollection, type CollectionEntry } from 'astro:content'

// TODO: move post definitions to src/content/config.ts?
type PostOrNote = CollectionEntry<'writing'>

type Post = PostOrNote & { data: { destination: 'blog'; date?: string } }

type PostWithDate = Post & { data: { date: string } }

/**
 * Returns true if file is a blog post.
 */
const isPost = (post: PostOrNote): post is Post => post.data.destination === 'blog'

/**
 * Returns true if file is a published blog post.
 */
const isPublishedPost = (post: PostOrNote): post is PostWithDate =>
  isPost(post) && post.data.date && Date.parse(post.data.date) <= Date.now()

// const isScheduled = (post: Post): post is PostWithDate =>
//   isPost(post) && post.data.date && Date.parse(post.data.date) > Date.now()

// const isDraft = (post: Post): post is Post => isPost(post) && !isPublished(post) && !isScheduled(post)

/**
 * Sorts two posts in ascending order by title (or slug if either post is a draft with no title).
 */
const sortByTitleOrSlug = (a: Post, b: Post): number => (a.data.title || a.slug).localeCompare(b.data.title || b.slug)

/**
 * Sorts two posts in descending order by publish date (or the current date if either post is a draft with no date).
 */
const sortByDate = (a: Post, b: Post): number =>
  (Date.parse(b.data.date) || Date.now()).toString().localeCompare((Date.parse(a.data.date) || Date.now()).toString())

/**
 * Returns posts sorted in descending order by publish date.
 */
const sortPostsByDate = (posts: Post[]): Post[] => posts.sort(sortByDate)

/**
 * Returns posts sorted in ascending order by title, then descending order by publish date (so drafts with no dates appear first in alphabetical order).
 */
const sortPosts = (posts: Post[]): Post[] => posts.sort(sortByTitleOrSlug).sort(sortByDate)

/**
 * Returns all published posts, in descending order by date.
 */
export const getPublishedPosts = async (): Promise<PostWithDate[]> =>
  sortPostsByDate(await getCollection('writing', isPublishedPost))

/**
 * Returns all posts in development and published posts in production, in descending order by date.
 */
export const getPosts = async (): Promise<Post[]> =>
  sortPosts(
    await getCollection('writing', post => isPost(post) && (import.meta.env.PROD ? isPublishedPost(post) : true)),
  )
