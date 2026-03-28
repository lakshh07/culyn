import { ClockFillIcon, FireFillIcon } from '@/components/icons'
import { useThemeColors } from '@/constants/useTheme'
import { RecipeListItem } from '@culyn/shared/schemas'
import React, { useRef, useState } from 'react'
import { Animated, Image, Pressable, StyleSheet, Text, View } from 'react-native'

interface RecipeCardProps {
  item: RecipeListItem
  onPress?: () => void
  onHeartPress?: (liked: boolean) => void
}

export function RecipeCard({ item, onPress, onHeartPress }: RecipeCardProps) {
  const colors = useThemeColors()
  const [isLiked, setIsLiked] = useState(item.RecipeFavorite?.length > 0)
  const scale = useRef(new Animated.Value(1)).current
  const heartScale = useRef(new Animated.Value(1)).current

  const handleHeartPress = () => {
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

        {/* Row 1: Title Section */}
        <View style={styles.titleRow}>
          <Text style={[styles.title, { color: colors.textPrimary }]} numberOfLines={2}>
            {item.title}
          </Text>
        </View>

        {/* Row 2: Image Section */}
        <View style={styles.imageRow}>
          <View style={[styles.imageWrapper, { backgroundColor: colors.surface }]}>
            <Image
              source={item.imageUrl ? { uri: item.imageUrl } : require('@/assets/images/logo.png')}
              style={styles.image}
            />
          </View>
        </View>

        {/* Row 3: Footer Section */}
        <View style={styles.footerRow}>
          {item.cookTime && (
            <View style={styles.footerItem}>
              <ClockFillIcon width={14} height={14} />
              <Text style={[styles.credit, { color: colors.textMuted }]}>{item.cookTime} min</Text>
            </View>
          )}
          {item.calories && (
            <View style={styles.footerItem}>
              <FireFillIcon width={14} height={14} />
              <Text style={[styles.credit, { color: colors.textMuted }]}>{item.calories} kcal</Text>
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
    shadowColor: '#000000',
    shadowOpacity: 0.02,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  heartButton: {
    position: 'absolute',
    top: 7,
    right: 7,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.9)', // overridden inline with colors.cardOverlay
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
    width: 170,
    height: 170,
    borderRadius: 75,
    overflow: 'hidden',
    backgroundColor: '#f5f5f5',
    shadowColor: '#000000',
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

  footerRow: {
    height: 29,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  footerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  credit: {
    fontSize: 11,
    fontFamily: 'Poppins_400Regular',
    lineHeight: 14,
    marginTop: 2,
  },
})
