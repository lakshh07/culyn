'use client'

import { HeroSection } from '@/components/sections/hero'
import { RecipesSection } from '@/components/sections/recipes'
import { Navbar } from '@/components/layout/navbar'
import { useSession } from '@/hooks/use-session'
import { redirect } from 'next/navigation'
import { useEffect } from 'react'
import { LoadingScreen } from '@/components/ui/loading-screen'

export default function Home() {
  const { session, isLoading } = useSession()

  useEffect(() => {
    if (!isLoading && session) {
      redirect('/discover')
    }
  }, [session, isLoading])

  if (isLoading) {
    return <LoadingScreen />
  }

  return (
    <>
      <main className="relative h-full w-full p-4">
        <div className="rounded-lg bg-[#f1f1eeac]">
          <Navbar />
          <HeroSection />
          <RecipesSection className="-mt-10" bgColor="bg-[#fff]" />
        </div>
      </main>
    </>
  )
}
