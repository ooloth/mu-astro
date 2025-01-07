import { execSync } from 'child_process'
import { resolve } from 'path'
import { readdirSync, readFileSync } from 'fs'
import { type RemarkPlugin } from '@astrojs/markdown-remark'
import { VFile } from 'vfile'
import { slug as githubSlug } from 'github-slugger'

const slugify = (filename: string): string => githubSlug(filename.split('/').at(-1)!.replace('.md', ''))

const remarkBacklinks: RemarkPlugin = () => {
  const repoRoot = execSync('git rev-parse --show-toplevel').toString().trim()

  const getAllMarkdownFiles = (dir: string): string[] => {
    const files = readdirSync(dir, { withFileTypes: true })
    let markdownFiles: string[] = []

    files.forEach(file => {
      const fullPath = resolve(dir, file.name)
      if (file.isDirectory()) {
        markdownFiles = markdownFiles.concat(getAllMarkdownFiles(fullPath))
      } else if (file.isFile() && fullPath.endsWith('.md')) {
        markdownFiles.push(fullPath)
      }
    })

    return markdownFiles
  }

  const findBacklinks = (slug: string): string[] => {
    const contentDirectory = resolve(repoRoot, 'src/content')
    const markdownFiles = getAllMarkdownFiles(contentDirectory)
    const backlinks: string[] = []

    const wikiLinkWithOptionalDirectoryAndTextRegex = new RegExp(`\\[\\[(?:[^/]+/)?${slug}(\\|[^\\]]+)?\\]\\]`, 'g')

    markdownFiles.forEach(file => {
      const fileSlug = slugify(file)
      if (fileSlug === slug) {
        return
      }

      const content = readFileSync(file, 'utf-8')
      const matches = content.match(wikiLinkWithOptionalDirectoryAndTextRegex)

      if (matches && matches.length > 0) {
        backlinks.push(fileSlug)
      }
    })

    return backlinks
  }

  return function (_tree, file: VFile): void {
    const filepath = file.history[0]

    if (!filepath) {
      // NOTE: we'll get here when building the RSS feed, which is totally fine
      return
    }

    try {
      const slug = slugify(filepath)
      const backlinks = findBacklinks(slug)

      ;((file.data.astro ?? {}).frontmatter ?? {}).backlinks = backlinks
    } catch (error) {
      console.error('Error getting backlinks:', error)
    }
  }
}

export default remarkBacklinks
