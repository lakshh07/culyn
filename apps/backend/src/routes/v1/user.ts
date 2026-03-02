import { auth } from '@/lib/auth'
import { PLAN_DEFAULTS } from '@/lib/plans'
import db from '@/lib/prisma'
import { zValidator } from '@hono/zod-validator'
import { DietType } from '@prisma/client'
import { Hono } from 'hono'
import { HTTPException } from 'hono/http-exception'
import { z } from 'zod'

const user = new Hono()

// Middleware to get authenticated user
const getAuthUser = async (c: { req: { raw: { headers: Headers } } }) => {
  const session = await auth.api.getSession({
    headers: c.req.raw.headers,
  })

  if (!session) {
    throw new HTTPException(401, {
      message: 'You are not authenticated, please login',
    })
  }

  return session.user
}

user.get('lookup', async c => {
  const email = c.req.query('email')
  const user = await db.user.findUnique({
    where: { email },
  })

  if (!user) {
    throw new HTTPException(404, { message: 'User not found' })
  }

  return c.json(user)
})

// Get user stats
user.get('/stats', async c => {
  const currentUser = await getAuthUser(c)

  const [cookbookCount, shoppingListCount] = await Promise.all([
    db.recipeFavorite.count({
      where: {
        userId: currentUser.id,
        deletedAt: null,
      },
    }),
    db.groceryList.count({
      where: {
        userId: currentUser.id,
        deletedAt: null,
      },
    }),
  ])

  return c.json({
    cookbookCount,
    shoppingListCount,
  })
})

// ==================== PROFILE ROUTES ====================

// Get user profile
user.get('/profile', async c => {
  const currentUser = await getAuthUser(c)

  const profile = await db.user.findUnique({
    where: { id: currentUser.id },
    select: {
      id: true,
      email: true,
      name: true,
      image: true,
      emailVerified: true,
      createdAt: true,
      updatedAt: true,
    },
  })

  if (!profile) {
    throw new HTTPException(404, { message: 'Profile not found' })
  }

  return c.json(profile)
})

// Update user profile
const updateProfileSchema = z.object({
  name: z.string().min(1).max(100).optional(),
})

user.patch('/profile', zValidator('json', updateProfileSchema), async c => {
  const currentUser = await getAuthUser(c)
  const { name } = c.req.valid('json')

  const updatedProfile = await db.user.update({
    where: { id: currentUser.id },
    data: { name },
    select: {
      id: true,
      email: true,
      name: true,
      image: true,
      emailVerified: true,
      createdAt: true,
      updatedAt: true,
    },
  })

  return c.json(updatedProfile)
})

// ==================== DIETARY PREFERENCES ROUTES ====================

// Get dietary preferences
user.get('/dietary', async c => {
  const currentUser = await getAuthUser(c)

  const preferences = await db.dietaryPreference.findMany({
    where: {
      userId: currentUser.id,
      deletedAt: null,
    },
  })

  return c.json(preferences)
})

// Create/Update dietary preferences
const dietaryPreferenceSchema = z.object({
  dietTypes: z.array(z.string()),
  allergens: z.array(z.string()),
  dislikes: z.array(z.string()),
  preferences: z.string().optional(),
})

user.post('/dietary', zValidator('json', dietaryPreferenceSchema), async c => {
  const currentUser = await getAuthUser(c)
  const { dietTypes, allergens, dislikes, preferences } = c.req.valid('json')

  // Delete existing preferences
  await db.dietaryPreference.deleteMany({
    where: { userId: currentUser.id },
  })

  // Create new preferences for each diet type
  const newPreferences = await Promise.all(
    dietTypes.map(type =>
      db.dietaryPreference.create({
        data: {
          userId: currentUser.id,
          type: type as DietType,
          allergens,
          dislikes,
          preferences,
        },
      })
    )
  )

  // If no diet types selected but user has other preferences, create a generic one
  if (dietTypes.length === 0 && (allergens.length > 0 || dislikes.length > 0 || preferences)) {
    const genericPref = await db.dietaryPreference.create({
      data: {
        userId: currentUser.id,
        type: 'VEGETARIAN' as DietType,
        allergens,
        dislikes,
        preferences,
      },
    })
    newPreferences.push(genericPref)
  }

  return c.json(newPreferences)
})

