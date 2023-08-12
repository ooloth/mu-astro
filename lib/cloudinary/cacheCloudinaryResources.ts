import fs from 'fs'

import fetchResourcesByAssetFolder, { type CloudinaryResource } from './fetchResourcesByAssetFolder'

export const getJsonFileName = (folderName: string): string => `./lib/cloudinary/resources.${folderName}.json`

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
    console.info(`📝 Updated ${jsonFileName}.`)
  } catch (error: unknown) {
    console.error(`🚨 Error updating ${jsonFileName}:\n\n${JSON.stringify(error, null, 2)}`)
  }
}

export default async function cacheCloudinaryResources(folderName = 'mu'): Promise<void> {
  // IDEA: could extend later to cache multiple folders
  await writeResourcesToDisk(folderName, await fetchResourcesByAssetFolder(folderName))
}
