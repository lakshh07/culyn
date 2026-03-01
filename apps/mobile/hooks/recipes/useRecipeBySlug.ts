import { apiClient } from '@/lib/api'
import { authClient } from '@/lib/auth-client'
import { RecipeDetail } from '@culyn/shared/schemas'
import { useQuery } from '@tanstack/react-query'

export function useRecipeBySlug(slug: string) {
  const { data: session } = authClient.useSession()

  const data = useQuery({
    queryKey: ['v1', 'recipes', slug],
    queryFn: async () => {
      const response = await apiClient().get<RecipeDetail>(`/recipes/${slug}`)
      return response.data
    },
    enabled: !!session?.user?.id, // Only fetch when user is authenticated
    retry: 1,
  })

  return {
    recipe: data.data,
    isLoading: data.isLoading,
    error: data.error,
    refetch: data.refetch,
  }
}
