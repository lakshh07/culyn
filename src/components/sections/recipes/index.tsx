import { FC } from 'react'
import { RecipeCard } from './recipe-card'

interface Recipe {
  id: string
  title: string
  author: string
  image: string
}

const FAKE_RECIPES: Recipe[] = [
  {
    id: '1',
    title: 'Creamy Mushroom Pasta In A Silky Parmesan Cream Sauce',
    author: '@carlys_cookbook',
    image: '/test.jpg',
  },
  {
    id: '2',
    title: 'Tamarind Prawn Crispy Rice Salad',
    author: '@thehungryhobbit',
    image: '/test.jpg',
  },
  {
    id: '3',
    title: 'Creamy Chipotle Beef Ragu Pasta',
    author: '@recipe_road',
    image: '/test.jpg',
  },
  {
    id: '4',
    title: "Grandma's Spaghetti & Meatballs",
    author: '@aliciamaclaren',
    image: '/test.jpg',
  },
  {
    id: '5',
    title: 'Marry Me Chicken Meatball Soup',
    author: '@amysheppardfood',
    image: '/test.jpg',
  },
  {
    id: '6',
    title: 'Honey Garlic Glazed Salmon',
    author: '@foodie_chef',
    image: '/test.jpg',
  },
  {
    id: '7',
    title: 'Mediterranean Quinoa Bowl',
    author: '@healthy_eats',
    image: '/test.jpg',
  },
  {
    id: '8',
    title: 'Classic Beef Bourguignon',
    author: '@french_kitchen',
    image: '/test.jpg',
  },
]

interface RecipesSectionProps {
  className?: string
  bgColor?: string
}

export const RecipesSection: FC<RecipesSectionProps> = ({ className, bgColor }) => {
  return (
    <section className={className}>
      <div className="grid grid-cols-5 gap-2 px-4">
        {FAKE_RECIPES.map(recipe => (
          <RecipeCard key={recipe.id} recipe={recipe} className={bgColor} />
        ))}
      </div>
    </section>
  )
}
