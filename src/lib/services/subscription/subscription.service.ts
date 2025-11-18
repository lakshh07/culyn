import db from '@/lib/prisma'
import { HttpException } from '@/exceptions/http-exceptions'
import { Prisma } from '@/generated/prisma/client'

type Subscription = Prisma.SubscriptionGetPayload<{
  select: {
    plan: true
    status: true
    maxRecipes: true
    maxUsers: true
    maxLists: true
  }
}>

/**
 * Subscription Service
 *
 * Service for managing user subscriptions and limits
 */
export class SubscriptionService {
  static async getUserSubscription(userId: string): Promise<Subscription> {
    const user = await db.user.findUnique({
      where: { id: userId },
      select: {
        defaultOrgId: true,
        organizationsOwned: {
          select: {
            subscription: {
              select: {
                plan: true,
                status: true,
                maxRecipes: true,
                maxUsers: true,
                maxLists: true,
                aiCreditsLimit: true,
                aiCreditsUsed: true,
              },
            },
          },
        },
      },
    })

    if (!user?.organizationsOwned?.[0]?.subscription) {
      throw new HttpException('NOT_FOUND', {
        name: 'SubscriptionNotFoundError',
        message: 'User subscription not found',
      })
    }

    return user.organizationsOwned[0].subscription
  }

  /**
   * Check if user can create more recipes
   */
  static async canCreateRecipe(userId: string): Promise<{
    canCreate: boolean
    currentCount: number
    maxAllowed: number
    subscription: Subscription
  }> {
    const subscription = await this.getUserSubscription(userId)

    const currentCount = await db.recipe.count({
      where: {
        userId,
        deletedAt: null,
      },
    })

    return {
      canCreate: currentCount < subscription.maxRecipes,
      currentCount,
      maxAllowed: subscription.maxRecipes,
      subscription,
    }
  }

  /**
   * Check if user can add recipe to cookbook (favorites)
   */
  static async canAddToCookbook(userId: string): Promise<{
    canAdd: boolean
    currentCount: number
    maxAllowed: number
  }> {
    const subscription = await this.getUserSubscription(userId)

    const currentCount = await db.recipeFavorite.count({
      where: {
        userId,
        deletedAt: null,
      },
    })

    return {
      canAdd: currentCount < subscription.maxRecipes,
      currentCount,
      maxAllowed: subscription.maxRecipes,
    }
  }

  /**
   * Enforce recipe creation limit
   */
  static async enforceRecipeLimit(userId: string): Promise<void> {
    const { canCreate, currentCount, maxAllowed } = await this.canCreateRecipe(userId)

    if (!canCreate) {
      throw new HttpException('FORBIDDEN', {
        name: 'RecipeLimitExceededError',
        message: `Recipe limit exceeded. You have ${currentCount}/${maxAllowed} recipes. Upgrade to create more.`,
      })
    }
  }

  /**
   * Enforce cookbook limit
   */
  static async enforceCookbookLimit(userId: string): Promise<void> {
    const { canAdd, currentCount, maxAllowed } = await this.canAddToCookbook(userId)

    if (!canAdd) {
      throw new HttpException('FORBIDDEN', {
        name: 'CookbookLimitExceededError',
        message: `Cookbook limit exceeded. You have ${currentCount}/${maxAllowed} recipes saved. Upgrade to save more.`,
      })
    }
  }
}
