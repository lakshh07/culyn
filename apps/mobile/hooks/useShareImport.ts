import { apiClient } from '@/lib/api'
import {
  notifyProcessingComplete,
  notifyProcessingFailed,
  notifyProcessingStarted,
  notifyUpgradeRequired,
  requestNotificationPermissions,
} from '@/lib/notifications'
import { ImportContentResponse } from '@culyn/shared/schemas'
import { isAxiosError } from 'axios'
import { useRouter } from 'expo-router'
import { useCallback, useEffect, useRef, useState } from 'react'
import { AppState } from 'react-native'

import { useJobPolling } from './useJobPolling'

export function useShareImport() {
  const router = useRouter()
  const [pendingUrl, setPendingUrl] = useState<string | null>(null)
  const [jobId, setJobId] = useState<string | undefined>(undefined)
  const isProcessing = useRef(false)

  const { status, result, error, reset: resetPolling } = useJobPolling(jobId)

  const handleShareUrl = useCallback(async (url: string) => {
    if (isProcessing.current) return
    isProcessing.current = true

    try {
      await requestNotificationPermissions()
      await notifyProcessingStarted(url)

      const response = await apiClient().post<ImportContentResponse>('/content/import', { url })

      setJobId(response.data.jobId)
    } catch (err) {
      console.error('[ShareImport] Failed to start import:', err)
      const isLimitError = isAxiosError(err) && (err as any).response?.status === 403
      if (isLimitError) {
        await notifyUpgradeRequired()
      } else {
        await notifyProcessingFailed()
      }
      isProcessing.current = false
    }
  }, [])

  // Process pending URL
  useEffect(() => {
    if (pendingUrl) {
      handleShareUrl(pendingUrl)
      setPendingUrl(null)
    }
  }, [pendingUrl, handleShareUrl])

  // Handle job completion
  useEffect(() => {
    if (status === 'COMPLETED' && result) {
      const category = result.category.toLowerCase()
      const slug = result.slug

      notifyProcessingComplete(category, slug, slug)

      // Navigate if app is in the foreground
      if (AppState.currentState === 'active') {
        const routes: Record<string, string> = {
          recipe: `/recipes/${slug}`,
          place: `/places/${slug}`,
          product: `/products/${slug}`,
        }
        const route = routes[category]
        if (route) {
          router.push(route as any)
        }
      }

      // Reset state
      setJobId(undefined)
      resetPolling()
      isProcessing.current = false
    }
  }, [status, result, router, resetPolling])

  // Handle job failure
  useEffect(() => {
    if (status === 'FAILED' || status === 'CANCELLED') {
      notifyProcessingFailed()
      setJobId(undefined)
      resetPolling()
      isProcessing.current = false
    }
  }, [status, error, resetPolling])

  return {
    triggerImport: setPendingUrl,
    isProcessing: isProcessing.current,
  }
}
