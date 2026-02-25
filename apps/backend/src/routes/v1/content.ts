import { QUEUE_NAMES } from '@/bull/config'
import { contentImportQueue } from '@/bull/queues'
import { auth } from '@/lib/auth'
import db from '@/lib/prisma'
import { enforceLibraryLimit } from '@/lib/subscription'
import { ImportContentRequestSchema } from '@culyn/shared/schemas'
import { JobType } from '@prisma/client'
import { Hono } from 'hono'
import { HTTPException } from 'hono/http-exception'

const content = new Hono()

// POST /content/import - Import content from URL (unified pipeline)
content.post('/import', async c => {
  const session = await auth.api.getSession({
    headers: c.req.raw.headers,
  })

  if (!session) {
    throw new HTTPException(401, {
      message: 'You are not authenticated, please login',
    })
  }

  const { user, org } = await db.$transaction(async tx => {
    const user = await tx.user.findUnique({
      where: { id: session.user.id },
    })

    const org = await tx.organization.findFirst({
      where: { ownerId: session.user.id },
    })

    return { user, org }
  })

  if (!user || !org) {
    throw new HTTPException(404, {
      message: 'User or organization not found',
    })
  }

  await enforceLibraryLimit(session.user.id)

  const payload = await ImportContentRequestSchema.parseAsync(await c.req.json())

  const bullJob = await contentImportQueue.add(QUEUE_NAMES.CONTENT_IMPORT, {
    userId: session.user.id,
    organizationId: org.id,
    url: payload.url,
  })

  const job = await db.job.create({
    data: {
      bullJobId: bullJob.id,
      type: JobType.CONTENT_IMPORT,
      user: { connect: { id: session.user.id } },
      organization: { connect: { id: org.id } },
      jobData: {
        url: payload.url,
      },
    },
  })

  return c.json({ jobId: job.id }, 202)
})

export default content
