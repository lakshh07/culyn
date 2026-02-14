import { apiClient } from '@/lib/api';
import { authClient } from '@/lib/auth-client';
import { PlaceDetail } from '@culyn/shared/schemas';
import { useQuery } from '@tanstack/react-query';

export function usePlaceBySlug(slug: string) {
  const { data: session } = authClient.useSession();

  const data = useQuery({
    queryKey: ['v1', 'places', slug],
    queryFn: async () => {
      const response = await apiClient().get<PlaceDetail>(`/places/${slug}`);
      return response.data;
    },
    enabled: !!session?.user?.id && !!slug,
    retry: 1,
  });

  return {
    place: data.data,
    isLoading: data.isLoading,
    error: data.error,
    refetch: data.refetch,
  };
}
