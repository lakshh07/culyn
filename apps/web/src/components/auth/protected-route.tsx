'use client'

import { useSession } from '@/hooks/use-session'
import { redirect } from 'next/navigation'
import { useEffect } from 'react'
import { LoadingScreen } from '@/components/ui/loading-screen'

interface ProtectedRouteProps {
  children: React.ReactNode
  redirectTo?: string
}

export function ProtectedRoute({ children, redirectTo = '/' }: ProtectedRouteProps) {
  const { session, isLoading } = useSession()

  useEffect(() => {
    if (!isLoading && !session) {
      redirect(redirectTo)
    }
  }, [session, isLoading, redirectTo])

  if (isLoading) {
    return <LoadingScreen />
  }

  if (!session) {
    return null
  }

  return <>{children}</>
}
