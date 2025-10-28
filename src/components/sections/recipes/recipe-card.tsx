import { Card, CardTitle } from '@/components/ui/card'
import { BookmarkIcon } from '@/components/icons'
import { FC } from 'react'
import Image from 'next/image'

interface Recipe {
  id: string
  title: string
  author: string
  image: string
}

interface RecipeCardProps {
  recipe: Recipe
}

export const RecipeCard: FC<RecipeCardProps> = ({ recipe }) => {
  return (
    <Card className="group relative flex min-h-[300px] flex-col justify-between rounded-lg border-none bg-[#f6f6f6] px-5 py-4 shadow-none">
      <div className="flex items-center justify-between">
        <CardTitle className="max-w-[210px] font-mono text-sm">{recipe.title}</CardTitle>

        <div className="absolute top-3 right-3 flex shrink-0 cursor-pointer items-center gap-2 rounded-full bg-white p-1">
          <BookmarkIcon className="size-4 text-gray-500" />
        </div>
      </div>
      <div className="pointer-events-none flex items-center justify-center overflow-hidden rounded-full transition-transform duration-300 select-none group-hover:scale-105">
        <Image
          src={recipe.image}
          alt={recipe.title}
          width={164}
          height={164}
          className="rounded-full object-cover"
        />
      </div>
      <div>
        <p className="text-xs text-gray-500">{recipe.author}</p>
      </div>
    </Card>
  )
}
