import { ClockFillIcon, HeartFillIcon, HeartIcon } from '@/components/icons'
import { useThemeColors } from '@/constants/useTheme'
import { ContentCategory } from '@culyn/shared/schemas'
import React, { useRef, useState } from 'react'
import { Animated, Image, Pressable, StyleSheet, Text, View } from 'react-native'

const CATEGORY_LABELS: Record<ContentCategory, string> = {
  RECIPE: 'Recipe',
  PLACE: 'Place',
  PRODUCT: 'Product',
}

interface UnifiedContentCardProps {
  id: string
  title: string | null
  imageUrl: string | null
  category: ContentCategory
  cookTime?: number | null
  city?: string | null
  brand?: string | null
  price?: number | null
  onPress?: () => void
  onHeartPress?: (liked: boolean) => void
}

export function UnifiedContentCard({
  id,
  title,
  imageUrl,
  category,
  cookTime,
  city,
  brand,
  price,
  onPress,
  onHeartPress,
}: UnifiedContentCardProps) {
  const colors = useThemeColors()
  const [isLiked, setIsLiked] = useState(false)
  const scale = useRef(new Animated.Value(1)).current
  const heartScale = useRef(new Animated.Value(1)).current

  const categoryColor =
    category === 'RECIPE'
      ? colors.categoryRecipe
      : category === 'PLACE'
        ? colors.categoryPlace
        : colors.categoryProduct

  const handleHeartPress = () => {
    setIsLiked(!isLiked)
    onHeartPress?.(!isLiked)
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

  const metaLine =
    category === 'RECIPE' && cookTime
      ? `${cookTime} min`
      : category === 'PLACE' && city
        ? city
        : category === 'PRODUCT' && brand
          ? brand
          : null

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[styles.container, { backgroundColor: colors.cardBackgroundElevated }]}>
        <Animated.View
          style={[
            styles.heartButton,
            { borderColor: colors.backgroundSecondary },
            { transform: [{ scale: heartScale }] },
          ]}>
          <Pressable onPress={handleHeartPress} hitSlop={8} style={styles.heartButtonInner}>
            {isLiked ? (
              <HeartFillIcon width={20} height={20} />
            ) : (
              <HeartIcon width={20} height={20} />
            )}
          </Pressable>
        </Animated.View>

        <View style={styles.titleRow}>
          <Text style={[styles.title, { color: colors.textPrimary }]} numberOfLines={2}>
            {title || 'Untitled'}
          </Text>
        </View>

        <View style={styles.imageRow}>
          <View style={styles.imageWrapper}>
            {imageUrl ? (
              <Image source={{ uri: imageUrl }} style={styles.image} />
            ) : (
              <View
                style={[styles.imagePlaceholder, { backgroundColor: colors.backgroundSecondary }]}
              />
            )}
          </View>
        </View>

        <View style={styles.footerRow}>
          <View style={[styles.categoryBadge, { backgroundColor: categoryColor }]}>
            <Text style={styles.categoryLabel}>{CATEGORY_LABELS[category]}</Text>
          </View>
          {metaLine && (
            <View style={styles.footerItem}>
              {category === 'RECIPE' && <ClockFillIcon width={12} height={12} />}
              <Text style={[styles.metaText, { color: colors.textMuted }]}>{metaLine}</Text>
            </View>
          )}
        </View>
      </Pressable>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 8,
    flexDirection: 'column',
    height: 260,
    shadowColor: '#000',
    shadowOpacity: 0.02,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  heartButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 30,
    height: 30,
    borderRadius: 13,
    borderWidth: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    zIndex: 10,
  },
  heartButtonInner: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleRow: {
    height: 48,
    justifyContent: 'flex-start',
  },
  title: {
    fontSize: 14,
    fontFamily: 'Syne_500Medium',
    lineHeight: 20,
    marginRight: 40,
  },
  imageRow: {
    height: 160,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageWrapper: {
    width: 160,
    height: 160,
    borderRadius: 75,
    overflow: 'hidden',
    backgroundColor: '#f5f5f5',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
  },
  footerRow: {
    height: 29,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  categoryLabel: {
    color: '#FFFFFF',
    fontSize: 10,
    fontFamily: 'Poppins_400Regular',
    fontWeight: '600',
  },
  footerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 11,
    fontFamily: 'Poppins_400Regular',
    lineHeight: 14,
    marginTop: 2,
  },
})
