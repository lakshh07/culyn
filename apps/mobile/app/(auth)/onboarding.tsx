import { useThemeColors } from '@/constants/useTheme'
import { apiClient } from '@/lib/api'
import { authClient } from '@/lib/auth-client'
import { requestNotificationPermissions } from '@/lib/notifications'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { useRouter } from 'expo-router'
import React, { useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react'
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ViewToken,
} from 'react-native'
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import { scheduleOnRN } from 'react-native-worklets'

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window')

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

type SheetMode = 'email' | 'checking' | 'signin' | 'signup'

const SLIDES = [
  {
    id: '1',
    headline: 'Stop Losing Things You Want to Try',
    sub: 'Save recipes, restaurants, products, and places from Instagram reels and posts - instantly organized in one place.',
    image: require('@/assets/images/onboarding/01.png'),
  },
  {
    id: '2',
    headline: 'Your AI, Powered by What You Save',
    sub: 'Ask for ideas, substitutions, comparisons, meal plans, or recommendations - based on your saved recipes, places, and products.',
    image: require('@/assets/images/onboarding/02.png'),
  },
  {
    id: '3',
    headline: 'Organize. Explore. Discover.',
    sub: 'Build your personal library of recipes, cafes, outfits, gadgets, and more - and see what others are loving.',
    image: require('@/assets/images/onboarding/03.png'),
  },
]

const LOOP_SLIDES = [...SLIDES, { ...SLIDES[0], id: 'loop-0' }]

type AuthFormState = {
  email: string
  password: string
  name: string
  loading: boolean
  error: string
}

type AuthFormAction =
  | { type: 'SET_EMAIL'; payload: string }
  | { type: 'SET_PASSWORD'; payload: string }
  | { type: 'SET_NAME'; payload: string }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string }
  | { type: 'RESET_PASSWORD_AND_NAME' }
  | { type: 'RESET_FORM' }

function authFormReducer(state: AuthFormState, action: AuthFormAction): AuthFormState {
  switch (action.type) {
    case 'SET_EMAIL':
      return { ...state, email: action.payload }
    case 'SET_PASSWORD':
      return { ...state, password: action.payload }
    case 'SET_NAME':
      return { ...state, name: action.payload }
    case 'SET_LOADING':
      return { ...state, loading: action.payload }
    case 'SET_ERROR':
      return { ...state, error: action.payload }
    case 'RESET_PASSWORD_AND_NAME':
      return { ...state, password: '', name: '', error: '' }
    case 'RESET_FORM':
      return {
        email: state.email,
        password: '',
        name: '',
        loading: false,
        error: '',
      }
    default:
      return state
  }
}

type GradientButtonProps = {
  onPress: () => void
  disabled?: boolean
  loading?: boolean
  text: string
  colors: { primaryGradientStart: string; primaryGradientEnd: string; white: string }
  style?: object
}

const GradientButton = React.memo<GradientButtonProps>(function GradientButton({
  onPress,
  disabled,
  loading,
  text,
  colors,
  style,
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      style={[styles.primaryBtn, style]}>
      <LinearGradient
        colors={[colors.primaryGradientStart, colors.primaryGradientEnd]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientBtn}>
        {loading ? (
          <ActivityIndicator color={colors.white} />
        ) : (
          <Text style={[styles.primaryBtnText, { color: colors.white }]}>{text}</Text>
        )}
      </LinearGradient>
    </TouchableOpacity>
  )
})

