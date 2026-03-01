import { apiClient } from '@/lib/api'
import { authClient } from '@/lib/auth-client'
import { ChatConversationWithMessages } from '@culyn/shared/schemas'
import { useQuery } from '@tanstack/react-query'

export function useChatConversation(id: string) {
  const { data: session } = authClient.useSession()

  const data = useQuery({
    queryKey: ['v1', 'chat', 'conversations', id],
    queryFn: async () => {
      const response = await apiClient().get<ChatConversationWithMessages>(
        `/chat/conversations/${id}`
      )
      return response.data
    },
    enabled: !!session?.user?.id && !!id,
    retry: 1,
  })

  return {
    conversation: data.data,
    isLoading: data.isLoading,
    error: data.error,
    refetch: data.refetch,
  }
}
