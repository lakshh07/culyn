import {
  BookmarkIcon,
  FilterIcon,
  HeartIcon,
  SearchIcon,
  SortIcon,
  XDashedIcon,
  XIcon,
} from '@/components/icons'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardTitle } from '@/components/ui/card'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Ingredient, Tag } from '@/generated/prisma/client'
import { Api } from '@/lib/api'
import { ClientErrorHandler } from '@/lib/errors'
import { cn } from '@/lib/utils'
import { RecipeDetail } from '@culyn/shared/schemas'
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ChevronDownIcon } from 'lucide-react'
import { inView } from 'motion'
import { AnimatePresence, motion } from 'motion/react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useQueryState } from 'nuqs'
import { FC, useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { useDebounceCallback, useMediaQuery } from 'usehooks-ts'

interface RecipesSectionProps {
  className?: string
  bgColor?: string
}

export const RecipesSection: FC<RecipesSectionProps> = ({ className, bgColor }) => {
  const [showSearchCulina, setShowSearchCulina] = useState(false)
  const [isInitialLoad, setIsInitialLoad] = useState(true)
  const [selectedTag, setSelectedTag] = useQueryState('tag')
  const [selectedSort, setSelectedSort] = useQueryState('sortBy')
  const [searchQuery, setSearchQuery] = useQueryState('q')
  const [cookTimeRange, setCookTimeRange] = useQueryState('cookTime')
  const [caloriesRange, setCaloriesRange] = useQueryState('calories')
  const [proteinRange, setProteinRange] = useQueryState('protein')
  const [selectedIngredients, setSelectedIngredients] = useQueryState('ingredients')
  const [ingredientSearch, setIngredientSearch] = useState('')
  const [open, setOpen] = useState(false)
  const isDesktop = useMediaQuery('(min-width: 1024px)')

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

  const { data: ingredients, isLoading: isLoadingIngredients } = useQuery({
    queryKey: ['v1', 'ingredients'],
    queryFn: async () => {
      const response = await Api.v1.get<Ingredient[]>('/ingredients')
      return response.data
    },
  })

  const tagId = useMemo(() => tags?.find(tag => tag.name === selectedTag)?.id, [tags, selectedTag])

  // Parse filter ranges
  const cookTimeFilter = useMemo(() => {
    if (!cookTimeRange) return null
    const [min, max] = cookTimeRange.split('-').map(v => (v === 'max' ? undefined : parseInt(v)))
    return { min, max }
  }, [cookTimeRange])

  const caloriesFilter = useMemo(() => {
    if (!caloriesRange) return null
    const [min, max] = caloriesRange.split('-').map(v => (v === 'max' ? undefined : parseInt(v)))
    return { min, max }
  }, [caloriesRange])

  const proteinFilter = useMemo(() => {
    if (!proteinRange) return null
    const [min, max] = proteinRange.split('-').map(v => (v === 'max' ? undefined : parseInt(v)))
    return { min, max }
  }, [proteinRange])

  const selectedIngredientsArray = useMemo(
    () => (selectedIngredients ? selectedIngredients.split(',') : []),
    [selectedIngredients]
  )

  const { data: recipes, isLoading: isLoadingRecipes } = useQuery({
    queryKey: [
      'v1',
      'recipes',
      selectedTag,
      selectedSort,
      searchQuery,
      cookTimeRange,
      caloriesRange,
      proteinRange,
      selectedIngredients,
    ],
    queryFn: async ({ signal }) => {
      const response = await Api.v1.get<RecipeDetail[]>('/recipes', {
        signal,
        params: {
          ...(selectedTag && tagId && { tagId }),
          ...(selectedSort && { sortBy: selectedSort }),
          ...(searchQuery && { q: searchQuery }),
          ...(cookTimeFilter?.min !== undefined && { cookTimeMin: cookTimeFilter.min }),
          ...(cookTimeFilter?.max !== undefined && { cookTimeMax: cookTimeFilter.max }),
          ...(caloriesFilter?.min !== undefined && { caloriesMin: caloriesFilter.min }),
          ...(caloriesFilter?.max !== undefined && { caloriesMax: caloriesFilter.max }),
          ...(proteinFilter?.min !== undefined && { proteinMin: proteinFilter.min }),
          ...(proteinFilter?.max !== undefined && { proteinMax: proteinFilter.max }),
          ...(selectedIngredientsArray.length > 0 && {
            ingredientIds: selectedIngredientsArray.join(','),
          }),
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

  useEffect(() => {
    // Set isInitialLoad to false after initial animations complete
    const timer = setTimeout(() => {
      setIsInitialLoad(false)
    }, 2000) // After all initial animations finish

    return () => clearTimeout(timer)
  }, [])

  return (
    <section className={cn(className, 'space-y-4 sm:space-y-4 lg:space-y-5 xl:space-y-6')}>
      <motion.div
        id="search-culina"
        className="flex items-center justify-between gap-2 pt-20 sm:gap-3 sm:pt-16 lg:pt-20"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: isInitialLoad ? 1.2 : 0, ease: 'easeOut' }}>
        <InputGroup className="hover:bg-accent h-[34px] overflow-hidden bg-neutral-50/60 backdrop-blur-xs [--radius:9999px] lg:h-[39px] xl:h-[44px]">
          <InputGroupAddon className="ml-1">
            <SearchIcon className="size-3 sm:size-3.5 xl:size-4" />
          </InputGroupAddon>

          <InputGroupInput
            id="search-recipes"
            className="text-xs! placeholder:text-neutral-500 sm:ml-1 sm:text-sm! lg:ml-2 xl:text-base!"
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

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: isInitialLoad ? 1.3 : 0, ease: 'easeOut' }}>
          <Select
            value={selectedSort ?? 'newest'}
            onValueChange={value => setSelectedSort(value === 'newest' ? null : value)}>
            <SelectTrigger
              className={cn(
                'hover:bg-accent h-[34px]! rounded-full bg-neutral-50/60 px-4! font-medium text-neutral-900! backdrop-blur-xs sm:text-xs sm:leading-4 lg:h-[39px]! lg:px-6! lg:text-[13px] xl:h-[44px]! xl:text-sm xl:leading-5',
                selectedSort && selectedSort !== 'newest' && 'border-dashed border-neutral-900!'
              )}>
              <SortIcon className="size-3 text-neutral-900! sm:size-3.5 xl:size-4" />
              <span className="hidden sm:inline">Sort</span>
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
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: isInitialLoad ? 1.4 : 0, ease: 'easeOut' }}>
          <Drawer direction={isDesktop ? 'right' : 'bottom'} disablePreventScroll>
            <DrawerTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  'h-[34px] rounded-full bg-neutral-50/60 px-4! font-medium text-neutral-900! backdrop-blur-xs sm:text-xs sm:leading-4 lg:h-[39px]! lg:px-6! lg:text-[13px] xl:h-[44px]! xl:text-sm xl:leading-5',
                  (cookTimeRange || caloriesRange || proteinRange || selectedIngredients) &&
                    'border-dashed border-neutral-900!'
                )}>
                <FilterIcon className="size-3 sm:size-3.5 xl:size-4" />
                <span className="hidden sm:inline">Filter</span>
                {(cookTimeRange || caloriesRange || proteinRange || selectedIngredients) && (
                  <Badge className="ml-2 h-5 min-w-5 rounded-full px-1.5 text-xs">
                    {
                      [cookTimeRange, caloriesRange, proteinRange, selectedIngredients].filter(
                        Boolean
                      ).length
                    }
                  </Badge>
                )}
              </Button>
            </DrawerTrigger>
            <DrawerContent className="m-2 lg:max-w-md! lg:rounded-l-lg">
              <DrawerHeader>
                <DrawerTitle className="text-left">Filter Recipes</DrawerTitle>
                <DrawerDescription className="text-left">
                  Narrow down recipes by cooking time, nutrition, and ingredients
                </DrawerDescription>
              </DrawerHeader>

              <div className="scrollbar-hide mt-4 space-y-6 overflow-y-auto px-4 pb-6">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="font-mono text-xs font-semibold text-neutral-700 lg:text-sm">
                      Cooking Time
                    </label>
                    {cookTimeRange && (
                      <Button
                        variant="link"
                        size="sm"
                        className="h-auto p-0 text-xs text-neutral-500 hover:text-neutral-900"
                        onClick={() => setCookTimeRange(null)}>
                        clear
                      </Button>
                    )}
                  </div>
                  <Select
                    value={cookTimeRange ?? ''}
                    onValueChange={v => setCookTimeRange(v || null)}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select cooking time" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Minutes</SelectLabel>
                        <SelectItem value="0-15">0-15 mins</SelectItem>
                        <SelectItem value="15-30">15-30 mins</SelectItem>
                        <SelectItem value="30-60">30-60 mins</SelectItem>
                        <SelectItem value="60-120">60-120 mins</SelectItem>
                        <SelectItem value="120-max">Over 120 mins</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="font-mono text-xs font-semibold text-neutral-700 lg:text-sm">
                      Calories
                    </label>
                    {caloriesRange && (
                      <Button
                        variant="link"
                        size="sm"
                        className="h-auto p-0 text-xs text-neutral-500 hover:text-neutral-900"
                        onClick={() => setCaloriesRange(null)}>
                        clear
                      </Button>
                    )}
                  </div>
                  <Select
                    value={caloriesRange ?? ''}
                    onValueChange={v => setCaloriesRange(v || null)}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select calorie range" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Calories</SelectLabel>
                        <SelectItem value="0-300">0-300 cal</SelectItem>
                        <SelectItem value="300-600">300-600 cal</SelectItem>
                        <SelectItem value="600-900">600-900 cal</SelectItem>
                        <SelectItem value="900-1200">900-1200 cal</SelectItem>
                        <SelectItem value="1200-max">Over 1200 cal</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="font-mono text-xs font-semibold text-neutral-700 lg:text-sm">
                      Protein
                    </label>
                    {proteinRange && (
                      <Button
                        variant="link"
                        size="sm"
                        className="h-auto p-0 text-xs text-neutral-500 hover:text-neutral-900"
                        onClick={() => setProteinRange(null)}>
                        clear
                      </Button>
                    )}
                  </div>
                  <Select
                    value={proteinRange ?? ''}
                    onValueChange={v => setProteinRange(v || null)}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select protein range" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Grams of Protein</SelectLabel>
                        <SelectItem value="0-10">0-10g</SelectItem>
                        <SelectItem value="10-20">10-20g</SelectItem>
                        <SelectItem value="20-30">20-30g</SelectItem>
                        <SelectItem value="30-50">30-50g</SelectItem>
                        <SelectItem value="50-max">Over 50g</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="font-mono text-xs font-semibold text-neutral-700 lg:text-sm">
                      Ingredients
                    </label>
                    {selectedIngredientsArray.length > 0 && (
                      <Button
                        variant="link"
                        size="sm"
                        className="h-auto p-0 text-xs text-neutral-500 hover:text-neutral-900"
                        onClick={() => setSelectedIngredients(null)}>
                        clear all
                      </Button>
                    )}
                  </div>

                  {selectedIngredientsArray.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {selectedIngredientsArray.map(ingredientId => {
                        const ingredient = ingredients?.find(i => i.id === ingredientId)
                        if (!ingredient) return null
                        return (
                          <Badge
                            key={ingredientId}
                            variant="secondary"
                            className="cursor-pointer gap-1 pr-2 pl-3"
                            onClick={() => {
                              const newIngredients = selectedIngredientsArray.filter(
                                id => id !== ingredientId
                              )
                              setSelectedIngredients(
                                newIngredients.length > 0 ? newIngredients.join(',') : null
                              )
                            }}>
                            {ingredient.name}
                            <XIcon className="size-3" />
                          </Badge>
                        )
                      })}
                    </div>
                  )}

                  <Popover open={open} onOpenChange={setOpen} modal={false}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={open}
                        className="w-full justify-between px-3 font-normal text-neutral-500 hover:bg-transparent">
                        {selectedIngredientsArray.length > 0 ? (
                          <span className="font-mono">
                            {selectedIngredientsArray.length} ingredients selected
                          </span>
                        ) : (
                          'Select ingredients'
                        )}
                        <ChevronDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent
                      className="w-(--radix-popover-trigger-width) p-0"
                      align="start"
                      onOpenAutoFocus={e => e.preventDefault()}
                      onWheel={e => e.stopPropagation()}>
                      <Command>
                        <CommandInput
                          className="font-mono"
                          placeholder="Search ingredients..."
                          value={ingredientSearch}
                          onValueChange={setIngredientSearch}
                        />
                        <CommandList>
                          <CommandEmpty>No ingredients found.</CommandEmpty>
                          <CommandGroup className="font-mono" heading="Available Ingredients">
                            {isLoadingIngredients ? (
                              <div className="py-6 text-center text-sm text-neutral-500">
                                Loading...
                              </div>
                            ) : (
                              ingredients
                                ?.filter(i => !selectedIngredientsArray.includes(i.id))
                                .map(ingredient => (
                                  <CommandItem
                                    key={ingredient.id}
                                    className="cursor-pointer"
                                    value={ingredient.name}
                                    onSelect={() => {
                                      setSelectedIngredients(
                                        selectedIngredientsArray.length > 0
                                          ? [...selectedIngredientsArray, ingredient.id].join(',')
                                          : ingredient.id
                                      )
                                      setIngredientSearch('')
                                    }}>
                                    {ingredient.name}
                                  </CommandItem>
                                ))
                            )}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <DrawerFooter className="ms-2">
                <div className="flex gap-4">
                  <DrawerClose asChild>
                    <Button variant="outline" className="flex-1">
                      Close
                    </Button>
                  </DrawerClose>
                  <Button
                    variant="default"
                    className="flex-1"
                    onClick={() => {
                      setCookTimeRange(null)
                      setCaloriesRange(null)
                      setProteinRange(null)
                      setSelectedIngredients(null)
                    }}>
                    Reset All Filters
                  </Button>
                </div>
              </DrawerFooter>
            </DrawerContent>
          </Drawer>
        </motion.div>
      </motion.div>

      <AnimatePresence>
        {(searchQuery ||
          selectedTag ||
          selectedSort ||
          cookTimeRange ||
          caloriesRange ||
          proteinRange ||
          selectedIngredients) && (
          <motion.div
            key="filter-info"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="-mt-3 flex items-center justify-between px-4 font-mono text-sm font-semibold text-neutral-500">
            <div className="flex flex-wrap items-center gap-2">
              <p>showing results for:</p>
              {searchQuery && <Badge variant="secondary">&quot;{searchQuery}&quot;</Badge>}
              {selectedTag && <Badge variant="secondary">{selectedTag}</Badge>}
              {selectedSort && <Badge variant="secondary">sorted: {selectedSort}</Badge>}
              {cookTimeRange && (
                <Badge variant="secondary">
                  time: {cookTimeRange.replace('-max', '+').replace('-', '-')} mins
                </Badge>
              )}
              {caloriesRange && (
                <Badge variant="secondary">
                  cal: {caloriesRange.replace('-max', '+').replace('-', '-')}
                </Badge>
              )}
              {proteinRange && (
                <Badge variant="secondary">
                  protein: {proteinRange.replace('-max', '+').replace('-', '-')}g
                </Badge>
              )}
              {selectedIngredientsArray.length > 0 && (
                <Badge variant="secondary">{selectedIngredientsArray.length} ingredients</Badge>
              )}
            </div>

            <motion.p
              whileTap={{ scale: 0.95 }}
              whileHover={{ color: 'rgba(0, 0, 0, 0.8)' }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="cursor-pointer whitespace-nowrap underline select-none"
              onClick={() => {
                setSelectedTag(null)
                setSelectedSort(null)
                setSearchQuery(null)
                setCookTimeRange(null)
                setCaloriesRange(null)
                setProteinRange(null)
                setSelectedIngredients(null)
              }}>
              clear all
            </motion.p>
          </motion.div>
        )}

        <motion.h1
          key="section-title"
          className="font-mono text-base font-semibold sm:text-lg lg:text-xl xl:text-2xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: isInitialLoad ? 1.5 : 0, ease: 'easeOut' }}>
          What others are saving
        </motion.h1>

        <motion.div
          key="tags-section"
          className="scrollbar-hide flex gap-2 overflow-x-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: isInitialLoad ? 1.6 : 0, ease: 'easeOut' }}>
          <Button
            onClick={() => setSelectedTag(null)}
            size="sm"
            variant={selectedTag === null ? 'default' : 'secondary'}
            className={cn('rounded-full text-xs xl:text-sm')}>
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
                  className={cn('rounded-full text-xs xl:text-sm')}>
                  {tag.name}
                </Button>
              ))}
        </motion.div>

        <motion.div
          layoutId="recipes-grid"
          key="recipes-grid"
          className="grid grid-cols-2 gap-3 overflow-hidden pt-2 pb-10 sm:grid-cols-3 lg:grid-cols-4 lg:px-2 xl:grid-cols-5 xl:px-4"
          layout
          transition={{ duration: 0.5, ease: 'easeOut' }}>
          <AnimatePresence mode="popLayout">
            {isLoadingRecipes ? (
              Array.from({ length: 8 }).map((_, index) => (
                <motion.div
                  key={`skeleton-${index}`}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{
                    duration: 0.3,
                    delay: (isInitialLoad ? 1.7 : 0) + index * 0.05,
                    ease: 'easeOut',
                  }}
                  layout>
                  <RecipeCardSkeleton className={bgColor} />
                </motion.div>
              ))
            ) : recipes && recipes.filter(r => r.cookingSteps && r.ingredients).length === 0 ? (
              <motion.div
                key="empty-state"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -30 }}
                transition={{ duration: 0.4, delay: isInitialLoad ? 1.7 : 0.3, ease: 'easeOut' }}
                className="col-span-5 flex flex-col items-center justify-center py-20">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.3, delay: isInitialLoad ? 1.9 : 0.5, ease: 'easeOut' }}
                  className="mb-6">
                  <Image
                    src="/assets/misc/empty-plate.png"
                    alt="No recipes found"
                    width={200}
                    height={200}
                    className="size-28 sm:size-32 lg:size-44 xl:size-48"
                  />
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: isInitialLoad ? 2.1 : 0.7, ease: 'easeOut' }}
                  className="text-center">
                  <h3 className="mb-2 font-mono text-sm font-semibold text-neutral-700 sm:text-base lg:text-lg xl:text-xl">
                    No recipes found
                  </h3>
                  <p className="max-w-xs font-mono text-xs text-neutral-500 sm:max-w-md lg:text-sm xl:max-w-lg">
                    Try adjusting your search terms or filters to discover more delicious recipes
                  </p>
                </motion.div>
              </motion.div>
            ) : (
              recipes
                ?.filter(r => r.cookingSteps && r.ingredients)
                .map((recipe, index) => (
                  <motion.div
                    key={recipe.id}
                    initial={{ opacity: 0, scale: 0.8, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{
                      opacity: 0,
                      scale: 0.9,
                      y: -10,
                      transition: {
                        duration: 0.2,
                        delay: index * 0.02,
                        ease: 'easeIn',
                      },
                    }}
                    transition={{
                      duration: 0.4,
                      delay: (isInitialLoad ? 1.7 : 0) + index * 0.05,
                      ease: 'easeOut',
                    }}
                    layout
                    layoutId={recipe.id}>
                    <RecipeCard recipe={recipe} className={bgColor} />
                  </motion.div>
                ))
            )}
          </AnimatePresence>
        </motion.div>
      </AnimatePresence>

      <motion.div
        initial={{ y: 100 }}
        animate={{ y: showSearchCulina ? 0 : 100 }}
        exit={{ y: 100, transition: { duration: 0.3, ease: 'easeIn' } }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        onClick={() => {
          const searchElement = document.getElementById('search-culina')
          if (searchElement) {
            searchElement.scrollIntoView({ behavior: 'smooth', inline: 'start' })
            document.getElementById('search-recipes')?.focus({ preventScroll: true })
          }
        }}
        className="fixed bottom-5 left-1/2 flex h-12 w-[calc(100%-2rem)] -translate-x-1/2 cursor-pointer items-center justify-between rounded-full border bg-neutral-50/60 px-6 text-sm text-neutral-500 backdrop-blur-xs select-none sm:w-80">
        <span>Search culina</span>

        <SearchIcon className="size-4" />
      </motion.div>
    </section>
  )
}

