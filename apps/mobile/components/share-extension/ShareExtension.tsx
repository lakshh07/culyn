import { SHARED_KEYCHAIN_GROUP, SHARED_KEY_COOKIE, SHARED_KEY_JOB_ID } from '@/lib/shared-keychain'
import * as SecureStore from 'expo-secure-store'
import { Text, View, close, type InitialProps } from 'expo-share-extension'
import { CheckCircle2, XCircle } from 'lucide-react-native'
import React, { useEffect, useRef, useState } from 'react'
import { ActivityIndicator, Animated, StyleSheet, TouchableOpacity } from 'react-native'

const API_URL = process.env.EXPO_PUBLIC_CULYN_API_URL ?? ''

type Status = 'loading' | 'success' | 'error'

export default function ShareExtension({ url, text }: InitialProps) {
  const [status, setStatus] = useState<Status>('loading')
  const [errorMsg, setErrorMsg] = useState('')
  const animValue = useRef(new Animated.Value(0)).current

  useEffect(() => {
    Animated.spring(animValue, {
      toValue: 1,
      tension: 60,
      friction: 9,
      useNativeDriver: true,
    }).start()
    runImport()
  }, [])

  async function runImport() {
    const sharedUrl = url || extractUrl(text)
    console.log('[ShareExtension] URL received:', sharedUrl)

    if (!sharedUrl) {
      console.log('[ShareExtension] No URL found')
      setErrorMsg('No link found to import.')
      setStatus('error')
      return
    }

    console.log('[ShareExtension] Reading cookie from shared keychain...')
    const cookie = await SecureStore.getItemAsync(SHARED_KEY_COOKIE, {
      accessGroup: SHARED_KEYCHAIN_GROUP,
    })
    console.log('[ShareExtension] Cookie found:', !!cookie)

    if (!cookie) {
      setErrorMsg('Open the Culyn app and log in first.')
      setStatus('error')
      return
    }

    try {
      console.log('[ShareExtension] Calling /content/import...')
      const response = await fetch(`${API_URL}/v1/content/import`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Cookie: cookie,
        },
        body: JSON.stringify({ url: sharedUrl }),
      })

      console.log('[ShareExtension] Response status:', response.status)

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      const data = await response.json()
      console.log('[ShareExtension] jobId received:', data.jobId)

      await SecureStore.setItemAsync(SHARED_KEY_JOB_ID, data.jobId, {
        accessGroup: SHARED_KEYCHAIN_GROUP,
      })
      console.log('[ShareExtension] jobId written to shared keychain')

      setStatus('success')
      setTimeout(close, 1500)
    } catch (err) {
      console.log('[ShareExtension] Error:', err)
      setErrorMsg('Something went wrong. Please try again.')
      setStatus('error')
    }
  }

  const opacity = animValue
  const scale = animValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.95, 1],
  })

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.card, { opacity, transform: [{ scale }] }]}>
        {status === 'loading' && (
          <>
            <ActivityIndicator size="large" color="#111111" style={styles.iconSpacing} />
            <Text style={styles.title}>Saving to Culyn</Text>
            <Text style={styles.subtitle}>Please wait...</Text>
          </>
        )}
        {status === 'success' && (
          <>
            <CheckCircle2 size={44} color="#22C55E" strokeWidth={2.5} style={styles.iconSpacing} />
            <Text style={styles.title}>Saved successfully</Text>
            <Text style={styles.subtitle}>We&apos;ll notify you when it&apos;s ready.</Text>
          </>
        )}
        {status === 'error' && (
          <>
            <XCircle size={44} color="#EF4444" strokeWidth={2.5} style={styles.iconSpacing} />
            <Text style={styles.errorText}>{errorMsg}</Text>
            <TouchableOpacity style={styles.dismissButton} onPress={() => close()}>
              <Text style={styles.dismissText}>Dismiss</Text>
            </TouchableOpacity>
          </>
        )}
      </Animated.View>
    </View>
  )
}

function extractUrl(text: string | undefined): string | undefined {
  if (!text) return undefined
  const match = text.match(/https?:\/\/[^\s]+/)
  return match?.[0]
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
  },
  card: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingVertical: 40,
    paddingHorizontal: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  iconSpacing: {
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111111',
    marginBottom: 6,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
  },
  errorText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111111',
    textAlign: 'center',
    marginBottom: 20,
    marginTop: 4,
  },
  dismissButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    width: '100%',
    alignItems: 'center',
    marginBottom: 40,
  },
  dismissText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333333',
  },
})
