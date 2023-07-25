import { getCollection, type CollectionEntry } from 'astro:content'

// TODO: move post definitions to src/content/config.ts?
type PostOrNote = CollectionEntry<'writing'>

type Post = PostOrNote & { data: { destination: 'blog'; date?: string } }

type PostWithDate = Post & { data: { date: string } }

const isPost = (post: PostOrNote): post is Post => post.data.destination === 'blog'

const isPublishedPost = (post: PostOrNote): post is PostWithDate =>
  isPost(post) && post.data.date && Date.parse(post.data.date) <= Date.now()

// const isScheduled = (post: Post): post is PostWithDate =>
//   isPost(post) && post.data.date && Date.parse(post.data.date) > Date.now()

// const isDraft = (post: Post): post is Post => isPost(post) && !isPublished(post) && !isScheduled(post)

const sortByTitleOrSlug = (a: Post, b: Post): number => {
  // If post is a draft with no title, sort using its slug.
  const aTitleOrSlug = a.data.title || a.slug
  const bTitleOrSlug = b.data.title || b.slug
  return aTitleOrSlug.localeCompare(bTitleOrSlug)
}

const sortByDate = (a: Post, b: Post): number => {
  // If post is a draft with no date, sort it to the top.
  const aDate = a.data.date ? Date.parse(a.data.date).toString() : Date.now().toString()
  const bDate = b.data.date ? Date.parse(b.data.date).toString() : Date.now().toString()
  return bDate.localeCompare(aDate)
}

/**
 * Sorts post by title (ascending), then publish date (descending) so drafts appear in a consistent order
 */
const sortPosts = (posts: Post[]): Post[] => posts.sort(sortByTitleOrSlug).sort(sortByDate)

export const getPublishedPosts = async (): Promise<PostWithDate[]> => await getCollection('writing', isPublishedPost)

/**
 * Returns all posts in development and published posts in production, sorted in descending order by publish date.
 */
export const getPosts = async (): Promise<Post[]> => {
  const posts: Post[] = await getCollection(
    'writing',
    post => isPost(post) && (import.meta.env.PROD ? isPublishedPost(post) : true),
  )

  return sortPosts(posts)
}
