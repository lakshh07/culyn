import { useThemeColors } from '@/constants/useTheme';
import { authClient } from '@/lib/auth-client';
import { requestNotificationPermissions } from '@/lib/notifications';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type AuthMode = 'initial' | 'signin' | 'signup';

export default function OnboardingScreen() {
  const colors = useThemeColors();
  const router = useRouter();

  const [mode, setMode] = useState<AuthMode>('initial');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleContinue = async () => {
    if (!email.trim()) {
      setError('Please enter your email');
      return;
    }

    // Simple email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email');
      return;
    }

    setError('');
    setLoading(true);

    // For simplicity, we'll just show signup form for new users
    // In production, you might want to check if user exists via API
    // For now, we'll go straight to signup mode
    setMode('signin');
    setLoading(false);
  };

  const handleSignIn = async () => {
    if (!password.trim()) {
      setError('Please enter your password');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const result = await authClient.signIn.email({
        email,
        password,
      });

      if (result.error) {
        setError(result.error.message || 'Failed to sign in');
        setLoading(false);
        return;
      }

      // Success - router will handle navigation via session check
      router.replace('/(tabs)/discover');
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : 'An error occurred. Please try again.';
      setError(__DEV__ ? message : 'An error occurred. Please try again.');
      setLoading(false);
    }
  };

  const handleSignUp = async () => {
    if (!name.trim()) {
      setError('Please enter your name');
      return;
    }

    if (!password.trim()) {
      setError('Please enter a password');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const result = await authClient.signUp.email({
        email,
        password,
        name,
      });

      if (result.error) {
        setError(result.error.message || 'Failed to create account');
        setLoading(false);
        return;
      }

      // Request notification permissions for share extension import updates
      requestNotificationPermissions();

      // Success - router will handle navigation via session check
      router.replace('/(tabs)/discover');
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : 'An error occurred. Please try again.';
      setError(__DEV__ ? message : 'An error occurred. Please try again.');
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);

    try {
      await authClient.signIn.social({
        provider: 'google',
        callbackURL: '/(tabs)/discover',
      });
    } catch {
      setError('Failed to sign in with Google');
      setLoading(false);
    }
  };

  const switchToSignIn = () => {
    setMode('signin');
    setError('');
  };

  const switchToSignUp = () => {
    setMode('signup');
    setError('');
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={['top', 'left', 'right']}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps='handled'
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.header}>
              <Text style={[styles.logo, { color: colors.textPrimary }]}>
                Culyn
              </Text>
              <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                Your personal recipe companion
              </Text>
            </View>

            <View style={styles.formContainer}>
              {mode === 'initial' && (
                <>
                  <View style={styles.inputGroup}>
                    <Text style={[styles.label, { color: colors.textPrimary }]}>
                      Email
                    </Text>
                    <TextInput
                      style={[
                        styles.input,
                        {
                          backgroundColor: colors.backgroundSecondary,
                          borderColor: colors.border,
                          color: colors.textPrimary,
                        },
                      ]}
                      placeholder='Enter your email'
                      placeholderTextColor={colors.textMuted}
                      value={email}
                      onChangeText={setEmail}
                      keyboardType='email-address'
                      autoCapitalize='none'
                      autoCorrect={false}
                      editable={!loading}
                    />
                  </View>

                  {error ? (
                    <Text style={[styles.error, { color: colors.error }]}>
                      {error}
                    </Text>
                  ) : null}

                  <TouchableOpacity
                    style={styles.primaryButton}
                    onPress={handleContinue}
                    disabled={loading}
                  >
                    <LinearGradient
                      colors={[
                        colors.primaryGradientStart,
                        colors.primaryGradientEnd,
                      ]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.gradientButton}
                    >
                      {loading ? (
                        <ActivityIndicator color='#FFFFFF' />
                      ) : (
                        <Text style={styles.primaryButtonText}>Continue</Text>
                      )}
                    </LinearGradient>
                  </TouchableOpacity>
                </>
              )}

              {mode === 'signin' && (
                <>
                  <View style={styles.inputGroup}>
                    <Text style={[styles.label, { color: colors.textPrimary }]}>
                      Email
                    </Text>
                    <TextInput
                      style={[
                        styles.input,
                        {
                          backgroundColor: colors.backgroundSecondary,
                          borderColor: colors.border,
                          color: colors.textPrimary,
                        },
                      ]}
                      placeholder='Enter your email'
                      placeholderTextColor={colors.textMuted}
                      value={email}
                      onChangeText={setEmail}
                      keyboardType='email-address'
                      autoCapitalize='none'
                      autoCorrect={false}
                      editable={!loading}
                    />
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={[styles.label, { color: colors.textPrimary }]}>
                      Password
                    </Text>
                    <TextInput
                      style={[
                        styles.input,
                        {
                          backgroundColor: colors.backgroundSecondary,
                          borderColor: colors.border,
                          color: colors.textPrimary,
                        },
                      ]}
                      placeholder='Enter your password'
                      placeholderTextColor={colors.textMuted}
                      value={password}
                      onChangeText={setPassword}
                      secureTextEntry
                      autoCapitalize='none'
                      autoCorrect={false}
                      editable={!loading}
                    />
                  </View>

                  {error ? (
                    <Text style={[styles.error, { color: colors.error }]}>
                      {error}
                    </Text>
                  ) : null}

                  <TouchableOpacity
                    style={styles.primaryButton}
                    onPress={handleSignIn}
                    disabled={loading}
                  >
                    <LinearGradient
                      colors={[
                        colors.primaryGradientStart,
                        colors.primaryGradientEnd,
                      ]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.gradientButton}
                    >
                      {loading ? (
                        <ActivityIndicator color='#FFFFFF' />
                      ) : (
                        <Text style={styles.primaryButtonText}>Sign In</Text>
                      )}
                    </LinearGradient>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.switchButton}
                    onPress={switchToSignUp}
                    disabled={loading}
                  >
                    <Text
                      style={[
                        styles.switchText,
                        { color: colors.textSecondary },
                      ]}
                    >
                      Don&apos;t have an account?{' '}
                      <Text
                        style={{
                          color: colors.primary,
                          fontFamily: 'Poppins_500Medium',
                        }}
                      >
                        Sign Up
                      </Text>
                    </Text>
                  </TouchableOpacity>
                </>
              )}

              {mode === 'signup' && (
                <>
                  <View style={styles.inputGroup}>
                    <Text style={[styles.label, { color: colors.textPrimary }]}>
                      Name
                    </Text>
                    <TextInput
                      style={[
                        styles.input,
                        {
                          backgroundColor: colors.backgroundSecondary,
                          borderColor: colors.border,
                          color: colors.textPrimary,
                        },
                      ]}
                      placeholder='Enter your name'
                      placeholderTextColor={colors.textMuted}
                      value={name}
                      onChangeText={setName}
                      autoCapitalize='words'
                      autoCorrect={false}
                      editable={!loading}
                    />
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={[styles.label, { color: colors.textPrimary }]}>
                      Email
                    </Text>
                    <TextInput
                      style={[
                        styles.input,
                        {
                          backgroundColor: colors.backgroundSecondary,
                          borderColor: colors.border,
                          color: colors.textPrimary,
                        },
                      ]}
                      placeholder='Enter your email'
                      placeholderTextColor={colors.textMuted}
                      value={email}
                      onChangeText={setEmail}
                      keyboardType='email-address'
                      autoCapitalize='none'
                      autoCorrect={false}
                      editable={!loading}
                    />
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={[styles.label, { color: colors.textPrimary }]}>
                      Password
                    </Text>
                    <TextInput
                      style={[
                        styles.input,
                        {
                          backgroundColor: colors.backgroundSecondary,
                          borderColor: colors.border,
                          color: colors.textPrimary,
                        },
                      ]}
                      placeholder='Create a password (min 8 characters)'
                      placeholderTextColor={colors.textMuted}
                      value={password}
                      onChangeText={setPassword}
                      secureTextEntry
                      autoCapitalize='none'
                      autoCorrect={false}
                      editable={!loading}
                    />
                  </View>

                  {error ? (
                    <Text style={[styles.error, { color: colors.error }]}>
                      {error}
                    </Text>
                  ) : null}

                  <TouchableOpacity
                    style={styles.primaryButton}
                    onPress={handleSignUp}
                    disabled={loading}
                  >
                    <LinearGradient
                      colors={[
                        colors.primaryGradientStart,
                        colors.primaryGradientEnd,
                      ]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.gradientButton}
                    >
                      {loading ? (
                        <ActivityIndicator color='#FFFFFF' />
                      ) : (
                        <Text style={styles.primaryButtonText}>
                          Create Account
                        </Text>
                      )}
                    </LinearGradient>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.switchButton}
                    onPress={switchToSignIn}
                    disabled={loading}
                  >
                    <Text
                      style={[
                        styles.switchText,
                        { color: colors.textSecondary },
                      ]}
                    >
                      Already have an account?{' '}
                      <Text
                        style={{
                          color: colors.primary,
                          fontFamily: 'Poppins_500Medium',
                        }}
                      >
                        Sign In
                      </Text>
                    </Text>
                  </TouchableOpacity>
                </>
              )}

              <View style={styles.divider}>
                <View
                  style={[
                    styles.dividerLine,
                    { backgroundColor: colors.border },
                  ]}
                />
                <Text style={[styles.dividerText, { color: colors.textMuted }]}>
                  or
                </Text>
                <View
                  style={[
                    styles.dividerLine,
                    { backgroundColor: colors.border },
                  ]}
                />
              </View>

              <TouchableOpacity
                style={[
                  styles.googleButton,
                  {
                    backgroundColor: colors.backgroundSecondary,
                    borderColor: colors.border,
                  },
                ]}
                onPress={handleGoogleSignIn}
                disabled={loading}
              >
                <Text
                  style={[
                    styles.googleButtonText,
                    { color: colors.textPrimary },
                  ]}
                >
                  Continue with Google
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  logo: {
    fontSize: 48,
    fontFamily: 'LeckerliOne_400Regular',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'EBGaramond_400Regular',
    textAlign: 'center',
  },
  formContainer: {
    width: '100%',
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontFamily: 'Poppins_500Medium',
    marginBottom: 8,
  },
  input: {
    height: 52,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 16,
    fontSize: 16,
    fontFamily: 'Poppins_400Regular',
  },
  error: {
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
    marginBottom: 16,
    textAlign: 'center',
  },
  primaryButton: {
    marginTop: 8,
    marginBottom: 16,
  },
  gradientButton: {
    height: 52,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#8b5cf6',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Poppins_500Medium',
  },
  switchButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  switchText: {
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
  },
  googleButton: {
    height: 52,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  googleButtonText: {
    fontSize: 16,
    fontFamily: 'Poppins_500Medium',
  },
});
