'use client'

import { ProtectedRoute } from '@/components/auth/protected-route'
import { ProtectedNavbar } from '@/components/layout/navbar/protected'

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <ProtectedNavbar />
      {children}
    </ProtectedRoute>
  )
}
