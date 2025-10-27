import { Card, CardTitle } from '@/components/ui/card';
import { BookmarkIcon } from '@/components/icons';
import { FC } from 'react';
import Image from 'next/image';

interface Recipe {
  id: string;
  title: string;
  author: string;
  image: string;
}

interface RecipeCardProps {
  recipe: Recipe;
}

export const RecipeCard: FC<RecipeCardProps> = ({ recipe }) => {
  return (
    <Card className='group px-5 py-4 rounded-lg relative shadow-none border-none bg-[#f6f6f6] min-h-[300px] flex flex-col justify-between'>
      <div className='flex justify-between items-center'>
        <CardTitle className='font-mono text-sm max-w-[210px]'>
          {recipe.title}
        </CardTitle>

        <div className='flex items-center gap-2 shrink-0 bg-white rounded-full p-1 absolute top-3 right-3 cursor-pointer'>
          <BookmarkIcon className='size-4 text-gray-500' />
        </div>
      </div>
      <div className='flex justify-center items-center rounded-full group-hover:scale-105 transition-transform duration-300 overflow-hidden pointer-events-none select-none'>
        <Image
          src={recipe.image}
          alt={recipe.title}
          width={164}
          height={164}
          className='object-cover rounded-full'
        />
      </div>
      <div>
        <p className='text-xs text-gray-500'>{recipe.author}</p>
      </div>
    </Card>
  );
};
