'use client'

import { CookPageSkeleton } from '@/components/sections/recipes/cook-page-skeleton'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { useRecipeBySlug } from '@/hooks/use-recipes'
import { getIngredientImageUrl } from '@/lib/recipe/ingredient-assets'
import { scaleIngredientQuantity } from '@/lib/utils'
import { CookingStep } from '@culyn/shared/schemas'
import { AnimatePresence, motion } from 'motion/react'
import Image from 'next/image'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import React, { useMemo, useState } from 'react'
import { useMediaQuery } from 'usehooks-ts'

export default function RecipeCookingPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = React.use(params)
  const { recipe, isLoadingRecipe } = useRecipeBySlug(slug)
  const [currentStep, setCurrentStep] = useState(0)
  const searchParams = useSearchParams()
  const servingsParam = searchParams.get('servings')
  const originalServings = recipe?.servings || 2
  const [servings, setServings] = useState(servingsParam ? Number(servingsParam) : originalServings)
  const isDesktop = useMediaQuery('(min-width: 1024px)')

  React.useEffect(() => {
    if (recipe?.servings && servings === originalServings) {
      setServings(recipe.servings)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recipe?.servings])

  const scale = useMemo(() => servings / originalServings, [servings, originalServings])

  const scaledCookingSteps = useMemo(() => {
    if (!recipe?.cookingSteps) return []
    return (recipe.cookingSteps as CookingStep[]).map(step => ({
      ...step,
      ingredients_used: step.ingredients_used.map(ingredient => ({
        ...ingredient,
        scaledQuantity: scaleIngredientQuantity(ingredient.quantity, scale),
      })),
    }))
  }, [recipe?.cookingSteps, scale])

  const currentStepData = scaledCookingSteps[currentStep]
  const isLastStep = currentStep === scaledCookingSteps.length - 1

  if (isLoadingRecipe) {
    return <CookPageSkeleton isDesktop={isDesktop} />
  }

  if (!recipe) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="text-4xl font-bold">Recipe not found</div>
        </div>
      </div>
    )
  }

  if (scaledCookingSteps.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="text-4xl font-bold">No cooking steps available</div>
          <Link href={`/recipes/${slug}`}>
            <Button variant="outline" className="mt-4">
              Back to recipe
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  const handleNextStep = () => {
    if (!isLastStep) {
      setCurrentStep(prev => prev + 1)
    }
  }

  const handlePrevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1)
    }
  }

  if (!isDesktop) {
    return (
      <div className="relative top-18 lg:hidden">
        {/* Background Image - positioned behind all content */}
        <div className="absolute -top-22 -right-5 -z-10 flex size-[40vh] items-center justify-center overflow-hidden rounded-full bg-white">
          {recipe.imageUrl && (
            <Image
              src={recipe.imageUrl}
              alt={recipe.title || 'Recipe image'}
              width={640}
              height={640}
              className="scale-120 bg-white object-cover"
              priority
            />
          )}
        </div>

        {/* White overlay for better text readability */}
        <div className="absolute inset-0 -top-18 -z-5 bg-white/70" />

        {/* Content on top of image */}
        <div className="relative px-4 pt-6 pb-24">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{
                duration: 0.5,
                ease: [0.4, 0.0, 0.2, 1],
              }}
              className="mb-8">
              <motion.h1
                className="mb-2 font-mono text-lg font-light text-neutral-600"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.3 }}>
                Step {currentStepData?.step_number.toString().padStart(2, '0')}:
              </motion.h1>
              <motion.p
                className="font-mono text-xl leading-normal font-semibold text-neutral-800"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.3 }}>
                {currentStepData?.step_description}
              </motion.p>
            </motion.div>
          </AnimatePresence>

          {/* What You'll Need */}
          <AnimatePresence mode="wait">
            <motion.div
              key={`tools-${currentStep}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{
                duration: 0.5,
                delay: 0.15,
                ease: [0.4, 0.0, 0.2, 1],
              }}
              className="mb-8 space-y-4">
              <h2 className="font-mono text-lg font-semibold text-neutral-800">
                What You&apos;ll Need
              </h2>

              {currentStepData?.tools_required && currentStepData.tools_required.length > 0 && (
                <div className="border-t border-neutral-200">
                  {currentStepData.tools_required.map((tool, index) => (
                    <motion.div
                      key={`tool-${index}`}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{
                        delay: 0.3 + index * 0.05,
                        duration: 0.4,
                        ease: [0.4, 0.0, 0.2, 1],
                      }}
                      className="border-b border-neutral-200 py-3 ps-2 font-mono text-sm font-medium text-neutral-600 capitalize">
                      {tool}
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Ingredients */}
          <AnimatePresence mode="wait">
            {currentStepData?.ingredients_used && currentStepData.ingredients_used.length > 0 && (
              <motion.div
                key={`ingredients-${currentStep}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{
                  duration: 0.5,
                  delay: 0.3,
                  ease: [0.4, 0.0, 0.2, 1],
                }}
                className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="font-mono text-lg font-semibold text-neutral-800">Ingredients</h2>
                  <p className="font-mono text-sm text-neutral-600">
                    {currentStepData.ingredients_used.length} items
                  </p>
                </div>

                <div className="flex flex-col gap-3">
                  {currentStepData.ingredients_used.map((ingredient, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{
                        delay: 0.3 + index * 0.05,
                        duration: 0.2,
                        ease: [0.4, 0.0, 0.2, 1],
                      }}
                      className="rounded-lg border border-neutral-200 bg-white/80 px-4 py-3 font-mono backdrop-blur-sm">
                      <div className="flex items-center gap-4">
                        <div className="relative size-14 overflow-hidden">
                          <Avatar className="size-full rounded-xl object-cover">
                            <AvatarImage src={getIngredientImageUrl(ingredient.name)} />
                            <AvatarFallback className="size-full rounded-xl object-cover">
                              {ingredient.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                        </div>

                        <div className="flex flex-col gap-1">
                          <p className="text-sm font-medium text-neutral-700">{ingredient.name}</p>
                          <p className="text-sm text-neutral-600">{ingredient.scaledQuantity}</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Fixed Bottom Navigation */}
        <div className="fixed right-0 bottom-0 left-0 z-50 border-t border-neutral-200 bg-white/95 p-4 backdrop-blur-md">
          <div className="flex items-center justify-between gap-3">
            <AnimatePresence>
              {currentStep === 0 ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.2 }}
                  className="flex-1">
                  <Link href={`/recipes/${slug}`} className="block">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full border-neutral-300 bg-white/80 backdrop-blur-sm">
                      Back to recipe
                    </Button>
                  </Link>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.2 }}
                  className="flex-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePrevStep}
                    className="w-full border-neutral-300 bg-white/80 backdrop-blur-sm">
                    Previous
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>

            {currentStep > 0 && (
              <Link href={`/recipes/${slug}`}>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-neutral-300 bg-white/80 backdrop-blur-sm">
                  Close
                </Button>
              </Link>
            )}

            <motion.div
              whileTap={{ scale: 0.95 }}
              transition={{ duration: 0.1 }}
              className="flex-1">
              <Button
                size="sm"
                onClick={handleNextStep}
                disabled={isLastStep}
                className="w-full bg-neutral-800 text-white hover:bg-neutral-700 disabled:cursor-not-allowed disabled:opacity-50">
                {isLastStep ? 'Complete!' : 'Next'}
              </Button>
            </motion.div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative grid min-h-screen sm:grid-cols-[1fr_42%]">
      <div className="sticky top-0 flex h-screen overflow-hidden">
        <div className="relative flex h-full w-full flex-col justify-between bg-white/85 p-8 xl:p-16">
          <div className="flex max-w-4xl flex-1 flex-col justify-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{
                  duration: 0.5,
                  ease: [0.4, 0.0, 0.2, 1],
                }}
                className="mb-8">
                <motion.h1
                  className="font-mono text-xl font-light text-neutral-600 lg:mb-2 lg:text-2xl xl:mb-4 xl:text-3xl"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1, duration: 0.3 }}>
                  Step {currentStepData?.step_number.toString().padStart(2, '0')}:
                </motion.h1>
                <motion.p
                  className="font-mono text-xl leading-normal font-semibold text-neutral-800 lg:text-2xl xl:text-4xl"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.3 }}>
                  {currentStepData?.step_description}
                </motion.p>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="flex items-center justify-between">
            <AnimatePresence>
              {currentStep === 0 ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.2 }}>
                  <Link href={`/recipes/${slug}`}>
                    <Button
                      variant="outline"
                      size={'sm'}
                      className="border-neutral-300 bg-white/80 backdrop-blur-sm">
                      Back to recipe
                    </Button>
                  </Link>
                </motion.div>
              ) : (
                <div className="flex items-center gap-2">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.2 }}>
                    <Button
                      variant="outline"
                      size={'sm'}
                      onClick={handlePrevStep}
                      className="border-neutral-300 bg-white/80 backdrop-blur-sm">
                      Previous step
                    </Button>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.2 }}>
                    <Link href={`/recipes/${slug}`}>
                      <Button
                        variant="outline"
                        size={'sm'}
                        className="border-neutral-300 bg-white/80 backdrop-blur-sm">
                        Close
                      </Button>
                    </Link>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>

            <div className="flex gap-3">
              <motion.div whileTap={{ scale: 0.95 }} transition={{ duration: 0.1 }}>
                <Button
                  size={'sm'}
                  onClick={handleNextStep}
                  disabled={isLastStep}
                  className="bg-neutral-800 text-white hover:bg-neutral-700 disabled:cursor-not-allowed disabled:opacity-50">
                  {isLastStep ? 'Complete!' : 'Next step'}
                </Button>
              </motion.div>
            </div>
          </div>

          <div className="absolute right-0 -bottom-[10%] -left-[8%] -z-1 overflow-hidden rounded-full">
            <div className="pointer-events-none flex size-[45vw] items-center justify-center overflow-hidden rounded-full border border-neutral-200 transition-transform duration-300 select-none group-hover:scale-105">
              {recipe.imageUrl ? (
                <Image
                  src={recipe.imageUrl}
                  alt={recipe.title || 'Recipe image'}
                  width={640}
                  height={640}
                  className="scale-120 object-cover"
                  priority
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center rounded-full bg-neutral-200">
                  <span className="text-xl text-neutral-400">No image available</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="relative mt-10 lg:top-10 lg:p-8 xl:top-0 xl:p-16">
        <div className="sticky top-8 space-y-20">
          <AnimatePresence mode="wait">
            <motion.div
              key={`tools-${currentStep}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{
                duration: 0.5,
                delay: 0.15,
                ease: [0.4, 0.0, 0.2, 1],
              }}
              className="space-y-6">
              <h1 className="font-mono font-semibold text-neutral-800 lg:text-xl xl:text-2xl">
                What You&apos;ll Need
              </h1>

              {currentStepData?.tools_required && currentStepData.tools_required.length > 0 && (
                <div className="border-t border-neutral-200">
                  {currentStepData.tools_required.map((tool, index) => (
                    <motion.div
                      key={`tool-${index}`}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{
                        delay: 0.3 + index * 0.05,
                        duration: 0.4,
                        ease: [0.4, 0.0, 0.2, 1],
                      }}
                      className="border-b border-neutral-200 py-4 ps-2 font-mono font-medium text-neutral-600 capitalize lg:text-base xl:text-lg">
                      {tool}
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          <AnimatePresence mode="wait">
            {currentStepData?.ingredients_used && currentStepData.ingredients_used.length > 0 && (
              <motion.div
                key={`ingredients-${currentStep}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{
                  duration: 0.5,
                  delay: 0.3,
                  ease: [0.4, 0.0, 0.2, 1],
                }}
                className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="font-mono font-semibold text-neutral-800 lg:text-xl xl:text-2xl">
                    Ingredients
                  </h2>
                  <p className="font-mono text-neutral-600 lg:text-sm xl:text-base">
                    {currentStepData.ingredients_used.length} items
                  </p>
                </div>

                <div className="flex flex-col gap-3">
                  {currentStepData.ingredients_used.map((ingredient, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{
                        delay: 0.3 + index * 0.05,
                        duration: 0.2,
                        ease: [0.4, 0.0, 0.2, 1],
                      }}
                      className="rounded-lg border border-neutral-200 bg-white/80 px-4 py-3 font-mono backdrop-blur-sm">
                      <div className="flex items-center gap-4">
                        <div className="relative size-16 overflow-hidden">
                          <Avatar className="size-full rounded-xl object-cover">
                            <AvatarImage src={getIngredientImageUrl(ingredient.name)} />
                            <AvatarFallback className="size-full rounded-xl object-cover">
                              {ingredient.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                        </div>

                        <div className="flex flex-col gap-1">
                          <p className="font-medium text-neutral-700 lg:text-base xl:text-lg">
                            {ingredient.name}
                          </p>
                          <p className="text-base text-neutral-600 lg:text-sm xl:text-base">
                            {ingredient.scaledQuantity}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
