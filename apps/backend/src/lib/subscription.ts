import { PLAN_DEFAULTS } from '@/lib/plans'
import db from '@/lib/prisma'
import { HTTPException } from 'hono/http-exception'

export async function getLibraryCount(userId: string): Promise<number> {
  const [recipeCount, placeCount, productCount] = await Promise.all([
    db.recipeFavorite.count({ where: { userId, deletedAt: null } }),
    db.placeFavorite.count({ where: { userId, deletedAt: null } }),
    db.productFavorite.count({ where: { userId, deletedAt: null } }),
  ])
  return recipeCount + placeCount + productCount
}

export async function getLibraryLimit(userId: string): Promise<number> {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: {
      organizationsOwned: {
        select: { subscription: { select: { plan: true } } },
      },
    },
  })
  const subscription = user?.organizationsOwned?.[0]?.subscription
  if (!subscription) throw new HTTPException(404, { message: 'User subscription not found' })
  return PLAN_DEFAULTS[subscription.plan].maxImports
}

export async function enforceLibraryLimit(userId: string): Promise<void> {
  const maxAllowed = await getLibraryLimit(userId)
  if (maxAllowed === -1) return // unlimited plan
  const currentCount = await getLibraryCount(userId)
  if (currentCount >= maxAllowed) {
    throw new HTTPException(403, {
      message: `Library limit reached. You have ${currentCount}/${maxAllowed} items saved. Upgrade to save more.`,
    })
  }
}
