import { auth } from '@/lib/auth'
import db from '@/lib/prisma'
import { Hono } from 'hono'
import { HTTPException } from 'hono/http-exception'
import { z } from 'zod'

const jobs = new Hono()

const BatchJobsRequestSchema = z.object({
  jobIds: z.array(z.string()).min(1).max(50), // Limit to 50 jobs per request
})

// POST /jobs/batch - Get multiple jobs by IDs
jobs.post('/batch', async c => {
  const session = await auth.api.getSession({
    headers: c.req.raw.headers,
  })

  if (!session) {
    throw new HTTPException(401, {
      message: 'You are not authenticated, please login',
    })
  }

  const body = await c.req.json()
  const { jobIds } = BatchJobsRequestSchema.parse(body)

  const jobsList = await db.job.findMany({
    where: {
      id: { in: jobIds },
      userId: session.user.id, // Ensure user can only access their own jobs
    },
    select: {
      id: true,
      type: true,
      status: true,
      progress: true,
      resultData: true,
      errorData: true,
      jobData: true,
      failedAt: true,
      completedAt: true,
    },
  })

  // Return jobs as a map for easy lookup
  const jobsMap = jobsList.reduce(
    (acc, job) => {
      acc[job.id] = job
      return acc
    },
    {} as Record<string, (typeof jobsList)[0]>
  )

  return c.json(jobsMap)
})

export default jobs
