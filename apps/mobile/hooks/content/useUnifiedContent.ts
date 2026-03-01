import { apiClient } from '@/lib/api'
import { authClient } from '@/lib/auth-client'
import {
  ContentCategory,
  PlaceListItem,
  ProductListItem,
  RecipeListItem,
} from '@culyn/shared/schemas'
import { useInfiniteQuery } from '@tanstack/react-query'

const PAGE_SIZE = 20

export interface UnifiedContentFilters {
  [key: string]: string | number | undefined
}

export function useUnifiedContent(
  category: ContentCategory,
  filters?: UnifiedContentFilters | null
) {
  const { data: session } = authClient.useSession()

  const query = useInfiniteQuery({
    queryKey: ['v1', 'unified-content', category, filters],
    queryFn: async ({ pageParam = 0 }) => {
      const extraParams = filters ?? {}

      if (category === 'RECIPE') {
        const response = await apiClient().get<RecipeListItem[]>('/recipes', {
          params: { limit: PAGE_SIZE, offset: pageParam, ...extraParams },
        })
        return response.data
      }

      if (category === 'PLACE') {
        const response = await apiClient().get<PlaceListItem[]>('/places', {
          params: { limit: PAGE_SIZE, offset: pageParam, ...extraParams },
        })
        return response.data
      }

      if (category === 'PRODUCT') {
        const response = await apiClient().get<ProductListItem[]>('/products', {
          params: { limit: PAGE_SIZE, offset: pageParam, ...extraParams },
        })
        return response.data
      }

      return []
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.length < PAGE_SIZE) return undefined
      return allPages.flat().length
    },
    enabled: !!session?.user?.id,
    retry: 1,
  })

  const items = query.data?.pages.flat()

  return {
    items,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
    fetchNextPage: query.fetchNextPage,
    hasNextPage: query.hasNextPage,
    isFetchingNextPage: query.isFetchingNextPage,
  }
}
