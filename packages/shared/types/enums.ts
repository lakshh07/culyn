export const JobStatus = {
  QUEUED: 'QUEUED',
  PENDING: 'PENDING',
  RUNNING: 'RUNNING',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED',
  CANCELLED: 'CANCELLED',
  PAUSED: 'PAUSED',
} as const;
export type JobStatus = typeof JobStatus[keyof typeof JobStatus];

export const RecipeSourceType = {
  MANUAL: 'MANUAL',
  INSTAGRAM_REEL: 'INSTAGRAM_REEL',
  INSTAGRAM_POST: 'INSTAGRAM_POST',
  INSTAGRAM_VIDEO: 'INSTAGRAM_VIDEO',
  TIKTOK: 'TIKTOK',
} as const;
export type RecipeSourceType = typeof RecipeSourceType[keyof typeof RecipeSourceType];
