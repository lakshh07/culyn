import { HttpException } from '@/exceptions/http-exceptions'
import { auth } from '@/lib/auth'
import { ErrorResponse } from '@/lib/http'
import { NextRequest } from 'next/server'
import db from '@/lib/prisma'

interface NextRequestContext {
  params: Promise<{ slug: string; listId: string }>
}

export async function DELETE(req: NextRequest, ctx: NextRequestContext) {
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

    const params = await ctx.params
    const { slug, listId } = params

    const recipe = await db.recipe.findUnique({
      where: { slug, userId: session.user.id, deletedAt: null },
      select: { id: true },
    })

    if (!recipe) {
      throw new HttpException('NOT_FOUND', {
        name: 'RecipeNotFoundError',
        message: 'Recipe not found',
      })
    }

    const list = await db.groceryList.findFirst({
      where: { id: listId, userId: session.user.id, deletedAt: null },
    })

    if (!list) {
      throw new HttpException('NOT_FOUND', {
        name: 'GroceryListNotFoundError',
        message: 'Grocery list not found',
      })
    }

    await db.$transaction(async tx => {
      await tx.listItem.updateMany({
        where: { listId, recipeId: recipe.id },
        data: { checked: false, notes: null, deletedAt: new Date() },
      })

      await tx.groceryList.update({
        where: { id: listId },
        data: { completed: true, deletedAt: new Date() },
      })
    })

    return new Response(null, { status: 204 })
  } catch (error) {
    return new ErrorResponse().from(error)
  }
}
