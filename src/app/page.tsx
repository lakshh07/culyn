import { HeroSection } from '@/components/sections/hero'
import { RecipesSection } from '@/components/sections/recipes'
import { Navbar } from '@/components/layout/navbar'

export default function Home() {
  return (
    <>
      <main className="relative h-full w-full p-4">
        <div className="rounded-lg bg-neutral-50/50">
          <Navbar />
          <HeroSection />
          <RecipesSection className="-mt-10" />
        </div>
      </main>
    </>
  )
}
