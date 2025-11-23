'use client'

import { LoadingIcon } from '@/components/icons'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  InputGroupTextarea,
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
      <div className="space-y-2 font-mono text-sm font-bold text-neutral-950 sm:space-y-1 sm:text-center sm:text-xl lg:space-y-1.5 lg:text-2xl xl:space-y-2 xl:text-3xl">
        <div className="flex flex-col items-start justify-center sm:flex-row sm:items-center sm:gap-1.5 lg:gap-2">
          <h1 className="text-neutral-500">Welcome back,</h1>
          <h1 className="text-neutral-950">It&apos;s {getCurrentDate()}.</h1>
        </div>
        <p>
          What are we making for{' '}
          <Highlighter action="underline" color="#FF9800" isView>
            <em className="italic">{getMealTypeByTime({ suffix: '?' })}</em>
          </Highlighter>
        </p>
      </div>
      <div className="mx-auto sm:max-w-2xl lg:max-w-3xl xl:max-w-5xl">
        <InputGroup className="flex flex-col sm:h-[44px] sm:flex-row sm:[--radius:9999px] lg:h-[49px] xl:h-[54px]">
          <InputGroupAddon className="hidden sm:block">
            <SourceSelect recipeSource={recipeSource} setRecipeSource={setRecipeSource} />
          </InputGroupAddon>

          <InputGroupInput
            id="input-secure-19"
            className="ml-2 hidden placeholder:text-neutral-500 sm:block sm:text-sm! xl:text-base!"
            placeholder="Paste an recipe source link to create a recipe"
            value={recipeInput}
            onChange={e => setRecipeInput(e.target.value)}
            onKeyDown={e => handleKeyPress(e)}
          />

          <InputGroupTextarea
            id="input-secure-20"
            className="ml-2 text-xs placeholder:text-neutral-500 sm:hidden"
            placeholder="Paste an recipe source link to create a recipe"
            value={recipeInput}
            onChange={e => setRecipeInput(e.target.value)}
            onKeyDown={e => handleKeyPress(e)}
          />

          <InputGroupAddon
            align="inline-end"
            className="flex w-full items-center justify-between pr-[9px] pl-0.5 sm:w-auto sm:pr-3 sm:pl-0">
            <div className="sm:hidden">
              <SourceSelect recipeSource={recipeSource} setRecipeSource={setRecipeSource} />
            </div>

            <InputGroupButton
              variant={'default'}
              className="h-7 w-28 text-xs sm:h-8 sm:w-32 lg:h-9 lg:w-36 xl:h-11 xl:w-40 xl:px-6 xl:text-sm"
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

const SourceSelect = ({
  recipeSource,
  setRecipeSource,
}: {
  recipeSource: RecipeSourceType
  setRecipeSource: (value: RecipeSourceType) => void
}) => {
  return (
    <Select
      value={recipeSource}
      defaultValue={RecipeSourceType.INSTAGRAM_REEL}
      onValueChange={value => setRecipeSource(value as RecipeSourceType)}>
      <SelectTrigger className="bg-secondary text-secondary-foreground hover:bg-secondary/80 h-7! w-full rounded-sm border-none text-xs shadow-none sm:h-8! sm:rounded-md sm:shadow-xs lg:h-9! xl:h-11! xl:text-sm">
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
  )
}
