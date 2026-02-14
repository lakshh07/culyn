import { MapIcon } from '@/components/icons';
import { useThemeColors } from '@/constants/useTheme';
import React, { useRef } from 'react';
import {
  Animated,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

interface PlaceCardProps {
  id: string;
  name: string | null;
  imageUrl: string | null;
  city: string | null;
  cuisine: string | null;
  priceRange: string | null;
  type: string;
  onPress?: () => void;
}

export function PlaceCard({
  name,
  imageUrl,
  city,
  cuisine,
  priceRange,
  type,
  onPress,
}: PlaceCardProps) {
  const colors = useThemeColors();
  const scale = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scale, {
      toValue: 0.95,
      useNativeDriver: true,
      speed: 20,
      bounciness: 4,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      speed: 20,
      bounciness: 4,
    }).start();
  };

  const typeLabel = type.replace(/_/g, ' ').toLowerCase();

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[
          styles.container,
          { backgroundColor: colors.cardBackgroundElevated },
        ]}
      >
        <View style={styles.imageContainer}>
          {imageUrl ? (
            <Image source={{ uri: imageUrl }} style={styles.image} />
          ) : (
            <View
              style={[
                styles.imagePlaceholder,
                { backgroundColor: colors.backgroundSecondary },
              ]}
            >
              <MapIcon width={32} height={32} opacity={0.3} />
            </View>
          )}
          <View
            style={[
              styles.typeBadge,
              { backgroundColor: colors.categoryPlace },
            ]}
          >
            <Text style={styles.typeBadgeText}>{typeLabel}</Text>
          </View>
        </View>

        <View style={styles.textContainer}>
          <Text
            style={[styles.name, { color: colors.textPrimary }]}
            numberOfLines={2}
          >
            {name || 'Unnamed Place'}
          </Text>
          <View style={styles.metaRow}>
            {city && (
              <Text style={[styles.meta, { color: colors.textMuted }]}>
                {city}
              </Text>
            )}
            {cuisine && (
              <Text style={[styles.meta, { color: colors.textMuted }]}>
                {city ? ' · ' : ''}
                {cuisine}
              </Text>
            )}
          </View>
          {priceRange && (
            <Text style={[styles.price, { color: colors.textSecondary }]}>
              {priceRange}
            </Text>
          )}
        </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.02,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  imageContainer: {
    width: '100%',
    height: 140,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  typeBadge: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  typeBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontFamily: 'Poppins_400Regular',
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  textContainer: {
    padding: 12,
    gap: 4,
  },
  name: {
    fontSize: 14,
    fontFamily: 'Syne_500Medium',
    lineHeight: 20,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  meta: {
    fontSize: 12,
    fontFamily: 'Poppins_400Regular',
    lineHeight: 16,
  },
  price: {
    fontSize: 12,
    fontFamily: 'Poppins_400Regular',
  },
});
