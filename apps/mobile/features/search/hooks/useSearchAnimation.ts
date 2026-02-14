import { useCallback } from 'react';
import { Dimensions, Keyboard } from 'react-native';
import {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';

const SCREEN_HEIGHT = Dimensions.get('window').height;
const OPEN_SPRING = { damping: 20, stiffness: 250 };
const CLOSE_SPRING = { damping: 22, stiffness: 200 };

export function useSearchAnimation(onOpenComplete?: () => void) {
  const progress = useSharedValue(0);

  const open = useCallback(() => {
    progress.value = withSpring(1, OPEN_SPRING, (finished) => {
      if (finished && onOpenComplete) {
        runOnJS(onOpenComplete)();
      }
    });
  }, [onOpenComplete]);

  const close = useCallback(() => {
    Keyboard.dismiss();
    progress.value = withSpring(0, CLOSE_SPRING);
  }, []);

  // Dim backdrop over the content behind the overlay
  const backdropStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0, 0.6, 1], [0, 0.3, 0.5]),
    pointerEvents: (progress.value > 0.01 ? 'auto' : 'none') as 'auto' | 'none',
  }));

  // The original HomeHeader fades out as the overlay appears
  const headerFadeStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0, 0.4], [1, 0], Extrapolation.CLAMP),
    transform: [
      {
        scale: interpolate(
          progress.value,
          [0, 0.5],
          [1, 0.97],
          Extrapolation.CLAMP,
        ),
      },
    ],
  }));

  // Overlay panel slides down from behind the header position and expands
  const overlayStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0, 0.2], [0, 1], Extrapolation.CLAMP),
    transform: [
      {
        translateY: interpolate(
          progress.value,
          [0, 1],
          [-40, 0],
          Extrapolation.CLAMP,
        ),
      },
    ],
    pointerEvents: (progress.value > 0.01 ? 'auto' : 'none') as 'auto' | 'none',
  }));

  // Bottom bar within the overlay slides up into view
  const bottomBarStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0.5, 1], [0, 1], Extrapolation.CLAMP),
    transform: [
      {
        translateY: interpolate(
          progress.value,
          [0.5, 1],
          [20, 0],
          Extrapolation.CLAMP,
        ),
      },
    ],
  }));

  return {
    progress,
    open,
    close,
    backdropStyle,
    headerFadeStyle,
    overlayStyle,
    bottomBarStyle,
  };
}
