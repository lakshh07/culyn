import { Stack } from 'expo-router'
import React from 'react'

export default function AiChatLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="[id]" options={{ animation: 'fade' }} />
    </Stack>
  )
}
