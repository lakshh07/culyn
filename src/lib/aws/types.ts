/**
 * Options for uploading a file to S3
 */
export interface UploadToS3Options {
  key: string
  body: Buffer
  contentType: string
  bucket?: string
  metadata?: Record<string, string>
}

/**
 * Result from uploading to S3
 */
export interface UploadToS3Result {
  key: string
  url: string
  bucket: string
}

/**
 * Options for fetching a file from a URL and uploading to S3
 */
export interface FetchAndUploadOptions {
  url: string
  folder: string
  filename: string
  contentType: string
  bucket?: string
}
