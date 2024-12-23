// see: https://docs.astro.build/en/recipes/modified-time/

import { execSync } from 'child_process'
import { resolve } from 'path'

function remarkModifiedTime() {
  const repoRoot = execSync('git rev-parse --show-toplevel').toString().trim()

  const submodulePaths = execSync('git config --file .gitmodules --get-regexp path')
    .toString()
    .trim()
    .split('\n')
    .map(line => line.split(' ')[1])

  return function (tree, file) {
    const filepath = file.history[0]

    if (!filepath) {
      // NOTE: we'll get here when building the RSS feed, which is totally fine
      return
    }

    try {
      const absoluteFilePath = resolve(filepath)
      const relativeFilePath = absoluteFilePath.replace(`${repoRoot}/`, '')

      // Check if the file is within a submodule
      const submodulePath = submodulePaths.find(submodule => relativeFilePath.startsWith(submodule))

      let result
      if (submodulePath) {
        // Navigate to the submodule directory and get the last modified time
        const submoduleAbsolutePath = resolve(repoRoot, submodulePath)
        const submoduleRelativeFilePath = absoluteFilePath.replace(`${submoduleAbsolutePath}/`, '')
        result = execSync(
          `cd ${submoduleAbsolutePath} && git log -1 --pretty="format:%cI" "${submoduleRelativeFilePath}"`,
        )
          .toString()
          .trim()
      } else {
        // Get the last modified time in the main repository
        result = execSync(`git log -1 --pretty="format:%cI" "${relativeFilePath}"`).toString().trim()
      }

      file.data.astro.frontmatter.lastModified = result
    } catch (error) {
      console.error('Error getting last modified time:', error)
    }
  }
}

export default remarkModifiedTime
