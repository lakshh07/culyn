import {
  BookmarkIcon,
  ChefHatIcon,
  LoadingIcon,
  MinusIcon,
  PlayIcon,
  PauseIcon,
  PlusIcon,
} from '@/components/icons'
import { Button } from '@/components/ui/button'
import { motion } from 'motion/react'
import NumberFlow from '@number-flow/react'
import { FC, RefObject } from 'react'
import { useRouter } from 'next/navigation'
import { Api } from '@/lib/api'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { ClientErrorHandler } from '@/lib/errors'
import { VideoPlayerRef } from '@/components/ui/video-player'

interface FloatingActionButtonProps {
  slug: string
  servings: number
  setServings: (servings: number) => void
  recipeCookbookIds: string[]
  videoPlayerRef?: RefObject<VideoPlayerRef | null>
  videoState?: { isPlaying: boolean; isExpanded: boolean }
  hasVideo: boolean
}

export const FloatingActionButton: FC<FloatingActionButtonProps> = ({
  slug,
  servings,
  setServings,
  recipeCookbookIds,
  videoPlayerRef,
  videoState,
  hasVideo,
}) => {
  const router = useRouter()
  const queryClient = useQueryClient()

  const handleVideoToggle = () => {
    if (videoPlayerRef?.current) {
      videoPlayerRef.current.togglePlay()
    }
  }

  const { mutate: addToCookbook, isPending: isAddingToCookbook } = useMutation({
    mutationFn: async () => {
      await Api.v1.post(`/recipes/${slug}/cookbook`)
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
      await Api.v1.delete(`/recipes/${slug}/cookbook/${recipeCookbookIds[0]}`)
    },
    onSuccess: () => {
      toast.success('Recipe removed from cookbook')
      queryClient.invalidateQueries({ queryKey: ['v1', 'recipes'] })
      queryClient.invalidateQueries({ queryKey: ['v1', 'cookbook'] })
    },
    onError: error => new ClientErrorHandler().toast().handle(error),
  })

  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      transition={{ duration: 0.3 }}
      className="fixed bottom-4 left-1/2 flex -translate-x-1/2 gap-2 rounded-xl bg-white/70 px-2 py-2 shadow-lg backdrop-blur-xs sm:bottom-6 lg:py-3">
      <div className="flex items-center gap-2">
        <Button
          variant={'ghost'}
          size={'icon-sm'}
          className="active:scale-95"
          onClick={() => setServings(servings - 1)}
          disabled={servings <= 1}>
          <MinusIcon className="size-3.5 lg:size-4" />
        </Button>
        <div className="flex min-w-[86px] items-center gap-1 text-sm lg:min-w-[100px] lg:text-base">
          <p className="font-mono">Cooking for</p>
          <NumberFlow value={servings} className="-mt-0.5 font-mono" />
        </div>
        <Button
          variant={'ghost'}
          size={'icon-sm'}
          className="active:scale-95"
          onClick={() => setServings(servings + 1)}>
          <PlusIcon className="size-3.5 lg:size-4" />
        </Button>
      </div>

      <Button
        variant={'outline'}
        size={'sm'}
        className="text-xs active:scale-95 lg:text-sm"
        disabled={isAddingToCookbook || isRemovingFromCookbook}
        onClick={() => (recipeCookbookIds.length > 0 ? removeFromCookbook() : addToCookbook())}>
        {isAddingToCookbook || isRemovingFromCookbook ? (
          <LoadingIcon className="size-3.5 animate-spin lg:size-4" />
        ) : recipeCookbookIds.length > 0 ? (
          <BookmarkIcon className="size-3.5 fill-neutral-900 lg:size-4" />
        ) : (
          <BookmarkIcon className="size-3.5 lg:size-4" />
        )}
        <span className="hidden sm:inline">{recipeCookbookIds.length > 0 ? 'Saved' : 'Save'}</span>
      </Button>

      {hasVideo && videoPlayerRef && (
        <Button
          variant={'outline'}
          size={'sm'}
          className="text-xs active:scale-95 lg:text-sm"
          onClick={handleVideoToggle}>
          {videoState?.isPlaying ? (
            <>
              <PauseIcon className="size-3.5 lg:size-4" />
              <span className="hidden sm:inline">Pause</span>
            </>
          ) : (
            <>
              <PlayIcon className="size-3.5 lg:size-4" />
              <span className="hidden sm:inline">Watch</span>
            </>
          )}
        </Button>
      )}

      <Button
        size={'sm'}
        className="text-xs active:scale-95 lg:text-sm"
        onClick={() => router.push(`/recipes/${slug}/cook?servings=${servings}`)}>
        <ChefHatIcon className="size-3.5 lg:size-4" />
        Cook
      </Button>
    </motion.section>
  )
}
