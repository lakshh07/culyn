import { ErrorResponse } from '@/lib/http'
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { HttpException } from '@/exceptions/http-exceptions'
import { z } from 'zod'
import db from '@/lib/prisma'
import { JobType, RecipeSourceType } from '@/generated/prisma/enums'
import { generateRecipesQueue } from '@/bull/queues'
import { QUEUE_NAMES } from '@/bull/config'

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

    const { user, org } = await db.$transaction(async tx => {
      const user = await tx.user.findUnique({
        where: {
          id: session.user.id,
        },
      })

      const org = await tx.organization.findFirst({
        where: {
          ownerId: session.user.id,
        },
      })

      return { user, org }
    })

    if (!user || !org) {
      throw new HttpException('NOT_FOUND', {
        name: 'UserOrOrganizationError',
        message: 'User or organization not found',
      })
    }

    const payload = await z
      .object({
        url: z.url().describe('The URL of the recipe to generate'),
      })
      .parseAsync(await req.json())

    const { recipe, bullJob, job } = await db.$transaction(async tx => {
      const recipe = await tx.recipe.create({
        data: {
          user: {
            connect: {
              id: session.user.id,
            },
          },
          organization: {
            connect: {
              id: org.id,
            },
          },
        },
      })

      const bullJob = await generateRecipesQueue.add(QUEUE_NAMES.RECIPE_GENERATION, {
        userId: session.user.id,
        organizationId: org.id,
        recipeId: recipe.id,
        url: payload.url,
        sourceType: RecipeSourceType.INSTAGRAM_REEL,
      })

      const job = await tx.job.create({
        data: {
          bullJobId: bullJob.id,
          type: JobType.RECIPE_GENERATION,
          user: {
            connect: {
              id: session.user.id,
            },
          },
          organization: {
            connect: {
              id: org.id,
            },
          },
        },
      })

      return { recipe, bullJob, job }
    })

    return NextResponse.json({
      status: 202,
      data: { recipeId: recipe.id, bullJobId: bullJob.id, jobId: job.id },
    })
  } catch (error) {
    return new ErrorResponse().from(error)
  }
}
