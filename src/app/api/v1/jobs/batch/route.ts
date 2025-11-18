import { HttpException } from '@/exceptions/http-exceptions'
import { auth } from '@/lib/auth'
import { ErrorResponse } from '@/lib/http'
import db from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const BatchJobsRequestSchema = z.object({
  jobIds: z.array(z.string()).min(1).max(50), // Limit to 50 jobs per request
})

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: req.headers,
    })

    if (!session) {
      throw new HttpException('UNAUTHORIZED', {
        name: 'AuthenticationError',
        message: 'You are not authenticated, please login',
      })
    }

    const body = await req.json()
    const { jobIds } = BatchJobsRequestSchema.parse(body)

    const jobs = await db.job.findMany({
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
    const jobsMap = jobs.reduce(
      (acc, job) => {
        acc[job.id] = job
        return acc
      },
      {} as Record<string, (typeof jobs)[0]>
    )

    return NextResponse.json(jobsMap)
  } catch (error) {
    return new ErrorResponse().from(error)
  }
}
