import { ErrorState } from '@/components/ui/ErrorState';
import { ChatRowSkeleton } from '@/components/ui/Skeleton';
import { useThemeColors } from '@/constants/useTheme';
import { useChatConversations } from '@/hooks/chat/useChatConversations';
import { apiClient } from '@/lib/api';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const CONTEXT_BADGES: Record<string, { label: string; color: string }> = {
  RECIPE: { label: 'Recipe', color: '#EF4444' },
  PLACE: { label: 'Place', color: '#14B8A6' },
  PRODUCT: { label: 'Product', color: '#22C55E' },
  GENERAL: { label: 'General', color: '#8B5CF6' },
};

export default function AiChatScreen() {
  const colors = useThemeColors();
  const router = useRouter();
  const { conversations, isLoading, error, refetch } = useChatConversations();

  const handleNewChat = async () => {
    try {
      const response = await apiClient().post('/chat/conversations', {
        contextType: 'GENERAL',
      });
      const conversation = response.data;
      router.push({
        pathname: '/chat-detail/[id]',
        params: { id: conversation.id },
      });
    } catch {
      // Handle error
    }
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={['top', 'left', 'right']}
    >
      <View style={styles.header}>
        <View>
          <Text style={[styles.title, { color: colors.textPrimary }]}>
            Chat
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Ask about recipes, places, or anything.
          </Text>
        </View>
        <Pressable onPress={handleNewChat}>
          <LinearGradient
            colors={[colors.primaryGradientStart, colors.primaryGradientEnd]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.newChatButton}
          >
            <Feather name='plus' size={20} color='#FFFFFF' />
          </LinearGradient>
        </Pressable>
      </View>

      {isLoading ? (
        <View>
          {Array.from({ length: 5 }).map((_, i) => (
            <ChatRowSkeleton key={i} />
          ))}
        </View>
      ) : error ? (
        <ErrorState message='Could not load conversations.' onRetry={refetch} />
      ) : conversations && conversations.length > 0 ? (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
        >
          {conversations.map((conv) => {
            const badge =
              CONTEXT_BADGES[conv.contextType] || CONTEXT_BADGES.GENERAL;
            const lastMessage = (conv as any).lastMessage;

            return (
              <Pressable
                key={conv.id}
                style={[
                  styles.conversationRow,
                  { borderBottomColor: colors.border },
                ]}
                onPress={() =>
                  router.push({
                    pathname: '/chat-detail/[id]',
                    params: { id: conv.id },
                  })
                }
              >
                <View style={styles.conversationInfo}>
                  <View style={styles.conversationTitleRow}>
                    <Text
                      style={[
                        styles.conversationTitle,
                        { color: colors.textPrimary },
                      ]}
                      numberOfLines={1}
                    >
                      {conv.title || 'New Chat'}
                    </Text>
                    <View
                      style={[
                        styles.contextBadge,
                        { backgroundColor: badge.color },
                      ]}
                    >
                      <Text style={styles.contextBadgeText}>{badge.label}</Text>
                    </View>
                  </View>
                  {lastMessage?.content && (
                    <Text
                      style={[
                        styles.conversationPreview,
                        { color: colors.textMuted },
                      ]}
                      numberOfLines={1}
                    >
                      {lastMessage.content}
                    </Text>
                  )}
                </View>
                <Feather
                  name='chevron-right'
                  size={18}
                  color={colors.textMuted}
                />
              </Pressable>
            );
          })}
        </ScrollView>
      ) : (
        <View style={styles.emptyContainer}>
          <Feather name='message-circle' size={48} color={colors.textMuted} />
          <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>
            No conversations yet
          </Text>
          <Text style={[styles.emptySubtitle, { color: colors.textMuted }]}>
            Start a new chat to ask about recipes, places, or products.
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  title: {
    fontSize: 28,
    lineHeight: 32,
    fontFamily: 'EBGaramond_500Medium',
  },
  subtitle: {
    fontSize: 13,
    fontFamily: 'Syne_400Regular',
    marginTop: 4,
  },
  newChatButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingBottom: 86,
  },
  conversationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
  },
  conversationInfo: {
    flex: 1,
    marginRight: 12,
    gap: 4,
  },
  conversationTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  conversationTitle: {
    fontSize: 15,
    fontFamily: 'Syne_500Medium',
    lineHeight: 20,
    flexShrink: 1,
  },
  contextBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  contextBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontFamily: 'Poppins_400Regular',
    fontWeight: '600',
  },
  conversationPreview: {
    fontSize: 13,
    fontFamily: 'Poppins_400Regular',
    lineHeight: 18,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    gap: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontFamily: 'Syne_500Medium',
  },
  emptySubtitle: {
    fontSize: 14,
    fontFamily: 'Syne_400Regular',
    textAlign: 'center',
    lineHeight: 20,
  },
});
