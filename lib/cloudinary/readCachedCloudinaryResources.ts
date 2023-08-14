import fsExtra from 'fs-extra'

import { getErrorDetails } from '../../src/utils/log'
import getJsonFileName from '../../scripts/getJsonFileName'
import type { CloudinaryResource } from './types'

export default async function readCachedCloudinaryResources(folderName = 'mu'): Promise<CloudinaryResource[] | void> {
  const jsonFileName = getJsonFileName(folderName)

  try {
    const json = await fsExtra.readJson(jsonFileName)
    return json[folderName].resources
  } catch (error: unknown) {
    throw new Error(`🚨 Error reading ${jsonFileName}:\n\n${getErrorDetails(error)}`)
  }
}
