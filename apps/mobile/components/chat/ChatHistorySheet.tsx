import { useThemeColors } from '@/constants/useTheme'
import { useChatConversations } from '@/hooks/chat/useChatConversations'
import React, { useEffect, useRef } from 'react'
import { Animated, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

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

interface ChatHistorySheetProps {
  visible: boolean
  onClose: () => void
  onSelect: (id: string) => void
  onNewChat: () => void
}

export function ChatHistorySheet({ visible, onClose, onSelect, onNewChat }: ChatHistorySheetProps) {
  const colors = useThemeColors()
  const insets = useSafeAreaInsets()
  const { conversations } = useChatConversations()

  const backdropOpacity = useRef(new Animated.Value(0)).current
  const sheetTranslateY = useRef(new Animated.Value(500)).current

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(backdropOpacity, { toValue: 1, duration: 220, useNativeDriver: true }),
        Animated.timing(sheetTranslateY, { toValue: 0, duration: 280, useNativeDriver: true }),
      ]).start()
    } else {
      backdropOpacity.setValue(0)
      sheetTranslateY.setValue(500)
    }
  }, [visible, backdropOpacity, sheetTranslateY])

  const animateClose = (callback?: () => void) => {
    Animated.parallel([
      Animated.timing(backdropOpacity, { toValue: 0, duration: 200, useNativeDriver: true }),
      Animated.timing(sheetTranslateY, { toValue: 500, duration: 240, useNativeDriver: true }),
    ]).start(() => {
      onClose()
      callback?.()
    })
  }

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={() => animateClose()}>
      <View style={styles.wrapper}>
        <Animated.View
          style={[
            styles.backdrop,
            { backgroundColor: colors.overlayBackdrop, opacity: backdropOpacity },
          ]}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => animateClose()} />
        </Animated.View>

        <Animated.View
          style={[
            styles.card,
            {
              backgroundColor: colors.background,
              paddingBottom: insets.bottom + 24,
              transform: [{ translateY: sheetTranslateY }],
            },
          ]}>
          {/* Handle */}
          <View style={styles.handleRow}>
            <View style={[styles.handle, { backgroundColor: colors.border }]} />
          </View>

          {/* Header */}
          <View style={styles.sheetHeader}>
            <Text style={[styles.sheetTitle, { color: colors.textPrimary }]}>Chat History</Text>
            <Pressable
              onPress={() => {
                animateClose(onNewChat)
              }}
              style={[styles.newChatBtn, { backgroundColor: colors.backgroundSecondary }]}>
              <Text style={[styles.newChatText, { color: colors.textPrimary }]}>+ New Chat</Text>
            </Pressable>
          </View>

          {/* List */}
          <ScrollView
            style={styles.list}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled">
            {!conversations?.length && (
              <Text style={[styles.emptyText, { color: colors.textMuted }]}>
                No past chats yet.
              </Text>
            )}
            {conversations?.map((conv, i) => (
              <Pressable
                key={conv.id}
                onPress={() => animateClose(() => onSelect(conv.id))}
                style={({ pressed }) => [
                  styles.row,
                  i < conversations.length - 1 && {
                    borderBottomWidth: StyleSheet.hairlineWidth,
                    borderBottomColor: colors.border,
                  },
                  pressed && { opacity: 0.6 },
                ]}>
                <Text style={[styles.rowTitle, { color: colors.textPrimary }]} numberOfLines={1}>
                  {conv.title || 'Untitled'}
                </Text>
                <Text style={[styles.rowTime, { color: colors.textMuted }]}>
                  {timeAgo(conv.updatedAt?.toString() ?? conv.createdAt?.toString() ?? '')}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  card: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 12,
    maxHeight: '75%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 16,
  },
  handleRow: {
    alignItems: 'center',
    marginBottom: 20,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  sheetTitle: {
    fontSize: 22,
    fontFamily: 'EBGaramond_500Medium',
  },
  newChatBtn: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
  },
  newChatText: {
    fontSize: 13,
    fontFamily: 'Syne_500Medium',
  },
  list: {
    flexGrow: 0,
  },
  emptyText: {
    fontSize: 14,
    fontFamily: 'Syne_400Regular',
    paddingVertical: 20,
    textAlign: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    gap: 12,
  },
  rowTitle: {
    flex: 1,
    fontSize: 15,
    fontFamily: 'Syne_400Regular',
  },
  rowTime: {
    fontSize: 13,
    fontFamily: 'Syne_400Regular',
  },
})
