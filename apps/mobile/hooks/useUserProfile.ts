import { apiClient } from '@/lib/api';
import { authClient } from '@/lib/auth-client';
import { useQuery } from '@tanstack/react-query';

export interface UserProfile {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  emailVerified: boolean;
  provider: string | null;
  createdAt: string;
  updatedAt: string;
}

export function useUserProfile() {
  const { data: session, isPending: isSessionLoading } =
    authClient.useSession();

  const {
    data: profile,
    isLoading: isProfileLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['v1', 'user', 'profile', session?.user?.id],
    queryFn: async () => {
      const response = await apiClient().get<UserProfile>('/user/profile');
      return response.data;
    },
    enabled: !!session?.user?.id,
  });

  return {
    session,
    profile: profile || session?.user,
    isLoading: isSessionLoading || isProfileLoading,
    error,
    refetch,
  };
}
