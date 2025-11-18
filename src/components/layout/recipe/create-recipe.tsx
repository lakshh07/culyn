'use client'

import { LoadingIcon } from '@/components/icons'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from '@/components/ui/input-group'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { RecipeSourceType } from '@/generated/prisma/enums'
import { Api } from '@/lib/api'
import { ClientErrorHandler } from '@/lib/errors'
import { getCurrentDate, getMealTypeByTime } from '@/lib/utils'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import React, { useState } from 'react'
import { toast } from 'sonner'
import { Highlighter } from '@/components/ui/highlighter'

export const CreateRecipe = () => {
  const [recipeInput, setRecipeInput] = useState('')
  const [recipeSource, setRecipeSource] = useState<RecipeSourceType>(
    RecipeSourceType.INSTAGRAM_REEL
  )

  const queryClient = useQueryClient()
  const router = useRouter()

  const handleCreateRecipe = () => {
    if (!recipeInput.trim()) return
    createRecipe()
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleCreateRecipe()
    }
  }

  const { mutate: createRecipe, isPending: isCreatingRecipe } = useMutation({
    mutationFn: async () => {
      const response = await Api.v1.post('/recipes/generate', {
        url: recipeInput,
        sourceType: recipeSource,
      })
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['v1', 'cookbook'] })
      setRecipeInput('')
      setRecipeSource(RecipeSourceType.INSTAGRAM_REEL)
      toast.success('Recipe created successfully', {
        description: 'The recipe will be available in your recipes section shortly.',
      })
      router.push('/cookbook')
    },
    onError: error => new ClientErrorHandler().toast().handle(error),
  })

  return (
    <div className="space-y-16">
      <div className="space-y-2 text-center font-mono text-3xl font-bold text-neutral-950">
        <h1 className="text-neutral-500">
          Welcome back, <span className="text-neutral-950">It&apos;s {getCurrentDate()}.</span>
        </h1>
        <p>
          What are we making for{' '}
          <Highlighter action="underline" color="#FF9800" isView>
            <em className="italic">{getMealTypeByTime({ suffix: '?' })}</em>
          </Highlighter>
        </p>
      </div>
      <div className="mx-auto max-w-5xl">
        <InputGroup className="h-[54px] [--radius:9999px]">
          <InputGroupAddon>
            <Select
              value={recipeSource}
              defaultValue={RecipeSourceType.INSTAGRAM_REEL}
              onValueChange={value => setRecipeSource(value as RecipeSourceType)}>
              <SelectTrigger className="bg-secondary text-secondary-foreground hover:bg-secondary/80 h-11! w-full border-none">
                <SelectValue placeholder="Select a recipe source" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Recipe sources</SelectLabel>
                  <SelectItem value={RecipeSourceType.INSTAGRAM_REEL}>Instagram reel</SelectItem>
                  <SelectItem value={RecipeSourceType.INSTAGRAM_POST} disabled>
                    Instagram post
                  </SelectItem>
                  <SelectItem value={RecipeSourceType.INSTAGRAM_VIDEO} disabled>
                    Instagram video
                  </SelectItem>
                  <SelectItem value={RecipeSourceType.TIKTOK} disabled>
                    TikTok
                  </SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </InputGroupAddon>

          <InputGroupInput
            id="input-secure-19"
            className="ml-2 text-base! placeholder:text-neutral-500"
            placeholder="Paste an recipe source link to create a recipe"
            value={recipeInput}
            onChange={e => setRecipeInput(e.target.value)}
            onKeyDown={e => handleKeyPress(e)}
          />

          <InputGroupAddon align="inline-end">
            <InputGroupButton
              variant={'default'}
              className="h-11 w-40 px-6"
              onClick={() => createRecipe()}
              disabled={isCreatingRecipe || !recipeInput.trim()}>
              {isCreatingRecipe ? <LoadingIcon className="animate-spin" /> : 'Create recipe'}
            </InputGroupButton>
          </InputGroupAddon>
        </InputGroup>
      </div>
    </div>
  )
}
