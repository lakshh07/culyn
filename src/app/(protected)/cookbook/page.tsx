'use client'

import { EllipsisIcon, LoadingIcon, TrashIcon } from '@/components/icons'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Skeleton } from '@/components/ui/skeleton'
import { useBatchJobs } from '@/hooks/use-batch-jobs'
import { Api } from '@/lib/api'
import { ClientErrorHandler } from '@/lib/errors'
import { getCurrentDate } from '@/lib/utils'
import { RecipeCookbook } from '@/types/recipes'
import { Job } from '@/generated/prisma/client'
import { JobStatus } from '@/generated/prisma/enums'
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { FC, useEffect, useState } from 'react'
import { toast } from 'sonner'
import { motion } from 'motion/react'
import { CircularProgress } from '@/components/ui/circular-progress'

export default function CookbookPage() {
  const [isInitialLoad, setIsInitialLoad] = useState(true)
  const { data: cookbook, isPending: isPendingCookbook } = useQuery({
    queryKey: ['v1', 'cookbook'],
    queryFn: async () => {
      const response = await Api.v1.get<RecipeCookbook[]>('/cookbook')
      return response.data
    },
    placeholderData: keepPreviousData,
  })

  const jobIds = cookbook?.map(cb => cb.recipe.metadata?.jobId).filter(Boolean) || []

  const { jobsMap } = useBatchJobs(jobIds, !!cookbook)

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
                <h1>Welcome back,</h1>
                <h1>It&apos;s {getCurrentDate()}.</h1>
              </motion.div>
              <motion.p
                className="text-neutral-500"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6, ease: 'easeOut' }}>
                Your recipes are waiting for you.
              </motion.p>
            </motion.div>
          </motion.div>

          <motion.div
            className="mt-20"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.8, ease: 'easeOut' }}>
            {isPendingCookbook ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {Array.from({ length: 6 }).map((_, index) => (
                  <CookbookCardSkeleton key={index} index={index} isInitialLoad={isInitialLoad} />
                ))}
              </div>
            ) : cookbook && cookbook.length > 0 ? (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-3">
                {cookbook.map((cb, index) => {
                  const jobId = cb.recipe.metadata?.jobId
                  const job = jobId ? jobsMap[jobId] : null
                  return (
                    <motion.div
                      key={cb.id}
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
                        delay: (isInitialLoad ? 1 : 0) + index * 0.05,
                        ease: 'easeOut',
                      }}>
                      <CookbookCard
                        cookbook={cb}
                        job={job}
                        index={index}
                        isInitialLoad={isInitialLoad}
                      />
                    </motion.div>
                  )
                })}
              </div>
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
                    src="/assets/misc/empty-book.png"
                    alt="No recipes found"
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
                  No recipes in your cookbook yet
                </motion.p>
                <motion.p
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.3, delay: 0.5, ease: 'easeOut' }}
                  className="font-mono text-xs text-neutral-500 lg:text-sm">
                  Start adding recipes to your cookbook!
                </motion.p>
              </motion.div>
            )}
          </motion.div>

          {cookbook && cookbook.length > 0 && (
            <motion.section
              className="mx-auto my-28 flex max-w-md flex-col items-center justify-center gap-2"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.2, ease: 'easeOut' }}>
              <motion.h1
                className="font-mono text-base font-semibold sm:text-lg lg:text-xl xl:text-2xl"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 1.4, ease: 'easeOut' }}>
                Save upto 12 recipes
              </motion.h1>
              <motion.p
                className="text-center font-mono text-xs font-medium tracking-wide text-neutral-500 sm:text-sm xl:text-base"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 1.5, ease: 'easeOut' }}>
                you have {cookbook?.length} recipes saved. Upgrade to Culina Pro to save unlimited
                recipes and access to all features.
              </motion.p>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 1.6, ease: 'easeOut' }}>
                <Button variant="default" size="sm" className="mt-4">
                  Try Culina Pro
                </Button>
              </motion.div>
            </motion.section>
          )}
        </div>
      </div>
    </section>
  )
}

interface CookbookCardProps {
  cookbook: RecipeCookbook
  job: Job | null
  index: number
  isInitialLoad: boolean
}

