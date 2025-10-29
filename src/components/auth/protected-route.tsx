'use client'

import { useSession } from '@/hooks/use-session'
import { redirect } from 'next/navigation'
import { useEffect } from 'react'
import { Spinner } from '@/components/ui/spinner'

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
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    )
  }

  if (!session) {
    return null
  }

  return <>{children}</>
}
