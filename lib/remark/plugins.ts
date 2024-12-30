import { type RemarkPlugins } from 'astro'
import remarkLastModified from './last-modified'
import remarkRemoveTags from './remove-tags'
import remarkWikiLink from './wiki-link'
import remarkYouTubeEmbedFromImageLink from './youtube-embed-from-image-link'

export default [
  remarkLastModified,
  remarkRemoveTags,
  remarkWikiLink,
  remarkYouTubeEmbedFromImageLink,
] satisfies RemarkPlugins
