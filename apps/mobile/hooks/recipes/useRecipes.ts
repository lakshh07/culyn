import { apiClient } from '@/lib/api';
import { authClient } from '@/lib/auth-client';
import { RecipeListItem } from '@culyn/shared/schemas';
import { useQuery } from '@tanstack/react-query';

export function useRecipes() {
  const { data: session } = authClient.useSession();

  const data = useQuery({
    queryKey: ['v1', 'recipes'],
    queryFn: async () => {
      const response = await apiClient().get<RecipeListItem[]>('/recipes');
      return response.data;
    },
    enabled: !!session?.user?.id, // Only fetch when user is authenticated
    retry: 1,
  });

  return {
    recipes: data.data,
    isLoading: data.isLoading,
    error: data.error,
    refetch: data.refetch,
  };
}
