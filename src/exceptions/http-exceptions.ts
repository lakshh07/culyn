import { HttpStatusCodes } from '@/exceptions/status'
import type { HttpErrorResponseBody } from '@/types/http'

export class HttpException extends Error {
  public code: number

  constructor(
    public readonly status: keyof typeof HttpStatusCodes,
    private readonly options: Partial<Omit<HttpErrorResponseBody, 'code'>> = {}
  ) {
    super(options.message)
    this.name = this.options.name || this.status
    this.code = HttpStatusCodes[this.status]
  }

  public serialize() {
    return {
      code: this.code,
      name: this.name,
      message: this.message,
      errors: this.options.errors,
    }
  }
}