export default function OnboardingScreen() {
  const colors = useThemeColors()
  const router = useRouter()
  const insets = useSafeAreaInsets()

  // Carousel
  const [currentSlide, setCurrentSlide] = useState(0)
  const flatListRef = useRef<FlatList>(null)
  const viewabilityConfig = useRef({ viewAreaCoveragePercentThreshold: 50 })
  const carouselTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    carouselTimerRef.current = setInterval(() => {
      setCurrentSlide(prev => {
        const next = prev + 1
        flatListRef.current?.scrollToIndex({ index: next, animated: true })
        if (next >= SLIDES.length) {
          setTimeout(() => {
            flatListRef.current?.scrollToIndex({ index: 0, animated: false })
          }, 380)
          return 0
        }
        return next
      })
    }, 3000)

    return () => {
      if (carouselTimerRef.current) {
        clearInterval(carouselTimerRef.current)
      }
    }
  }, [])

  // Sheet state
  const [sheetVisible, setSheetVisible] = useState(false)
  const [sheetMode, setSheetMode] = useState<SheetMode>('email')

  // Auth form state with reducer
  const [formState, dispatch] = useReducer(authFormReducer, {
    email: '',
    password: '',
    name: '',
    loading: false,
    error: '',
  })

  // Animated values
  const sheetTranslateY = useSharedValue(SCREEN_HEIGHT)
  const backdropOpacity = useSharedValue(0)
  const contentOpacity = useSharedValue(1)
  const buttonScale = useSharedValue(1)

  // ── Sheet open / close ──────────────────────────────────────────────────

  const openSheet = useCallback(() => {
    setSheetMode('email')
    dispatch({ type: 'RESET_PASSWORD_AND_NAME' })
    setSheetVisible(true)
    sheetTranslateY.value = SCREEN_HEIGHT
    backdropOpacity.value = 0
    sheetTranslateY.value = withTiming(0, {
      duration: 340,
      easing: Easing.out(Easing.cubic),
    })
    backdropOpacity.value = withTiming(0.6, { duration: 280 })
  }, [sheetTranslateY, backdropOpacity])

  const closeSheet = useCallback(() => {
    Keyboard.dismiss()
    sheetTranslateY.value = withTiming(SCREEN_HEIGHT, { duration: 320 }, () => {
      scheduleOnRN(setSheetVisible, false)
      scheduleOnRN(setSheetMode, 'email')
      scheduleOnRN(dispatch, { type: 'RESET_FORM' })
    })
    backdropOpacity.value = withTiming(0, { duration: 280 })
  }, [sheetTranslateY, backdropOpacity])

  const transitionTo = useCallback(
    (newMode: SheetMode) => {
      contentOpacity.value = withTiming(0, { duration: 150 }, () => {
        scheduleOnRN(setSheetMode, newMode)
        scheduleOnRN(dispatch, { type: 'SET_ERROR', payload: '' })
        if (newMode === 'email') {
          scheduleOnRN(dispatch, { type: 'RESET_PASSWORD_AND_NAME' })
        }
        contentOpacity.value = withTiming(1, { duration: 200 })
      })
    },
    [contentOpacity]
  )

  // ── Animated styles ─────────────────────────────────────────────────────

  const backdropAnimStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }))

  const sheetAnimStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: sheetTranslateY.value }],
  }))

  const contentAnimStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
  }))

  const buttonAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }))

  // ── Carousel ─────────────────────────────────────────────────────────────

  const onViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0 && viewableItems[0].index !== null) {
        const idx = viewableItems[0].index!
        setCurrentSlide(idx >= SLIDES.length ? 0 : idx)
      }
    },
    []
  )

  const renderSlide = useCallback(
    ({ item }: { item: (typeof SLIDES)[0] }) => (
      <View style={[styles.slide, { width: SCREEN_WIDTH }]}>
        <Image source={item.image} style={styles.slideImage} resizeMode="contain" />
        <View style={styles.textArea}>
          <Text style={[styles.headline, { color: colors.textPrimary }]}>{item.headline}</Text>
          <Text style={[styles.subtext, { color: colors.textSecondary }]}>{item.sub}</Text>
        </View>
      </View>
    ),
    [colors.textPrimary, colors.textSecondary]
  )

  const handleContinue = useCallback(async () => {
    const emailValue = formState.email.trim()

    if (!emailValue) {
      dispatch({ type: 'SET_ERROR', payload: 'Please enter your email' })
      return
    }

    if (!EMAIL_REGEX.test(emailValue)) {
      dispatch({ type: 'SET_ERROR', payload: 'Please enter a valid email' })
      return
    }

    dispatch({ type: 'SET_LOADING', payload: true })

    let userExists = false

    try {
      const result = await apiClient().get(`/user/lookup?email=${emailValue}`)
      userExists = result.data.user !== null
    } catch {
      userExists = false
    }

    dispatch({ type: 'SET_LOADING', payload: false })

    transitionTo(userExists ? 'signin' : 'signup')
  }, [formState.email, transitionTo])

  const handleSignIn = useCallback(async () => {
    if (!formState.password.trim()) {
      dispatch({ type: 'SET_ERROR', payload: 'Please enter your password' })
      return
    }

    dispatch({ type: 'SET_ERROR', payload: '' })
    dispatch({ type: 'SET_LOADING', payload: true })

    try {
      const result = await authClient.signIn.email({
        email: formState.email,
        password: formState.password,
      })
      if (result.error) {
        dispatch({
          type: 'SET_ERROR',
          payload: result.error.message || 'Failed to sign in',
        })
        dispatch({ type: 'SET_LOADING', payload: false })
        return
      }
      router.replace('/(tabs)/discover')
    } catch (err) {
      dispatch({
        type: 'SET_ERROR',
        payload: err instanceof Error ? err.message : 'An error occurred. Please try again.',
      })
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }, [formState.email, formState.password, router])

  const handleSignUp = useCallback(async () => {
    if (!formState.name.trim()) {
      dispatch({ type: 'SET_ERROR', payload: 'Please enter your name' })
      return
    }
    if (!formState.password.trim()) {
      dispatch({ type: 'SET_ERROR', payload: 'Please enter a password' })
      return
    }
    if (formState.password.length < 8) {
      dispatch({
        type: 'SET_ERROR',
        payload: 'Password must be at least 8 characters',
      })
      return
    }

    dispatch({ type: 'SET_ERROR', payload: '' })
    dispatch({ type: 'SET_LOADING', payload: true })

    try {
      const result = await authClient.signUp.email({
        email: formState.email,
        password: formState.password,
        name: formState.name,
      })
      if (result.error) {
        dispatch({
          type: 'SET_ERROR',
          payload: result.error.message || 'Failed to create account',
        })
        dispatch({ type: 'SET_LOADING', payload: false })
        return
      }
      requestNotificationPermissions()
      router.replace({
        pathname: '/(tabs)/discover',
        params: { showUpgrade: '1' },
      })
    } catch (err) {
      dispatch({
        type: 'SET_ERROR',
        payload: err instanceof Error ? err.message : 'An error occurred. Please try again.',
      })
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }, [formState.email, formState.password, formState.name, router])

  const handleGoogleSignIn = useCallback(async () => {
    dispatch({ type: 'SET_ERROR', payload: '' })
    dispatch({ type: 'SET_LOADING', payload: true })

    try {
      const result = await authClient.signIn.social({
        provider: 'google',
        callbackURL: '/(tabs)/discover',
      })
      if (result?.error) {
        dispatch({ type: 'SET_ERROR', payload: result.error.message || 'Failed to sign in with Google' })
        dispatch({ type: 'SET_LOADING', payload: false })
        return
      }
      router.replace('/(tabs)/discover')
    } catch {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to sign in with Google' })
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }, [router])

  const handleAppleSignIn = useCallback(async () => {
    dispatch({ type: 'SET_ERROR', payload: '' })
    dispatch({ type: 'SET_LOADING', payload: true })

    try {
      const result = await authClient.signIn.social({
        provider: 'apple',
        callbackURL: '/(tabs)/discover',
      })
      if (result?.error) {
        dispatch({ type: 'SET_ERROR', payload: result.error.message || 'Failed to sign in with Apple' })
        dispatch({ type: 'SET_LOADING', payload: false })
        return
      }
      router.replace('/(tabs)/discover')
    } catch {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to sign in with Apple' })
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }, [router])

  const sheetTitle = useMemo(() => {
    if (sheetMode === 'email' || sheetMode === 'checking') return 'Welcome to Culyn'
    if (sheetMode === 'signin') return 'Sign In'
    return 'Create Account'
  }, [sheetMode])

  return (
    <View style={[styles.outerContainer, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <View style={styles.logoArea}>
          <Text style={[styles.logo, { color: colors.textPrimary }]}>Culyn</Text>
        </View>

        <FlatList
          ref={flatListRef}
          data={LOOP_SLIDES}
          renderItem={renderSlide}
          keyExtractor={item => item.id}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          snapToAlignment="start"
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={viewabilityConfig.current}
          style={styles.flatList}
          getItemLayout={(_, index) => ({
            length: SCREEN_WIDTH,
            offset: SCREEN_WIDTH * index,
            index,
          })}
        />

        <View style={[styles.bottomControls, { paddingBottom: insets.bottom + 20 }]}>
          <View style={styles.dots}>
            {SLIDES.map((_, i) => (
              <View
                key={i}
                style={[
                  styles.dot,
                  {
                    backgroundColor: i === currentSlide ? colors.primary : colors.border,
                    width: i === currentSlide ? 22 : 8,
                  },
                ]}
              />
            ))}
          </View>

          <Animated.View style={buttonAnimStyle}>
            <Pressable
              onPress={openSheet}
              onPressIn={() => {
                buttonScale.value = withSpring(0.96, { damping: 20 })
              }}
              onPressOut={() => {
                buttonScale.value = withSpring(1, { damping: 20 })
              }}>
              <LinearGradient
                colors={[colors.primaryGradientStart, colors.primaryGradientEnd]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.getStartedBtn}>
                <Text style={[styles.getStartedText, { color: colors.white }]}>Get Started</Text>
                <Ionicons
                  name="arrow-forward"
                  size={18}
                  color={colors.white}
                  style={{ marginLeft: 8 }}
                />
              </LinearGradient>
            </Pressable>
          </Animated.View>

          <Text style={[styles.termsText, { color: colors.textMuted }]}>
            By continuing, you agree to our <Text style={{ color: colors.primary }}>Terms</Text>
            {' & '}
            <Text style={{ color: colors.primary }}>Privacy Policy</Text>
          </Text>
        </View>
      </SafeAreaView>

      <Animated.View
        style={[styles.backdrop, backdropAnimStyle]}
        pointerEvents={sheetVisible ? 'auto' : 'none'}>
        <Pressable style={StyleSheet.absoluteFillObject} onPress={closeSheet} />
      </Animated.View>

      <Animated.View
        style={[styles.sheet, { backgroundColor: colors.background }, sheetAnimStyle]}
        pointerEvents={sheetVisible ? 'auto' : 'none'}>
        <View style={styles.sheetHandle}>
          <View style={[styles.handleBar, { backgroundColor: colors.border }]} />
        </View>

        <View style={styles.sheetHeader}>
          <Text style={[styles.sheetTitle, { color: colors.textPrimary }]}>{sheetTitle}</Text>
          <TouchableOpacity onPress={closeSheet} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Text style={[styles.cancelText, { color: colors.textSecondary }]}>Cancel</Text>
          </TouchableOpacity>
        </View>

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
          keyboardVerticalOffset={8}>
          <ScrollView
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={[styles.sheetContent, { paddingBottom: insets.bottom + 24 }]}>
            <Animated.View style={contentAnimStyle}>
              {sheetMode === 'email' && (
                <View>
                  <View style={styles.inputContainer}>
                    <TextInput
                      style={[
                        styles.input,
                        {
                          backgroundColor: colors.backgroundSecondary,
                          borderColor: colors.border,
                          color: colors.textPrimary,
                          paddingRight: formState.loading ? 50 : 16,
                        },
                      ]}
                      placeholder="Enter your email"
                      placeholderTextColor={colors.textMuted}
                      value={formState.email}
                      onChangeText={text => dispatch({ type: 'SET_EMAIL', payload: text })}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoCorrect={false}
                      editable={!formState.loading}
                      returnKeyType="done"
                      onSubmitEditing={handleContinue}
                    />
                    {formState.loading && (
                      <View style={styles.inputLoadingIndicator}>
                        <ActivityIndicator size="small" color={colors.primary} />
                      </View>
                    )}
                  </View>
                  {!!formState.error && (
                    <Text style={[styles.error, { color: colors.error }]}>{formState.error}</Text>
                  )}
                  <GradientButton
                    onPress={handleContinue}
                    loading={formState.loading}
                    text="Continue"
                    colors={colors}
                  />
                </View>
              )}

              {sheetMode === 'signin' && (
                <View>
                  <View style={styles.emailRow}>
                    <Text
                      style={[styles.emailDisplay, { color: colors.textSecondary }]}
                      numberOfLines={1}>
                      {formState.email}
                    </Text>
                    <TouchableOpacity onPress={() => transitionTo('email')}>
                      <Text style={[styles.editLink, { color: colors.primary }]}>Edit</Text>
                    </TouchableOpacity>
                  </View>
                  <TextInput
                    style={[
                      styles.input,
                      {
                        backgroundColor: colors.backgroundSecondary,
                        borderColor: colors.border,
                        color: colors.textPrimary,
                      },
                    ]}
                    placeholder="Enter your password"
                    placeholderTextColor={colors.textMuted}
                    value={formState.password}
                    onChangeText={text => dispatch({ type: 'SET_PASSWORD', payload: text })}
                    secureTextEntry
                    autoCapitalize="none"
                    autoCorrect={false}
                    editable={!formState.loading}
                    returnKeyType="done"
                    onSubmitEditing={handleSignIn}
                  />
                  {!!formState.error && (
                    <Text style={[styles.error, { color: colors.error }]}>{formState.error}</Text>
                  )}
                  <GradientButton
                    onPress={handleSignIn}
                    loading={formState.loading}
                    text="Sign In"
                    colors={colors}
                  />
                </View>
              )}

              {/* Sign Up mode */}
              {sheetMode === 'signup' && (
                <View>
                  <View style={styles.emailRow}>
                    <Text
                      style={[styles.emailDisplay, { color: colors.textSecondary }]}
                      numberOfLines={1}>
                      {formState.email}
                    </Text>
                    <TouchableOpacity onPress={() => transitionTo('email')}>
                      <Text style={[styles.editLink, { color: colors.primary }]}>Edit</Text>
                    </TouchableOpacity>
                  </View>
                  <TextInput
                    style={[
                      styles.input,
                      {
                        backgroundColor: colors.backgroundSecondary,
                        borderColor: colors.border,
                        color: colors.textPrimary,
                      },
                    ]}
                    placeholder="Your full name"
                    placeholderTextColor={colors.textMuted}
                    value={formState.name}
                    onChangeText={text => dispatch({ type: 'SET_NAME', payload: text })}
                    autoCapitalize="words"
                    autoCorrect={false}
                    editable={!formState.loading}
                    returnKeyType="next"
                  />
                  <TextInput
                    style={[
                      styles.input,
                      {
                        backgroundColor: colors.backgroundSecondary,
                        borderColor: colors.border,
                        color: colors.textPrimary,
                        marginTop: 12,
                      },
                    ]}
                    placeholder="Create a password (min 8 chars)"
                    placeholderTextColor={colors.textMuted}
                    value={formState.password}
                    onChangeText={text => dispatch({ type: 'SET_PASSWORD', payload: text })}
                    secureTextEntry
                    autoCapitalize="none"
                    autoCorrect={false}
                    editable={!formState.loading}
                    returnKeyType="done"
                    onSubmitEditing={handleSignUp}
                  />
                  {!!formState.error && (
                    <Text style={[styles.error, { color: colors.error }]}>{formState.error}</Text>
                  )}
                  <GradientButton
                    onPress={handleSignUp}
                    loading={formState.loading}
                    text="Create Account"
                    colors={colors}
                  />
                </View>
              )}
            </Animated.View>

            {/* ── Divider ── */}
            <View style={styles.divider}>
              <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
              <Text style={[styles.dividerLabel, { color: colors.textMuted }]}>OR</Text>
              <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
            </View>

            {/* ── Social buttons ── */}
            <TouchableOpacity
              style={styles.appleBtn}
              onPress={handleAppleSignIn}
              disabled={formState.loading}>
              <Ionicons name="logo-apple" size={20} color={colors.white} />
              <Text style={[styles.appleBtnText, { color: colors.white }]}>
                Continue with Apple
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.googleBtn,
                {
                  borderColor: colors.border,
                  backgroundColor: colors.background,
                },
              ]}
              onPress={handleGoogleSignIn}
              disabled={formState.loading}>
              <Text style={styles.googleG}>G</Text>
              <Text style={[styles.googleBtnText, { color: colors.textPrimary }]}>
                Continue with Google
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </Animated.View>
    </View>
  )
}

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  logoArea: {
    alignItems: 'center',
    paddingTop: 12,
    paddingBottom: 45,
  },
  logo: {
    fontSize: 34,
    fontFamily: 'LeckerliOne_400Regular',
  },
  flatList: {
    flex: 1,
  },
  slide: {
    flex: 1,
  },
  slideImage: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT * 0.33,
  },
  textArea: {
    paddingHorizontal: 32,
    paddingTop: 28,
  },
  headline: {
    fontSize: 24,
    fontFamily: 'Syne_600SemiBold',
    lineHeight: 36,
    marginBottom: 10,
  },
  subtext: {
    fontSize: 15,
    fontFamily: 'Poppins_400Regular',
    lineHeight: 24,
  },
  bottomControls: {
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    marginBottom: 20,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  getStartedBtn: {
    height: 56,
    borderRadius: 28,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#6A89A7', // colors.primary (light theme)
    shadowOpacity: 0.35,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  getStartedText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontFamily: 'Poppins_500Medium',
  },
  termsText: {
    fontSize: 12,
    fontFamily: 'Poppins_400Regular',
    textAlign: 'center',
    marginTop: 14,
  },
  // Sheet overlay
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000000', // dark overlay backdrop
    zIndex: 10,
  },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    shadowColor: '#000000',
    shadowOpacity: 0.18,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: -4 },
    elevation: 24,
    zIndex: 20,
    maxHeight: SCREEN_HEIGHT * 0.85,
  },
  sheetHandle: {
    alignItems: 'center',
    paddingTop: 12,
    paddingBottom: 6,
  },
  handleBar: {
    width: 40,
    height: 4,
    borderRadius: 2,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingBottom: 18,
  },
  sheetTitle: {
    fontSize: 20,
    fontFamily: 'Syne_600SemiBold',
  },
  cancelText: {
    fontSize: 15,
    fontFamily: 'Poppins_400Regular',
  },
  sheetContent: {
    paddingHorizontal: 24,
  },
  // Form
  emailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  emailDisplay: {
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
    flex: 1,
  },
  editLink: {
    fontSize: 14,
    fontFamily: 'Poppins_500Medium',
    marginLeft: 8,
  },
  inputContainer: {
    position: 'relative',
  },
  input: {
    height: 52,
    borderRadius: 14,
    borderWidth: 1.5,
    paddingHorizontal: 16,
    fontSize: 16,
    fontFamily: 'Poppins_400Regular',
  },
  inputLoadingIndicator: {
    position: 'absolute',
    right: 16,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
  },
  error: {
    fontSize: 13,
    fontFamily: 'Poppins_400Regular',
    marginTop: 8,
    marginBottom: 2,
  },
  primaryBtn: {
    marginTop: 16,
  },
  gradientBtn: {
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#6A89A7', // colors.primary (light theme)
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Poppins_500Medium',
  },
  switchBtn: {
    paddingVertical: 14,
    alignItems: 'center',
  },
  switchText: {
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
    textAlign: 'center',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerLabel: {
    marginHorizontal: 12,
    fontSize: 13,
    fontFamily: 'Poppins_500Medium',
  },
  // Social buttons
  appleBtn: {
    height: 52,
    borderRadius: 14,
    backgroundColor: '#000000', // Apple brand color, always black
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 12,
  },
  appleBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Poppins_500Medium',
  },
  googleBtn: {
    height: 52,
    borderRadius: 14,
    borderWidth: 1.5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  googleG: {
    fontSize: 18,
    fontFamily: 'Poppins_500Medium',
    color: '#4285F4', // colors.googleBrand — Google brand color, always same
    fontWeight: '700',
  },
  googleBtnText: {
    fontSize: 16,
    fontFamily: 'Poppins_500Medium',
  },
})
