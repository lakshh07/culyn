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
import { Api } from '@/lib/api'
import { ClientErrorHandler } from '@/lib/errors'
import { getCurrentDate } from '@/lib/utils'
import { RecipeCookbook } from '@/types/recipes'
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { FC } from 'react'
import { toast } from 'sonner'

export default function CookbookPage() {
  const { data: cookbook, isPending: isPendingCookbook } = useQuery({
    queryKey: ['v1', 'cookbook'],
    queryFn: async () => {
      const response = await Api.v1.get<RecipeCookbook[]>('/cookbook')
      return response.data
    },
    placeholderData: keepPreviousData,
  })

  return (
    <section className="min-h-screen">
      <div className="max-w-8xl mx-auto px-4 py-16">
        <div className="relative top-24 space-y-16">
          <div className="space-y-16">
            <div className="space-y-2 text-center font-mono text-3xl font-bold text-neutral-950">
              <h1>
                Welcome back, <span>It&apos;s {getCurrentDate()}.</span>
              </h1>
              <p className="text-neutral-500">Your recipes are waiting for you.</p>
            </div>
            <div className="mx-auto max-w-5xl"></div>
          </div>

          <div className="mt-20">
            {isPendingCookbook ? (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, index) => (
                  <CookbookCardSkeleton key={index} />
                ))}
              </div>
            ) : cookbook && cookbook.length > 0 ? (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {cookbook.map(cb => (
                  <CookbookCard key={cb.id} cookbook={cb} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <p className="font-mono text-lg font-medium text-neutral-600">
                  No recipes in your cookbook yet
                </p>
                <p className="font-mono text-sm text-neutral-500">
                  Start adding recipes to your cookbook!
                </p>
              </div>
            )}
          </div>

          <section className="mx-auto my-28 flex max-w-md flex-col items-center justify-center gap-2">
            <h1 className="font-mono text-2xl font-semibold">Save upto 12 recipes</h1>
            <p className="text-center font-mono font-medium tracking-wide text-neutral-500">
              you have {cookbook?.length} recipes saved. Upgrade to Culina Pro to save unlimited
              recipes and access to all features.
            </p>
            <Button variant="default" size="sm" className="mt-4">
              Try Culina Pro
            </Button>
          </section>
        </div>
      </div>
    </section>
  )
}

interface CookbookCardProps {
  cookbook: RecipeCookbook
}

const CookbookCard: FC<CookbookCardProps> = ({ cookbook }) => {
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
    <div
      key={cookbook.id}
      onClick={() => router.push(`/recipes/${cookbook.recipe.slug}`)}
      className="relative grid min-h-[150px] cursor-pointer grid-cols-[100px_1fr] items-center gap-3 rounded-lg bg-neutral-100 p-4">
      <div className="pointer-events-none mx-auto flex items-center justify-center overflow-hidden rounded-full border border-neutral-200 transition-transform duration-300 select-none group-hover:scale-105">
        <Image
          src={cookbook.recipe.imageUrl ?? ''}
          alt={cookbook.recipe.title ?? ''}
          width={640}
          height={640}
          className="size-20 scale-115 object-cover"
        />
      </div>

      <div className="flex flex-col gap-1">
        <h2 className="font-mono text-lg font-medium">{cookbook.recipe.shortTitle}</h2>
        <div className="flex items-center gap-2">
          <p className="font-mono text-sm text-neutral-500">
            {`By: @${cookbook.recipe.sourceName}`}
          </p>
          <span className="text-neutral-400">•</span>
          <p className="font-mono text-sm text-neutral-500">{`${cookbook.recipe.cookTime} mins cooking time`}</p>
        </div>
      </div>

      <div className="absolute top-2 right-2">
        <DropdownMenu>
          <DropdownMenuTrigger className="cursor-pointer rounded-full p-1 hover:bg-neutral-200 focus-visible:outline-none">
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
    </div>
  )
}

const CookbookCardSkeleton = () => {
  return (
    <div className="relative grid min-h-[150px] grid-cols-[100px_1fr] items-center gap-3 rounded-lg bg-neutral-100 p-4">
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
    </div>
  )
}
