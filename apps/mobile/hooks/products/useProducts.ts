import { apiClient } from '@/lib/api'
import { authClient } from '@/lib/auth-client'
import { ProductListItem } from '@culyn/shared/schemas'
import { useInfiniteQuery } from '@tanstack/react-query'

const PAGE_SIZE = 20

export function useProducts(params?: { category?: string; brand?: string; q?: string }) {
  const { data: session } = authClient.useSession()

  const query = useInfiniteQuery({
    queryKey: ['v1', 'products', params],
    queryFn: async ({ pageParam = 0 }) => {
      const response = await apiClient().get<ProductListItem[]>('/products', {
        params: { ...params, limit: PAGE_SIZE, offset: pageParam },
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

  const products = query.data?.pages.flat()

  return {
    products,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
    fetchNextPage: query.fetchNextPage,
    hasNextPage: query.hasNextPage,
    isFetchingNextPage: query.isFetchingNextPage,
  }
}
