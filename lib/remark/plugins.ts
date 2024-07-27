import remarkUnwrapImages from 'remark-unwrap-images'
import remarkWikiLink from '@portaljs/remark-wiki-link'

import remarkRemoveTags from './remove-tags'

export default [
  remarkRemoveTags,
  remarkUnwrapImages,
  [
    remarkWikiLink,
    {
      // see: https://github.com/datopian/portaljs/tree/main/packages/remark-wiki-link
      // see: https://stackoverflow.com/a/76897910/8802485
      pathFormat: 'obsidian-absolute',
      wikiLinkResolver: (slug: string): string[] => [`${slug}/`], // expects all pages to have root-level paths
    },
  ],
]
