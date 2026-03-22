'use client'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Api } from '@/lib/api'
import type { AdminRecipeItem } from '@/hooks/use-admin-recipes'
import { useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'

const jsonField = z
  .string()
  .optional()
  .refine(val => {
    if (!val?.trim()) return true
    try {
      JSON.parse(val)
      return true
    } catch {
      return false
    }
  }, 'Invalid JSON')

const schema = z.object({
  title: z.string().optional(),
  shortTitle: z.string().optional(),
  description: z.string().optional(),
  tagline: z.string().optional(),
  notes: z.string().optional(),
  cookTime: z.string().optional(),
  servings: z.string().optional(),
  difficulty: z.string().optional(),
  calories: z.string().optional(),
  protein: z.string().optional(),
  carbs: z.string().optional(),
  fat: z.string().optional(),
  isPublic: z.boolean().optional(),
  cookingSteps: jsonField,
  ingredients: jsonField,
})

type FormValues = z.infer<typeof schema>

type FullRecipe = AdminRecipeItem & {
  description?: string | null
  tagline?: string | null
  notes?: string | null
  cookingSteps?: unknown
  ingredients?: unknown
  protein?: number | null
  carbs?: number | null
  fat?: number | null
}

interface RecipeEditModalProps {
  recipe: FullRecipe
  open: boolean
  onClose: () => void
  queryKey: unknown[]
}

export function RecipeEditModal({ recipe, open, onClose, queryKey }: RecipeEditModalProps) {
  const queryClient = useQueryClient()

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
  })

  useEffect(() => {
    if (open) {
      form.reset({
        title: recipe.title ?? '',
        shortTitle: recipe.shortTitle ?? '',
        description: recipe.description ?? '',
        tagline: recipe.tagline ?? '',
        notes: recipe.notes ?? '',
        cookTime: recipe.cookTime != null ? String(recipe.cookTime) : '',
        servings: recipe.servings != null ? String(recipe.servings) : '',
        difficulty: recipe.difficulty ?? '',
        calories: recipe.calories != null ? String(recipe.calories) : '',
        protein: recipe.protein != null ? String(recipe.protein) : '',
        carbs: recipe.carbs != null ? String(recipe.carbs) : '',
        fat: recipe.fat != null ? String(recipe.fat) : '',
        isPublic: recipe.isPublic,
        cookingSteps: recipe.cookingSteps ? JSON.stringify(recipe.cookingSteps, null, 2) : '',
        ingredients: recipe.ingredients ? JSON.stringify(recipe.ingredients, null, 2) : '',
      })
    }
  }, [open, recipe, form])

  const onSubmit = async (values: FormValues) => {
    try {
      const payload: Record<string, unknown> = {}
      if (values.title !== undefined) payload.title = values.title
      if (values.shortTitle !== undefined) payload.shortTitle = values.shortTitle
      if (values.description !== undefined) payload.description = values.description
      if (values.tagline !== undefined) payload.tagline = values.tagline
      if (values.notes !== undefined) payload.notes = values.notes
      if (values.cookTime) payload.cookTime = Number(values.cookTime)
      if (values.servings) payload.servings = Number(values.servings)
      if (values.difficulty) payload.difficulty = values.difficulty
      if (values.calories) payload.calories = Number(values.calories)
      if (values.protein) payload.protein = Number(values.protein)
      if (values.carbs) payload.carbs = Number(values.carbs)
      if (values.fat) payload.fat = Number(values.fat)
      payload.isPublic = values.isPublic
      if (values.cookingSteps?.trim()) payload.cookingSteps = JSON.parse(values.cookingSteps)
      if (values.ingredients?.trim()) payload.ingredients = JSON.parse(values.ingredients)

      await Api.v1.patch(`/admin/recipes/${recipe.slug}`, payload)
      await queryClient.invalidateQueries({ queryKey })
      toast.success('Recipe updated')
      onClose()
    } catch {
      toast.error('Failed to update recipe')
    }
  }

  const { register, handleSubmit, formState } = form

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Recipe</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium">Title</label>
              <Input {...register('title')} placeholder="Title" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium">Short Title</label>
              <Input {...register('shortTitle')} placeholder="Short title" />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium">Description</label>
            <Textarea {...register('description')} placeholder="Description" rows={2} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium">Tagline</label>
              <Input {...register('tagline')} placeholder="#HighProtein, #LowFat" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium">Notes</label>
              <Input {...register('notes')} placeholder="Notes" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium">Cook Time (min)</label>
              <Input type="number" {...register('cookTime')} />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium">Servings</label>
              <Input type="number" {...register('servings')} />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium">Difficulty</label>
              <select
                {...register('difficulty')}
                className="border-input h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm">
                <option value="">—</option>
                <option value="EASY">Easy</option>
                <option value="MEDIUM">Medium</option>
                <option value="HARD">Hard</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-4 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium">Calories</label>
              <Input type="number" {...register('calories')} />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium">Protein (g)</label>
              <Input type="number" step="0.1" {...register('protein')} />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium">Carbs (g)</label>
              <Input type="number" step="0.1" {...register('carbs')} />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium">Fat (g)</label>
              <Input type="number" step="0.1" {...register('fat')} />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="isPublic" {...register('isPublic')} className="size-4" />
            <label htmlFor="isPublic" className="text-sm">
              Public
            </label>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium">Ingredients (JSON)</label>
            <Textarea
              {...register('ingredients')}
              placeholder="[]"
              rows={4}
              className="font-mono text-xs"
            />
            {formState.errors.ingredients && (
              <p className="text-destructive text-xs">{formState.errors.ingredients.message}</p>
            )}
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium">Cooking Steps (JSON)</label>
            <Textarea
              {...register('cookingSteps')}
              placeholder="[]"
              rows={4}
              className="font-mono text-xs"
            />
            {formState.errors.cookingSteps && (
              <p className="text-destructive text-xs">{formState.errors.cookingSteps.message}</p>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={formState.isSubmitting}>
              {formState.isSubmitting ? 'Saving…' : 'Save'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
