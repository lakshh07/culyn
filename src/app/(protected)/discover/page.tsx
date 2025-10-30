'use client'

import { useState } from 'react'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from '@/components/ui/input-group'
import { PlusIcon } from '@/components/icons'
import { getCurrentDate, getMealTypeByTime } from '@/lib/utils'
import { RecipesSection } from '@/components/sections/recipes'

export default function DiscoverPage() {
  const [recipeInput, setRecipeInput] = useState('')

  const handleCreateRecipe = () => {
    if (!recipeInput.trim()) return

    // TODO: Implement recipe creation logic
    console.log('Creating recipe with input:', recipeInput)
    setRecipeInput('')
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleCreateRecipe()
    }
  }

  return (
    <section className="min-h-screen">
      <div className="max-w-8xl mx-auto px-4 py-16">
        <div className="relative top-28 space-y-16">
          <div className="space-y-2 text-center font-mono text-4xl font-medium text-neutral-950">
            <h1 className="text-neutral-500">
              Welcome back, <span className="text-neutral-950">It&apos;s {getCurrentDate()}.</span>
            </h1>
            <p>
              What are we making for{' '}
              <em className="italic">{getMealTypeByTime({ suffix: '?' })}</em>
            </p>
          </div>

          <div className="mx-auto max-w-6xl">
            <InputGroup className="h-[60px] p-1 [--radius:9999px]">
              <InputGroupAddon>
                <InputGroupButton variant="default" className="size-11">
                  <PlusIcon className="size-5.5" />
                </InputGroupButton>
              </InputGroupAddon>

              <InputGroupInput
                id="input-secure-19"
                className="ml-2 text-base! placeholder:text-neutral-500"
                placeholder="Create or save a recipe using a link, photo, file, or text."
                value={recipeInput}
                onChange={e => setRecipeInput(e.target.value)}
              />

              <InputGroupAddon align="inline-end">
                <InputGroupButton variant={'default'} className="h-11 px-6">
                  Create recipe
                </InputGroupButton>
              </InputGroupAddon>
            </InputGroup>
          </div>

          <RecipesSection className="mt-36" bgColor="" />
        </div>{' '}
      </div>
    </section>
  )
}
