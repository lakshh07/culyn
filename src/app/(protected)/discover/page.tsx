'use client'

import { RecipesSection } from '@/components/sections/recipes'
import { CreateRecipe } from '@/components/layout/recipe/create-recipe'

export default function DiscoverPage() {
  return (
    <section className="min-h-screen">
      <div className="max-w-8xl mx-auto px-4 py-16">
        <div className="relative top-24 space-y-16">
          <CreateRecipe />

          <RecipesSection className="mt-32" bgColor="bg-secondary" />
        </div>
      </div>
    </section>
  )
}
