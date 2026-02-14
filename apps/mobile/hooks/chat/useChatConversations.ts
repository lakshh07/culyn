import { apiClient } from '@/lib/api';
import { authClient } from '@/lib/auth-client';
import { ChatConversation } from '@culyn/shared/schemas';
import { useQuery } from '@tanstack/react-query';

type ConversationWithPreview = ChatConversation & {
  lastMessage?: { content: string; createdAt: string } | null;
};

export function useChatConversations() {
  const { data: session } = authClient.useSession();

  const data = useQuery({
    queryKey: ['v1', 'chat', 'conversations'],
    queryFn: async () => {
      const response =
        await apiClient().get<ConversationWithPreview[]>('/chat/conversations');
      return response.data;
    },
    enabled: !!session?.user?.id,
    retry: 1,
  });

  return {
    conversations: data.data,
    isLoading: data.isLoading,
    error: data.error,
    refetch: data.refetch,
  };
}
