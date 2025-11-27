'use client'

import React, { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { LoadingIcon, TrashIcon, XIcon } from '@/components/icons'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Api } from '@/lib/api'
import { ClientErrorHandler } from '@/lib/errors'
import { getIngredientImageUrl } from '@/lib/recipe/ingredient-assets'
import { cn } from '@/lib/utils'
import { GroceryList } from '@/types/lists'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import Link from 'next/link'
import { toast } from 'sonner'

interface AnimatedShoppingListProps {
  groceryLists: GroceryList[]
}

const listContainerVariants = {
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.2,
    },
  },
}

const listItemVariants = {
  hidden: {
    opacity: 0,
    y: 20,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
    },
  },
}

const contentVariants = {
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.2,
      delay: 0.1,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      duration: 0.1,
    },
  },
}

export const AnimatedShoppingList: React.FC<AnimatedShoppingListProps> = ({ groceryLists }) => {
  const [selectedListId, setSelectedListId] = useState<string | null>(null)

  const selectedList = useMemo(() => {
    if (!selectedListId) return null
    return groceryLists?.find(list => list.id === selectedListId) || null
  }, [groceryLists, selectedListId])

  return (
    <>
      <div className="mt-20 grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-3">
        {groceryLists?.map((list, index) => (
          <motion.div
            key={list.id}
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
              duration: 0.25,
              delay: index * 0.05,
              ease: 'easeOut',
            }}
            layoutId={`list-card-${list.id}`}
            onClick={() => setSelectedListId(list.id)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="relative grid min-h-[120px] cursor-pointer grid-cols-[1fr_40px] items-center gap-4 rounded-lg bg-neutral-100 p-4 sm:min-h-[1350x] lg:min-h-[120px]">
            <div>
              <motion.h3
                layoutId={`list-title-${list.id}`}
                className="max-w-[calc(100%-40px)] font-mono text-base font-medium text-neutral-900 lg:text-lg">
                {list.name}
              </motion.h3>

              <div className="flex flex-col items-start gap-1 lg:flex-row lg:items-center lg:gap-2">
                <p className="max-w-[120px] truncate font-mono text-xs text-neutral-500 sm:text-sm">
                  Cooking for {list.items[0]?.recipe?.servings}
                </p>
                <span className="hidden text-neutral-400 lg:block">•</span>
                <p className="font-mono text-xs text-neutral-500 sm:text-sm">
                  {list.items.length} items
                </p>
              </div>
            </div>

            <DeleteListButton
              recipeSlug={list.items[0]?.recipe?.slug}
              listId={list.id}
              onClick={e => {
                e.stopPropagation()
              }}
            />
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {selectedList && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-50 h-full w-full bg-black/50 backdrop-blur-sm"
              onClick={() => setSelectedListId(null)}
            />

            <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                layoutId={`list-card-${selectedList.id}`}
                className="pointer-events-auto w-full max-w-2xl rounded-xl bg-white shadow-2xl"
                transition={{
                  type: 'spring',
                  stiffness: 400,
                  damping: 30,
                }}>
                <motion.div
                  variants={contentVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="relative p-5 sm:p-6">
                  <button
                    onClick={() => setSelectedListId(null)}
                    className="absolute top-4 right-4 cursor-pointer rounded-full p-2 transition-colors hover:bg-neutral-100">
                    <XIcon className="size-5" />
                  </button>

                  <div className="border-b border-neutral-200 pb-4">
                    <motion.h2
                      layoutId={`list-title-${selectedList.id}`}
                      className="max-w-[calc(100%-40px)] font-mono text-lg font-semibold text-neutral-900 sm:text-xl lg:text-2xl">
                      {selectedList.name}
                    </motion.h2>
                    <div className="mt-2 flex items-center gap-4">
                      <p className="text-xs text-neutral-500 lg:text-sm">
                        Cooking for {selectedList.items[0]?.recipe?.servings}
                      </p>
                      <Link
                        href={`/recipes/${selectedList.items[0]?.recipe?.slug}`}
                        className="text-xs text-neutral-900 underline hover:text-neutral-700 lg:text-sm"
                        onClick={e => e.stopPropagation()}>
                        View Recipe
                      </Link>
                    </div>
                  </div>

                  <motion.div
                    variants={listContainerVariants}
                    initial="hidden"
                    animate="visible"
                    className="max-h-[60vh] overflow-y-auto">
                    {selectedList.items.map(item => (
                      <motion.div key={item.id} variants={listItemVariants}>
                        <ItemCard item={item} />
                      </motion.div>
                    ))}
                  </motion.div>

                  <div className="mt-2 border-neutral-200 pt-4">
                    <DeleteListButton
                      recipeSlug={selectedList.items[0]?.recipe?.slug}
                      listId={selectedList.id}
                      fullWidth
                      onSuccess={() => setSelectedListId(null)}
                    />
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

const DeleteListButton = ({
  recipeSlug,
  listId,
  fullWidth,
  onClick,
  onSuccess,
}: {
  recipeSlug: string
  listId: string
  fullWidth?: boolean
  onClick?: (e: React.MouseEvent) => void
  onSuccess?: () => void
}) => {
  const queryClient = useQueryClient()

  const { mutate: deleteListMutation, isPending: isDeletingList } = useMutation({
    mutationFn: async () => {
      await Api.v1.delete(`/recipes/${recipeSlug}/lists/${listId}`)
    },
    onSuccess: () => {
      toast.success('List deleted successfully')
      queryClient.invalidateQueries({ queryKey: ['v1', 'lists'] })
      onSuccess?.()
    },
    onError: error => new ClientErrorHandler().toast().handle(error),
  })

  if (fullWidth) {
    return (
      <Button
        variant="destructive"
        size="sm"
        className="w-full"
        onClick={e => {
          onClick?.(e)
          deleteListMutation()
        }}
        disabled={isDeletingList}>
        {isDeletingList ? (
          <>
            <LoadingIcon className="mr-2 size-4 animate-spin" />
            Deleting...
          </>
        ) : (
          <>
            <TrashIcon className="mr-2 size-4" />
            Delete List
          </>
        )}
      </Button>
    )
  }

  return (
    <Button
      variant={'ghost'}
      size={'icon-sm'}
      className="mr-2 shrink-0 hover:bg-neutral-300/50 active:scale-95"
      onClick={e => {
        onClick?.(e)
        deleteListMutation()
      }}
      disabled={isDeletingList}>
      {isDeletingList ? (
        <LoadingIcon className="size-4 animate-spin text-neutral-500" />
      ) : (
        <TrashIcon className="text-destructive size-4" />
      )}
    </Button>
  )
}

const ItemCard = ({ item }: { item: GroceryList['items'][number] }) => {
  const queryClient = useQueryClient()

  const { mutate: updateItemMutation, isPending: isUpdatingItem } = useMutation({
    mutationFn: async ({
      slug,
      itemId,
      checked,
      notes,
    }: {
      slug: string
      itemId: string
      checked?: boolean
      notes?: string
    }) => {
      const response = await Api.v1.patch(`/recipes/${slug}/items/${itemId}`, {
        ...(checked !== undefined && { checked }),
        ...(notes !== undefined && { notes }),
      })
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['v1', 'lists'] })
    },
    onError: error => new ClientErrorHandler().toast().handle(error),
  })

  return (
    <div
      onClick={() =>
        updateItemMutation({
          slug: item.recipe.slug,
          itemId: item.id,
          checked: !item.checked,
        })
      }
      className="flex cursor-pointer items-center space-x-4 border-b border-neutral-200 px-0 py-4 transition-colors hover:bg-neutral-50 sm:px-4 sm:py-4">
      <div className="relative">
        <div
          className={cn(
            'absolute -top-2 -right-2 z-10 flex size-5 cursor-pointer items-center justify-center rounded-md bg-white/80 shadow',
            {
              'cursor-not-allowed opacity-50': isUpdatingItem,
            }
          )}
          onClick={e => {
            e.stopPropagation()
            e.preventDefault()

            updateItemMutation({
              slug: item.recipe.slug,
              itemId: item.id,
            })
          }}>
          <XIcon className="size-3" />
        </div>
        <Avatar className="size-15 rounded-lg object-cover">
          <AvatarImage src={getIngredientImageUrl(item.name)} />
          <AvatarFallback className="size-full rounded-xl bg-neutral-100 object-cover">
            {item.name.charAt(0)}
          </AvatarFallback>
        </Avatar>
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-col">
          <p className="font-mono text-sm font-medium text-neutral-900 capitalize">{item.name}</p>
          <div className="font-mono text-xs text-neutral-500 sm:text-sm">
            {item.amount}
            <span className="ps-0.5 text-neutral-500">{item.unit}</span>
          </div>
        </div>
      </div>

      <div className="mr-4 flex shrink-0 items-center justify-end gap-6">
        {isUpdatingItem ? (
          <LoadingIcon className="size-4 animate-spin cursor-not-allowed text-neutral-500" />
        ) : (
          <Checkbox checked={item.checked} disabled={isUpdatingItem} className="size-4 sm:size-5" />
        )}
      </div>
    </div>
  )
}
