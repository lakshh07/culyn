import { S3Client } from '@aws-sdk/client-s3'
import { aws } from '@/configs/aws'

export const s3 = new S3Client({
  region: aws.region,
  endpoint: aws.endpoint,
  credentials: {
    accessKeyId: aws.accessKeyId,
    secretAccessKey: aws.secretAccessKey,
  },
})
