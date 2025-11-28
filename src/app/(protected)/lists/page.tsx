'use client'

import { GroceryList } from '@/types/lists'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { AnimatedShoppingList } from '@/components/sections/lists/animated-shopping-list'
import { Api } from '@/lib/api'
import { motion } from 'motion/react'
import { useEffect, useState } from 'react'
import Image from 'next/image'
import { Skeleton } from '@/components/ui/skeleton'

export default function ListsPage() {
  const [isInitialLoad, setIsInitialLoad] = useState(true)
  const { data: groceryLists, isPending: isPendingLists } = useQuery({
    queryKey: ['v1', 'lists'],
    queryFn: async () => {
      const response = await Api.v1.get<GroceryList[]>('/lists')
      return response.data?.filter(list => !list.deletedAt)
    },
    placeholderData: keepPreviousData,
  })

  useEffect(() => {
    // Set isInitialLoad to false after initial animations complete
    const timer = setTimeout(() => {
      setIsInitialLoad(false)
    }, 2000) // After all initial animations finish

    return () => clearTimeout(timer)
  }, [])

  return (
    <section className="min-h-screen">
      <div className="max-w-8xl mx-auto px-3 py-16 sm:px-4">
        <div className="relative top-24 space-y-16">
          <motion.div
            className="space-y-16"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}>
            <motion.div
              className="space-y-2 font-mono text-sm font-bold text-neutral-950 sm:space-y-1 sm:text-center sm:text-xl lg:space-y-1.5 lg:text-2xl xl:space-y-2 xl:text-3xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2, ease: 'easeOut' }}>
              <motion.div
                className="flex flex-col items-start justify-center sm:flex-row sm:items-center sm:gap-1.5 lg:gap-2"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4, ease: 'easeOut' }}>
                <h1>Shopping List</h1>
              </motion.div>
              <motion.p
                className="text-neutral-500"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6, ease: 'easeOut' }}>
                Manage your shopping list here.
              </motion.p>
            </motion.div>
          </motion.div>

          <motion.div
            className="mt-20"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.7, ease: 'easeOut' }}>
            {isPendingLists ? (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-3">
                {Array.from({ length: 6 }).map((_, index) => (
                  <ShoppingListCardSkeleton
                    key={index}
                    index={index}
                    isInitialLoad={isInitialLoad}
                  />
                ))}
              </div>
            ) : groceryLists && groceryLists.length > 0 ? (
              <AnimatedShoppingList groceryLists={groceryLists} isInitialLoad={isInitialLoad} />
            ) : (
              <motion.div
                className="flex flex-col items-center justify-center py-8 text-center sm:py-0 lg:py-8 xl:py-14"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.3, ease: 'easeOut' }}>
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.3, delay: 0.4, ease: 'easeOut' }}
                  className="mb-6">
                  <Image
                    src="/assets/misc/empty-basket.png"
                    alt="No shopping lists found"
                    width={640}
                    height={640}
                    className="size-28 sm:size-32 lg:size-44 xl:size-48"
                  />
                </motion.div>
                <motion.p
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.3, delay: 0.5, ease: 'easeOut' }}
                  className="font-mono text-base font-medium text-neutral-600 lg:text-lg">
                  No shopping lists yet
                </motion.p>
                <motion.p
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.3, delay: 0.5, ease: 'easeOut' }}
                  className="font-mono text-xs text-neutral-500 lg:text-sm">
                  Create a shopping list from a recipe to get started!
                </motion.p>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  )
}

const ShoppingListCardSkeleton = ({
  index,
  isInitialLoad,
}: {
  index: number
  isInitialLoad: boolean
}) => {
  return (
    <motion.div
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
        delay: (isInitialLoad ? 1.0 : 0) + index * 0.05,
        ease: 'easeOut',
      }}
      className="relative grid min-h-[120px] grid-cols-[1fr_40px] items-center gap-4 rounded-lg bg-neutral-100 p-4 sm:min-h-[120px] lg:min-h-[120px]">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-6 w-3/4 bg-white" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-24 bg-white" />
          <span className="text-neutral-400">•</span>
          <Skeleton className="h-4 w-16 bg-white" />
        </div>
      </div>

      <div className="flex items-center justify-end">
        <Skeleton className="size-8 rounded-full bg-white" />
      </div>
    </motion.div>
  )
}
