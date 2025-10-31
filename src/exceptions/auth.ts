import { HttpException } from '@/exceptions/http-exceptions'

export class AuthError extends HttpException {
  constructor() {
    super('UNAUTHORIZED', {
      name: 'AuthenticationError',
      message: 'You are not authenticated, please login',
    })
  }
}

export class AuthBasicError extends AuthError {
  constructor() {
    super()
    this.name = 'AuthBasicError'
    this.message = 'Invalid credentials'
  }
}
