'use client'

import { authClient } from '@/lib/auth-client'
import { useEffect, useState } from 'react'

export type Session = {
  user: {
    id: string
    email: string
    name?: string | null
    image?: string | null
    isAdmin?: boolean
  }
  session: {
    id: string
    expiresAt: Date
  }
} | null

export function useSession() {
  const [session, setSession] = useState<Session>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchSession = async () => {
      try {
        setIsLoading(true)
        const { data } = await authClient.getSession()
        setSession(data as Session)
      } catch (error) {
        console.error('Failed to fetch session:', error)
        setSession(null)
      } finally {
        setIsLoading(false)
      }
    }

    fetchSession()
  }, [])

  return { session, isLoading }
}
