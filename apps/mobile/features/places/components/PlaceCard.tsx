import { MapIcon } from '@/components/icons'
import { useThemeColors } from '@/constants/useTheme'
import { PlaceListItem } from '@culyn/shared/schemas'
import React, { useRef, useState } from 'react'
import { Animated, Image, Pressable, StyleSheet, Text, View } from 'react-native'

interface PlaceCardProps {
  id: string
  item: PlaceListItem
  onPress?: () => void
  onHeartPress?: (liked: boolean) => void
}

export function PlaceCard({ id, item, onPress, onHeartPress }: PlaceCardProps) {
  const colors = useThemeColors()
  const [isLiked, setIsLiked] = useState(false)
  const scale = useRef(new Animated.Value(1)).current
  const heartScale = useRef(new Animated.Value(1)).current

  const handleHeartPress = (e: any) => {
    setIsLiked(!isLiked)
    onHeartPress?.(!isLiked)
  }

  const handleHeartPressIn = () => {
    Animated.spring(heartScale, {
      toValue: 0.9,
      useNativeDriver: true,
      speed: 20,
      bounciness: 6,
    }).start()
  }

  const handleHeartPressOut = () => {
    Animated.spring(heartScale, {
      toValue: 1,
      useNativeDriver: true,
      speed: 20,
      bounciness: 6,
    }).start()
  }

  const handlePressIn = () => {
    Animated.spring(scale, {
      toValue: 0.95,
      useNativeDriver: true,
      speed: 20,
      bounciness: 4,
    }).start()
  }

  const handlePressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      speed: 20,
      bounciness: 4,
    }).start()
  }

  if (!item) return null

  const typeLabel = item.type?.replace(/_/g, ' ').toLowerCase()

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={styles.container}>
        <View style={styles.imageContainer}>
          {item.imageUrl ? (
            <Image source={{ uri: item.imageUrl }} style={styles.image} />
          ) : (
            <View
              style={[styles.imagePlaceholder, { backgroundColor: colors.backgroundSecondary }]}>
              <MapIcon width={32} height={32} opacity={0.3} />
            </View>
          )}

          <Animated.View
            style={[
              styles.heartButton,
              { backgroundColor: colors.cardOverlay, transform: [{ scale: heartScale }] },
            ]}>
            <Pressable
              onPress={handleHeartPress}
              onPressIn={handleHeartPressIn}
              onPressOut={handleHeartPressOut}
              hitSlop={8}
              style={styles.heartButtonInner}>
              <Image
                source={
                  isLiked
                    ? require('@/assets/icons/heart-fill.png')
                    : require('@/assets/icons/heart.png')
                }
                style={styles.heartIcon}
                resizeMode="contain"
              />
            </Pressable>
          </Animated.View>
        </View>

        <View style={styles.textContainer}>
          <Text style={[styles.name, { color: colors.textPrimary }]} numberOfLines={1}>
            {item.name}
          </Text>

          <View style={styles.metaRow}>
            <View
              style={[
                styles.typeBadge,
                { backgroundColor: colors.white, shadowColor: colors.black },
              ]}>
              <Text style={[styles.typeBadgeText, { color: colors.black }]}>{typeLabel}</Text>
            </View>
            {item.city && (
              <Text style={[styles.cityText, { color: colors.textMuted }]} numberOfLines={1}>
                {item.city}
              </Text>
            )}
          </View>
        </View>
      </Pressable>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginBottom: 8,
  },
  imageContainer: {
    width: '100%',
    aspectRatio: 1,
    position: 'relative',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
    overflow: 'hidden',
    borderRadius: 16,
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 16,
    overflow: 'hidden',
  },
  heartButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'visible',
    elevation: 3,
    zIndex: 10,
  },
  heartButtonInner: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  heartIcon: {
    width: 17,
    height: 17,
  },
  textContainer: {
    paddingTop: 10,
    gap: 6,
  },
  name: {
    fontSize: 14,
    fontFamily: 'Syne_500Medium',
    lineHeight: 20,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 6,
  },
  typeBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    backgroundColor: 'rgba(255, 255, 255, 1)',
  },
  typeBadgeText: {
    color: '#000000',
    fontSize: 9,
    fontFamily: 'Poppins_400Regular',
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  cityText: {
    fontSize: 12,
    fontFamily: 'Syne_400Regular',
    flex: 1,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 13,
    fontFamily: 'Syne_500Medium',
  },
  starIcon: {
    width: 14,
    height: 14,
  },
})
