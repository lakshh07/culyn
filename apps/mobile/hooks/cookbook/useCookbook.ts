import { apiClient } from '@/lib/api'
import { authClient } from '@/lib/auth-client'
import { CookbookItem } from '@culyn/shared/schemas'
import { useQuery } from '@tanstack/react-query'

export function useCookbook() {
  const { data: session } = authClient.useSession()

  const data = useQuery({
    queryKey: ['v1', 'cookbook'],
    queryFn: async () => {
      const response = await apiClient().get<CookbookItem[]>('/cookbook')
      return response.data
    },
    enabled: !!session?.user?.id,
    retry: 1,
  })

  return {
    cookbook: data.data,
    isLoading: data.isLoading,
    error: data.error,
    refetch: data.refetch,
  }
}
