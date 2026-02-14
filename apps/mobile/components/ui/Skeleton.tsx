import { useThemeColors } from '@/constants/useTheme';
import React, { useEffect } from 'react';
import { StyleSheet, ViewStyle } from 'react-native';
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

interface SkeletonProps {
  width: number | `${number}%`;
  height: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export function Skeleton({
  width,
  height,
  borderRadius = 8,
  style,
}: SkeletonProps) {
  const colors = useThemeColors();
  const shimmer = useSharedValue(0);

  useEffect(() => {
    shimmer.value = withRepeat(
      withTiming(1, { duration: 1200, easing: Easing.ease }),
      -1,
      true
    );
  }, [shimmer]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(shimmer.value, [0, 1], [0.4, 0.8]),
  }));

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          borderRadius,
          backgroundColor: colors.backgroundSecondary,
        },
        animatedStyle,
        style,
      ]}
    />
  );
}

export function ContentCardSkeleton() {
  return (
    <Animated.View style={styles.cardContainer}>
      <Skeleton width='70%' height={16} borderRadius={6} />
      <Skeleton width='40%' height={14} borderRadius={6} />
      <Animated.View style={styles.cardImageContainer}>
        <Skeleton width={160} height={160} borderRadius={80} />
      </Animated.View>
      <Animated.View style={styles.cardFooter}>
        <Skeleton width={50} height={20} borderRadius={8} />
        <Skeleton width={60} height={14} borderRadius={6} />
      </Animated.View>
    </Animated.View>
  );
}

export function PlaceRowSkeleton() {
  return (
    <Animated.View style={styles.rowContainer}>
      <Animated.View style={styles.rowContent}>
        <Skeleton width='65%' height={16} borderRadius={6} />
        <Skeleton width='40%' height={12} borderRadius={4} />
      </Animated.View>
      <Skeleton width={18} height={18} borderRadius={4} />
    </Animated.View>
  );
}

export function ChatRowSkeleton() {
  return (
    <Animated.View style={styles.chatRowContainer}>
      <Animated.View style={styles.chatRowContent}>
        <Animated.View style={styles.chatTitleRow}>
          <Skeleton width='55%' height={16} borderRadius={6} />
          <Skeleton width={50} height={18} borderRadius={6} />
        </Animated.View>
        <Skeleton width='80%' height={13} borderRadius={4} />
      </Animated.View>
      <Skeleton width={18} height={18} borderRadius={4} />
    </Animated.View>
  );
}

export function PlaceCardSkeleton() {
  return (
    <Animated.View style={styles.placeCardContainer}>
      <Skeleton width='100%' height={140} borderRadius={0} />
      <Animated.View style={styles.placeCardText}>
        <Skeleton width='70%' height={16} borderRadius={6} />
        <Skeleton width='50%' height={12} borderRadius={4} />
      </Animated.View>
    </Animated.View>
  );
}

export function DetailHeaderSkeleton() {
  return (
    <Animated.View style={styles.detailContainer}>
      <Skeleton width='100%' height={320} borderRadius={0} />
      <Animated.View style={styles.detailContent}>
        <Skeleton width='80%' height={28} borderRadius={8} />
        <Animated.View style={styles.detailMeta}>
          <Skeleton width={60} height={22} borderRadius={8} />
          <Skeleton width={80} height={16} borderRadius={6} />
        </Animated.View>
        <Skeleton width='100%' height={60} borderRadius={8} />
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    height: 260,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 8,
    gap: 6,
  },
  cardImageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 29,
    marginTop: 8,
  },
  rowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 20,
    gap: 12,
  },
  rowContent: {
    flex: 1,
    gap: 6,
  },
  chatRowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 20,
    gap: 12,
  },
  chatRowContent: {
    flex: 1,
    gap: 8,
  },
  chatTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  placeCardContainer: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  placeCardText: {
    padding: 12,
    gap: 6,
  },
  detailContainer: {
    gap: 0,
  },
  detailContent: {
    paddingHorizontal: 18,
    paddingTop: 20,
    gap: 14,
  },
  detailMeta: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },
});
