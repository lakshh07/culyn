'use client'

import { useSession } from '@/hooks/use-session'
import { LoadingScreen } from '@/components/ui/loading-screen'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect } from 'react'

const tabs = [
  { label: 'Recipes', href: '/admin/recipes' },
  { label: 'Places', href: '/admin/places' },
  { label: 'Products', href: '/admin/products' },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { session, isLoading } = useSession()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (!isLoading && (!session || !session.user.isAdmin)) {
      router.replace('/cookbook')
    }
  }, [session, isLoading, router])

  if (isLoading) return <LoadingScreen />
  if (!session || !session.user.isAdmin) return null

  return (
    <div className="bg-background min-h-screen">
      <div className="border-b">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-14 items-center gap-6">
            <span className="text-muted-foreground text-sm font-semibold">Admin</span>
            <nav className="flex gap-1">
              {tabs.map(tab => (
                <Link
                  key={tab.href}
                  href={tab.href}
                  className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                    pathname.startsWith(tab.href)
                      ? 'bg-accent text-accent-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                  }`}>
                  {tab.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </div>
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">{children}</div>
    </div>
  )
}
