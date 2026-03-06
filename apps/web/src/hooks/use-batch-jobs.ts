import { Job } from '@culyn/shared/types'
import { Api } from '@/lib/api'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useRef } from 'react'

export const useBatchJobs = (jobIds: string[], enabled: boolean = true) => {
  const filteredJobIds = jobIds.filter(Boolean)
  const queryClient = useQueryClient()
  const previousJobIdsRef = useRef<string[]>([])

  const {
    data: jobsMap,
    isPending: isPendingJobs,
    error,
  } = useQuery<Record<string, Job>>({
    queryKey: ['v1', 'jobs', 'batch', filteredJobIds.sort()], // Sort for consistent cache key
    queryFn: async () => {
      if (filteredJobIds.length === 0) return {}

      const response = await Api.v1.post<Record<string, Job>>('/jobs/batch', {
        jobIds: filteredJobIds,
      })
      return response.data
    },
    enabled: enabled && filteredJobIds.length > 0,
    refetchInterval: query => {
      const jobs = query.state.data as Record<string, Job> | undefined
      const hasRunningJobs =
        jobs &&
        Object.values(jobs).some(job => {
          return job.status === 'RUNNING' || job.status === 'QUEUED' || job.status === 'PENDING'
        })

      return hasRunningJobs ? 1000 * 5 : false
    },
  })

  // Track job IDs changes and invalidate queries when no more running jobs
  useEffect(() => {
    if (!jobsMap) return

    const hasRunningJobs = Object.values(jobsMap).some(
      job => job.status === 'RUNNING' || job.status === 'QUEUED' || job.status === 'PENDING'
    )

    // Check if we had running jobs before but don't now (last refetch)
    const previousJobIds = previousJobIdsRef.current
    const hadRunningJobs = previousJobIds.length > 0

    if (hadRunningJobs && !hasRunningJobs) {
      console.log('invalidating cookbook and recipes')
      queryClient.invalidateQueries({ queryKey: ['v1', 'cookbook'] })
      queryClient.invalidateQueries({ queryKey: ['v1', 'recipes'] })
      queryClient.invalidateQueries({ queryKey: ['v1', 'user', 'stats'] })
    }

    // Update the previous job IDs reference
    previousJobIdsRef.current = hasRunningJobs ? filteredJobIds : []
  }, [jobsMap, queryClient, filteredJobIds])

  return {
    jobsMap: jobsMap || {},
    isPendingJobs,
    error,
    getJob: (jobId: string) => jobsMap?.[jobId] || null,
  }
}
