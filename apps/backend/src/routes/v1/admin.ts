import { auth } from '@/lib/auth'
import db from '@/lib/prisma'
import { Hono } from 'hono'
import { HTTPException } from 'hono/http-exception'

const admin = new Hono()

// POST /admin/recipes/:slug/image - Generate recipe image
// Note: recipeImageService is deferred (stays in web app)
// This route is a placeholder for future migration
admin.post('/recipes/:slug/image', async c => {
  const session = await auth.api.getSession({
    headers: c.req.raw.headers,
  })

  if (!session) {
    throw new HTTPException(401, {
      message: 'You are not authenticated, please login',
    })
  }

  const { slug } = c.req.param()

  const recipe = await db.recipe.findUnique({
    where: { slug },
  })

  if (!recipe) {
    throw new HTTPException(404, {
      message: 'Recipe not found',
    })
  }

  // Note: Recipe image generation service is deferred
  // The recipeImageService and image generation logic stay in the web app for now
  // This endpoint will be fully implemented when services are migrated
  throw new HTTPException(501, {
    message:
      'Recipe image generation is not yet implemented in the backend API. This service is still handled by the web application.',
  })
})

export default admin
