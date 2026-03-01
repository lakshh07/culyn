import { apiClient } from '@/lib/api'
import { authClient } from '@/lib/auth-client'
import { useMutation, useQueryClient } from '@tanstack/react-query'

export function useProductFavorite(slug: string) {
  const { data: session } = authClient.useSession()
  const queryClient = useQueryClient()

  const addFavorite = useMutation({
    mutationFn: async () => {
      const response = await apiClient().post(`/products/${slug}/favorite`)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['v1', 'products', slug] })
      queryClient.invalidateQueries({ queryKey: ['v1', 'products'] })
    },
  })

  const removeFavorite = useMutation({
    mutationFn: async (favoriteId: string) => {
      await apiClient().delete(`/products/${slug}/favorite/${favoriteId}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['v1', 'products', slug] })
      queryClient.invalidateQueries({ queryKey: ['v1', 'products'] })
    },
  })

  return { addFavorite, removeFavorite }
}
