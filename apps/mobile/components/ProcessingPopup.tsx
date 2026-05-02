import { useThemeColors } from '@/constants/useTheme'
import { usePendingImport } from '@/contexts/PendingImportContext'
import { useJobPolling } from '@/hooks/useJobPolling'
import { useQueryClient } from '@tanstack/react-query'
import React, { useEffect, useRef } from 'react'
import { Animated, StyleSheet, Text, View } from 'react-native'

const SHIMMER_WIDTH = 36

export function ProcessingPopup() {
  const colors = useThemeColors()
  const { pendingJobId, setPendingJobId } = usePendingImport()
  const queryClient = useQueryClient()

  const { result: jobResult, error: jobError } = useJobPolling(pendingJobId ?? undefined)

  const shimmer = useRef(new Animated.Value(0)).current

  useEffect(() => {
    Animated.loop(
      Animated.timing(shimmer, { toValue: 1, duration: 1400, useNativeDriver: true })
    ).start()
  }, [shimmer])

  useEffect(() => {
    if (jobResult?.success) {
      queryClient.invalidateQueries({ queryKey: ['v1', 'library'] })
      setPendingJobId(null)
    }
  }, [jobResult, queryClient, setPendingJobId])

  useEffect(() => {
    if (jobError) setPendingJobId(null)
  }, [jobError, setPendingJobId])

  if (!pendingJobId) return null

  const shimmerX = shimmer.interpolate({
    inputRange: [0, 1],
    outputRange: [-SHIMMER_WIDTH, 96],
  })

  // To make it look like an extension of the tab bar, we use transparent background
  // (relying on the TabBar's container background) and match the text color to the theme.
  return (
    <View style={[styles.pill, { backgroundColor: 'transparent' }]}>
      <Text style={[styles.label, { color: colors.textPrimary }]}>We&apos;re cooking it</Text>
      <View style={[styles.track, { backgroundColor: `${colors.textPrimary}20` }]}>
        <Animated.View
          style={[
            styles.shimmer,
            { backgroundColor: colors.textPrimary, transform: [{ translateX: shimmerX }] },
          ]}
        />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20, // Align with tab bar's 20px horizontal padding
    paddingVertical: 13,
  },
  label: {
    fontSize: 14,
    fontFamily: 'EBGaramond_500Medium',
    letterSpacing: 0.1,
  },
  track: {
    height: 3,
    width: 96,
    borderRadius: 2,
    overflow: 'hidden',
  },
  shimmer: {
    position: 'absolute',
    height: '100%',
    width: SHIMMER_WIDTH,
    borderRadius: 2,
  },
})
