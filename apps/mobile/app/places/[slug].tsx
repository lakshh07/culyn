import { BackIcon, HeartFillIcon, HeartIcon } from '@/components/icons'
import { useThemeColors } from '@/constants/useTheme'
import { usePlaceBySlug } from '@/hooks/places/usePlaceBySlug'
import { usePlaceFavorite } from '@/hooks/places/usePlaceFavorite'
import { Feather } from '@expo/vector-icons'
import { GlassView } from 'expo-glass-effect'
import { LinearGradient } from 'expo-linear-gradient'
import { useLocalSearchParams, useRouter } from 'expo-router'
import React from 'react'
import { Image, Linking, Platform, Pressable, Share, StyleSheet, Text, View } from 'react-native'
import MapView, { Marker } from 'react-native-maps'
import Animated, {
  FadeInUp,
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'

const HERO_HEIGHT = 380

const getSourceIcon = (sourceType?: string): string => {
  if (!sourceType) return 'link'
  if (sourceType.startsWith('INSTAGRAM')) return 'instagram'
  if (sourceType === 'TIKTOK') return 'video'
  if (sourceType.startsWith('YOUTUBE')) return 'youtube'
  return 'link'
}

export default function PlaceDetailScreen() {
  const colors = useThemeColors()
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const { slug } = useLocalSearchParams<{ slug: string }>()
  const { place } = usePlaceBySlug(slug)
  const { addFavorite, removeFavorite } = usePlaceFavorite(slug)
  const scrollY = useSharedValue(0)

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

  if (!place) return null

  const isFavorited = place.PlaceFavorite && place.PlaceFavorite.length > 0
  const favoriteId = isFavorited ? place.PlaceFavorite[0].id : null

  const handleToggleFavorite = () => {
    if (isFavorited && favoriteId) {
      removeFavorite.mutate(favoriteId)
    } else {
      addFavorite.mutate()
    }
  }

  const handleCall = () => {
    if (place.phoneNumber) Linking.openURL(`tel:${place.phoneNumber}`)
  }

  const handleWebsite = () => {
    if (place.website) Linking.openURL(place.website)
  }

  const handleAskAI = () => {
    router.push({
      pathname: '/chat-detail/[id]',
      params: { id: 'new', contextType: 'PLACE', placeId: place.id },
    })
  }

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out ${place.name}${place.address ? ` at ${place.address}` : ''}`,
      })
    } catch {}
  }

  const handleOpenInMaps = () => {
    if (!place.latitude || !place.longitude) return
    const lat = Number(place.latitude)
    const lng = Number(place.longitude)
    const label = encodeURIComponent(place.name || 'Place')
    const url = Platform.select({
      ios: `maps:0,0?q=${label}@${lat},${lng}`,
      android: `geo:${lat},${lng}?q=${lat},${lng}(${label})`,
    })
    if (url) Linking.openURL(url)
  }

  const handleOpenLink = () => {
    if (place.sourceUrl) Linking.openURL(place.sourceUrl)
  }

  const typeLabel = place.type.replace(/_/g, ' ').toLowerCase()
  const hasCoords = place.latitude && place.longitude
  const lat = Number(place.latitude)
  const lng = Number(place.longitude)

  // Parse hours
  const parsedHours = (() => {
    if (!place.hours) return null
    try {
      const h = typeof place.hours === 'string' ? JSON.parse(place.hours) : place.hours
      if (Array.isArray(h)) {
        return h.map((item: any) => ({
          day: item.day,
          time: item.open && item.close ? `${item.open} - ${item.close}` : 'Closed',
        }))
      }
      if (typeof h === 'object') {
        return Object.entries(h).map(([day, time]) => ({
          day: day.charAt(0).toUpperCase() + day.slice(1),
          time: time as string,
        }))
      }
    } catch {}
    return null
  })()

  const tags = place.tags || []

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={['left', 'right']}>
      <Animated.ScrollView
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={false}>
        {/* Hero Image */}
        <View style={styles.heroContainer}>
          <Animated.View style={[styles.heroImageWrapper, heroAnimatedStyle]}>
            {place.imageUrl ? (
              <Image source={{ uri: place.imageUrl }} style={styles.heroImage} />
            ) : (
              <View
                style={[styles.heroPlaceholder, { backgroundColor: colors.backgroundSecondary }]}>
                <Feather name="map-pin" size={64} color={colors.textMuted} />
              </View>
            )}
          </Animated.View>
          <LinearGradient
            colors={['transparent', 'rgba(255,255,255,1)']}
            style={styles.heroGradient}
            pointerEvents="none"
          />
        </View>

        <View style={styles.contentContainer}>
          {/* Header Info */}
          <Animated.View entering={FadeInUp.delay(100).duration(500)} style={styles.infoContainer}>
            <Text style={[styles.title, { color: colors.textPrimary }]}>{place.name}</Text>

            <View style={styles.metaRow}>
              <View style={[styles.typeBadge]}>
                <Text style={styles.typeBadgeText}>{typeLabel}</Text>
              </View>
              {place.cuisine && (
                <Text style={[styles.metaText, { color: colors.textSecondary }]}>
                  {place.cuisine}
                </Text>
              )}
            </View>

            {place.description && (
              <Text style={[styles.description, { color: colors.textSecondary }]}>
                {place.description}
              </Text>
            )}
          </Animated.View>

          {/* Source Info */}
          {place.sourceName && (
            <Animated.View entering={FadeInUp.delay(200).duration(500)} style={styles.metaRow}>
              <Feather
                name={getSourceIcon(place.sourceType) as any}
                size={14}
                color={colors.textMuted}
              />
              <Text style={[styles.sourceText, { color: colors.textSecondary }]}>
                By {place.sourceName}
              </Text>
              {place.sourceUrl && (
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

          {/* Location with Embedded Map */}
          {(hasCoords || place.address || place.city) && (
            <Animated.View entering={FadeInUp.delay(300).duration(500)} style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Location</Text>

              {hasCoords && (
                <View style={styles.mapContainer}>
                  <MapView
                    style={styles.embeddedMap}
                    initialRegion={{
                      latitude: lat,
                      longitude: lng,
                      latitudeDelta: 0.01,
                      longitudeDelta: 0.01,
                    }}
                    scrollEnabled={false}
                    zoomEnabled={false}
                    rotateEnabled={false}
                    pitchEnabled={false}>
                    <Marker
                      coordinate={{ latitude: lat, longitude: lng }}
                      pinColor={colors.categoryPlace}
                    />
                  </MapView>
                  <Pressable
                    style={[styles.openMapsButton, { backgroundColor: colors.categoryPlace }]}
                    onPress={handleOpenInMaps}>
                    <Feather name="navigation" size={14} color="#FFFFFF" />
                    <Text style={styles.openMapsText}>Open in Maps</Text>
                  </Pressable>
                </View>
              )}

              {(place.address || place.city) && (
                <View
                  style={[styles.locationCard, { backgroundColor: colors.backgroundSecondary }]}>
                  <Feather name="map-pin" size={18} color={colors.categoryPlace} />
                  <View style={styles.locationTextContainer}>
                    {place.address && (
                      <Text style={[styles.locationAddress, { color: colors.textPrimary }]}>
                        {place.address}
                      </Text>
                    )}
                    <Text style={[styles.locationCity, { color: colors.textSecondary }]}>
                      {[place.city, place.state, place.country].filter(Boolean).join(', ')}
                    </Text>
                  </View>
                </View>
              )}
            </Animated.View>
          )}

          {/* Hours */}
          {parsedHours && parsedHours.length > 0 && (
            <Animated.View entering={FadeInUp.delay(400).duration(500)} style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Hours</Text>
              <View style={[styles.hoursCard, { backgroundColor: colors.backgroundSecondary }]}>
                {parsedHours.map((h, index) => (
                  <View key={index} style={styles.hoursRow}>
                    <Text style={[styles.hoursDay, { color: colors.textPrimary }]}>{h.day}</Text>
                    <Text style={[styles.hoursTime, { color: colors.textSecondary }]}>
                      {h.time}
                    </Text>
                  </View>
                ))}
              </View>
            </Animated.View>
          )}

          {/* Contact */}
          {(place.phoneNumber || place.website) && (
            <Animated.View entering={FadeInUp.delay(500).duration(500)} style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Contact</Text>
              <View style={styles.contactRow}>
                {place.phoneNumber && (
                  <Pressable
                    onPress={handleCall}
                    style={[styles.contactButton, { backgroundColor: colors.backgroundSecondary }]}>
                    <Feather name="phone" size={18} color={colors.categoryPlace} />
                    <Text style={[styles.contactText, { color: colors.textPrimary }]}>Call</Text>
                  </Pressable>
                )}
                {place.website && (
                  <Pressable
                    onPress={handleWebsite}
                    style={[styles.contactButton, { backgroundColor: colors.backgroundSecondary }]}>
                    <Feather name="globe" size={18} color={colors.categoryPlace} />
                    <Text style={[styles.contactText, { color: colors.textPrimary }]}>Website</Text>
                  </Pressable>
                )}
              </View>
            </Animated.View>
          )}

          {/* Notes */}
          {place.notes && (
            <Animated.View entering={FadeInUp.delay(550).duration(500)} style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Notes</Text>
              <Text style={[styles.description, { color: colors.textSecondary }]}>
                {place.notes}
              </Text>
            </Animated.View>
          )}

          {/* Tags */}
          {tags.length > 0 && (
            <Animated.View entering={FadeInUp.delay(600).duration(500)} style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Tags</Text>
              <View style={styles.tagsRow}>
                {tags.map(t => (
                  <View
                    key={t.tag.id}
                    style={[styles.tagChip, { backgroundColor: colors.categoryPlaceSoft }]}>
                    <Text style={[styles.tagText, { color: colors.categoryPlace }]}>
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
      <Pressable
        style={[styles.backButton, { top: insets.top }]}
        onPress={() => router.back()}
        hitSlop={8}>
        <GlassView
          isInteractive={true}
          style={[styles.glassButton, { backgroundColor: colors.background }]}>
          <BackIcon width={22} height={22} />
        </GlassView>
      </Pressable>

      {/* Glass Footer Bar */}
      <GlassView style={[styles.footer, { backgroundColor: colors.background }]}>
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

        {hasCoords && (
          <Pressable onPress={handleOpenInMaps} hitSlop={8}>
            <LinearGradient
              colors={[colors.primaryGradientStart, colors.primaryGradientEnd]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.directionsButton}>
              <Feather name="navigation" size={16} color="#FFFFFF" />
              <Text style={styles.directionsText}>Directions</Text>
            </LinearGradient>
          </Pressable>
        )}
      </GlassView>

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
    backgroundColor: '#000',
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
    height: HERO_HEIGHT / 3,
  },
  contentContainer: {
    paddingHorizontal: 18,
    paddingTop: 20,
    gap: 28,
  },
  infoContainer: {
    gap: 12,
  },
  title: {
    fontSize: 32,
    lineHeight: 34,
    fontFamily: 'EBGaramond_500Medium',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flexWrap: 'wrap',
  },
  typeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    backgroundColor: 'rgba(255, 255, 255, 1)',
  },
  typeBadgeText: {
    color: '#000',
    fontSize: 11,
    fontFamily: 'Poppins_400Regular',
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  metaText: {
    fontSize: 14,
    fontFamily: 'Syne_400Regular',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  ratingText: {
    fontSize: 15,
    fontFamily: 'Syne_500Medium',
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
    fontFamily: 'Syne_400Regular',
  },
  sourceText: {
    fontSize: 12,
    fontFamily: 'Syne_400Regular',
    textDecorationLine: 'underline',
  },
  metaSeparator: {
    fontSize: 12,
    lineHeight: 14,
    fontFamily: 'Syne_400Regular',
  },
  link: {
    fontSize: 12,
    lineHeight: 14,
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
  mapContainer: {
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
  },
  embeddedMap: {
    width: '100%',
    height: 180,
  },
  openMapsButton: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  openMapsText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontFamily: 'Syne_500Medium',
  },
  locationCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  locationTextContainer: {
    flex: 1,
    gap: 4,
  },
  locationAddress: {
    fontSize: 14,
    fontFamily: 'Syne_400Regular',
    lineHeight: 20,
  },
  locationCity: {
    fontSize: 13,
    fontFamily: 'Poppins_400Regular',
  },
  hoursCard: {
    borderRadius: 12,
    padding: 16,
    gap: 8,
  },
  hoursRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  hoursDay: {
    fontSize: 14,
    fontFamily: 'Syne_500Medium',
    textTransform: 'capitalize',
  },
  hoursTime: {
    fontSize: 14,
    fontFamily: 'Syne_400Regular',
  },
  contactRow: {
    flexDirection: 'row',
    gap: 12,
  },
  contactButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
  },
  contactText: {
    fontSize: 15,
    fontFamily: 'Syne_500Medium',
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
    shadowColor: '#000',
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
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 8,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 14,
    gap: 16,
  },
  footerAction: {
    padding: 4,
  },
  directionsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 9999,
  },
  directionsText: {
    color: '#FFFFFF',
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
    pointerEvents: 'none',
  },
})
