import fsExtra from 'fs-extra'
import type { CloudinaryResource } from './fetchResourcesByAssetFolder'
import { getJsonFileName } from './cacheCloudinaryResources'

export default async function readCachedCloudinaryResources(): Promise<CloudinaryResource[] | void> {
  const jsonFileName = getJsonFileName('mu')

  try {
    const json = await fsExtra.readJson(jsonFileName)
    return json.mu.resources
  } catch (error: unknown) {
    throw new Error(`🚨 Error reading ${jsonFileName}:\n\n${JSON.stringify(error, null, 2)}`)
  }
}
