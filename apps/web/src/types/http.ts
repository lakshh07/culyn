export type HttpErrorResponseBody = {
  name: string
  message: string
  code: number
  errors?: Record<string, unknown> | undefined
}
