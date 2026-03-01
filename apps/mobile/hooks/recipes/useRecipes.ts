import { apiClient } from '@/lib/api'
import { authClient } from '@/lib/auth-client'
import { RecipeListItem } from '@culyn/shared/schemas'
import { useInfiniteQuery } from '@tanstack/react-query'

const PAGE_SIZE = 20

export interface RecipeFilterParams {
  q?: string
  cookTimeMin?: number
  cookTimeMax?: number
  caloriesMin?: number
  caloriesMax?: number
  sortBy?: string
}

export function useRecipes(filters?: RecipeFilterParams) {
  const { data: session } = authClient.useSession()

  const query = useInfiniteQuery({
    queryKey: ['v1', 'recipes', filters],
    queryFn: async ({ pageParam = 0 }) => {
      const response = await apiClient().get<RecipeListItem[]>('/recipes', {
        params: { limit: PAGE_SIZE, offset: pageParam, ...filters },
      })
      return response.data
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.length < PAGE_SIZE) return undefined
      return allPages.flat().length
    },
    enabled: !!session?.user?.id,
    retry: 1,
  })

  const recipes = query.data?.pages.flat()

  return {
    recipes,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
    fetchNextPage: query.fetchNextPage,
    hasNextPage: query.hasNextPage,
    isFetchingNextPage: query.isFetchingNextPage,
  }
}
