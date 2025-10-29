'use client'

import { authClient } from '@/lib/auth-client'
import { useEffect, useState, useTransition } from 'react'

export type Session = {
  user: {
    id: string
    email: string
    name?: string | null
    image?: string | null
  }
  session: {
    id: string
    expiresAt: Date
  }
} | null

export function useSession() {
  const [session, setSession] = useState<Session>(null)
  const [isLoading, startLoading] = useTransition()

  useEffect(() => {
    const fetchSession = async () => {
      try {
        startLoading(async () => {
          const { data } = await authClient.getSession()
          setSession(data as Session)
        })
      } catch (error) {
        console.error('Failed to fetch session:', error)
        setSession(null)
      }
    }

    fetchSession()
  }, [])

  return { session, isLoading }
}
