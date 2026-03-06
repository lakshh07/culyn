import { Api } from '@/lib/api'
import { RecipeDetail, RecipeListItem } from '@culyn/shared/schemas'
import { useQuery } from '@tanstack/react-query'

export const useRecipes = () => {
  const { data: recipes, isLoading: isLoadingRecipes } = useQuery({
    queryKey: ['v1', 'recipes'],
    queryFn: async () => {
      const response = await Api.v1.get<RecipeListItem[]>('/recipes')
      return response.data
    },
  })

  return { recipes, isLoadingRecipes }
}

export const useRecipeBySlug = (slug: string) => {
  const {
    data: recipe,
    isLoading: isLoadingRecipe,
    error,
  } = useQuery({
    queryKey: ['v1', 'recipes', slug],
    queryFn: async () => {
      const response = await Api.v1.get<RecipeDetail>(`/recipes/${slug}`)
      return response.data
    },
    enabled: !!slug,
  })

  return { recipe, isLoadingRecipe, error }
}
