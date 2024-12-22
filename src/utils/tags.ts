export const cleanTags = (tags?: string[]): string[] =>
  Array.from(
    new Set(
      (tags ?? [])
        .filter(Boolean)
        .filter(tag => !['note'].includes(tag))
        .map(tag => tag.replace('topic/', ''))
        .map(tag => tag.replaceAll('-', ' ')),
    ),
  ).sort()
