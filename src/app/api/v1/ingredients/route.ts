import db from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'
import { ErrorResponse } from '@/lib/http'
import { HttpException } from '@/exceptions/http-exceptions'
import { auth } from '@/lib/auth'

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

    const ingredients = await db.ingredient.findMany({
      where: {
        deletedAt: null,
      },
      select: {
        id: true,
        name: true,
        slug: true,
        category: true,
      },
      orderBy: {
        name: 'asc',
      },
    })

    return NextResponse.json(ingredients)
  } catch (error) {
    return new ErrorResponse().from(error)
  }
}
