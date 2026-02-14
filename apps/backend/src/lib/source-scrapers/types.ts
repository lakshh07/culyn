import type { SourcePlatform } from '@prisma/client'

export type ScrapedData = {
  caption: string
  ownerUsername: string
  videoUrl?: string
  displayUrl?: string
  imageUrls?: string[]
}

export type DownloadedMedia = {
  video?: { buffer: Buffer; url: string }
  thumbnail?: { buffer: Buffer; url: string }
  images?: Array<{ buffer: Buffer; url: string }>
}
