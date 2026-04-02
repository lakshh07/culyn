import { ChatInputBar } from '@/components/chat/ChatInputBar'
import { GeneratingDots } from '@/components/chat/Dots'
import { BackIcon } from '@/components/icons'
import { useThemeColors } from '@/constants/useTheme'
import { useChatConversation } from '@/hooks/chat/useChatConversation'
import { useSendMessage } from '@/hooks/chat/useSendMessage'
import { apiClient } from '@/lib/api'
import { ChatMessage } from '@culyn/shared/schemas'
import { Feather } from '@expo/vector-icons'
import { GlassView } from 'expo-glass-effect'
import { useLocalSearchParams, useRouter } from 'expo-router'
import React, { useEffect, useRef, useState } from 'react'
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

export default function AiChatDetailScreen() {
  const colors = useThemeColors()
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const params = useLocalSearchParams<{
    id: string
    contextType?: string
    recipeId?: string
    placeId?: string
    productId?: string
    initialMessage?: string
  }>()

  const [conversationId, setConversationId] = useState(params.id !== 'new' ? params.id : '')
  const [inputText, setInputText] = useState('')
  const initialMessageApplied = useRef(false)
  const [localMessages, setLocalMessages] = useState<ChatMessage[]>([])
  const scrollViewRef = useRef<ScrollView>(null)

  const { conversation, refetch } = useChatConversation(conversationId)
  const { sendMessage, isStreaming, streamedContent } = useSendMessage(conversationId || null)

  useEffect(() => {
    if (params.initialMessage && conversationId && !initialMessageApplied.current) {
      initialMessageApplied.current = true
      setInputText(params.initialMessage)
    }
  }, [params.initialMessage, conversationId])

  useEffect(() => {
    if (params.id === 'new') {
      const createConversation = async () => {
        try {
          const response = await apiClient().post('/chat/conversations', {
            contextType: params.contextType || 'GENERAL',
            ...(params.recipeId && { recipeId: params.recipeId }),
            ...(params.placeId && { placeId: params.placeId }),
            ...(params.productId && { productId: params.productId }),
          })
          setConversationId(response.data.id)
        } catch {
          // Handle error
        }
      }
      createConversation()
    }
  }, [params.id, params.contextType, params.recipeId, params.placeId, params.productId])

  useEffect(() => {
    if (conversation?.messages) {
      setLocalMessages(conversation.messages)
    }
  }, [conversation?.messages])

  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true })
  }, [localMessages, streamedContent])

  const handleSend = async () => {
    if (!inputText.trim() || isStreaming) return

    const userMessage: ChatMessage = {
      id: `temp-${Date.now()}`,
      conversationId,
      role: 'USER',
      content: inputText.trim(),
      model: null,
      tokens: null,
      createdAt: new Date().toISOString(),
    }

    setLocalMessages(prev => [...prev, userMessage])
    const messageText = inputText.trim()
    setInputText('')

    try {
      await sendMessage(messageText)
      refetch()
    } catch {
      // Handle error
    }
  }

  return (
    <View style={[styles.root, { backgroundColor: colors.backgroundSecondary }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <GlassView
            isInteractive={true}
            style={[styles.glassButton, { backgroundColor: colors.surface }]}>
            <BackIcon width={20} height={20} />
          </GlassView>
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]} numberOfLines={1}>
          {conversation?.title || 'New Chat'}
        </Text>
        <View style={{ width: 36 }} />
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={insets.top + 60}>
        {/* Messages */}
        <ScrollView
          ref={scrollViewRef}
          style={styles.flex}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}>
          {localMessages.length === 0 && !isStreaming && (
            <View style={styles.emptyChat}>
              <Feather name="message-circle" size={40} color={colors.textMuted} />
              <Text style={[styles.emptyChatText, { color: colors.textMuted }]}>
                Start a conversation...
              </Text>
            </View>
          )}

          {localMessages.map(msg => {
            const isUser = msg.role === 'USER'
            return (
              <View
                key={msg.id}
                style={[styles.messageBubble, isUser ? styles.userBubble : styles.assistantBubble]}>
                <Text style={[styles.messageText, { color: isUser ? '#FFFFFF' : '#111827' }]}>
                  {msg.content}
                </Text>
              </View>
            )
          })}

          {isStreaming && !streamedContent && (
            <View style={[styles.messageBubble, styles.assistantBubble]}>
              <GeneratingDots />
            </View>
          )}

          {isStreaming && streamedContent && (
            <View style={[styles.messageBubble, styles.assistantBubble]}>
              <Text style={[styles.messageText, { color: '#111827' }]}>{streamedContent}</Text>
            </View>
          )}
        </ScrollView>

        {/* Input bar */}
        <ChatInputBar
          value={inputText}
          onChangeText={setInputText}
          onSend={handleSend}
          isStreaming={isStreaming}
        />
      </KeyboardAvoidingView>
    </View>
  )
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 10,
    gap: 12,
  },
  glassButton: {
    padding: 8,
    borderRadius: 999,
  },
  headerTitle: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Syne_500Medium',
    textAlign: 'center',
  },
  messagesContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
    flexGrow: 1,
  },
  emptyChat: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
    gap: 12,
  },
  emptyChatText: {
    fontSize: 15,
    fontFamily: 'Syne_400Regular',
  },
  messageBubble: {
    maxWidth: '80%',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 18,
    marginVertical: 4,
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: '#1C1C1E',
    borderBottomRightRadius: 4,
  },
  assistantBubble: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 15,
    fontFamily: 'Syne_400Regular',
    lineHeight: 22,
  },
})
