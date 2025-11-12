import { HttpException } from '@/exceptions/http-exceptions'
import { auth } from '@/lib/auth'
import { ErrorResponse } from '@/lib/http'
import db from '@/lib/prisma'
import { NextRequest } from 'next/server'
import z from 'zod'

interface NextRequestContext {
  params: Promise<{ slug: string; itemId: string }>
}

export async function PATCH(req: NextRequest, ctx: NextRequestContext) {
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
    const { slug, itemId } = params

    const payload = await z
      .union([
        z.object({
          clearAll: z.boolean(),
        }),
        z.object({
          checked: z.boolean(),
        }),
        z.object({
          notes: z.string(),
        }),
      ])
      .parseAsync(await req.json())

    const recipe = await db.recipe.findUnique({
      where: { slug },
      select: { id: true },
    })

    if (!recipe) {
      throw new HttpException('NOT_FOUND', {
        name: 'RecipeNotFoundError',
        message: 'Recipe not found',
      })
    }

    const item = await db.listItem.findFirst({
      where: {
        id: itemId,
        recipeId: recipe.id,
        deletedAt: null,
        list: {
          userId: session.user.id,
        },
      },
    })

    if (!item) {
      throw new HttpException('NOT_FOUND', {
        name: 'ListItemNotFoundError',
        message: 'List item not found',
      })
    }

    if ('clearAll' in payload) {
      await db.$transaction(async tx => {
        await tx.listItem.updateMany({
          where: { id: itemId, recipeId: recipe.id },
          data: { deletedAt: new Date() },
        })

        await tx.groceryList.update({
          where: { id: item.listId },
          data: { completed: true, deletedAt: new Date() },
        })
      })

      return new Response(null, { status: 204 })
    }

    if ('checked' in payload) {
      await db.listItem.update({
        where: { id: itemId, recipeId: recipe.id },
        data: { checked: payload.checked, updatedAt: new Date() },
      })

      return new Response(null, { status: 204 })
    }

    if ('notes' in payload) {
      await db.listItem.update({
        where: { id: itemId, recipeId: recipe.id },
        data: { notes: payload.notes, updatedAt: new Date() },
      })

      return new Response(null, { status: 204 })
    }
  } catch (error) {
    return new ErrorResponse().from(error)
  }
}
