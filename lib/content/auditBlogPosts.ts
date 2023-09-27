import { isPost, type Post } from '../../src/utils/posts'
import sendEmail from '../sendGrid/sendEmail'

async function auditBlogPosts(posts: Post[]): Promise<void> {
  // Only proceed if this is an audit build
  if (!import.meta.env.AUDIT_CONTENT) return

  const noTitle: Post[] = []
  const scheduled: Post[] = []

  type DraftsByStatus = {
    announcing: { emoji: string; items: Post[] }
    publishing: { emoji: string; items: Post[] }
    editing: { emoji: string; items: Post[] }
    drafting: { emoji: string; items: Post[] }
    outlining: { emoji: string; items: Post[] }
    researching: { emoji: string; items: Post[] }
    unknown: { emoji: string; items: Post[] }
  }

  const draftsByStatus: DraftsByStatus = {
    announcing: { emoji: '🎙️', items: [] },
    publishing: { emoji: '🚀', items: [] },
    editing: { emoji: '💅', items: [] },
    drafting: { emoji: '🤮', items: [] },
    outlining: { emoji: '🌳', items: [] },
    researching: { emoji: '🔍', items: [] },
    unknown: { emoji: '🤷‍♂️', items: [] },
  }

  posts.forEach(item => {
    if (!item.data.title) noTitle.push(item)
    if (!isPost(item)) return

    // If item is published, skip it (since it's not a draft)
    if (Date.parse(item.data.date) <= Date.now()) {
      return
    }

    // If item is both scheduled and publishing, put it in the scheduled list
    if (Date.parse(item.data.date) > Date.now()) {
      scheduled.push(item)
      return
    }

    // Add drafts to the matching status list
    Object.keys(draftsByStatus).forEach(key => {
      if (item.data.status === key) {
        draftsByStatus[key as keyof DraftsByStatus].items.push(item)
        return
      }
    })

    // If draft has an unrecognized status, add it to the unknown list
    if (!Object.keys(draftsByStatus).includes(item.data.status)) {
      draftsByStatus.unknown.items.push(item)
    }
  })

  /**
   * Returns the post slug and appends a star if the post is high priority
   */
  const getItemTitle = (item: Post): string => (item.data.priority === 'high' ? `${item.slug} ⭐️` : item.slug)

  const getItemsHtml = (items: Post[]): string =>
    items
      .sort((a, b) => a.slug.localeCompare(b.slug)) // sort alphabetically by slug
      .map(item => `<li>${getItemTitle(item)}</li>`)
      .join('')

  const noTitleHtml = noTitle.length ? `<h3>🤷‍♂️ Missing a title️</h3><ul>${getItemsHtml(noTitle)}</ul>` : ''

  const getScheduledItemsHtml = (items: Post[]): string =>
    items
      // Sort by date, ascending using localeCompare
      .sort((a, b) => a.data.date.localeCompare(b.data.date))
      .map(item => `<li><strong>${item.data.date}:</strong> ${item.data.title}</li>`)
      .join('')

  const scheduledHtml =
    '<h3>Scheduled 📆</h3>' +
    (scheduled.length ? `<ul>${getScheduledItemsHtml(scheduled)}</ul>` : '<p><em>Time to schedule a post!</em></p>')

  const draftsHtml = Object.keys(draftsByStatus)
    .map(key =>
      draftsByStatus[key as keyof DraftsByStatus].items.length
        ? `<h3>${key[0].toLocaleUpperCase() + key.slice(1)} ${
            draftsByStatus[key as keyof DraftsByStatus].emoji
          }</h3><ul>${getItemsHtml(
            draftsByStatus[key as keyof DraftsByStatus].items.sort((a, b) =>
              a.data.priority === 'high' && b.data.priority === 'low'
                ? -1
                : a.data.priority === 'low' && b.data.priority === 'high'
                ? 1
                : 0,
            ),
          )}</ul>`
        : '',
    )
    .join('')

  await sendEmail('Blog post drafts ✍️', noTitleHtml + scheduledHtml + draftsHtml)
}

export default auditBlogPosts
