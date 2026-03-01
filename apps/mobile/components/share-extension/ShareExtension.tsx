import { close, openHostApp, type InitialProps, Text, View } from 'expo-share-extension'
import React, { useEffect, useState } from 'react'
import { StyleSheet, TouchableOpacity } from 'react-native'

export default function ShareExtension({ url, text }: InitialProps) {
  const [error, setError] = useState(false)

  useEffect(() => {
    // Try to extract a URL from the shared data
    const sharedUrl = url || extractUrl(text)

    if (!sharedUrl) {
      setError(true)
      return
    }

    // Open the host app with the shared URL
    openHostApp(`share?url=${encodeURIComponent(sharedUrl)}`)

    // Close the extension after a brief delay so the user sees confirmation
    const timeout = setTimeout(() => {
      close()
    }, 1000)

    return () => clearTimeout(timeout)
  }, [url, text])

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>No link found to import.</Text>
        <TouchableOpacity style={styles.dismissButton} onPress={() => close()}>
          <Text style={styles.dismissText}>Dismiss</Text>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <Text style={styles.checkmark}>✓</Text>
      <Text style={styles.title}>Added to Culyn</Text>
      <Text style={styles.subtitle}>Processing your link...</Text>
    </View>
  )
}

function extractUrl(text: string | undefined): string | undefined {
  if (!text) return undefined
  const urlMatch = text.match(/https?:\/\/[^\s]+/)
  return urlMatch?.[0]
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  checkmark: {
    fontSize: 32,
    color: '#4ADE80',
    marginBottom: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  errorText: {
    fontSize: 16,
    color: '#F87171',
    marginBottom: 16,
    textAlign: 'center',
  },
  dismissButton: {
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#374151',
  },
  dismissText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
  },
})
