import { ChatHistorySheet } from '@/components/chat/ChatHistorySheet'
import { ChatInputBar } from '@/components/chat/ChatInputBar'
import { useThemeColors } from '@/constants/useTheme'
import { useChatConversations } from '@/hooks/chat/useChatConversations'
import { authClient } from '@/lib/auth-client'
import { useRouter } from 'expo-router'
import React, { useState } from 'react'
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

const SUGGESTIONS_FULL = [
  {
    label: "Suggest a dinner recipe with what's in my fridge.",
    prompt: "Suggest a dinner recipe with what's in my fridge.",
  },
  {
    label: 'Find a highly-rated restaurant near me to visit.',
    prompt: 'Find a highly-rated restaurant near me to visit.',
  },
  {
    label: 'What kitchen tools should I add to my collection?',
    prompt: 'What kitchen tools should I add to my collection?',
  },
]
const SUGGESTIONS_HALF = [
  { label: "What's in my library?", prompt: 'Show me my saved library.' },
  { label: 'Inspire me tonight.', prompt: 'Give me inspiration for tonight.' },
]

function timeAgo(dateStr: string): string {
  const now = Date.now()
  const diff = now - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs === 1 ? 'an hour' : `${hrs}h`} ago`
  const days = Math.floor(hrs / 24)
  if (days < 7) return `${days === 1 ? 'a day' : `${days} days`} ago`
  const weeks = Math.floor(days / 7)
  if (weeks < 5) return `${weeks === 1 ? 'a week' : `${weeks} weeks`} ago`
  const months = Math.floor(days / 30)
  return `${months === 1 ? 'a month' : `${months} months`} ago`
}

export default function AiChatScreen() {
  const colors = useThemeColors()
  const insets = useSafeAreaInsets()
  const router = useRouter()
  const { data: session } = authClient.useSession()
  const { conversations } = useChatConversations()

  const [historyOpen, setHistoryOpen] = useState(false)
  const [inputText, setInputText] = useState('')

  const firstName = session?.user?.name?.split(' ')[0] ?? 'there'
  const recentChats = conversations?.slice(0, 4) ?? []

  const navigateToChat = (prompt: string) => {
    router.push({ pathname: '/ai-chat/[id]', params: { id: 'new', initialMessage: prompt } })
  }

  const handleSend = () => {
    if (!inputText.trim()) return
    const text = inputText.trim()
    setInputText('')
    navigateToChat(text)
  }

  const handleSelectConversation = (id: string) => {
    router.push({ pathname: '/ai-chat/[id]', params: { id } })
  }

  return (
    <KeyboardAvoidingView
      style={[styles.root, { backgroundColor: colors.backgroundSecondary }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />
      <View style={[styles.body, { paddingTop: insets.top + 48 }]}>
        <View style={styles.greetingBlock}>
          <Text style={[styles.greetingLine1, { color: colors.textPrimary }]}>
            Hey, {firstName}!
          </Text>
          <Text style={[styles.greetingLine2, { color: colors.textPrimary }]}>
            What can I help with?
          </Text>
        </View>

        <Text style={[styles.suggestionsLabel, { color: colors.textMuted }]}>Suggestions</Text>

        {SUGGESTIONS_FULL.map(s => (
          <Pressable
            key={s.label}
            style={({ pressed }) => [
              styles.suggestionChip,
              { backgroundColor: colors.background },
              pressed && { opacity: 0.6 },
            ]}
            onPress={() => navigateToChat(s.prompt)}>
            <Text style={[styles.suggestionText, { color: colors.textPrimary }]}>{s.label}</Text>
          </Pressable>
        ))}

        <View style={styles.halfRow}>
          {SUGGESTIONS_HALF.map(s => (
            <Pressable
              key={s.label}
              style={({ pressed }) => [
                styles.suggestionChip,
                styles.halfChip,
                { backgroundColor: colors.background },
                pressed && { opacity: 0.6 },
              ]}
              onPress={() => navigateToChat(s.prompt)}>
              <Text style={[styles.suggestionText, { color: colors.textPrimary }]}>{s.label}</Text>
            </Pressable>
          ))}
        </View>

        {recentChats.length > 0 && (
          <View style={styles.pastChatsSection}>
            <View style={styles.pastChatsHeader}>
              <Text style={[styles.pastChatsTitle, { color: colors.textMuted }]}>Past Chats</Text>
              <Pressable onPress={() => setHistoryOpen(true)} hitSlop={8}>
                <Text style={[styles.viewAllText, { color: colors.textMuted }]}>View all</Text>
              </Pressable>
            </View>
            {recentChats.map(conv => (
              <Pressable
                key={conv.id}
                onPress={() => handleSelectConversation(conv.id)}
                style={({ pressed }) => [styles.pastChatRow, pressed && { opacity: 0.6 }]}>
                <Text
                  style={[styles.pastChatTitle, { color: colors.textPrimary }]}
                  numberOfLines={1}>
                  {conv.title || 'Untitled'}
                </Text>
                <Text style={[styles.pastChatTime, { color: colors.textMuted }]}>
                  {timeAgo(conv.updatedAt?.toString() ?? conv.createdAt?.toString() ?? '')}
                </Text>
              </Pressable>
            ))}
          </View>
        )}
      </View>

      <ChatInputBar
        value={inputText}
        onChangeText={setInputText}
        onSend={handleSend}
        isStreaming={false}
      />

      <ChatHistorySheet
        visible={historyOpen}
        onClose={() => setHistoryOpen(false)}
        onSelect={handleSelectConversation}
        onNewChat={() => router.push({ pathname: '/ai-chat/[id]', params: { id: 'new' } })}
      />
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  body: {
    flex: 1,
    paddingHorizontal: 24,
  },
  greetingBlock: {
    marginBottom: 36,
  },
  greetingLine1: {
    fontSize: 28,
    fontFamily: 'Syne_600SemiBold',
    lineHeight: 40,
  },
  greetingLine2: {
    fontSize: 28,
    fontFamily: 'Syne_600SemiBold',
    lineHeight: 40,
  },
  suggestionsLabel: {
    fontSize: 13,
    fontFamily: 'Syne_400Regular',
    marginBottom: 12,
  },
  suggestionChip: {
    borderRadius: 28,
    paddingHorizontal: 18,
    paddingVertical: 10,
    marginBottom: 10,
  },
  suggestionText: {
    fontSize: 14,
    fontFamily: 'Syne_400Regular',
    lineHeight: 20,
  },
  halfRow: {
    flexDirection: 'row',
    gap: 10,
  },
  halfChip: {
    flex: 1,
    marginBottom: 0,
  },

  // Past Chats
  pastChatsSection: {
    marginTop: 28,
  },
  pastChatsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  pastChatsTitle: {
    fontSize: 13,
    fontFamily: 'Syne_400Regular',
  },
  viewAllText: {
    fontSize: 13,
    fontFamily: 'Syne_400Regular',
  },
  pastChatRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 28,
    paddingHorizontal: 8,
    marginBottom: 10,
  },
  pastChatTitle: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'Syne_400Regular',
    lineHeight: 20,
  },
  pastChatTime: {
    fontSize: 13,
    fontFamily: 'Syne_400Regular',
  },
})
