// see: https://docs.astro.build/en/recipes/modified-time/

import { execSync } from 'child_process'
import { resolve } from 'path'

function remarkModifiedTime() {
  return function (tree, file) {
    console.log('file:', file)
    const filepath = file.history[0]
    console.log('filepath:', filepath)

    // FIXME: the filepath might not be correctly set in the production environment. This could be due to differences in how file paths are handled or how the file.history array is populated.

    if (!filepath) {
      console.error('Error: filepath is undefined')
      return
    }

    try {
      // Resolve the absolute path of the file
      const absoluteFilePath = resolve(filepath)
      console.log('absoluteFilePath:', absoluteFilePath)

      // Get the root directory of the repository
      const repoRoot = execSync('git rev-parse --show-toplevel').toString().trim()
      console.log('repoRoot:', repoRoot)

      // Get the relative path of the file from the repository root
      const relativeFilePath = absoluteFilePath.replace(`${repoRoot}/`, '')
      console.log('relativeFilePath:', relativeFilePath)

      // Check if the file is within a submodule
      const submodulePath = execSync(`git submodule foreach --quiet 'echo $path'`)
        .toString()
        .trim()
        .split('\n')
        .find(submodule => relativeFilePath.startsWith(submodule))
      console.log('submodulePath:', submodulePath)

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
      console.log('lastModified:', result)
    } catch (error) {
      console.error('Error getting last modified time:', error)
    }
  }
}

export default remarkModifiedTime
