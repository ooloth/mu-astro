export const generateTagCloudItemHtml = (
  tagsInUrl: string[],
  tagsInFilteredEntries: string[],
  tagsInAllEntries: string[],
): string => {
  const colors = {
    active: 'bg-[--moonlight-red] hover:shadow-glow text-zinc-900 cursor-pointer',
    inactive: 'bg-zinc-900 hover:shadow-glow text-[--moonlight-red] cursor-pointer',
    unavailable: 'opacity-50 text-[--moonlight-red] cursor-not-allowed',
  }

  return tagsInAllEntries
    .map(tag => {
      const state = tagsInUrl.includes(tag)
        ? 'active'
        : tagsInFilteredEntries.includes(tag)
          ? 'inactive'
          : 'unavailable'

      const classes = `rounded border-[1px] border-[--moonlight-red] px-2 leading-relaxed text-[0.95rem] ${colors[state]}`

      const tagWithSpaces = tag.replaceAll('-', ' ')

      return `<button data-tag-button data-tag-value="${tag}" ${state === 'unavailable' ? 'disabled' : null} class="${classes}">${tagWithSpaces}</button>`
    })
    .join('')
}

const escapeHtml = (unsafe: string): string => {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

// This type is defined here to avoid an error that otherwise occurs when calling this function in a script tag on the
// client side after importing it from index.ts, which imports collections types defined in files which import astro:content,
// which cannot be imported (even indirectly) on the client side.
export type NotesListItem = {
  href: string
  // icon: {
  //   type: 'image' | 'emoji'
  //   src: string
  // }
  iconHtml: string
  tags: string[]
  text: string
}

/**
 * This approach supports updating the DOM via a script tag to avoid loading an additional frontend framework like React.
 */
export const generateNotesListItemHtml = (notes: NotesListItem[]): string => {
  return notes
    .map(
      (item, index): string => `
        <li class="inline">
          <span class="whitespace-nowrap">
            <span class="inline mr-1">${item.iconHtml}</span>
            <a href=${item.href} class="inline link-nav whitespace-normal">${escapeHtml(item.text)}</a>
          </span>

          ${index < notes.length - 1 ? '<span class="mx-2 text-[--moonlight-red]">•</span>' : ''}
        </li>
      `,
    )
    .join('')
}

/* TODO: show item tags? */

/* <ul class="ml-2 inline-flex gap-1">
  {cleanTags(note.data.tags).map(tag => (
    <li class="rounded border-[1px] border-[--moonlight-red] px-[0.25rem] text-[0.7rem] leading-relaxed text-[--moonlight-red]">
      {tag.replaceAll('-', ' ')}
    </li>
  ))}
</ul> */
