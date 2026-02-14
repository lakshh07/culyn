import { useThemeColors } from '@/constants/useTheme';
import { useContentImport } from '@/hooks/content/useContentImport';
import { useJobPolling } from '@/hooks/useJobPolling';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function AddScreen() {
  const colors = useThemeColors();
  const router = useRouter();
  const [url, setUrl] = useState('');
  const { importAsync, isImporting, jobId, error: importError, reset: resetImport } = useContentImport();
  const { status, progress, result, error: pollError, isPolling, reset: resetPolling } = useJobPolling(jobId);

  const isProcessing = isImporting || isPolling;
  const error = importError || pollError;

  // Navigate when job completes
  useEffect(() => {
    if (result?.success && result.slug) {
      if (result.category === 'RECIPE') {
        router.push({
          pathname: '/recipes/[slug]',
          params: { slug: result.slug },
        });
      } else if (result.category === 'PLACE') {
        router.push({
          pathname: '/places/[slug]',
          params: { slug: result.slug },
        });
      } else if (result.category === 'PRODUCT') {
        router.push({
          pathname: '/products/[slug]',
          params: { slug: result.slug },
        });
      }
    }
  }, [result, router]);

  const handleImport = async () => {
    if (!url.trim()) return;
    resetImport();
    resetPolling();

    try {
      await importAsync(url.trim());
    } catch {
      // Error is captured in the mutation state
    }
  };

  const handleReset = () => {
    resetImport();
    resetPolling();
    setUrl('');
  };

  const getProgressLabel = (): string => {
    if (isImporting) return 'Starting import...';
    if (progress <= 5) return 'Detecting source...';
    if (progress <= 15) return 'Scraping metadata...';
    if (progress <= 30) return 'Downloading media...';
    if (progress <= 45) return 'Uploading to cloud...';
    if (progress <= 55) return 'Classifying content...';
    if (progress <= 60) return 'Creating record...';
    if (progress <= 80) return 'Extracting details with AI...';
    if (progress <= 90) return 'Generating image...';
    return 'Finalizing...';
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={['top', 'left', 'right']}
    >
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.textPrimary }]}>
          Add New
        </Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Import from a link or add manually.
        </Text>
      </View>

      <View style={styles.inputSection}>
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
          Import from URL
        </Text>
        <Text style={[styles.sectionDescription, { color: colors.textMuted }]}>
          Paste an Instagram, TikTok, or YouTube link and we'll automatically
          detect the content type.
        </Text>

        <View
          style={[
            styles.inputContainer,
            {
              backgroundColor: colors.backgroundSecondary,
              borderColor: colors.border,
            },
          ]}
        >
          <Feather name='link' size={18} color={colors.textMuted} />
          <TextInput
            style={[styles.input, { color: colors.textPrimary }]}
            placeholder='Paste a URL...'
            placeholderTextColor={colors.textMuted}
            value={url}
            onChangeText={setUrl}
            autoCapitalize='none'
            autoCorrect={false}
            keyboardType='url'
            editable={!isProcessing}
          />
        </View>

        {error && (
          <View style={styles.errorContainer}>
            <Text style={[styles.errorText, { color: colors.error }]}>
              {typeof error === 'string' ? error : 'Import failed. Please try again.'}
            </Text>
            <Pressable onPress={handleReset}>
              <Text style={[styles.retryText, { color: colors.primary }]}>
                Try again
              </Text>
            </Pressable>
          </View>
        )}

        {isPolling && (
          <View style={styles.progressSection}>
            <View style={[styles.progressBarBg, { backgroundColor: colors.border }]}>
              <View
                style={[
                  styles.progressBarFill,
                  {
                    backgroundColor: colors.primary,
                    width: `${Math.max(progress, 2)}%`,
                  },
                ]}
              />
            </View>
            <Text style={[styles.progressText, { color: colors.textSecondary }]}>
              {getProgressLabel()} ({progress}%)
            </Text>
          </View>
        )}

        <Pressable onPress={handleImport} disabled={isProcessing || !url.trim()}>
          <LinearGradient
            colors={[colors.primaryGradientStart, colors.primaryGradientEnd]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[
              styles.importButton,
              { opacity: isProcessing || !url.trim() ? 0.5 : 1 },
            ]}
          >
            {isProcessing ? (
              <ActivityIndicator size='small' color='#FFFFFF' />
            ) : (
              <>
                <Feather name='download' size={18} color='#FFFFFF' />
                <Text style={styles.importButtonText}>Import</Text>
              </>
            )}
          </LinearGradient>
        </Pressable>
      </View>

      <View style={[styles.divider, { backgroundColor: colors.border }]} />

      <View style={styles.manualSection}>
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
          Or Add Manually
        </Text>

        {[
          {
            label: 'Recipe',
            icon: 'book-open' as const,
            color: colors.categoryRecipe,
          },
          {
            label: 'Place',
            icon: 'map-pin' as const,
            color: colors.categoryPlace,
          },
          {
            label: 'Product',
            icon: 'shopping-bag' as const,
            color: colors.categoryProduct,
          },
        ].map((item) => (
          <Pressable
            key={item.label}
            style={[
              styles.manualOption,
              { backgroundColor: colors.backgroundSecondary },
            ]}
          >
            <View
              style={[
                styles.manualIconContainer,
                { backgroundColor: item.color },
              ]}
            >
              <Feather name={item.icon} size={18} color='#FFFFFF' />
            </View>
            <Text
              style={[styles.manualOptionText, { color: colors.textPrimary }]}
            >
              Add {item.label}
            </Text>
            <Feather
              name='chevron-right'
              size={18}
              color={colors.textMuted}
            />
          </Pressable>
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 24,
    gap: 6,
  },
  title: {
    fontSize: 28,
    lineHeight: 32,
    fontFamily: 'EBGaramond_500Medium',
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 20,
    fontFamily: 'Syne_400Regular',
  },
  inputSection: {
    paddingHorizontal: 20,
    gap: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Syne_500Medium',
  },
  sectionDescription: {
    fontSize: 13,
    fontFamily: 'Syne_400Regular',
    lineHeight: 18,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    fontFamily: 'Syne_400Regular',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  errorText: {
    fontSize: 13,
    fontFamily: 'Syne_400Regular',
    flex: 1,
  },
  retryText: {
    fontSize: 13,
    fontFamily: 'Syne_500Medium',
  },
  progressSection: {
    gap: 6,
  },
  progressBarBg: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    fontFamily: 'Syne_400Regular',
  },
  importButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 4,
  },
  importButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Syne_500Medium',
  },
  divider: {
    height: 1,
    marginHorizontal: 20,
    marginVertical: 28,
  },
  manualSection: {
    paddingHorizontal: 20,
    gap: 12,
  },
  manualOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    gap: 14,
  },
  manualIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  manualOptionText: {
    flex: 1,
    fontSize: 15,
    fontFamily: 'Syne_500Medium',
  },
});
