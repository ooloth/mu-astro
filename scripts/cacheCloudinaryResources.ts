import fs from 'fs'

import fetchResourcesByAssetFolder from './fetchResourcesByAssetFolder'
import { getErrorDetails } from '../src/utils/log'
import getJsonFileName from './getJsonFileName'
import type { CloudinaryResource } from '../lib/cloudinary/types'

async function writeResourcesToDisk(folderName: string, resources: CloudinaryResource[]): Promise<void> {
  const contents = {
    date: new Date().toLocaleString('en-CA'),
    mu: {
      count: resources.length,
      resources,
    },
  }

  const jsonFileName = getJsonFileName(folderName)

  try {
    fs.writeFileSync(jsonFileName, JSON.stringify(contents, null, 2))
    console.info(`📝 Updated ${jsonFileName}`)
  } catch (error: unknown) {
    console.error(`🚨 Error updating ${jsonFileName}:\n\n${getErrorDetails(error)}`)
  }
}

// Save all Cloudinary image details with a single Admin API call each time the build begins
async function cacheCloudinaryResources(folderName = 'mu'): Promise<void> {
  const resources = await fetchResourcesByAssetFolder(folderName)

  // IDEA: could extend later to cache multiple folders
  await writeResourcesToDisk(folderName, resources)
}

await cacheCloudinaryResources()
