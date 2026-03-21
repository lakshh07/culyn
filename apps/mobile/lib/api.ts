import { API_URL } from '@/constants/config'
import { authClient } from '@/lib/auth-client'
import axios, { AxiosError, AxiosInstance, AxiosResponse } from 'axios'

export const API_BASE_URL = API_URL

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
        // Token expired or invalid — Better Auth handles session refresh automatically
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
