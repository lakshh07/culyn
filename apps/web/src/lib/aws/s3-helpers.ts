import { PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'
import { s3 } from './s3'
import axios from 'axios'
import { FetchAndUploadOptions, UploadToS3Options, UploadToS3Result } from './types'

/**
 * S3 configuration constants
 */
const S3_CONFIG = Object.freeze({
  BUCKET: process.env.AWS_S3_BUCKET || 'culina-ai',
  PUBLIC_URL_BASE: process.env.AWS_PUBLIC_URL_BASE || '',
  FOLDERS: {
    RECIPE_VIDEOS: 'recipe-videos',
    RECIPE_THUMBNAILS: 'recipe-thumbnails',
    RECIPE_IMAGES: 'recipe-images',
  },
})

/**
 * Content type mappings for common file types
 */
const CONTENT_TYPES = Object.freeze({
  VIDEO_MP4: 'video/mp4',
  IMAGE_JPG: 'image/jpg',
  IMAGE_JPEG: 'image/jpeg',
  IMAGE_PNG: 'image/png',
  IMAGE_WEBP: 'image/webp',
})

/**
 * Generic function to upload a buffer to S3
 * @param options Upload options including key, body, and content type
 * @returns Upload result with key and public URL
 */
export async function uploadToS3(options: UploadToS3Options): Promise<UploadToS3Result> {
  const { key, body, contentType, bucket = S3_CONFIG.BUCKET, metadata } = options

  await s3.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: body,
      ContentType: contentType,
      ...(metadata && { Metadata: metadata }),
    })
  )

  const url = `${S3_CONFIG.PUBLIC_URL_BASE}/${key}`

  return {
    key,
    url,
    bucket,
  }
}

/**
 * Fetch a file from a URL and upload it to S3
 * @param options Fetch and upload options
 * @returns Upload result with key and public URL
 */
export async function fetchAndUploadToS3(
  options: FetchAndUploadOptions
): Promise<UploadToS3Result> {
  const { url, folder, filename, contentType, bucket = S3_CONFIG.BUCKET } = options

  const response = await axios.get(url, {
    responseType: 'arraybuffer',
  })

  const buffer = Buffer.from(response.data)
  const key = `${folder}/${filename}`

  return uploadToS3({
    key,
    body: buffer,
    contentType,
    bucket,
  })
}

/**
 * Upload a video file to S3
 * @param videoBuffer Video buffer to upload
 * @param recipeId Recipe ID for naming
 * @returns Upload result
 */
export async function uploadRecipeVideo(
  videoBuffer: Buffer,
  recipeId: string
): Promise<UploadToS3Result> {
  const filename = `${recipeId}-${Date.now()}.mp4`
  const key = `${S3_CONFIG.FOLDERS.RECIPE_VIDEOS}/${filename}`

  return uploadToS3({
    key,
    body: videoBuffer,
    contentType: CONTENT_TYPES.VIDEO_MP4,
  })
}

/**
 * Fetch video from URL and upload to S3
 * @param videoUrl URL of the video to fetch
 * @param recipeId Recipe ID for naming
 * @returns Upload result
 */
export async function fetchAndUploadRecipeVideo(
  videoUrl: string,
  recipeId: string
): Promise<UploadToS3Result> {
  const filename = `${recipeId}-${Date.now()}.mp4`

  return fetchAndUploadToS3({
    url: videoUrl,
    folder: S3_CONFIG.FOLDERS.RECIPE_VIDEOS,
    filename,
    contentType: CONTENT_TYPES.VIDEO_MP4,
  })
}

/**
 * Upload a thumbnail/image file to S3
 * @param imageBuffer Image buffer to upload
 * @param recipeId Recipe ID for naming
 * @param folder Folder to upload to (defaults to thumbnails)
 * @param extension File extension (defaults to jpg)
 * @returns Upload result
 */
export async function uploadRecipeImage(
  imageBuffer: Buffer,
  recipeId: string,
  folder: string = S3_CONFIG.FOLDERS.RECIPE_THUMBNAILS,
  extension: string = 'jpg'
): Promise<UploadToS3Result> {
  const filename = `${recipeId}-${Date.now()}.${extension}`
  const key = `${folder}/${filename}`

  const contentTypeMap: Record<string, string> = {
    jpg: CONTENT_TYPES.IMAGE_JPG,
    jpeg: CONTENT_TYPES.IMAGE_JPEG,
    png: CONTENT_TYPES.IMAGE_PNG,
    webp: CONTENT_TYPES.IMAGE_WEBP,
  }

  const contentType = contentTypeMap[extension.toLowerCase()] || CONTENT_TYPES.IMAGE_JPG

  return uploadToS3({
    key,
    body: imageBuffer,
    contentType,
  })
}

/**
 * Fetch image from URL and upload to S3
 * @param imageUrl URL of the image to fetch
 * @param recipeId Recipe ID for naming
 * @param folder Folder to upload to (defaults to thumbnails)
 * @param extension File extension (defaults to jpg)
 * @returns Upload result
 */
export async function fetchAndUploadRecipeImage(
  imageUrl: string,
  recipeId: string,
  folder: string = S3_CONFIG.FOLDERS.RECIPE_THUMBNAILS,
  extension: string = 'jpg'
): Promise<UploadToS3Result> {
  const filename = `${recipeId}-${Date.now()}.${extension}`

  const contentTypeMap: Record<string, string> = {
    jpg: CONTENT_TYPES.IMAGE_JPG,
    jpeg: CONTENT_TYPES.IMAGE_JPEG,
    png: CONTENT_TYPES.IMAGE_PNG,
    webp: CONTENT_TYPES.IMAGE_WEBP,
  }

  const contentType = contentTypeMap[extension.toLowerCase()] || CONTENT_TYPES.IMAGE_JPG

  return fetchAndUploadToS3({
    url: imageUrl,
    folder,
    filename,
    contentType,
  })
}

/**
 * Delete a file from S3
 * @param key S3 key to delete
 * @param bucket S3 bucket (defaults to configured bucket)
 */
export async function deleteFromS3(key: string, bucket: string = S3_CONFIG.BUCKET): Promise<void> {
  await s3.send(
    new DeleteObjectCommand({
      Bucket: bucket,
      Key: key,
    })
  )
}

/**
 * Export S3 configuration for use in other modules
 */
export { S3_CONFIG, CONTENT_TYPES }
