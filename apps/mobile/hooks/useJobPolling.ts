import { apiClient } from '@/lib/api'
import { useCallback, useEffect, useRef, useState } from 'react'

type JobStatus = 'QUEUED' | 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'CANCELLED'

type JobResult = {
  category: 'RECIPE' | 'PLACE' | 'PRODUCT'
  slug: string
  recordId: string
  success: boolean
  error?: string
}

type JobData = {
  id: string
  type: string
  status: JobStatus
  progress: number
  resultData: JobResult | null
  errorData: { message: string } | null
  jobData: Record<string, unknown> | null
  failedAt: string | null
  completedAt: string | null
}

export function useJobPolling(jobId: string | undefined, intervalMs: number = 2000) {
  const [status, setStatus] = useState<JobStatus | null>(null)
  const [progress, setProgress] = useState(0)
  const [result, setResult] = useState<JobResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isPolling, setIsPolling] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const stopPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    setIsPolling(false)
  }, [])

  const reset = useCallback(() => {
    stopPolling()
    setStatus(null)
    setProgress(0)
    setResult(null)
    setError(null)
  }, [stopPolling])

  useEffect(() => {
    if (!jobId) {
      return
    }

    setIsPolling(true)

    const poll = async () => {
      try {
        const response = await apiClient().post<Record<string, JobData>>('/jobs/batch', {
          jobIds: [jobId],
        })

        const jobData = response.data[jobId]
        if (!jobData) return

        setStatus(jobData.status)
        setProgress(jobData.progress)

        if (jobData.status === 'COMPLETED' && jobData.resultData) {
          setResult(jobData.resultData)
          stopPolling()
        } else if (jobData.status === 'FAILED') {
          setError(jobData.errorData?.message || 'Job failed')
          stopPolling()
        } else if (jobData.status === 'CANCELLED') {
          setError('Job was cancelled')
          stopPolling()
        }
      } catch (err) {
        // Silently continue polling on network errors
        console.warn('[JobPolling] Poll error:', err)
      }
    }

    // Initial poll immediately
    poll()

    // Then poll at interval
    intervalRef.current = setInterval(poll, intervalMs)

    return () => {
      stopPolling()
    }
  }, [jobId, intervalMs, stopPolling])

  return {
    status,
    progress,
    result,
    error,
    isPolling,
    reset,
  }
}
