import { BackIcon, HeartIcon } from '@/components/icons';
import { useThemeColors } from '@/constants/useTheme';
import { usePlaceBySlug } from '@/hooks/places/usePlaceBySlug';
import { Feather } from '@expo/vector-icons';
import { GlassView } from 'expo-glass-effect';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import {
  Image,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';

export default function PlaceDetailScreen() {
  const colors = useThemeColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { place } = usePlaceBySlug(slug);

  if (!place) return null;

  const handleCall = () => {
    if (place.phoneNumber) {
      Linking.openURL(`tel:${place.phoneNumber}`);
    }
  };

  const handleWebsite = () => {
    if (place.website) {
      Linking.openURL(place.website);
    }
  };

  const handleAskAI = () => {
    router.push({
      pathname: '/chat-detail/[id]',
      params: { id: 'new', contextType: 'PLACE', placeId: place.id },
    });
  };

  const typeLabel = place.type.replace(/_/g, ' ').toLowerCase();

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: colors.background }]}
      edges={['left', 'right']}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {place.imageUrl ? (
          <Image source={{ uri: place.imageUrl }} style={styles.heroImage} />
        ) : (
          <View
            style={[
              styles.heroPlaceholder,
              { backgroundColor: colors.backgroundSecondary },
            ]}
          >
            <Feather name='map-pin' size={64} color={colors.textMuted} />
          </View>
        )}

        <View style={styles.contentContainer}>
          <View style={styles.infoContainer}>
            <Text style={[styles.title, { color: colors.textPrimary }]}>
              {place.name}
            </Text>

            <View style={styles.metaRow}>
              <View
                style={[
                  styles.typeBadge,
                  { backgroundColor: colors.categoryPlace },
                ]}
              >
                <Text style={styles.typeBadgeText}>{typeLabel}</Text>
              </View>
              {place.cuisine && (
                <Text style={[styles.metaText, { color: colors.textSecondary }]}>
                  {place.cuisine}
                </Text>
              )}
              {place.priceRange && (
                <Text style={[styles.metaText, { color: colors.textSecondary }]}>
                  {place.priceRange}
                </Text>
              )}
            </View>

            {place.description && (
              <Text style={[styles.description, { color: colors.textSecondary }]}>
                {place.description}
              </Text>
            )}
          </View>

          {(place.address || place.city) && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
                Location
              </Text>
              <View
                style={[
                  styles.locationCard,
                  { backgroundColor: colors.backgroundSecondary },
                ]}
              >
                <Feather name='map-pin' size={18} color={colors.primary} />
                <View style={styles.locationTextContainer}>
                  {place.address && (
                    <Text
                      style={[
                        styles.locationAddress,
                        { color: colors.textPrimary },
                      ]}
                    >
                      {place.address}
                    </Text>
                  )}
                  <Text
                    style={[
                      styles.locationCity,
                      { color: colors.textSecondary },
                    ]}
                  >
                    {[place.city, place.state, place.country]
                      .filter(Boolean)
                      .join(', ')}
                  </Text>
                </View>
              </View>
            </View>
          )}

          {(place.phoneNumber || place.website) && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
                Contact
              </Text>
              <View style={styles.contactRow}>
                {place.phoneNumber && (
                  <Pressable
                    onPress={handleCall}
                    style={[
                      styles.contactButton,
                      { backgroundColor: colors.backgroundSecondary },
                    ]}
                  >
                    <Feather name='phone' size={18} color={colors.primary} />
                    <Text
                      style={[styles.contactText, { color: colors.textPrimary }]}
                    >
                      Call
                    </Text>
                  </Pressable>
                )}
                {place.website && (
                  <Pressable
                    onPress={handleWebsite}
                    style={[
                      styles.contactButton,
                      { backgroundColor: colors.backgroundSecondary },
                    ]}
                  >
                    <Feather name='globe' size={18} color={colors.primary} />
                    <Text
                      style={[styles.contactText, { color: colors.textPrimary }]}
                    >
                      Website
                    </Text>
                  </Pressable>
                )}
              </View>
            </View>
          )}

          {place.notes && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
                Notes
              </Text>
              <Text style={[styles.description, { color: colors.textSecondary }]}>
                {place.notes}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      <Pressable
        style={[styles.backButton, { top: insets.top }]}
        onPress={() => router.back()}
        hitSlop={8}
      >
        <GlassView
          isInteractive={true}
          style={[styles.glassButton, { backgroundColor: colors.background }]}
        >
          <BackIcon width={22} height={22} />
        </GlassView>
      </Pressable>

      <Pressable
        style={[styles.heartButton, { top: insets.top }]}
        hitSlop={8}
      >
        <GlassView
          isInteractive={true}
          style={[styles.glassButton, { backgroundColor: colors.background }]}
        >
          <HeartIcon width={22} height={22} />
        </GlassView>
      </Pressable>

      <Pressable style={styles.askAiButton} onPress={handleAskAI}>
        <LinearGradient
          colors={[colors.primaryGradientStart, colors.primaryGradientEnd]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.askAiGradient}
        >
          <Feather name='message-circle' size={20} color='#FFFFFF' />
          <Text style={styles.askAiText}>Ask AI</Text>
        </LinearGradient>
      </Pressable>

      <LinearGradient
        colors={[colors.gradientStart, colors.gradientEnd]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        pointerEvents='none'
        style={styles.gradientOverlay}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  heroImage: {
    width: '100%',
    height: 320,
    resizeMode: 'cover',
  },
  heroPlaceholder: {
    width: '100%',
    height: 320,
    justifyContent: 'center',
    alignItems: 'center',
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
  },
  typeBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontFamily: 'Poppins_400Regular',
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  metaText: {
    fontSize: 14,
    fontFamily: 'Syne_400Regular',
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
    fontFamily: 'Syne_400Regular',
  },
  section: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 18,
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
  backButton: {
    position: 'absolute',
    left: 18,
    zIndex: 9999,
  },
  heartButton: {
    position: 'absolute',
    right: 18,
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
  askAiButton: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    zIndex: 9998,
  },
  askAiGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderRadius: 9999,
    shadowColor: '#8b5cf6',
    shadowOpacity: 0.4,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
  },
  askAiText: {
    color: '#FFFFFF',
    fontSize: 15,
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
});
