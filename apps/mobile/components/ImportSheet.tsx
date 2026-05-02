import { useThemeColors } from '@/constants/useTheme'
import { usePendingImport } from '@/contexts/PendingImportContext'
import { useContentImport } from '@/hooks/content/useContentImport'
import { Feather } from '@expo/vector-icons'
import { isAxiosError } from 'axios'
import * as Clipboard from 'expo-clipboard'
import React, { useEffect, useRef, useState } from 'react'
import {
  ActivityIndicator,
  Animated,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

interface ImportSheetProps {
  visible: boolean
  onClose: () => void
  onShowUpgrade: () => void
}

export function ImportSheet({ visible, onClose, onShowUpgrade }: ImportSheetProps) {
  const colors = useThemeColors()
  const insets = useSafeAreaInsets()
  const { setPendingJobId } = usePendingImport()
  const { importAsync, isImporting } = useContentImport()
  const [url, setUrl] = useState('')
  const [error, setError] = useState<string | null>(null)

  const backdropOpacity = useRef(new Animated.Value(0)).current
  const sheetTranslateY = useRef(new Animated.Value(300)).current

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(backdropOpacity, { toValue: 1, duration: 220, useNativeDriver: true }),
        Animated.timing(sheetTranslateY, { toValue: 0, duration: 260, useNativeDriver: true }),
      ]).start()
    } else {
      backdropOpacity.setValue(0)
      sheetTranslateY.setValue(300)
    }
  }, [visible, backdropOpacity, sheetTranslateY])

  const animateClose = (callback?: () => void) => {
    Animated.parallel([
      Animated.timing(backdropOpacity, { toValue: 0, duration: 200, useNativeDriver: true }),
      Animated.timing(sheetTranslateY, { toValue: 300, duration: 240, useNativeDriver: true }),
    ]).start(() => {
      onClose()
      callback?.()
    })
  }

  const handlePaste = async () => {
    const text = await Clipboard.getStringAsync()
    if (text) setUrl(text)
  }

  const handleAdd = async () => {
    const trimmed = url.trim()
    if (!trimmed) return
    setError(null)

    try {
      const result = await importAsync(trimmed)
      if (result?.jobId) {
        setPendingJobId(result.jobId)
      }
      setUrl('')
      animateClose()
    } catch (err) {
      if (isAxiosError(err) && err.response?.status === 403) {
        animateClose(onShowUpgrade)
      } else {
        setError('Import failed. Please check the URL and try again.')
      }
    }
  }

  const handleClose = () => {
    setUrl('')
    setError(null)
    animateClose()
  }

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={handleClose}>
      <View style={styles.wrapper}>
        <Animated.View
          style={[
            styles.backdrop,
            { backgroundColor: colors.overlayBackdrop, opacity: backdropOpacity },
          ]}>
          <Pressable style={StyleSheet.absoluteFill} onPress={handleClose} />
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
          {/* Drag handle */}
          <View style={styles.handleRow}>
            <View style={[styles.handle, { backgroundColor: colors.border }]} />
          </View>

          {/* Title */}
          <Text style={[styles.title, { color: colors.textPrimary }]}>Add from a link</Text>

          {/* Subtitle */}
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            We currently support Instagram links only. Tap the icon below to paste from clipboard.
          </Text>

          {/* Input */}
          <View
            style={[
              styles.inputContainer,
              {
                backgroundColor: colors.backgroundSecondary,
                borderColor: error ? colors.error : colors.border,
              },
            ]}>
            <TextInput
              style={[styles.input, { color: colors.textPrimary }]}
              placeholder="Paste your link here"
              placeholderTextColor={colors.textMuted}
              value={url}
              onChangeText={text => {
                setUrl(text)
                if (error) setError(null)
              }}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="url"
              editable={!isImporting}
            />
            <TouchableOpacity onPress={handlePaste} style={styles.pasteBtn}>
              <Feather name="clipboard" size={18} color={colors.textMuted} />
            </TouchableOpacity>
          </View>

          {/* Inline error */}
          {error && <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>}

          {/* Buttons */}
          <View style={styles.buttonRow}>
            <TouchableOpacity
              onPress={handleClose}
              style={[styles.cancelBtn, { borderColor: colors.border }]}
              disabled={isImporting}>
              <Text style={[styles.cancelBtnText, { color: colors.textPrimary }]}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleAdd}
              style={[
                styles.addBtn,
                {
                  backgroundColor: url.trim() && !isImporting ? colors.textPrimary : colors.border,
                },
              ]}
              disabled={!url.trim() || isImporting}>
              {isImporting ? (
                <ActivityIndicator size="small" color={colors.background} />
              ) : (
                <Text
                  style={[
                    styles.addBtnText,
                    { color: url.trim() ? colors.background : colors.textMuted },
                  ]}>
                  Add
                </Text>
              )}
            </TouchableOpacity>
          </View>
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
    shadowColor: '#000000',
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
  title: {
    fontSize: 26,
    fontFamily: 'EBGaramond_500Medium',
    lineHeight: 34,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: 'Syne_400Regular',
    lineHeight: 20,
    marginBottom: 20,
  },
  underline: {
    textDecorationLine: 'underline',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 10,
    marginBottom: 8,
  },
  input: {
    flex: 1,
    fontSize: 15,
    fontFamily: 'Syne_400Regular',
  },
  pasteBtn: {
    padding: 4,
  },
  errorText: {
    fontSize: 13,
    fontFamily: 'Syne_400Regular',
    marginBottom: 12,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  cancelBtn: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtnText: {
    fontSize: 15,
    fontFamily: 'Syne_500Medium',
  },
  addBtn: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBtnText: {
    fontSize: 15,
    fontFamily: 'Syne_500Medium',
  },
})
