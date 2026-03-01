import { apiClient } from '@/lib/api'
import { authClient } from '@/lib/auth-client'
import { ProductDetail } from '@culyn/shared/schemas'
import { useQuery } from '@tanstack/react-query'

export function useProductBySlug(slug: string) {
  const { data: session } = authClient.useSession()

  const data = useQuery({
    queryKey: ['v1', 'products', slug],
    queryFn: async () => {
      const response = await apiClient().get<ProductDetail>(`/products/${slug}`)
      return response.data
    },
    enabled: !!session?.user?.id && !!slug,
    retry: 1,
  })

  return {
    product: data.data,
    isLoading: data.isLoading,
    error: data.error,
    refetch: data.refetch,
  }
}
