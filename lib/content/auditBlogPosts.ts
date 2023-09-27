import { isPost, type Post } from '../../src/utils/posts'
import sendEmail from '../sendGrid/sendEmail'

async function auditBlogPosts(posts: Post[]): Promise<void> {
  // Only proceed if this is an audit build
  if (!import.meta.env.AUDIT_CONTENT) return

  type DraftsByStatus = {
    announcing: { emoji: string; items: Post[] }
    publishing: { emoji: string; items: Post[] }
    scheduled: { emoji: string; items: Post[] }
    priority: { emoji: string; items: Post[] }
    editing: { emoji: string; items: Post[] }
    drafting: { emoji: string; items: Post[] }
    outlining: { emoji: string; items: Post[] }
    researching: { emoji: string; items: Post[] }
    unknown: { emoji: string; items: Post[] }
  }

  const draftsByStatus: DraftsByStatus = {
    announcing: { emoji: '🎙️', items: [] },
    publishing: { emoji: '🚀', items: [] },
    scheduled: { emoji: '📆', items: [] },
    priority: { emoji: '⭐️', items: [] },
    editing: { emoji: '💅', items: [] },
    drafting: { emoji: '🤮', items: [] },
    outlining: { emoji: '🌳', items: [] },
    researching: { emoji: '🔍', items: [] },
    unknown: { emoji: '🤷‍♂️', items: [] },
  }

  posts.forEach(item => {
    if (!isPost(item)) return

    // If item is published, skip it (since it's not a draft)
    if (Date.parse(item.data.date) <= Date.now()) {
      return
    }

    // If item is both scheduled and publishing, put it in the scheduled list
    if (Date.parse(item.data.date) > Date.now()) {
      draftsByStatus.scheduled.items.push(item)
      return
    }

    // If the item is high priority, add it to the priority list
    if (item.data.priority === 'high' && item.data.status !== 'announcing' && item.data.status !== 'publishing') {
      draftsByStatus.priority.items.push(item)
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

  const getItemsHtml = (items: Post[]): string =>
    items
      .sort((a, b) => a.slug.localeCompare(b.slug)) // sort alphabetically by slug
      .map(item => `<li>${item.slug}</li>`)
      .join('')

  const getScheduledItemsHtml = (items: Post[]): string =>
    items
      // Sort by date, ascending using localeCompare
      .sort((a, b) => a.data.date.localeCompare(b.data.date))
      .map(item => `<li><strong>${item.data.date}:</strong> ${item.data.title}</li>`)
      .join('')

  const draftsHtml = Object.keys(draftsByStatus)
    .map(key =>
      draftsByStatus[key as keyof DraftsByStatus].items.length
        ? `<h3>${key[0].toLocaleUpperCase() + key.slice(1)} ${
            draftsByStatus[key as keyof DraftsByStatus].emoji
          }</h3><ul>${
            key === 'scheduled'
              ? getScheduledItemsHtml(draftsByStatus[key as keyof DraftsByStatus].items)
              : getItemsHtml(draftsByStatus[key as keyof DraftsByStatus].items)
          }</ul>`
        : '',
    )
    .join('')

  await sendEmail('Blog post drafts ✍️', draftsHtml)
}

export default auditBlogPosts
