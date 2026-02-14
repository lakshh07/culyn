import { connectionOptions, defaultJobOptions, QUEUE_NAMES } from '@/bull/config'
import type { ContentImportJobData, ContentImportJobResult } from '@/bull/types'
import { Queue } from 'bullmq'

export const contentImportQueue = new Queue<ContentImportJobData, ContentImportJobResult>(
  QUEUE_NAMES.CONTENT_IMPORT,
  {
    connection: connectionOptions,
    defaultJobOptions,
  }
)
