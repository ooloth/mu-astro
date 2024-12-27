import remarkWikiLink from '@portaljs/remark-wiki-link'

import remarkLastModified from './last-modified'
import remarkRemoveTags from './remove-tags'
import remarkYouTubeEmbedFromImageLink from './youtube-embed-from-image-link'

export default [
  remarkLastModified,
  remarkRemoveTags,
  [
    remarkWikiLink,
    {
      // see: https://github.com/datopian/portaljs/tree/main/packages/remark-wiki-link
      // see: https://stackoverflow.com/a/76897910/8802485
      pathFormat: 'obsidian-absolute',
      wikiLinkResolver: (slug: string): string[] => [`${slug}/`], // expects all pages to have root-level paths
    },
  ],
  remarkYouTubeEmbedFromImageLink,
]