// Delete dietary preference
user.delete('/dietary/:id', async c => {
  const currentUser = await getAuthUser(c)
  const id = c.req.param('id')

  const preference = await db.dietaryPreference.findFirst({
    where: { id, userId: currentUser.id },
  })

  if (!preference) {
    throw new HTTPException(404, { message: 'Preference not found' })
  }

  await db.dietaryPreference.delete({
    where: { id },
  })

  return c.json({ message: 'Preference deleted successfully' })
})

// ==================== BILLING ROUTES ====================

// Get billing info
user.get('/billing', async c => {
  const currentUser = await getAuthUser(c)

  // Get user's default organization
  const userWithOrg = await db.user.findUnique({
    where: { id: currentUser.id },
    include: {
      organizationsOwned: {
        include: {
          subscription: true,
        },
        take: 1,
      },
    },
  })

  if (!userWithOrg || !userWithOrg.organizationsOwned[0]) {
    throw new HTTPException(404, { message: 'Organization not found' })
  }

  const organization = userWithOrg.organizationsOwned[0]
  const subscription = organization.subscription

  if (!subscription) {
    throw new HTTPException(404, { message: 'Subscription not found' })
  }

  // Get usage stats
  const [recipeCount, listCount, userCount] = await Promise.all([
    db.recipe.count({
      where: {
        orgId: organization.id,
        deletedAt: null,
      },
    }),
    db.groceryList.count({
      where: {
        orgId: organization.id,
        deletedAt: null,
      },
    }),
    db.userOrganization.count({
      where: {
        orgId: organization.id,
        deletedAt: null,
      },
    }),
  ])

  const planLimits = PLAN_DEFAULTS[subscription.plan]

  const daysLeft = subscription.currentPeriodEnd
    ? Math.max(
        0,
        Math.ceil((subscription.currentPeriodEnd.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
      )
    : undefined

  return c.json({
    subscription: {
      plan: subscription.plan,
      status: subscription.status,
      currentPeriodEnd: subscription.currentPeriodEnd?.toISOString() ?? null,
      chargeAt: subscription.chargeAt?.toISOString() ?? null,
      paidCount: subscription.paidCount ?? null,
      daysLeft: daysLeft ?? null,
      cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
      paymentMethod: subscription.paymentMethodLast4
        ? {
            last4: subscription.paymentMethodLast4,
            type: subscription.paymentMethodType,
            brand: subscription.paymentMethodBrand,
          }
        : null,
      maxRecipes: planLimits.maxImports,
      maxLists: planLimits.maxLists,
      aiCreditsLimit: planLimits.aiCreditsLimit,
    },
    usage: {
      recipeCount,
      userCount,
      listCount,
    },
  })
})

// ==================== SECURITY ROUTES ====================

// Get active sessions
user.get('/sessions', async c => {
  const currentUser = await getAuthUser(c)

  const sessions = await db.session.findMany({
    where: {
      userId: currentUser.id,
    },
    select: {
      id: true,
      userAgent: true,
      ipAddress: true,
      createdAt: true,
      expiresAt: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  })

  return c.json(sessions)
})

// Revoke specific session
user.delete('/sessions/:id', async c => {
  const currentUser = await getAuthUser(c)
  const sessionId = c.req.param('id')

  const session = await db.session.findFirst({
    where: {
      id: sessionId,
      userId: currentUser.id,
    },
  })

  if (!session) {
    throw new HTTPException(404, { message: 'Session not found' })
  }

  await db.session.delete({
    where: { id: sessionId },
  })

  return c.json({ message: 'Session revoked successfully' })
})

// Revoke all sessions
user.delete('/sessions', async c => {
  const currentUser = await getAuthUser(c)

  await db.session.deleteMany({
    where: {
      userId: currentUser.id,
    },
  })

  return c.json({ message: 'All sessions revoked successfully' })
})

export default user
