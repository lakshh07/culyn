import { useThemeColors } from '@/constants/useTheme'
import { useProductBySlug } from '@/hooks/products/useProductBySlug'
import { useProductFavorite } from '@/hooks/products/useProductFavorite'
import { Feather } from '@expo/vector-icons'
import * as Haptics from 'expo-haptics'
import { LinearGradient } from 'expo-linear-gradient'
import { useLocalSearchParams, useRouter } from 'expo-router'
import React, { useRef } from 'react'
import {
  Image,
  Linking,
  Pressable,
  Animated as RNAnimated,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import Animated, {
  FadeInLeft,
  FadeInUp,
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'

const HERO_HEIGHT = 400

const getSourceIcon = (sourceType?: string): string => {
  if (!sourceType) return 'link'
  if (sourceType.startsWith('INSTAGRAM')) return 'instagram'
  if (sourceType === 'TIKTOK') return 'video'
  if (sourceType.startsWith('YOUTUBE')) return 'youtube'
  return 'link'
}

export default function ProductDetailScreen() {
  const colors = useThemeColors()
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const { slug } = useLocalSearchParams<{ slug: string }>()
  const { product } = useProductBySlug(slug)
  const { addFavorite, removeFavorite } = useProductFavorite(slug)
  const scrollY = useSharedValue(0)

  const backScale = useRef(new RNAnimated.Value(1)).current
  const heartScale = useRef(new RNAnimated.Value(1)).current

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: event => {
      scrollY.value = event.contentOffset.y
    },
  })

  const heroAnimatedStyle = useAnimatedStyle(() => {
    const translateY = interpolate(
      scrollY.value,
      [-200, 0, HERO_HEIGHT],
      [-100, 0, HERO_HEIGHT * 0.5]
    )
    const scale = interpolate(scrollY.value, [-200, 0], [2, 1], 'clamp')
    return {
      transform: [{ translateY }, { scale }],
    }
  })

  if (!product) return null

  const isFavorited = product.ProductFavorite && product.ProductFavorite.length > 0
  const favoriteId = isFavorited ? product.ProductFavorite[0].id : null

  const handleToggleFavorite = () => {
    if (isFavorited && favoriteId) {
      removeFavorite.mutate(favoriteId)
    } else {
      addFavorite.mutate()
    }
  }

  const handleOpenLink = () => {
    if (product.sourceUrl) Linking.openURL(product.sourceUrl)
  }

  const makePressHandlers = (animValue: RNAnimated.Value, onPress: () => void) => ({
    onPressIn: () =>
      RNAnimated.spring(animValue, {
        toValue: 1.15,
        useNativeDriver: true,
        speed: 20,
        bounciness: 6,
      }).start(),
    onPressOut: () =>
      RNAnimated.spring(animValue, {
        toValue: 1,
        useNativeDriver: true,
        speed: 20,
        bounciness: 6,
      }).start(),
    onPress: () => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
      onPress()
    },
  })

  const features = Array.isArray(product.features) ? product.features : []
  const categoryLabel = product.category.replace(/_/g, ' ').toLowerCase()
  const tags = product.tags || []

  // Parse specifications into key-value pairs
  const specEntries = (() => {
    if (!product.specifications) return []
    try {
      const specs =
        typeof product.specifications === 'string'
          ? JSON.parse(product.specifications)
          : product.specifications
      if (typeof specs === 'object' && !Array.isArray(specs)) {
        return Object.entries(specs).map(([key, value]) => ({
          label: key.replace(/_/g, ' '),
          value: String(value),
        }))
      }
    } catch {}
    return []
  })()

  // Chunk specs into rows of 2
  const specRows: { label: string; value: string }[][] = []
  for (let i = 0; i < specEntries.length; i += 2) {
    specRows.push(specEntries.slice(i, i + 2))
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={['left', 'right']}>
      <LinearGradient
        colors={[colors.gradientStart, colors.gradientEnd]}
        start={{ x: 0, y: 1 }}
        end={{ x: 0, y: 0 }}
        pointerEvents="none"
        style={[styles.gradientOverlay2]}
      />
      <Animated.ScrollView
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={false}>
        {/* Hero Image */}
        <View style={[styles.heroContainer, { backgroundColor: colors.black }]}>
          <Animated.View style={[styles.heroImageWrapper, heroAnimatedStyle]}>
            {product.imageUrl ? (
              <Image source={{ uri: product.imageUrl }} style={styles.heroImage} />
            ) : (
              <View
                style={[styles.heroPlaceholder, { backgroundColor: colors.backgroundSecondary }]}>
                <Feather name="shopping-bag" size={64} color={colors.textMuted} />
              </View>
            )}
          </Animated.View>
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,1)']}
            style={styles.heroGradient}
            pointerEvents="none"
          />
        </View>
        <View style={[styles.contentContainer, { backgroundColor: colors.background }]}>
          {/* Header Info */}
          <Animated.View entering={FadeInUp.delay(100).duration(500)} style={styles.infoContainer}>
            <Text style={[styles.title, { color: colors.textPrimary }]}>{product.name}</Text>

            <View style={styles.metaRow}>
              <View style={[styles.categoryBadge, { backgroundColor: colors.white, shadowColor: colors.black }]}>
                <Text style={[styles.categoryBadgeText, { color: colors.black }]}>{categoryLabel}</Text>
              </View>
              {product.brand && product.brand !== 'Unspecified' && (
                <Text style={[styles.metaText, { color: colors.textSecondary }]}>
                  {product.brand}
                </Text>
              )}
              {(() => {
                const modelNumber =
                  typeof product.modelNumber === 'string'
                    ? product.modelNumber.trim()
                    : product.modelNumber
                const modelNumberLower =
                  typeof modelNumber === 'string' ? modelNumber.toLowerCase() : undefined

                if (!modelNumber) return null
                if (modelNumberLower === 'null' || modelNumberLower === 'undefined') return null

                return (
                  <Text style={[styles.metaText, { color: colors.textMuted }]}>{modelNumber}</Text>
                )
              })()}
            </View>

            {product.description && (
              <Text style={[styles.description, { color: colors.textSecondary }]}>
                {product.description}
              </Text>
            )}
          </Animated.View>

          {/* Source Info */}
          {product.sourceName && (
            <Animated.View entering={FadeInUp.delay(200).duration(500)} style={styles.metaRow}>
              <Feather
                name={getSourceIcon(product.sourceType) as any}
                size={14}
                color={colors.textMuted}
              />
              <Text style={[styles.sourceText, { color: colors.textSecondary }]}>
                By {product.sourceName}
              </Text>
              {product.sourceUrl && (
                <>
                  <Text style={[styles.metaSeparator, { color: colors.textSecondary }]}>·</Text>
                  <Pressable onPress={handleOpenLink} hitSlop={8}>
                    <Text style={[styles.link, { color: colors.textSecondary }]}>
                      Original Link
                    </Text>
                  </Pressable>
                </>
              )}
            </Animated.View>
          )}

          {/* Specifications Grid */}
          {specRows.length > 0 && (
            <Animated.View entering={FadeInUp.delay(300).duration(500)} style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
                Specifications
              </Text>
              <View style={[styles.specGrid, { borderColor: colors.border }]}>
                {specRows.map((row, rowIndex) => (
                  <View key={`row-${rowIndex}`} style={styles.specRow}>
                    {row.map((item, itemIndex) => {
                      const isLastInRow = itemIndex === row.length - 1
                      const isLastRow = rowIndex === specRows.length - 1
                      return (
                        <View
                          key={item.label}
                          style={[
                            styles.specCard,
                            {
                              borderRightWidth: isLastInRow ? 0 : 1,
                              borderBottomWidth: isLastRow ? 0 : 1,
                              borderColor: colors.border,
                              backgroundColor: colors.background,
                            },
                          ]}>
                          <Text style={[styles.specLabel, { color: colors.textMuted }]}>
                            {item.label}
                          </Text>
                          <Text style={[styles.specValue, { color: colors.textPrimary }]}>
                            {item.value}
                          </Text>
                        </View>
                      )
                    })}
                    {row.length === 1 && (
                      <View
                        style={[
                          styles.specCard,
                          {
                            borderRightWidth: 0,
                            borderBottomWidth: 0,
                            borderColor: colors.border,
                            backgroundColor: colors.background,
                          },
                        ]}
                      />
                    )}
                  </View>
                ))}
              </View>
            </Animated.View>
          )}

          {/* Features Checklist */}
          {features.length > 0 && (
            <Animated.View entering={FadeInUp.delay(400).duration(500)} style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Features</Text>
              {features.map((feature: string, index: number) => (
                <Animated.View
                  key={index}
                  entering={FadeInLeft.delay(450 + index * 60)}
                  style={styles.featureRow}>
                  <Feather name="check-circle" size={16} color={colors.primary} />
                  <Text style={[styles.featureText, { color: colors.textPrimary }]}>{feature}</Text>
                </Animated.View>
              ))}
            </Animated.View>
          )}

          {/* Notes */}

          {(() => {
            const notes = typeof product.notes === 'string' ? product.notes.trim() : product.notes
            const notesLower = typeof notes === 'string' ? notes.toLowerCase() : undefined

            if (!notes) return null
            if (notesLower === 'null' || notesLower === 'undefined') return null

            return (
              <Animated.View entering={FadeInUp.delay(500).duration(500)} style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Notes</Text>
                <Text style={[styles.description, { color: colors.textSecondary }]}>{notes}</Text>
              </Animated.View>
            )
          })()}

          {/* Tags */}
          {tags.length > 0 && (
            <Animated.View entering={FadeInUp.delay(550).duration(500)} style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Tags</Text>
              <View style={styles.tagsRow}>
                {tags.map(t => (
                  <View
                    key={t.tag.id}
                    style={[styles.tagChip, { backgroundColor: colors.chipBackground }]}>
                    <Text style={[styles.tagText, { color: colors.chipText }]}>
                      {t.tag.name}
                    </Text>
                  </View>
                ))}
              </View>
            </Animated.View>
          )}
        </View>
      </Animated.ScrollView>

      {/* Back Button */}
      <RNAnimated.View
        style={[styles.buttonContainer, { top: insets.top, transform: [{ scale: backScale }] }]}>
        <Pressable {...makePressHandlers(backScale, () => router.back())} hitSlop={8}>
          <View style={[styles.button, { backgroundColor: colors.white }]}>
            <Image
              source={require('@/assets/icons/back.png')}
              style={styles.icon}
              resizeMode="contain"
            />
          </View>
        </Pressable>
      </RNAnimated.View>

      <RNAnimated.View
        style={[
          styles.topRightButtonContainer,
          { top: insets.top, transform: [{ scale: heartScale }] },
        ]}>
        <Pressable {...makePressHandlers(heartScale, handleToggleFavorite)} hitSlop={8}>
          <View style={[styles.button, { backgroundColor: colors.white }]}>
            <Image
              source={
                isFavorited
                  ? require('@/assets/icons/heart-fill.png')
                  : require('@/assets/icons/heart.png')
              }
              style={styles.icon}
              resizeMode="contain"
            />
          </View>
        </Pressable>
      </RNAnimated.View>

      {/* Glass Footer Bar */}
      {/* <GlassView style={[styles.footer, { backgroundColor: colors.background }]}>
        <Pressable onPress={handleToggleFavorite} hitSlop={8} style={styles.footerAction}>
          {isFavorited ? (
            <HeartFillIcon width={22} height={22} color="#EF4444" />
          ) : (
            <HeartIcon width={22} height={22} />
          )}
        </Pressable>

        <Pressable onPress={handleAskAI} hitSlop={8} style={styles.footerAction}>
          <Feather name="message-circle" size={20} color={colors.textPrimary} />
        </Pressable>

        <Pressable onPress={handleShare} hitSlop={8} style={styles.footerAction}>
          <Feather name="share" size={20} color={colors.textPrimary} />
        </Pressable>

        {(product.purchaseUrl || product.affiliateUrl) && (
          <Pressable onPress={handleBuy} hitSlop={8}>
            <LinearGradient
              colors={[colors.primaryGradientStart, colors.primaryGradientEnd]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.buyButton}>
              <Feather name="external-link" size={16} color="#FFFFFF" />
              <Text style={styles.buyButtonText}>Buy</Text>
            </LinearGradient>
          </Pressable>
        )}
      </GlassView> */}

      {/* Bottom gradient */}
      <LinearGradient
        colors={[colors.gradientStart, colors.gradientEnd]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        pointerEvents="none"
        style={styles.gradientOverlay}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  heroContainer: {
    height: HERO_HEIGHT,
    overflow: 'hidden',
    backgroundColor: '#000000', // overridden inline with colors.black
  },
  heroImageWrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    width: '100%',
    height: HERO_HEIGHT,
  },
  heroImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  heroPlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.5,
    height: HERO_HEIGHT / 4,
  },
  contentContainer: {
    paddingHorizontal: 18,
    paddingTop: 20,
    gap: 28,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    backgroundColor: 'white',
    marginTop: -20,
    overflow: 'hidden',
  },
  infoContainer: {
    gap: 10,
  },
  title: {
    fontSize: 32,
    lineHeight: 34,
    fontFamily: 'EBGaramond_500Medium',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  categoryBadge: {
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
  categoryBadgeText: {
    color: '#000000', // overridden inline with colors.black
    fontSize: 11,
    fontFamily: 'Poppins_400Regular',
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  metaText: {
    fontSize: 14,
    fontFamily: 'Syne_400Regular',
  },
  price: {
    fontSize: 24,
    fontFamily: 'Syne_500Medium',
    lineHeight: 28,
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
    fontFamily: 'Syne_400Regular',
  },
  sourceText: {
    fontSize: 12,
    lineHeight: 14,
    fontFamily: 'Syne_400Regular',
    textDecorationLine: 'underline',
  },
  metaSeparator: {
    fontSize: 12,
    fontFamily: 'Syne_400Regular',
  },
  link: {
    fontSize: 12,
    fontFamily: 'Syne_400Regular',
    textDecorationLine: 'underline',
  },
  section: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Syne_500Medium',
  },
  specGrid: {
    borderWidth: 1,
    borderRadius: 16,
    overflow: 'hidden',
  },
  specRow: {
    flexDirection: 'row',
  },
  specCard: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRightWidth: 1,
    borderBottomWidth: 1,
  },
  specLabel: {
    fontSize: 12,
    lineHeight: 14,
    fontFamily: 'Syne_400Regular',
    marginBottom: 8,
    textTransform: 'capitalize',
  },
  specValue: {
    fontSize: 14,
    lineHeight: 18,
    fontFamily: 'Syne_400Regular',
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    paddingVertical: 2,
  },
  featureText: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'Syne_400Regular',
    lineHeight: 20,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tagChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  tagText: {
    fontSize: 13,
    fontFamily: 'Syne_400Regular',
  },
  backButton: {
    position: 'absolute',
    left: 18,
    zIndex: 9999,
  },
  glassButton: {
    padding: 8,
    borderRadius: 999,
    shadowColor: '#000000',
    shadowOpacity: 0.15,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 8,
  },
  footer: {
    position: 'absolute',
    bottom: 25,
    left: '50%',
    transform: [{ translateX: '-50%' }],
    borderRadius: 9999,
    zIndex: 9996,
    shadowColor: '#000000',
    shadowOpacity: 0.15,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 8,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingLeft: 20,
    paddingRight: 8,
    gap: 20,
  },
  footerAction: {
    padding: 4,
  },
  buyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 9999,
  },
  buyButtonText: {
    color: '#FFFFFF', // white text on gradient button
    fontSize: 14,
    fontFamily: 'Syne_500Medium',
  },
  gradientOverlay: {
    zIndex: 9995,
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 100,
    opacity: 0.5,
    pointerEvents: 'none',
  },
  gradientOverlay2: {
    zIndex: 9995,
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: 100,
    opacity: 0.5,
    pointerEvents: 'none',
  },
  buttonContainer: {
    position: 'absolute',
    left: 18,
    zIndex: 9999,
  },
  topRightButtonContainer: {
    position: 'absolute',
    right: 18,
    zIndex: 9999,
  },
  icon: {
    width: 22,
    height: 22,
  },
  button: {
    width: 40,
    height: 40,
    borderRadius: 15,
    backgroundColor: 'rgba(255, 255, 255, 1)',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000000',
    shadowOpacity: 0.15,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
  },
})
