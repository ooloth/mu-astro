import { type RemarkPlugins } from 'astro'
import remarkBacklinks from './backlinks'
import remarkLastModified from './last-modified'
import remarkRemoveTags from './remove-tags'
import remarkWikiLink from './wiki-link'
import remarkYouTubeEmbedFromImageLink from './youtube-embed-from-image-link'

export default [
  remarkBacklinks,
  remarkLastModified,
  remarkRemoveTags,
  remarkWikiLink,
  remarkYouTubeEmbedFromImageLink,
] satisfies RemarkPlugins
