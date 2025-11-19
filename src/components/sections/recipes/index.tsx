import { FC, useMemo, useState, useEffect } from 'react'
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Api } from '@/lib/api'
import { Tag } from '@/generated/prisma/client'
import { Card, CardTitle } from '@/components/ui/card'
import { useQueryState } from 'nuqs'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { BookmarkIcon } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { ClientErrorHandler } from '@/lib/errors'
import { FullRecipe } from '@/types/recipes'
import { AnimatePresence, motion } from 'motion/react'
import { inView } from 'motion'
import { FilterIcon, LoadingIcon, SearchIcon, SortIcon, XDashedIcon } from '@/components/icons'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
} from '@/components/ui/select'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'
import { useDebounceCallback } from 'usehooks-ts'

interface RecipesSectionProps {
  className?: string
  bgColor?: string
}

export const RecipesSection: FC<RecipesSectionProps> = ({ className, bgColor }) => {
  const [showSearchCulina, setShowSearchCulina] = useState(false)
  const [selectedTag, setSelectedTag] = useQueryState('tag')
  const [selectedSort, setSelectedSort] = useQueryState('sortBy')
  const [searchQuery, setSearchQuery] = useQueryState('q')
  const setQuery = useDebounceCallback(value => {
    setSearchQuery(value || null)
  }, 50)

  const { data: tags, isLoading: isLoadingTags } = useQuery({
    queryKey: ['v1', 'tags'],
    queryFn: async () => {
      const response = await Api.v1.get<Tag[]>('/tags')
      return response.data
    },
  })

  const tagId = useMemo(() => tags?.find(tag => tag.name === selectedTag)?.id, [tags, selectedTag])

  const { data: recipes, isLoading: isLoadingRecipes } = useQuery({
    queryKey: ['v1', 'recipes', selectedTag, selectedSort, searchQuery],
    queryFn: async ({ signal }) => {
      const response = await Api.v1.get<FullRecipe[]>('/recipes', {
        signal,
        params: {
          ...(selectedTag && tagId && { tagId }),
          ...(selectedSort && { sortBy: selectedSort }),
          ...(searchQuery && { q: searchQuery }),
        },
      })
      return response.data
    },
    placeholderData: keepPreviousData,
  })

  useEffect(() => {
    const searchElement = document.getElementById('search-culina')
    if (!searchElement) return

    const cleanup = inView(searchElement, () => {
      setShowSearchCulina(false)
      return () => setShowSearchCulina(true)
    })

    return cleanup
  }, [])

  return (
    <section className={cn(className, 'space-y-6')}>
      <div id="search-culina" className="flex items-center justify-between gap-3 pt-20">
        <InputGroup className="h-[44px] overflow-hidden bg-neutral-50/60 backdrop-blur-xs [--radius:9999px]">
          <InputGroupAddon className="ml-1">
            <SearchIcon className="size-4" />
          </InputGroupAddon>

          <InputGroupInput
            id="search-recipes"
            className="ml-2 text-base! placeholder:text-neutral-500"
            placeholder="Search recipes"
            value={searchQuery || ''}
            onChange={e => setQuery(e.target.value)}
          />

          {searchQuery && (
            <InputGroupAddon
              align="inline-end"
              className="mr-2 cursor-pointer rounded-full p-1 transition-colors duration-200 hover:bg-neutral-100"
              onClick={() => setSearchQuery(null)}>
              <XDashedIcon className="size-5 text-neutral-500" />
            </InputGroupAddon>
          )}
        </InputGroup>

        <Select
          value={selectedSort ?? 'newest'}
          onValueChange={value => setSelectedSort(value === 'newest' ? null : value)}>
          <SelectTrigger
            className={cn(
              'h-[44px]! rounded-full bg-neutral-50/60 px-6! text-neutral-900! backdrop-blur-xs',
              selectedSort && selectedSort !== 'newest' && 'border-dashed border-neutral-900!'
            )}>
            <SortIcon className="size-4 text-neutral-900!" /> Sort
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Sort by</SelectLabel>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="oldest">Oldest</SelectItem>
              <SelectItem value="popular">Popular</SelectItem>
              <SelectItem value="random">Random</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>

        <Button
          variant="outline"
          className="h-[44px] rounded-full bg-neutral-50/60 px-6! backdrop-blur-xs">
          <FilterIcon className="size-4" />
          Filter
        </Button>
      </div>

      <AnimatePresence>
        {(searchQuery || selectedTag || selectedSort) && (
          <motion.div
            key="filter-info"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="-mt-3 flex items-center justify-between px-4 font-mono text-sm font-semibold text-neutral-500">
            <p className="">
              showing results for: {searchQuery} {selectedTag && `by ${selectedTag}`}{' '}
              {selectedSort && `sorted by ${selectedSort}`}
            </p>

            <motion.p
              whileTap={{ scale: 0.95 }}
              whileHover={{ color: 'rgba(0, 0, 0, 0.8)' }}
              transition={{ duration: 0.3 }}
              className="cursor-pointer underline select-none"
              onClick={() => {
                setSelectedTag(null)
                setSelectedSort(null)
                setSearchQuery(null)
              }}>
              clear all
            </motion.p>
          </motion.div>
        )}

        <h1 key="section-title" className="font-mono text-2xl font-semibold">
          What others are saving
        </h1>

        <div key="tags-section" className="scrollbar-hide flex gap-2 overflow-x-auto pb-2">
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

        <div key="recipes-grid" className="grid grid-cols-5 gap-3 px-4 pb-10">
          {isLoadingRecipes
            ? Array.from({ length: 8 }).map((_, index) => (
                <RecipeCardSkeleton key={index} className={bgColor} />
              ))
            : recipes
                ?.filter(r => r.cookingSteps && r.ingredients)
                .map(recipe => <RecipeCard key={recipe.id} recipe={recipe} className={bgColor} />)}
        </div>
      </AnimatePresence>

      <motion.div
        initial={{ y: 100 }}
        animate={{ y: showSearchCulina ? 0 : 100 }}
        exit={{ y: 100 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        transition={{ duration: 0.3 }}
        onClick={() => {
          const searchElement = document.getElementById('search-culina')
          if (searchElement) {
            searchElement.scrollIntoView({ behavior: 'smooth', inline: 'start' })
            document.getElementById('search-recipes')?.focus({ preventScroll: true })
          }
        }}
        className="fixed bottom-5 left-1/2 flex h-12 w-80 -translate-x-1/2 cursor-pointer items-center justify-between rounded-full border bg-neutral-50/60 px-6 text-sm text-neutral-500 backdrop-blur-xs select-none">
        <span>Search culina</span>

        <SearchIcon className="size-4" />
      </motion.div>
    </section>
  )
}

interface RecipeCardProps {
  recipe: FullRecipe
  className?: string
}

const RecipeCard: FC<RecipeCardProps> = ({ recipe, className }) => {
  const router = useRouter()
  const queryClient = useQueryClient()
  const cookbookId = recipe.RecipeFavorite[0]?.id ?? null

  const { mutate: addToCookbook, isPending: isAddingToCookbook } = useMutation({
    mutationFn: async () => {
      await Api.v1.post(`/recipes/${recipe.slug}/cookbook`)
    },
    onSuccess: () => {
      toast.success('Recipe added to cookbook')
      queryClient.invalidateQueries({ queryKey: ['v1', 'recipes'] })
      queryClient.invalidateQueries({ queryKey: ['v1', 'cookbook'] })
    },
    onError: error => new ClientErrorHandler().toast().handle(error),
  })

  const { mutate: removeFromCookbook, isPending: isRemovingFromCookbook } = useMutation({
    mutationFn: async () => {
      await Api.v1.delete(`/recipes/${recipe.slug}/cookbook/${cookbookId}`)
    },
    onSuccess: () => {
      toast.success('Recipe removed from cookbook')
      queryClient.invalidateQueries({ queryKey: ['v1', 'recipes'] })
      queryClient.invalidateQueries({ queryKey: ['v1', 'cookbook'] })
    },
    onError: error => new ClientErrorHandler().toast().handle(error),
  })

  return (
    <Card
      onClick={() => router.push(`/recipes/${recipe.slug}`)}
      className={cn(
        'group relative flex min-h-[350px] cursor-pointer flex-col justify-between rounded-lg border-none bg-[#f6f6f6] px-5 py-4 shadow-none select-none',
        className
      )}>
      <div className="flex items-center justify-between">
        <CardTitle className="max-w-[210px] font-mono text-sm">
          {recipe.shortTitle ?? recipe.title}
        </CardTitle>

        <motion.div
          whileTap={{ scale: 0.95 }}
          onClick={e => {
            e.stopPropagation()
            if (cookbookId) {
              removeFromCookbook()
            } else {
              addToCookbook()
            }
          }}
          className={cn(
            'absolute top-3 right-3 flex shrink-0 cursor-pointer items-center gap-2 rounded-full bg-white p-1',
            (isRemovingFromCookbook || isAddingToCookbook) && 'pointer-events-none opacity-50'
          )}>
          {isRemovingFromCookbook || isAddingToCookbook ? (
            <LoadingIcon className="size-4 animate-spin" />
          ) : cookbookId ? (
            <BookmarkIcon className="size-4 fill-neutral-900" />
          ) : (
            <BookmarkIcon className="size-4 text-neutral-500" />
          )}
        </motion.div>
      </div>
      <div className="pointer-events-none mx-auto flex items-center justify-center overflow-hidden rounded-full shadow-xl transition-transform duration-300 select-none group-hover:scale-105">
        <Image
          src={recipe?.imageUrl ?? ''}
          alt={recipe?.title ?? ''}
          width={640}
          height={640}
          className="size-48 scale-120 object-cover"
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
