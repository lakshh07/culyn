import { JobStatus } from './enums';

export interface Job {
  id: string;
  bullJobId?: string | null;
  type: string;
  status: JobStatus;
  progress: number;
  jobData?: unknown;
  resultData?: unknown;
  errorData?: unknown;
  metadata?: Record<string, unknown> | null;
  userId?: string | null;
  orgId?: string | null;
  createdAt: string;
  updatedAt: string;
  failedAt?: string | null;
  startedAt?: string | null;
  completedAt?: string | null;
}
