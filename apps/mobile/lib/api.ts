import { authClient } from '@/lib/auth-client'
import axios, { AxiosError, AxiosInstance, AxiosResponse } from 'axios'
import Constants from 'expo-constants'

const getApiUrl = () => {
  if (__DEV__) {
    return process.env.EXPO_PUBLIC_CULYN_API_URL
  }
  return Constants.expoConfig?.extra?.apiUrl || 'https://your-api-domain.com'
}

export const API_BASE_URL = getApiUrl()

// Create a singleton instance map to reuse axios instances
const axiosInstances = new Map<string, AxiosInstance>()

export const apiClient = (version: 'v1' = 'v1'): AxiosInstance => {
  // Return existing instance if available
  if (axiosInstances.has(version)) {
    return axiosInstances.get(version)!
  }

  // Create new instance
  const instance = axios.create({
    baseURL: `${API_BASE_URL}/${version}`,
    timeout: 10000,
    headers: {
      'Content-Type': 'application/json',
    },
  })

  // Add request interceptor to inject auth cookies
  instance.interceptors.request.use(
    config => {
      const cookies = authClient.getCookie()
      if (__DEV__) {
        console.log('[API] Request URL:', config.url)
        console.log('[API] Cookies:', cookies ? 'Present' : 'Missing')
      }
      if (cookies) {
        config.headers.Cookie = cookies
      }
      return config
    },
    error => {
      return Promise.reject(error)
    }
  )

  // Response interceptor for error handling
  instance.interceptors.response.use(
    (response: AxiosResponse) => response,
    (error: AxiosError) => {
      if (error.response?.status === 401) {
        if (__DEV__) {
          console.error('[API] 401 Unauthorized:', {
            url: error.config?.url,
            message: error.response?.data,
          })
        }
        // Token expired or invalid, trigger re-authentication
        // Better Auth will handle session refresh automatically
      }
      return Promise.reject(error)
    }
  )

  // Store instance for reuse
  axiosInstances.set(version, instance)

  return instance
}

// API response types
export interface ApiResponse<T = any> {
  data: T
  message?: string
  success: boolean
}

export interface ApiError {
  message: string
  code: number
  errors?: Record<string, unknown>
}
