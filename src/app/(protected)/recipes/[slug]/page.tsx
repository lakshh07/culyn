'use client'

import { useRecipeBySlug } from '@/hooks/use-recipes'
import React, { useState, useMemo, useRef, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { InstagramIcon, LinkIcon } from '@/components/icons'
import { CookingStep } from '@/types/recipes'
import { FloatingActionButton } from '@/components/sections/recipes/floating-action-button'
import NumberFlow from '@number-flow/react'
import { DIFFICULTY_MAP, scaleIngredientQuantity } from '@/lib/utils'
import { DetailRecipeSkeleton } from '@/components/sections/recipes/detail-recipe-skeleton'
import VideoPlayer, { VideoPlayerRef } from '@/components/ui/video-player'
import { getIngredientImageUrl } from '@/lib/recipe/ingredient-assets'
import { CreateShoppingList } from '@/components/sections/recipes/create-shopping-list'

export default function RecipePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = React.use(params)
  const { recipe, isLoadingRecipe } = useRecipeBySlug(slug)

  const originalServings = recipe?.servings || 2
  const [servings, setServings] = useState(originalServings)
  const [videoState, setVideoState] = useState({ isPlaying: false, isExpanded: false })
  const videoPlayerRef = useRef<VideoPlayerRef>(null)

  const handleVideoStateChange = useCallback((isPlaying: boolean, isExpanded: boolean) => {
    setVideoState({ isPlaying, isExpanded })
  }, [])

  React.useEffect(() => {
    if (recipe?.servings && servings === originalServings) {
      setServings(recipe.servings)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recipe?.servings])

  const scale = useMemo(() => servings / originalServings, [servings, originalServings])

  const scaledIngredients = useMemo(() => {
    if (!recipe?.RecipeIngredient) return []
    return recipe.RecipeIngredient.map(ri => ({
      ...ri,
      scaledAmount: scaleIngredientQuantity(ri.amount, scale),
    }))
  }, [recipe?.RecipeIngredient, scale])

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

  const nutritionalData = useMemo(
    () => ({
      caloriesPercent: recipe?.calories ? Math.round((Number(recipe.calories) / 2000) * 100) : 0,
      proteinPercent: recipe?.protein ? Math.round((Number(recipe.protein) / 50) * 100) : 0,
      carbsPercent: recipe?.carbs ? Math.round((Number(recipe.carbs) / 275) * 100) : 0,
      fatPercent: recipe?.fat ? Math.round((Number(recipe.fat) / 75) * 100) : 0,
    }),
    [recipe?.calories, recipe?.protein, recipe?.carbs, recipe?.fat]
  )

  if (isLoadingRecipe) {
    return <DetailRecipeSkeleton />
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

  return (
    <>
      <div className="grid min-h-screen grid-cols-1 sm:grid-cols-2">
        <div className="relative top-0 flex h-[280px] items-center justify-center overflow-hidden p-12 shadow-inner sm:sticky sm:h-screen sm:bg-[#E8E3DA] lg:p-16">
          <div className="pointer-events-none relative mx-auto hidden items-center justify-center overflow-hidden rounded-full shadow-xl transition-transform duration-300 select-none group-hover:scale-105 sm:flex">
            {recipe.imageUrl ? (
              <Image
                src={recipe.imageUrl}
                alt={recipe.title || 'Recipe image'}
                width={640}
                height={640}
                className="size-[36vw] scale-120 object-cover lg:size-[35vw]"
                priority
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center rounded-full bg-neutral-200">
                <span className="text-xl text-neutral-400">No image available</span>
              </div>
            )}
          </div>

          <div className="absolute -right-5 bottom-0 flex size-[40vh] items-center justify-center overflow-hidden rounded-full sm:hidden">
            {recipe.imageUrl && (
              <Image
                src={recipe.imageUrl}
                alt={recipe.title || 'Recipe image'}
                width={640}
                height={640}
                className="scale-120 object-cover"
                priority
              />
            )}
          </div>
        </div>

        <div className="relative flex min-h-screen flex-col space-y-4 bg-white px-4 py-12 sm:mt-6 sm:px-6 sm:py-16 lg:px-10 xl:px-12">
          <h1 className="font-mono text-3xl font-medium lg:text-4xl">
            {recipe.shortTitle || recipe.title}
          </h1>

          <div className="flex items-center gap-2 font-mono text-xs text-neutral-600 lg:text-sm">
            <InstagramIcon className="size-4 lg:size-4.5" />
            <span className="text-neutral-600">
              By{' '}
              {recipe.sourceName && (
                <Link
                  href={`https://www.instagram.com/${recipe.sourceName}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline transition-colors hover:text-neutral-900">
                  {recipe.sourceName}
                </Link>
              )}
            </span>
            {recipe.sourceUrl && (
              <>
                <span className="text-neutral-400">•</span>
                <Link
                  href={recipe.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline transition-colors hover:text-neutral-900">
                  Original Recipe Link
                </Link>
              </>
            )}
          </div>

          {recipe.description && (
            <p className="font-mono text-sm tracking-wide text-neutral-600 sm:tracking-normal lg:text-base xl:text-lg">
              {recipe.description}
            </p>
          )}

          <div className="mt-8 space-y-3 xl:mt-10">
            <h2 className="font-mono text-xl font-medium lg:text-2xl">Details</h2>

            <div className="flex flex-col space-y-2">
              <div className="grid grid-cols-2 gap-0 xl:grid-cols-4">
                {[
                  {
                    label: 'Skill Level',
                    value: recipe.difficulty ? DIFFICULTY_MAP[recipe.difficulty] : 'Easy',
                  },
                  {
                    label: 'Cook Time',
                    value: recipe.cookTime ? `${recipe.cookTime} mins` : 'N/A',
                  },
                  { label: 'Servings', value: servings },
                  {
                    label: 'Serving Size',
                    value: recipe.servings ? `${Math.ceil(2)} cups` : 'N/A',
                  },
                  {
                    label: 'Est. Calories',
                    value: recipe.calories ? `${recipe.calories} kcal` : 'N/A',
                    percentage: nutritionalData.caloriesPercent,
                  },
                  {
                    label: 'Carbs',
                    value: recipe.carbs ? `${Number(recipe.carbs).toFixed(1)} g` : 'N/A',
                    percentage: nutritionalData.carbsPercent,
                  },
                  {
                    label: 'Protein',
                    value: recipe.protein ? `${Number(recipe.protein).toFixed(0)} g` : 'N/A',
                    percentage: nutritionalData.proteinPercent,
                  },
                  {
                    label: 'Fats',
                    value: recipe.fat ? `${Number(recipe.fat).toFixed(1)} g` : 'N/A',
                    percentage: nutritionalData.fatPercent,
                  },
                ].map(detail => (
                  <DetailBox
                    key={detail.label}
                    label={detail.label}
                    value={detail.value}
                    percentage={detail.percentage}
                  />
                ))}
              </div>
              <p className="flex items-center gap-1 ps-1 font-mono text-xs text-neutral-400">
                *Percent daily values are based on a 2,000 calorie diet as per FSSAI guidelines.
                <Link
                  href={'https://fssai.gov.in/cms/Amendment-FSS-Labelling-Display.php'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex size-4 cursor-pointer items-center justify-center rounded-full bg-neutral-100">
                  <LinkIcon className="size-2.5 text-neutral-500" />
                </Link>
              </p>
            </div>
          </div>

          <div className="mt-10 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-mono text-xl font-medium lg:text-2xl">Ingredients</h2>

              <CreateShoppingList
                scaledIngredients={scaledIngredients}
                recipeId={recipe.id}
                recipeSlug={slug}
              />
            </div>

            <div className="xs:grid-cols-2 grid grid-cols-4 gap-x-2 gap-y-4 lg:grid-cols-5 xl:grid-cols-7">
              {scaledIngredients.map(ri => (
                <div className="flex flex-col gap-2" key={ri.ingredient.slug}>
                  <div className="relative size-20 overflow-hidden sm:size-18 lg:size-20">
                    <Avatar className="size-full rounded-xl object-cover">
                      <AvatarImage src={getIngredientImageUrl(ri.ingredient.name)} />
                      <AvatarFallback className="size-full rounded-xl object-cover">
                        {ri.ingredient.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <div className="px-1">
                    <p className="font-mono text-xs text-neutral-700 capitalize lg:text-sm">
                      {ri.ingredient.name}
                    </p>
                    <div className="font-mono text-xs text-neutral-400">
                      {ri.scaledAmount && (
                        <NumberFlow value={Number(ri.scaledAmount)} className="font-mono text-xs" />
                      )}
                      <span className="ps-0.5 text-neutral-400">{ri.unit}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-10 space-y-3">
            <h2 className="font-mono text-xl font-medium lg:text-2xl">Cooking Steps</h2>

            <div className="mt-4 lg:mt-6">
              {scaledCookingSteps.map(step => (
                <div key={step.step_number} className="border-t border-neutral-200 pb-8">
                  <div className="grid grid-cols-[60px_1fr] gap-4 pt-6 lg:grid-cols-[80px_1fr] lg:pt-8 xl:gap-10">
                    <p className="font-mono text-[50px] leading-10 font-medium text-neutral-400 sm:text-[55px] lg:text-[65px] xl:text-[70px]">
                      {step.step_number.toString().padStart(2, '0')}
                    </p>
                    <div className="flex flex-col space-y-6">
                      <p className="font-mono text-lg font-semibold tracking-wider text-neutral-700 lg:text-xl">
                        {step.step_description}
                      </p>

                      {step.ingredients_used.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {step.ingredients_used.map(ingredient => (
                            <div
                              key={ingredient.name}
                              className="flex flex-col rounded-lg bg-neutral-100 px-4 py-3.5 font-mono text-xs lg:text-sm">
                              <p className="font-semibold text-neutral-600">{ingredient.name}</p>
                              <p className="font-medium text-neutral-500">
                                {ingredient.scaledQuantity}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <FloatingActionButton
        slug={slug}
        servings={servings}
        setServings={setServings}
        recipeCookbookIds={recipe.RecipeFavorite.map(rf => rf.id)}
        videoPlayerRef={videoPlayerRef}
        videoState={videoState}
        hasVideo={!!recipe.sourceVideoUrl && !!recipe.sourceThumbnailUrl}
      />

      {recipe.sourceVideoUrl && recipe.sourceThumbnailUrl && (
        <VideoPlayer
          ref={videoPlayerRef}
          videoUrl={recipe.sourceVideoUrl}
          thumbnailUrl={recipe.sourceThumbnailUrl}
          onStateChange={handleVideoStateChange}
        />
      )}
    </>
  )
}

const DetailBox = ({
  label,
  value,
  percentage,
}: {
  label: string
  value: string | number
  percentage?: number
}) => {
  return (
    <div className="-mr-px -mb-px space-y-0.5 border border-neutral-200 p-4 font-mono">
      <p className="text-xs text-neutral-500 lg:text-sm">{label}</p>
      <p className="flex items-center gap-2 text-sm font-medium lg:text-base">
        {value && typeof value === 'number' ? (
          <NumberFlow value={value} className="font-mono text-sm lg:text-base" />
        ) : (
          value
        )}
        <span className="text-xs text-neutral-400 lg:text-sm">
          {percentage ? `(${percentage}%)` : ''}
        </span>
      </p>
    </div>
  )
}
