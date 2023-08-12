// see: https://cloudinary.com/documentation/dynamic_folders
// see: https://cloudinary.com/documentation/admin_api#get_resources_by_asset_folder

import cloudinary from './client'
import type { ResourceApiResponse } from 'cloudinary'

export type CloudinaryResource = ResourceApiResponse['resources'][0]

async function fetchNextPage(folderName: string, nextCursor?: string): Promise<CloudinaryResource[]> {
  const response = await cloudinary.api
    .resources_by_asset_folder(folderName, {
      metadata: true, // include the metadata fields and values set for each asset
      context: true, //  include any key-value pairs of contextual metadata associated with each asset
      tags: true, // include the list of tag names assigned to each asset
      max_results: 500,
      next_cursor: nextCursor,
    })
    .catch(error => {
      
      throw Error(
        `🚨 Error fetching Cloudinary resources by asset folder "${folderName}":\n\n${JSON.stringify(
          error,
          null,
          2,
        )}\n`,
      )
    })

  return response.resources
}

async function fetchResourcesByAssetFolder(folderName = 'mu'): Promise<CloudinaryResource[]> {
  console.info(`📥 Fetching all Cloudinary resources from folder "${folderName}"...`)

  const fetchedResources: CloudinaryResource[] = []

  let nextCursor = undefined

  do {
    const resources = await fetchNextPage(folderName, nextCursor)

    fetchedResources.push(...resources)

    nextCursor = resources?.[0].next_cursor
  } while (nextCursor)

  // TODO: need to await all promises above here?

  console.info(`✅ Fetched ${fetchedResources.length} Cloudinary resources from folder "${folderName}".`)

  return fetchedResources
}

export default fetchResourcesByAssetFolder
