import { BackIcon, HeartIcon } from '@/components/icons';
import { useThemeColors } from '@/constants/useTheme';
import { useProductBySlug } from '@/hooks/products/useProductBySlug';
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

export default function ProductDetailScreen() {
  const colors = useThemeColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { product } = useProductBySlug(slug);

  if (!product) return null;

  const formattedPrice =
    product.price != null
      ? new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: product.currency || 'USD',
        }).format(Number(product.price))
      : null;

  const handleBuy = () => {
    const url = product.affiliateUrl || product.purchaseUrl;
    if (url) Linking.openURL(url);
  };

  const handleAskAI = () => {
    router.push({
      pathname: '/chat-detail/[id]',
      params: { id: 'new', contextType: 'PRODUCT', productId: product.id },
    });
  };

  const features = Array.isArray(product.features) ? product.features : [];
  const categoryLabel = product.category.replace(/_/g, ' ').toLowerCase();

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: colors.background }]}
      edges={['left', 'right']}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {product.imageUrl ? (
          <Image source={{ uri: product.imageUrl }} style={styles.heroImage} />
        ) : (
          <View
            style={[
              styles.heroPlaceholder,
              { backgroundColor: colors.backgroundSecondary },
            ]}
          >
            <Feather name='shopping-bag' size={64} color={colors.textMuted} />
          </View>
        )}

        <View style={styles.contentContainer}>
          <View style={styles.infoContainer}>
            <Text style={[styles.title, { color: colors.textPrimary }]}>
              {product.name}
            </Text>

            <View style={styles.metaRow}>
              <View
                style={[
                  styles.categoryBadge,
                  { backgroundColor: colors.categoryProduct },
                ]}
              >
                <Text style={styles.categoryBadgeText}>{categoryLabel}</Text>
              </View>
              {product.brand && (
                <Text
                  style={[styles.metaText, { color: colors.textSecondary }]}
                >
                  {product.brand}
                </Text>
              )}
            </View>

            {formattedPrice && (
              <Text style={[styles.price, { color: colors.textPrimary }]}>
                {formattedPrice}
              </Text>
            )}

            {product.description && (
              <Text
                style={[styles.description, { color: colors.textSecondary }]}
              >
                {product.description}
              </Text>
            )}
          </View>

          {features.length > 0 && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
                Features
              </Text>
              {features.map((feature: string, index: number) => (
                <View key={index} style={styles.featureRow}>
                  <Feather name='check' size={16} color={colors.success} />
                  <Text
                    style={[styles.featureText, { color: colors.textPrimary }]}
                  >
                    {feature}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {product.notes && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
                Notes
              </Text>
              <Text
                style={[styles.description, { color: colors.textSecondary }]}
              >
                {product.notes}
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

      <View style={styles.bottomBar}>
        {(product.purchaseUrl || product.affiliateUrl) && (
          <Pressable onPress={handleBuy} style={{ flex: 1 }}>
            <LinearGradient
              colors={[
                colors.primaryGradientStart,
                colors.primaryGradientEnd,
              ]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.buyButton}
            >
              <Feather name='external-link' size={18} color='#FFFFFF' />
              <Text style={styles.buyButtonText}>Buy</Text>
            </LinearGradient>
          </Pressable>
        )}
        <Pressable onPress={handleAskAI}>
          <LinearGradient
            colors={[colors.primaryGradientStart, colors.primaryGradientEnd]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.askAiSmall}
          >
            <Feather name='message-circle' size={20} color='#FFFFFF' />
          </LinearGradient>
        </Pressable>
      </View>

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
    paddingBottom: 120,
  },
  heroImage: {
    width: '100%',
    height: 360,
    resizeMode: 'cover',
  },
  heroPlaceholder: {
    width: '100%',
    height: 360,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentContainer: {
    paddingHorizontal: 18,
    paddingTop: 20,
    gap: 28,
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
    gap: 10,
    flexWrap: 'wrap',
  },
  categoryBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  categoryBadgeText: {
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
  section: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Syne_500Medium',
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
  bottomBar: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    right: 20,
    flexDirection: 'row',
    gap: 12,
    zIndex: 9998,
  },
  buyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 9999,
    shadowColor: '#8b5cf6',
    shadowOpacity: 0.4,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
  },
  buyButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Syne_500Medium',
  },
  askAiSmall: {
    width: 50,
    height: 50,
    borderRadius: 9999,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#8b5cf6',
    shadowOpacity: 0.4,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
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
