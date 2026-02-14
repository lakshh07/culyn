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

interface ProductCardProps {
  id: string;
  name: string | null;
  imageUrl: string | null;
  brand: string | null;
  price: number | null;
  currency: string | null;
  category: string;
  onPress?: () => void;
}

export function ProductCard({
  name,
  imageUrl,
  brand,
  price,
  currency,
  category,
  onPress,
}: ProductCardProps) {
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

  const formattedPrice =
    price != null
      ? new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: currency || 'USD',
        }).format(price)
      : null;

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
            />
          )}
          {formattedPrice && (
            <View
              style={[
                styles.priceBadge,
                { backgroundColor: colors.categoryProduct },
              ]}
            >
              <Text style={styles.priceText}>{formattedPrice}</Text>
            </View>
          )}
        </View>

        <View style={styles.textContainer}>
          <Text
            style={[styles.name, { color: colors.textPrimary }]}
            numberOfLines={2}
          >
            {name || 'Unnamed Product'}
          </Text>
          {brand && (
            <Text style={[styles.brand, { color: colors.textMuted }]}>
              {brand}
            </Text>
          )}
          <Text style={[styles.category, { color: colors.textMuted }]}>
            {category.replace(/_/g, ' ').toLowerCase()}
          </Text>
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
  },
  priceBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  priceText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontFamily: 'Poppins_400Regular',
    fontWeight: '600',
  },
  textContainer: {
    padding: 12,
    gap: 2,
  },
  name: {
    fontSize: 14,
    fontFamily: 'Syne_500Medium',
    lineHeight: 20,
  },
  brand: {
    fontSize: 12,
    fontFamily: 'Poppins_400Regular',
    lineHeight: 16,
  },
  category: {
    fontSize: 11,
    fontFamily: 'Poppins_400Regular',
    textTransform: 'capitalize',
  },
});
