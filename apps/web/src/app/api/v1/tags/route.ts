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

    const tags = await db.tag.findMany({
      where: {
        deletedAt: null,
      },
      orderBy: {
        name: 'asc',
      },
      select: {
        id: true,
        name: true,
        type: true,
      },
    })

    return NextResponse.json(tags)
  } catch (error) {
    return new ErrorResponse().from(error)
  }
}
