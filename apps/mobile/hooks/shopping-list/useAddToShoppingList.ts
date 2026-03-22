import { apiClient } from '@/lib/api'
import { useMutation, useQueryClient } from '@tanstack/react-query'

export function useAddToShoppingList() {
  const queryClient = useQueryClient()

  const addToList = useMutation({
    mutationFn: async ({
      recipeSlug,
      ingredientIds,
    }: {
      recipeSlug: string
      ingredientIds: string[]
    }) => {
      const response = await apiClient().post('/lists', { recipeSlug, ingredientIds })
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['v1', 'shopping-list'] })
    },
  })

  return { addToList }
}
