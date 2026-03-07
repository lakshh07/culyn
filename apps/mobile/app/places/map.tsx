import { BackIcon } from '@/components/icons'
import { useThemeColors } from '@/constants/useTheme'
import { usePlaces } from '@/hooks/places/usePlaces'
import { PlaceListItem } from '@culyn/shared/schemas'
import { Feather } from '@expo/vector-icons'
import { BottomSheet, Host } from '@expo/ui/swift-ui'
import { GlassView } from 'expo-glass-effect'
import { useRouter } from 'expo-router'
import React, { useMemo, useRef, useState } from 'react'
import { Image, Pressable, StyleSheet, Text, View } from 'react-native'
import MapView, { Marker, Region } from 'react-native-maps'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

const DEFAULT_REGION: Region = {
  latitude: 37.78825,
  longitude: -122.4324,
  latitudeDelta: 0.5,
  longitudeDelta: 0.5,
}

function computeBoundingRegion(places: { latitude: number; longitude: number }[]): Region {
  if (places.length === 0) return DEFAULT_REGION
  if (places.length === 1) {
    return {
      latitude: places[0].latitude,
      longitude: places[0].longitude,
      latitudeDelta: 0.02,
      longitudeDelta: 0.02,
    }
  }

  let minLat = places[0].latitude
  let maxLat = places[0].latitude
  let minLng = places[0].longitude
  let maxLng = places[0].longitude

  for (const p of places) {
    minLat = Math.min(minLat, p.latitude)
    maxLat = Math.max(maxLat, p.latitude)
    minLng = Math.min(minLng, p.longitude)
    maxLng = Math.max(maxLng, p.longitude)
  }

  const latDelta = Math.max((maxLat - minLat) * 1.4, 0.02)
  const lngDelta = Math.max((maxLng - minLng) * 1.4, 0.02)

  return {
    latitude: (minLat + maxLat) / 2,
    longitude: (minLng + maxLng) / 2,
    latitudeDelta: latDelta,
    longitudeDelta: lngDelta,
  }
}