const CookbookCard: FC<CookbookCardProps> = ({ cookbook, job }) => {
  const queryClient = useQueryClient()
  const router = useRouter()

  const { mutate: removeFromCookbook, isPending: isRemovingFromCookbook } = useMutation({
    mutationFn: async ({ slug, cookbookId }: { slug: string; cookbookId: string }) => {
      await Api.v1.delete(`/recipes/${slug}/cookbook/${cookbookId}`)
    },
    onSuccess: () => {
      toast.success('Recipe removed from cookbook')
      queryClient.invalidateQueries({ queryKey: ['v1', 'recipes'] })
      queryClient.invalidateQueries({ queryKey: ['v1', 'cookbook'] })
    },
    onError: error => new ClientErrorHandler().toast().handle(error),
  })

  return (
    <motion.div
      key={cookbook.id}
      whileHover={{
        scale: 1.01,
        transition: { duration: 0.2, ease: 'easeOut' },
      }}
      whileTap={{
        scale: 0.98,
        transition: { duration: 0.1, ease: 'easeOut' },
      }}
      onClick={() => router.push(`/recipes/${cookbook.recipe.slug}`)}
      className="relative grid min-h-[120px] cursor-pointer grid-cols-[100px_1fr] items-center gap-4 rounded-lg bg-neutral-100 p-4 select-none hover:shadow-md sm:min-h-[1350x] lg:min-h-[150px]">
      <div className="pointer-events-none mx-auto flex size-24 items-center justify-center overflow-hidden rounded-full border border-neutral-200 bg-white transition-transform duration-300 select-none group-hover:scale-105">
        {cookbook.recipe.imageUrl && !job ? (
          <Image
            src={cookbook.recipe.imageUrl}
            alt={cookbook.recipe.title ?? ''}
            width={640}
            height={640}
            className="size-24 scale-115 object-cover"
          />
        ) : (
          renderJobImageStatus(job)
        )}
      </div>

      <div className="flex flex-col gap-1">
        <h2 className="font-mono text-base font-medium lg:text-lg">
          {job
            ? 'Cooking...'
            : (cookbook.recipe.shortTitle ?? cookbook.recipe.title ?? 'Cooking...')}
        </h2>
        <div className="flex flex-col items-start gap-1 lg:flex-row lg:items-center lg:gap-2">
          {cookbook.recipe.sourceName && cookbook.recipe.cookTime && !job ? (
            <>
              <p className="max-w-[120px] truncate font-mono text-xs text-neutral-500 sm:text-sm">
                By: @{cookbook.recipe.sourceName}
              </p>
              <span className="hidden text-neutral-400 lg:block">•</span>
              <p className="font-mono text-xs text-neutral-500 sm:text-sm">
                {cookbook.recipe.cookTime} mins cooking time
              </p>
            </>
          ) : (
            renderJobDetailsStatus(job)
          )}
        </div>
      </div>

      {cookbook.recipe.sourceName && cookbook.recipe.cookTime && !job && (
        <div className={'absolute top-2 right-2'}>
          <DropdownMenu>
            <DropdownMenuTrigger
              onClick={e => e.stopPropagation()}
              className="cursor-pointer rounded-full p-1 hover:bg-neutral-200 focus-visible:outline-none">
              <EllipsisIcon className="size-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem
                variant="destructive"
                disabled={isRemovingFromCookbook}
                onClick={() =>
                  removeFromCookbook({
                    slug: cookbook.recipe.slug,
                    cookbookId: cookbook.id,
                  })
                }>
                {isRemovingFromCookbook ? (
                  <LoadingIcon className="size-4 animate-spin" />
                ) : (
                  <TrashIcon className="size-4" />
                )}
                Remove
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
    </motion.div>
  )
}

const CookbookCardSkeleton = ({
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
      className="relative grid min-h-[150px] grid-cols-[100px_1fr] items-center gap-3 rounded-lg bg-neutral-100 p-4">
      <div className="mx-auto flex items-center justify-center overflow-hidden rounded-full border border-neutral-200">
        <Skeleton className="size-20 rounded-full bg-white" />
      </div>

      <div className="flex flex-col gap-2">
        <Skeleton className="h-6 w-3/4 bg-white" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-20 bg-white" />
          <span className="text-neutral-400">•</span>
          <Skeleton className="h-4 w-24 bg-white" />
        </div>
      </div>

      <div className="absolute top-2 right-2">
        <Skeleton className="size-6 rounded-full bg-white" />
      </div>
    </motion.div>
  )
}

// Helper function to render job status in image area
const renderJobImageStatus = (job: Job | null) => {
  if (!job) return <div className="font-mono text-xs text-neutral-400">No image</div>

  switch (job.status) {
    case JobStatus.PENDING:
    case JobStatus.QUEUED:
      return <div className="font-mono text-xs text-neutral-500">Queued</div>
    case JobStatus.RUNNING:
    case JobStatus.COMPLETED:
      return <CircularProgress progress={job.progress ?? 0} />
    case JobStatus.FAILED:
      return <div className="font-mono text-xs text-red-500">Failed</div>
    case JobStatus.CANCELLED:
      return <div className="font-mono text-xs text-neutral-400">Cancelled</div>
    default:
      return <div className="font-mono text-xs text-neutral-400">No image</div>
  }
}

// Helper function to render job status in details area
const renderJobDetailsStatus = (job: Job | null) => {
  if (!job)
    return <div className="font-mono text-sm text-neutral-400">Recipe details loading...</div>

  switch (job.status) {
    case JobStatus.PENDING:
    case JobStatus.QUEUED:
      return <div className="font-mono text-sm text-neutral-500">Preparing recipe generation</div>
    case JobStatus.RUNNING:
    case JobStatus.COMPLETED:
      return <div className="font-mono text-sm text-neutral-500">Usually takes 2-3 minutes</div>
    case JobStatus.FAILED:
      return (
        <div
          className="font-mono text-sm text-red-500"
          title={(job.errorData as string) || 'Unknown error'}>
          Generation failed -{' '}
          {job.errorData ? String(job.errorData).slice(0, 30) + '...' : 'Unknown error'}
        </div>
      )
    case JobStatus.CANCELLED:
      return <div className="font-mono text-sm text-neutral-400">Generation cancelled</div>
    default:
      return <div className="font-mono text-sm text-neutral-400">Recipe details loading...</div>
  }
}
