import { HttpException } from '@/exceptions/http-exceptions'
import { auth } from '@/lib/auth'
import { ErrorResponse } from '@/lib/http'
import db from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

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

    const [cookbookCount, shoppingListCount] = await Promise.all([
      db.recipeFavorite.count({
        where: {
          userId: session.user.id,
          deletedAt: null,
        },
      }),
      db.groceryList.count({
        where: {
          userId: session.user.id,
          deletedAt: null,
        },
      }),
    ])

    return NextResponse.json({
      cookbookCount,
      shoppingListCount,
    })
  } catch (error) {
    return new ErrorResponse().from(error)
  }
}
