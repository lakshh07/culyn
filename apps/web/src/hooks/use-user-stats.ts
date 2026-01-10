import { Api } from '@/lib/api'
import { useQuery } from '@tanstack/react-query'

export interface UserStats {
  cookbookCount: number
  shoppingListCount: number
}

export const useUserStats = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['v1', 'user', 'stats'],
    queryFn: async () => {
      const response = await Api.v1.get<UserStats>('/user/stats')
      return response.data
    },
    staleTime: 1000 * 60 * 5, // 5 minutes - cache aggressively since counts don't change often
    gcTime: 1000 * 60 * 10, // 10 minutes
    refetchOnWindowFocus: true, // Refetch when user returns to tab
  })

  return {
    stats: data,
    isLoading,
    error,
    cookbookCount: data?.cookbookCount ?? 0,
    shoppingListCount: data?.shoppingListCount ?? 0,
  }
}
