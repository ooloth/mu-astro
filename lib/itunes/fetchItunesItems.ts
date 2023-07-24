import { transformCloudinaryImage } from 'lib/cloudinary/utils'
import getImagePlaceholderForEnv from 'utils/getImagePlaceholderForEnv'

interface iTunesListItem {
  date: string
  id: number
  name: string
}

export interface iTunesItem {
  artist: string
  title: string
  id: string
  date: string
  link: string
  imageUrl: string
  imagePlaceholder: string
}

type iTunesMedium = 'ebook' | 'music' | 'podcast'
type iTunesEntity = 'album' | 'ebook' | 'podcast'

// FIXME: separate by result type
interface iTunesResult {
  artistName?: string
  artworkUrl100: string
  collectionId?: number
  collectionViewUrl?: string
  date: string
  name: string
  trackId: number
  trackViewUrl?: string
}
interface iTunesAlbumResult extends iTunesResult {}
interface iTunesBookResult extends iTunesResult {}
interface iTunesPodcastResult extends iTunesResult {}

type Result = iTunesAlbumResult | iTunesBookResult | iTunesPodcastResult

export default async function fetchItunesItems(
  items: iTunesListItem[],
  medium: iTunesMedium,
  entity: iTunesEntity,
): Promise<iTunesItem[]> {
  const stringOfItemIDs = items.map(item => item.id).join(',')

  let formattedResults: iTunesItem[]
  const includedIds = new Set()

  // See: https://affiliate.itunes.apple.com/resources/documentation/itunes-store-web-service-search-api/#lookup
  try {
    const response = await fetch(
      `https://itunes.apple.com/lookup?id=${stringOfItemIDs}&country=CA&media=${medium}&entity=${entity}&sort=recent`,
    )

    const data = await response.json()

    formattedResults = await Promise.all(
      data.results.map(async (result: Result) => {
        if (!result) {
          return null
        }

        const resultID: number = result.collectionId || result.trackId
        const matchingItem: iTunesListItem | undefined = items.find(item => item.id === resultID)

        if (!matchingItem) {
          console.log('No matching item...')
          console.log('matchingItem', matchingItem)
          console.log('result', result)
          console.log('resultID', resultID)
          return null
        }

        const artist = result.artistName
        const title = matchingItem.name
        const id = resultID
        const date = matchingItem.date
        const link = result.collectionViewUrl || result.trackViewUrl
        // See image srcset URLs used on books.apple.com:
        const imageUrl = transformCloudinaryImage(
          `https://res.cloudinary.com/ooloth/image/fetch/${result.artworkUrl100.replace(
            '100x100bb',
            '400x0w',
          )}`,
          192,
        )

        if (!title || !id || !date || !link || !imageUrl || includedIds.has(id)) {
          console.log(`Removed iTunes result:`, result)
          return null
        }

        const imagePlaceholder = await getImagePlaceholderForEnv(imageUrl, 4)

        includedIds.add(id)

        return { artist, title, id, date, link, imageUrl, imagePlaceholder }
      }),
    )

    return formattedResults.filter(Boolean).sort((a, b) => b.date.localeCompare(a.date))
  } catch (error) {
    console.log('fetchItunesItems error:', error)
    return []
  }
}
