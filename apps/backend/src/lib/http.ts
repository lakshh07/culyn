import type { HttpErrorResponseBody } from '@culyn/shared/types'
import { formatZodError } from '@culyn/shared/utils'
import { Prisma } from '@prisma/client'
import type { Context } from 'hono'
import { HTTPException } from 'hono/http-exception'
import { ZodError } from 'zod'

/**
 * Error handler for Hono application
 * Converts various error types into consistent HTTP responses
 */
export function errorHandler(error: unknown, c: Context) {
  if (process.env.NODE_ENV !== 'production') {
    console.error('An error occurred while processing the request')
    console.error(error)
  }

  // HTTPException from Hono
  if (error instanceof HTTPException) {
    return error.getResponse()
  }

  // Zod validation errors
  if (error instanceof ZodError) {
    const body: HttpErrorResponseBody = {
      name: 'RequestValidationError',
      message: 'Failed to validate request data, please check the input.',
      errors: formatZodError(error),
      code: 400,
    }
    return c.json(body, 400)
  }

  // Prisma unique constraint errors
  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
    const body: HttpErrorResponseBody = {
      code: 409,
      name: 'RecordAlreadyExists',
      message: `A record with this ${error.meta?.target} already exists`,
      errors: {
        [error.meta?.target as string]: `A record with this ${error.meta?.target} already exists`,
      },
    }
    return c.json(body, 409)
  }

  // Generic error
  const body: HttpErrorResponseBody = {
    code: 500,
    name: 'InternalServerError',
    message: 'An unexpected error occurred',
  }
  return c.json(body, 500)
}
