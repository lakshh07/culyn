import { API_BASE_URL } from '@/lib/api';
import { authClient } from '@/lib/auth-client';
import { StreamMessageEvent } from '@culyn/shared/schemas';
import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useState } from 'react';

export function useSendMessage(conversationId: string) {
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamedContent, setStreamedContent] = useState('');
  const queryClient = useQueryClient();

  const sendMessage = useCallback(
    async (content: string) => {
      setIsStreaming(true);
      setStreamedContent('');

      try {
        const cookies = authClient.getCookie();
        const response = await fetch(
          `${API_BASE_URL}/api/v1/chat/conversations/${conversationId}/messages`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              ...(cookies ? { Cookie: cookies } : {}),
            },
            body: JSON.stringify({ content }),
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error: ${response.status}`);
        }

        const reader = response.body?.getReader();
        if (!reader) throw new Error('No response body');

        const decoder = new TextDecoder();
        let buffer = '';
        let fullContent = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (!line.trim()) continue;
            try {
              const event: StreamMessageEvent = JSON.parse(line);
              if (event.type === 'token' && event.content) {
                fullContent += event.content;
                setStreamedContent(fullContent);
              } else if (event.type === 'done') {
                queryClient.invalidateQueries({
                  queryKey: ['v1', 'chat', 'conversations', conversationId],
                });
              } else if (event.type === 'error') {
                throw new Error(event.error || 'Stream error');
              }
            } catch {
              // Skip malformed JSON lines
            }
          }
        }
      } finally {
        setIsStreaming(false);
      }
    },
    [conversationId, queryClient]
  );

  return {
    sendMessage,
    isStreaming,
    streamedContent,
  };
}