export default function PlacesMapScreen() {
  const colors = useThemeColors()
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const mapRef = useRef<MapView>(null)
  const { places } = usePlaces()
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false)
  const [selectedPlace, setSelectedPlace] = useState<PlaceListItem | null>(null)

  const placesWithCoords = useMemo(() => {
    if (!places) return []
    return places.filter(p => p.latitude != null && p.longitude != null) as (PlaceListItem & {
      latitude: number
      longitude: number
    })[]
  }, [places])

  const filteredPlaces = useMemo(() => {
    if (!showFavoritesOnly) return placesWithCoords
    return placesWithCoords.filter(p => p.PlaceFavorite && p.PlaceFavorite.length > 0)
  }, [placesWithCoords, showFavoritesOnly])

  const initialRegion = useMemo(
    () =>
      computeBoundingRegion(
        filteredPlaces.map(p => ({
          latitude: Number(p.latitude),
          longitude: Number(p.longitude),
        }))
      ),
    [filteredPlaces]
  )

  const handleMarkerPress = (place: PlaceListItem) => {
    setSelectedPlace(place)
    if (place.latitude && place.longitude) {
      mapRef.current?.animateToRegion(
        {
          latitude: Number(place.latitude),
          longitude: Number(place.longitude),
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        },
        300
      )
    }
  }

  const handleRecenter = () => {
    const region = computeBoundingRegion(
      filteredPlaces.map(p => ({
        latitude: Number(p.latitude),
        longitude: Number(p.longitude),
      }))
    )
    mapRef.current?.animateToRegion(region, 300)
  }

  const typeLabel = (type: string) => type.replace(/_/g, ' ').toLowerCase()

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={initialRegion}
        showsUserLocation={true}>
        {filteredPlaces.map(place => (
          <Marker
            key={place.id}
            coordinate={{
              latitude: Number(place.latitude),
              longitude: Number(place.longitude),
            }}
            pinColor={colors.categoryPlace}
            onPress={() => handleMarkerPress(place)}
          />
        ))}
      </MapView>

      {/* Back button */}
      <Pressable
        style={[styles.backButton, { top: insets.top + 8 }]}
        onPress={() => router.back()}
        hitSlop={8}>
        <GlassView
          isInteractive={true}
          style={[styles.glassButton, { backgroundColor: colors.background }]}>
          <BackIcon width={22} height={22} />
        </GlassView>
      </Pressable>

      {/* Filter toggle + count */}
      <View style={[styles.filterContainer, { top: insets.top + 8 }]}>
        <Pressable
          onPress={() => setShowFavoritesOnly(!showFavoritesOnly)}
          style={[
            styles.filterPill,
            {
              backgroundColor: showFavoritesOnly ? colors.categoryPlace : colors.background,
            },
          ]}>
          <Feather
            name={showFavoritesOnly ? 'heart' : 'map-pin'}
            size={14}
            color={showFavoritesOnly ? '#FFFFFF' : colors.textPrimary}
          />
          <Text
            style={[
              styles.filterText,
              {
                color: showFavoritesOnly ? '#FFFFFF' : colors.textPrimary,
              },
            ]}>
            {showFavoritesOnly ? 'Favorites' : 'All Places'}
          </Text>
        </Pressable>
        <Text style={[styles.countText, { color: colors.textSecondary }]}>
          {filteredPlaces.length} place{filteredPlaces.length !== 1 ? 's' : ''}
        </Text>
      </View>

      {/* Re-center button */}
      <Pressable
        style={[styles.recenterButton, { bottom: insets.bottom + 24 }]}
        onPress={handleRecenter}>
        <GlassView
          isInteractive={true}
          style={[styles.glassButton, { backgroundColor: colors.background }]}>
          <Feather name="crosshair" size={20} color={colors.textPrimary} />
        </GlassView>
      </Pressable>

      {/* Bottom Sheet for selected place */}
      <Host style={styles.sheetHost}>
        <BottomSheet
          isPresented={!!selectedPlace}
          onIsPresentedChange={isPresented => {
            if (!isPresented) setSelectedPlace(null)
          }}>
          {selectedPlace && (
            <View style={[styles.sheetContent, { backgroundColor: colors.background }]}>
              <View style={styles.sheetRow}>
                {selectedPlace.imageUrl ? (
                  <Image source={{ uri: selectedPlace.imageUrl }} style={styles.sheetImage} />
                ) : (
                  <View
                    style={[
                      styles.sheetImagePlaceholder,
                      { backgroundColor: colors.backgroundSecondary },
                    ]}>
                    <Feather name="map-pin" size={24} color={colors.textMuted} />
                  </View>
                )}
                <View style={styles.sheetInfo}>
                  <Text style={[styles.sheetName, { color: colors.textPrimary }]} numberOfLines={2}>
                    {selectedPlace.name}
                  </Text>
                  <View style={styles.sheetMeta}>
                    <View
                      style={[styles.sheetTypeBadge, { backgroundColor: colors.categoryPlace }]}>
                      <Text style={styles.sheetTypeBadgeText}>{typeLabel(selectedPlace.type)}</Text>
                    </View>
                    {selectedPlace.cuisine && (
                      <Text style={[styles.sheetCuisine, { color: colors.textSecondary }]}>
                        {selectedPlace.cuisine}
                      </Text>
                    )}
                  </View>
                  {selectedPlace.rating != null && (
                    <View style={styles.sheetRating}>
                      <Feather name="star" size={13} color="#FBBF24" />
                      <Text style={[styles.sheetRatingText, { color: colors.textPrimary }]}>
                        {Number(selectedPlace.rating).toFixed(1)}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
              <Pressable
                onPress={() => {
                  setSelectedPlace(null)
                  router.push({
                    pathname: '/places/[slug]',
                    params: { slug: selectedPlace.slug },
                  })
                }}
                style={[styles.viewDetailsButton, { backgroundColor: colors.categoryPlace }]}>
                <Text style={styles.viewDetailsText}>View Details</Text>
                <Feather name="chevron-right" size={16} color="#FFFFFF" />
              </Pressable>
            </View>
          )}
        </BottomSheet>
      </Host>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  backButton: {
    position: 'absolute',
    left: 18,
    zIndex: 10,
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
  filterContainer: {
    position: 'absolute',
    right: 18,
    zIndex: 10,
    alignItems: 'flex-end',
    gap: 4,
  },
  filterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  filterText: {
    fontSize: 13,
    fontFamily: 'Syne_500Medium',
  },
  countText: {
    fontSize: 12,
    fontFamily: 'Syne_400Regular',
    paddingRight: 4,
  },
  recenterButton: {
    position: 'absolute',
    right: 18,
    zIndex: 10,
  },
  sheetHost: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  sheetContent: {
    padding: 20,
    gap: 16,
  },
  sheetRow: {
    flexDirection: 'row',
    gap: 14,
  },
  sheetImage: {
    width: 72,
    height: 72,
    borderRadius: 12,
  },
  sheetImagePlaceholder: {
    width: 72,
    height: 72,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sheetInfo: {
    flex: 1,
    gap: 6,
  },
  sheetName: {
    fontSize: 18,
    fontFamily: 'EBGaramond_500Medium',
    lineHeight: 22,
  },
  sheetMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sheetTypeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  sheetTypeBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontFamily: 'Poppins_400Regular',
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  sheetCuisine: {
    fontSize: 13,
    fontFamily: 'Syne_400Regular',
  },
  sheetRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  sheetRatingText: {
    fontSize: 13,
    fontFamily: 'Syne_500Medium',
  },
  viewDetailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 14,
    borderRadius: 12,
  },
  viewDetailsText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontFamily: 'Syne_500Medium',
  },
})
