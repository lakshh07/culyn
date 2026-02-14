import { apiClient } from '@/lib/api';
import { authClient } from '@/lib/auth-client';
import { ContentCategory, UnifiedContentItem } from '@culyn/shared/schemas';
import { useQuery } from '@tanstack/react-query';

export function useLibrary(category?: ContentCategory) {
  const { data: session } = authClient.useSession();

  const data = useQuery({
    queryKey: ['v1', 'library', category],
    queryFn: async () => {
      const response = await apiClient().get<UnifiedContentItem[]>('/library', {
        params: category ? { category } : undefined,
      });
      return response.data;
    },
    enabled: !!session?.user?.id,
    retry: 1,
  });

  return {
    items: data.data,
    isLoading: data.isLoading,
    error: data.error,
    refetch: data.refetch,
  };
}
