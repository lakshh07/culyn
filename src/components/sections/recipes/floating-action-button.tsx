import { BookmarkIcon, ChefHatIcon, MinusIcon, PlayIcon, PlusIcon } from '@/components/icons'
import { Button } from '@/components/ui/button'
import { motion } from 'motion/react'
import NumberFlow from '@number-flow/react'
import { FC } from 'react'
import { useRouter } from 'next/navigation'

interface FloatingActionButtonProps {
  slug: string
  servings: number
  setServings: (servings: number) => void
}

export const FloatingActionButton: FC<FloatingActionButtonProps> = ({
  slug,
  servings,
  setServings,
}) => {
  const router = useRouter()

  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      transition={{ duration: 0.3 }}
      className="fixed bottom-6 left-1/2 flex -translate-x-1/2 gap-2 rounded-xl bg-white/80 px-2 py-3 shadow-lg backdrop-blur-sm">
      <div className="flex items-center gap-2">
        <Button
          variant={'ghost'}
          size={'icon-sm'}
          className="active:scale-95"
          onClick={() => setServings(servings - 1)}
          disabled={servings <= 1}>
          <MinusIcon className="size-4" />
        </Button>
        <div className="flex min-w-[100px] items-center gap-1">
          <p className="font-mono">Cooking for</p>
          <NumberFlow value={servings} className="-mt-0.5 font-mono text-base" />
        </div>
        <Button
          variant={'ghost'}
          size={'icon-sm'}
          className="active:scale-95"
          onClick={() => setServings(servings + 1)}>
          <PlusIcon className="size-4" />
        </Button>
      </div>

      <Button variant={'outline'} size={'sm'} className="active:scale-95">
        <BookmarkIcon className="size-4" />
        Save
      </Button>

      <Button variant={'outline'} size={'sm'} className="active:scale-95">
        <PlayIcon className="size-4" />
        Watch
      </Button>

      <Button
        size={'sm'}
        className="active:scale-95"
        onClick={() => router.push(`/recipes/${slug}/cook`)}>
        <ChefHatIcon className="size-4" />
        Cook
      </Button>
    </motion.section>
  )
}
