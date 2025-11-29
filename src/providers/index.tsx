'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { NuqsAdapter } from 'nuqs/adapters/next/app'
import { ThemeProvider } from 'next-themes'
import { Toaster } from '@/components/ui/sonner'
import React from 'react'

export const Providers = ({ children }: { children: React.ReactNode }) => {
  const [queryClient] = React.useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
          },
        },
      })
  )

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider
        attribute="class"
        defaultTheme="light"
        enableSystem={false}
        disableTransitionOnChange>
        <NuqsAdapter>{children}</NuqsAdapter>
        <Toaster position="top-center" />
      </ThemeProvider>
    </QueryClientProvider>
  )
}