interface RecipeCardProps {
  recipe: RecipeDetail
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
      queryClient.invalidateQueries({ queryKey: ['v1', 'user', 'stats'] })
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
      queryClient.invalidateQueries({ queryKey: ['v1', 'user', 'stats'] })
    },
    onError: error => new ClientErrorHandler().toast().handle(error),
  })

  return (
    <motion.div
      whileHover={{
        scale: 1.01,
        transition: { duration: 0.2, ease: 'easeOut' },
      }}
      whileTap={{
        scale: 0.98,
        transition: { duration: 0.1, ease: 'easeOut' },
      }}>
      <Card
        onClick={() => router.push(`/recipes/${recipe.slug}`)}
        className={cn(
          'group relative flex min-h-[260px] cursor-pointer flex-col justify-between rounded-3xl bg-white px-4 py-4 shadow-none transition-all duration-200 select-none hover:shadow-md sm:min-h-[320px] xl:min-h-[350px] xl:px-5',
          className
        )}>
        <div className="flex items-center justify-between">
          <CardTitle className="max-w-[120px] font-mono text-xs sm:max-w-[160px] lg:max-w-[180px] lg:text-sm xl:max-w-[210px]">
            {recipe.shortTitle ?? recipe.title}
          </CardTitle>

          <motion.div
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={e => {
              e.stopPropagation()
              if (cookbookId) {
                removeFromCookbook()
              } else {
                addToCookbook()
              }
            }}
            className={cn(
              'absolute top-3 right-3 flex shrink-0 cursor-pointer items-center gap-2 rounded-full bg-white p-1.5 transition-all duration-200',
              (isRemovingFromCookbook || isAddingToCookbook) &&
                'pointer-events-none animate-pulse opacity-50',
              cookbookId && 'bg-red-50'
            )}>
            {isRemovingFromCookbook || isAddingToCookbook ? (
              <HeartIcon className="size-3.5 animate-pulse text-red-500 sm:size-4" />
            ) : cookbookId ? (
              <HeartIcon className="size-3.5 fill-red-500 text-red-500 sm:size-4" />
            ) : (
              <HeartIcon className="size-3.5 text-red-500 sm:size-4" />
            )}
          </motion.div>
        </div>
        <motion.div
          className="pointer-events-none mx-auto flex items-center justify-center overflow-hidden rounded-full shadow-xl select-none"
          whileHover={{
            scale: 1.05,
            transition: { duration: 0.3, ease: 'easeOut' },
          }}>
          <Image
            src={recipe?.imageUrl ?? ''}
            alt={recipe?.title ?? ''}
            width={640}
            height={640}
            className="size-36 scale-120 object-cover sm:size-40 xl:size-52"
          />
        </motion.div>
        <div>
          <Link
            href={`https://www.instagram.com/${recipe?.sourceName}`}
            className="cursor-pointer font-mono text-[10px] leading-4 text-neutral-500 underline transition-colors duration-200 hover:text-neutral-700 lg:text-xs"
            target="_blank"
            rel="noopener noreferrer"
            title="View on Instagram">
            @{recipe?.sourceName}
          </Link>
        </div>
      </Card>
    </motion.div>
  )
}

interface RecipeCardSkeletonProps {
  className?: string
}

const RecipeCardSkeleton: FC<RecipeCardSkeletonProps> = ({ className }) => {
  return (
    <Card
      className={cn(
        'group relative flex min-h-[260px] flex-col justify-between rounded-lg border-none bg-[#f6f6f6] px-4 py-4 shadow-none sm:min-h-[320px] xl:min-h-[350px] xl:px-5',
        className
      )}>
      <div className="flex items-center justify-between">
        <Skeleton className="h-3 w-[120px] bg-white sm:h-4 sm:w-[160px] lg:w-[180px] xl:w-[210px]" />
        <div className="absolute top-3 right-3 flex shrink-0 items-center gap-2 rounded-full bg-white p-1">
          <BookmarkIcon className="size-3.5 animate-pulse text-neutral-500 sm:size-4" />
        </div>
      </div>
      <div className="mx-auto flex items-center justify-center overflow-hidden rounded-full border border-neutral-200">
        <Skeleton className="size-36 rounded-full bg-white sm:size-40 xl:size-48" />
      </div>
      <div>
        <Skeleton className="h-2.5 w-16 bg-white lg:h-3 lg:w-20" />
      </div>
    </Card>
  )
}
