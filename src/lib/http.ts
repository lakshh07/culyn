import { NextResponse } from 'next/server'
import { ZodError } from 'zod'
import { HttpException } from '@/exceptions/http-exceptions'
import Stripe from 'stripe'
import { Prisma } from '@/generated/prisma/client'
import type { HttpErrorResponseBody } from '@/types/http'
import { formatZodError } from '@/lib/zod'
import { AuthError, AuthBasicError } from '@/exceptions/auth'

export function errorHandler(error: unknown): {
  body: HttpErrorResponseBody
  status: number
} {
  if (error instanceof Error && process.env.NODE_ENV !== 'production') {
    console.error('An error occurred while processing the request')
    console.error(error)
  }

  if (error instanceof HttpException) {
    return { body: error.serialize(), status: error.code }
  }

  if (error instanceof AuthError) {
    return {
      body: { name: error.name, message: error.message, code: 401 },
      status: 401,
    }
  }

  if (error instanceof ZodError) {
    return {
      body: {
        name: 'RequestValidationError',
        message: 'Failed to validate request data, please check the input.',
        errors: formatZodError(error),
        code: 400,
      },
      status: 400,
    }
  }

  if (error instanceof Stripe.errors.StripeError) {
    return {
      body: {
        name: 'PaymentProcessingError',
        message: 'An error occurred while processing the payment request',
        code: 500,
      },
      status: 500,
    }
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
    return {
      body: {
        code: 409,
        name: 'RecordAlreadyExists',
        message: `A record with this ${error.meta?.target} already exists`,
        errors: {
          [error.meta?.target as string]: `A record with this ${error.meta?.target} already exists`,
        },
      },
      status: 409,
    }
  }

  return {
    body: {
      code: 500,
      name: 'InternalServerError',
      message: 'An unexpected error occurred while processing the request',
    },
    status: 500,
  }
}

export class ErrorResponse extends NextResponse {
  constructor() {
    super()
  }

  public from(error: unknown) {
    console.error('An error occurred while processing the request')
    console.error(error)
    const { body, status } = errorHandler(error)

    const response = new Response(JSON.stringify(body), {
      status,
      headers: { 'Content-Type': 'application/json' },
    })

    if (error instanceof AuthBasicError) {
      response.headers.set('WWW-Authenticate', `Basic realm="Secure Area"`)
    }

    return response
  }
}
