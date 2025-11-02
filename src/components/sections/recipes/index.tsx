import { FC, useMemo } from 'react'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { Api } from '@/lib/api'
import { Prisma, Tag } from '@/generated/prisma/client'
import { Card, CardTitle } from '@/components/ui/card'
import { useQueryState } from 'nuqs'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { BookmarkIcon } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

type RecipeWithTags = Prisma.RecipeGetPayload<{
  include: {
    tags: {
      include: {
        tag: true
      }
    }
  }
}>

interface RecipesSectionProps {
  className?: string
  bgColor?: string
}

export const RecipesSection: FC<RecipesSectionProps> = ({ className, bgColor }) => {
  const [selectedTag, setSelectedTag] = useQueryState('tag')

  const { data: tags, isLoading: isLoadingTags } = useQuery({
    queryKey: ['v1', 'tags'],
    queryFn: async () => {
      const response = await Api.v1.get<Tag[]>('/tags')
      return response.data
    },
  })

  const tagId = useMemo(() => tags?.find(tag => tag.name === selectedTag)?.id, [tags, selectedTag])

  const { data: recipes, isLoading: isLoadingRecipes } = useQuery({
    queryKey: ['v1', 'recipes', selectedTag],
    queryFn: async ({ signal }) => {
      const response = await Api.v1.get<RecipeWithTags[]>('/recipes', {
        signal,
        params: {
          ...(selectedTag && tagId && { tagId }),
        },
      })
      return response.data
    },
    placeholderData: keepPreviousData,
  })

  return (
    <section className={cn(className, 'space-y-6')}>
      <h1 className="font-mono text-2xl font-semibold">What others are saving</h1>

      <div className="scrollbar-hide flex gap-2 overflow-x-auto pb-2">
        <Button
          onClick={() => setSelectedTag(null)}
          size="sm"
          variant={selectedTag === null ? 'default' : 'secondary'}
          className={cn('rounded-full')}>
          All
        </Button>
        {isLoadingTags
          ? Array.from({ length: 5 }).map((_, index) => (
              <Skeleton key={index} className="h-8 w-28 shrink-0 rounded-full" />
            ))
          : tags?.map(tag => (
              <Button
                key={tag.id}
                size="sm"
                variant={selectedTag === tag.name ? 'default' : 'secondary'}
                onClick={() => setSelectedTag(tag.name)}
                className={cn('rounded-full')}>
                {tag.name}
              </Button>
            ))}
      </div>

      <div className="grid grid-cols-5 gap-3 px-4 pb-10">
        {isLoadingRecipes
          ? Array.from({ length: 8 }).map((_, index) => (
              <RecipeCardSkeleton key={index} className={bgColor} />
            ))
          : recipes?.map(recipe => (
              <RecipeCard key={recipe.id} recipe={recipe} className={bgColor} />
            ))}
      </div>
    </section>
  )
}

interface RecipeCardProps {
  recipe: RecipeWithTags
  className?: string
}

const RecipeCard: FC<RecipeCardProps> = ({ recipe, className }) => {
  return (
    <Card
      className={cn(
        'group relative flex min-h-[350px] flex-col justify-between rounded-lg border-none bg-[#f6f6f6] px-5 py-4 shadow-none',
        className
      )}>
      <div className="flex items-center justify-between">
        <CardTitle className="max-w-[210px] font-mono text-sm">
          {recipe.shortTitle ?? recipe.title}
        </CardTitle>

        <div className="absolute top-3 right-3 flex shrink-0 cursor-pointer items-center gap-2 rounded-full bg-white p-1">
          <BookmarkIcon className="size-4 text-neutral-500" />
        </div>
      </div>
      <div className="pointer-events-none mx-auto flex items-center justify-center overflow-hidden rounded-full border border-neutral-200 transition-transform duration-300 select-none group-hover:scale-105">
        <Image
          src={recipe?.imageUrl ?? ''}
          alt={recipe?.title ?? ''}
          width={640}
          height={640}
          className="size-48 scale-115 object-cover"
        />
      </div>
      <div>
        <Link
          href={`https://www.instagram.com/${recipe?.sourceName}`}
          className="cursor-pointer font-mono text-xs text-neutral-500 underline"
          target="_blank"
          rel="noopener noreferrer"
          title="View on Instagram">
          @{recipe?.sourceName}
        </Link>
      </div>
    </Card>
  )
}

interface RecipeCardSkeletonProps {
  className?: string
}

const RecipeCardSkeleton: FC<RecipeCardSkeletonProps> = ({ className }) => {
  return (
    <Card
      className={cn(
        'group relative flex min-h-[350px] flex-col justify-between rounded-lg border-none bg-[#f6f6f6] px-5 py-4 shadow-none',
        className
      )}>
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-[210px] bg-white" />
        <div className="absolute top-3 right-3 flex shrink-0 items-center gap-2 rounded-full bg-white p-1">
          <BookmarkIcon className="size-4 animate-pulse text-neutral-500" />
        </div>
      </div>
      <div className="mx-auto flex items-center justify-center overflow-hidden rounded-full border border-neutral-200">
        <Skeleton className="size-48 rounded-full bg-white" />
      </div>
      <div>
        <Skeleton className="h-3 w-20 bg-white" />
      </div>
    </Card>
  )
}
