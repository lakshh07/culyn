import axios from 'axios'
import type { DownloadedMedia, ScrapedData } from '../types'

/**
 * Downloads media (video + thumbnail) from scraped Instagram data
 */
export async function downloadInstagramMedia(scrapedData: ScrapedData): Promise<DownloadedMedia> {
  const media: DownloadedMedia = {}

  const downloadPromises: Promise<void>[] = []

  if (scrapedData.videoUrl) {
    downloadPromises.push(
      axios.get(scrapedData.videoUrl, { responseType: 'arraybuffer' }).then(response => {
        media.video = {
          buffer: Buffer.from(response.data),
          url: scrapedData.videoUrl!,
        }
      })
    )
  }

  if (scrapedData.displayUrl) {
    downloadPromises.push(
      axios.get(scrapedData.displayUrl, { responseType: 'arraybuffer' }).then(response => {
        media.thumbnail = {
          buffer: Buffer.from(response.data),
          url: scrapedData.displayUrl!,
        }
      })
    )
  }

  await Promise.all(downloadPromises)

  return media
}
