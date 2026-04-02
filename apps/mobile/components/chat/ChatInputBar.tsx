import { Feather } from '@expo/vector-icons'
import React from 'react'
import { Platform, Pressable, StyleSheet, TextInput, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

interface ChatInputBarProps {
  value: string
  onChangeText: (text: string) => void
  onSend: () => void
  isStreaming: boolean
  placeholder?: string
}

export function ChatInputBar({
  value,
  onChangeText,
  onSend,
  isStreaming,
  placeholder = 'Ask me anything...',
}: ChatInputBarProps) {
  const insets = useSafeAreaInsets()
  const canSend = value.trim().length > 0 && !isStreaming

  const TAB_BAR_HEIGHT = 40
  const bottomPadding = TAB_BAR_HEIGHT + insets.bottom + 20

  return (
    <View style={[styles.wrapper, { paddingBottom: bottomPadding }]}>
      <View style={styles.inputRow}>
        <TextInput
          style={styles.textInput}
          placeholder={isStreaming ? 'Generating...' : placeholder}
          placeholderTextColor="#9CA3AF"
          value={value}
          onChangeText={onChangeText}
          multiline
          maxLength={2000}
          editable={!isStreaming}
          returnKeyType="send"
          blurOnSubmit={false}
        />

        {/* Send / Stop button */}
        {isStreaming ? (
          <Pressable style={styles.stopButton} onPress={onSend}>
            <View style={styles.stopIcon} />
          </Pressable>
        ) : (
          <Pressable
            style={[styles.sendButton, !canSend && styles.sendButtonDisabled]}
            onPress={canSend ? onSend : undefined}
            disabled={!canSend}>
            <Feather name="arrow-up" size={18} color="#FFFFFF" />
          </Pressable>
        )}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: 16,
    paddingTop: 8,
    gap: 6,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    borderRadius: 28,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
    paddingLeft: 14,
    paddingRight: 10,
    paddingVertical: 10,
    gap: 8,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 6,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  iconButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textInput: {
    flex: 1,
    fontSize: 15,
    fontFamily: 'Syne_400Regular',
    color: '#111827',
    marginLeft: 6,
    minHeight: 38,
    maxHeight: 120,
    paddingTop: 8,
    paddingBottom: 8,
    lineHeight: 22,
  },
  sendButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#1C1C1E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.35,
  },
  stopButton: {
    width: 38,
    height: 38,
    borderRadius: 8,
    backgroundColor: '#1C1C1E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stopIcon: {
    width: 14,
    height: 14,
    borderRadius: 2,
    backgroundColor: '#FFFFFF',
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  footerModel: {
    fontSize: 11,
    fontFamily: 'Poppins_400Regular',
    color: '#9CA3AF',
  },
})
