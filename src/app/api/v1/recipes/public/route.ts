import db from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { ErrorResponse } from '@/lib/http'

export async function GET() {
  try {
    const recipes = await db.recipe.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      take: 8,
    })

    return NextResponse.json(recipes)
  } catch (error) {
    return new ErrorResponse().from(error)
  }
}
