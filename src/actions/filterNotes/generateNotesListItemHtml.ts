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
  text: string
}

export const generateNotesListItemHtml = (notes: NotesListItem[]): string => {
  return notes
    .map(
      (item, index): string => `
        <li class="inline">
          <span class="whitespace-nowrap">
            <span class="inline mr-1">${item.iconHtml}</span>
            <a href=${item.href} class="inline link-nav whitespace-normal">${item.text}</a>
          </span>

          ${index < notes.length - 1 ? '<span class="mx-2 text-[--moonlight-red]">•</span>' : ''}
        </li>
      `,
    )
    .join('')
}
