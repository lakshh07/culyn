import { apiClient } from '@/lib/api'
import { authClient } from '@/lib/auth-client'
import { useMutation, useQueryClient } from '@tanstack/react-query'

export function usePlaceFavorite(slug: string) {
  const { data: session } = authClient.useSession()
  const queryClient = useQueryClient()

  const addFavorite = useMutation({
    mutationFn: async () => {
      const response = await apiClient().post(`/places/${slug}/favorite`)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['v1', 'places', slug] })
      queryClient.invalidateQueries({ queryKey: ['v1', 'places'] })
    },
  })

  const removeFavorite = useMutation({
    mutationFn: async (favoriteId: string) => {
      await apiClient().delete(`/places/${slug}/favorite/${favoriteId}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['v1', 'places', slug] })
      queryClient.invalidateQueries({ queryKey: ['v1', 'places'] })
    },
  })

  return { addFavorite, removeFavorite }
}
