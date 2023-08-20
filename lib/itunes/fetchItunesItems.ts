import cloudinary from '../cloudinary/client'

interface iTunesListItem {
  date: string | Date
  id: number
  name: string
}

export interface iTunesItem {
  artist?: string
  title: string
  id: number
  date: string
  link: string
  imageUrl: string
}

type iTunesMedium = 'ebook' | 'music' | 'podcast'
type iTunesEntity = 'album' | 'ebook' | 'podcast'

// FIXME: separate by result type
interface iTunesResult {
  artistName?: string
  artworkUrl100: string
  collectionId?: number
  collectionName?: string
  collectionCensoredName?: string
  collectionViewUrl?: string
  date: string
  name: string
  releaseDate: Date
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
      data.results.map(async (result: Result): Promise<iTunesItem | null> => {
        if (!result) {
          return null
        }

        const resultID = result.collectionId || result.trackId
        const matchingItem = items.find(item => item.id === resultID)

        if (!matchingItem) {
          console.log('No matching item...')
          console.log('matchingItem', matchingItem)
          console.log('result', result)
          console.log('resultID', resultID)
          return null
        }

        const artist = result.artistName
        const title = matchingItem.name || result.collectionName || result.collectionCensoredName
        const id = resultID
        const date = matchingItem.date || result.releaseDate
        const link = result.collectionViewUrl || result.trackViewUrl

        // See image srcset URLs used on books.apple.com:
        const imageUrl = cloudinary.url(result.artworkUrl100.replace('100x100bb', '400x0w'), {
          type: 'fetch',
          crop: 'scale',
          fetch_format: 'auto',
          quality: 'auto',
          width: 600,
        })

        if (!title || !id || !date || !link || !imageUrl) {
          console.log(`Removed incomplete iTunes result:`, result)
          return null
        }

        if (includedIds.has(id)) {
          console.log(`Removed duplicate iTunes result:`, result)
          return null
        } else {
          includedIds.add(id)
        }

        return { artist, title, id, date: String(date), link, imageUrl }
      }),
    )

    return formattedResults.filter(Boolean).sort((a, b): number => Date.parse(b.date) - Date.parse(a.date))
  } catch (error) {
    console.log('fetchItunesItems error:', error)
    return []
  }
}
