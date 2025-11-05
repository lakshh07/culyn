import db from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'
import { ErrorResponse } from '@/lib/http'
import { HttpException } from '@/exceptions/http-exceptions'
import { auth } from '@/lib/auth'
import z from 'zod'

export async function GET(req: NextRequest) {
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

    const filters = await z
      .object({
        tagId: z.string().optional(),
      })
      .parseAsync(Object.fromEntries(req.nextUrl.searchParams))

    const recipes = await db.recipe.findMany({
      where: {
        ...(filters.tagId && {
          tags: {
            some: {
              tagId: filters.tagId,
              deletedAt: null,
            },
          },
        }),
      },
      include: {
        ...(filters.tagId && {
          tags: {
            where: {
              deletedAt: null,
            },
            include: {
              tag: {
                select: {
                  id: true,
                  name: true,
                  type: true,
                },
              },
            },
          },
        }),
        RecipeFavorite: {
          where: {
            deletedAt: null,
          },
          select: {
            id: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json(recipes)
  } catch (error) {
    return new ErrorResponse().from(error)
  }
}
