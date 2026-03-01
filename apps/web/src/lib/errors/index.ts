import { appConfig as app } from '@/configs/app'
import type { HttpErrorResponseBody } from '@culyn/shared/types'
import { AxiosError } from 'axios'
import { toast, type ExternalToast } from 'sonner'

export class ClientErrorHandler {
  private name = 'ApplicationClientError'
  private should_toast: boolean = true
  private toast_options: ExternalToast = { duration: 5000 }

  public handle(error: Error) {
    if (!app.isInProduction) {
      console.error('Client Error:', error)
    }

    if (error instanceof AxiosError) {
      const e = error as AxiosError<HttpErrorResponseBody>
      this.name = e.response?.data.name || 'Error'
      this.toast_options = {
        ...this.toast_options,
        description: e.response?.data.message || 'An unexpected error occurred.',
      }
    }

    this.showToast()
  }

  public toast(options?: Omit<ExternalToast, 'description'>): ClientErrorHandler {
    this.should_toast = true
    if (options) this.toast_options = { ...this.toast_options, ...options }
    return this
  }

  private showToast() {
    if (!this.should_toast) return
    toast.error(this.name, this.toast_options)
  }
}
