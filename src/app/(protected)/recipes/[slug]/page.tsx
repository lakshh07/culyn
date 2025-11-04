'use client'
import { useRecipeBySlug } from '@/hooks/use-recipes'
import React, { useState, useMemo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { InstagramIcon, LinkIcon } from '@/components/icons'
import { CookingStep } from '@/types/recipes'
import { FloatingActionButton } from '@/components/sections/recipes/floating-action-button'
import NumberFlow from '@number-flow/react'
import { DIFFICULTY_MAP, scaleIngredientQuantity } from '@/lib/utils'

export default function RecipePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = React.use(params)
  const { recipe, isLoadingRecipe } = useRecipeBySlug(slug)
  const originalServings = recipe?.servings || 2
  const [servings, setServings] = useState(originalServings)

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
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="text-4xl font-bold">Loading your recipe...</div>
        </div>
      </div>
    )
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
      <div className="grid min-h-screen lg:grid-cols-2">
        <div className="sticky top-0 flex h-screen items-center justify-center bg-[#E8E3DA] p-16">
          <div className="pointer-events-none relative top-6 mx-auto flex items-center justify-center overflow-hidden rounded-full border border-neutral-200 transition-transform duration-300 select-none group-hover:scale-105">
            {recipe.imageUrl ? (
              <Image
                src={recipe.imageUrl}
                alt={recipe.title || 'Recipe image'}
                width={640}
                height={640}
                className="size-[35vw] scale-115 object-cover"
                priority
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center rounded-full bg-neutral-200">
                <span className="text-xl text-neutral-400">No image available</span>
              </div>
            )}
          </div>
        </div>

        <div className="relative mt-6 flex min-h-screen flex-col space-y-4 bg-white px-12 py-16">
          <h1 className="font-mono text-4xl font-medium">{recipe.shortTitle || recipe.title}</h1>

          <div className="flex items-center gap-2 font-mono text-sm text-neutral-600">
            <InstagramIcon className="size-4.5" />
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
            <p className="font-mono text-lg text-neutral-600">{recipe.description}</p>
          )}

          <div className="mt-10 space-y-3">
            <h2 className="font-mono text-2xl font-medium">Details</h2>

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
            <h2 className="font-mono text-2xl font-medium">Ingredients</h2>

            <div className="xs:grid-cols-2 grid grid-cols-3 gap-x-2 gap-y-4 lg:grid-cols-5 xl:grid-cols-7">
              {scaledIngredients.map(ri => (
                <div className="flex flex-col gap-2" key={ri.ingredient.slug}>
                  <div className="relative size-20 overflow-hidden">
                    <Avatar className="size-full rounded-xl object-cover">
                      <AvatarImage src={``} />
                      <AvatarFallback className="size-full rounded-xl object-cover">
                        {ri.ingredient.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <div className="px-1">
                    <p className="font-mono text-sm text-neutral-700 capitalize">
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
            <h2 className="font-mono text-2xl font-medium">Cooking Steps</h2>

            <div className="mt-6">
              {scaledCookingSteps.map(step => (
                <div key={step.step_number} className="border-t border-neutral-200 pb-8">
                  <div className="grid grid-cols-[60px_1fr] gap-10 pt-8 lg:grid-cols-[80px_1fr]">
                    <p className="font-mono leading-10 font-medium text-neutral-400 lg:text-[54px] xl:text-[70px]">
                      {step.step_number.toString().padStart(2, '0')}
                    </p>
                    <div className="flex flex-col space-y-6">
                      <p className="font-mono text-xl font-semibold tracking-wide text-neutral-700">
                        {step.step_description}
                      </p>

                      {step.ingredients_used.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {step.ingredients_used.map(ingredient => (
                            <div
                              key={ingredient.name}
                              className="flex flex-col rounded-lg bg-neutral-100 px-4 py-3.5 font-mono text-sm">
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

      <FloatingActionButton slug={slug} servings={servings} setServings={setServings} />
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
      <p className="text-sm text-neutral-500">{label}</p>
      <p className="flex items-center gap-2 font-medium">
        {value && typeof value === 'number' ? (
          <NumberFlow value={value} className="font-mono text-base" />
        ) : (
          value
        )}
        <span className="text-sm text-neutral-400">{percentage ? `(${percentage}%)` : ''}</span>
      </p>
    </div>
  )
}
