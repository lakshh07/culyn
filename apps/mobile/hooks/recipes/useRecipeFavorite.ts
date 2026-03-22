import { apiClient } from '@/lib/api'
import { RecipeDetail } from '@culyn/shared/schemas'
import { useMutation, useQueryClient } from '@tanstack/react-query'

export function useRecipeFavorite(slug: string) {
  const queryClient = useQueryClient()
  const queryKey = ['v1', 'recipes', slug]

  const addFavorite = useMutation({
    mutationFn: async () => {
      const response = await apiClient().post(`/recipes/${slug}/cookbook`)
      return response.data
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey })
      const previous = queryClient.getQueryData<RecipeDetail>(queryKey)
      queryClient.setQueryData<RecipeDetail>(queryKey, old => {
        if (!old) return old
        return {
          ...old,
          RecipeFavorite: [{ id: '__optimistic__' } as RecipeDetail['RecipeFavorite'][number]],
        }
      })
      return { previous }
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) queryClient.setQueryData(queryKey, context.previous)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey })
      queryClient.invalidateQueries({ queryKey: ['v1', 'recipes'] })
    },
  })

  const removeFavorite = useMutation({
    mutationFn: async (cookbookId: string) => {
      await apiClient().delete(`/recipes/${slug}/cookbook/${cookbookId}`)
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey })
      const previous = queryClient.getQueryData<RecipeDetail>(queryKey)
      queryClient.setQueryData<RecipeDetail>(queryKey, old => {
        if (!old) return old
        return { ...old, RecipeFavorite: [] }
      })
      return { previous }
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) queryClient.setQueryData(queryKey, context.previous)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey })
      queryClient.invalidateQueries({ queryKey: ['v1', 'recipes'] })
    },
  })

  return { addFavorite, removeFavorite }
}
