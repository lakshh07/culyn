import { apiClient } from '@/lib/api';
import { authClient } from '@/lib/auth-client';
import { PlaceListItem } from '@culyn/shared/schemas';
import { useInfiniteQuery } from '@tanstack/react-query';

const PAGE_SIZE = 20;

export function usePlaces(params?: {
  type?: string;
  city?: string;
  q?: string;
}) {
  const { data: session } = authClient.useSession();

  const query = useInfiniteQuery({
    queryKey: ['v1', 'places', params],
    queryFn: async ({ pageParam = 0 }) => {
      const response = await apiClient().get<PlaceListItem[]>('/places', {
        params: { ...params, limit: PAGE_SIZE, offset: pageParam },
      });
      return response.data;
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.length < PAGE_SIZE) return undefined;
      return allPages.flat().length;
    },
    enabled: !!session?.user?.id,
    retry: 1,
  });

  const places = query.data?.pages.flat();

  return {
    places,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
    fetchNextPage: query.fetchNextPage,
    hasNextPage: query.hasNextPage,
    isFetchingNextPage: query.isFetchingNextPage,
  };
}
