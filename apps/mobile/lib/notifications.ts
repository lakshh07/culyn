import { Router } from 'expo-router'
import { NativeModules, Platform } from 'react-native'

// Check if the native module exists BEFORE requiring expo-notifications.
// Metro's require() throws during module init in a way try-catch can't intercept.
function isNotificationsAvailable(): boolean {
  return (
    !!NativeModules.ExpoPushTokenManager ||
    !!NativeModules.ExpoNotificationPresenter ||
    !!NativeModules.ExpoNotificationsEmitter
  )
}

let _notifications: typeof import('expo-notifications') | null = null

function getNotificationsModule() {
  if (_notifications) return _notifications
  if (!isNotificationsAvailable()) return null
  _notifications = require('expo-notifications')
  return _notifications
}

let handlerConfigured = false

function ensureHandler() {
  if (handlerConfigured) return
  const Notifications = getNotificationsModule()
  if (!Notifications) return

  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  })
  handlerConfigured = true
}

export async function requestNotificationPermissions(): Promise<boolean> {
  const Notifications = getNotificationsModule()
  if (!Notifications) return false

  ensureHandler()

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.DEFAULT,
    })
  }

  const { status: existing } = await Notifications.getPermissionsAsync()
  if (existing === 'granted') return true

  const { status } = await Notifications.requestPermissionsAsync()
  return status === 'granted'
}

export async function notifyProcessingStarted(url: string) {
  const Notifications = getNotificationsModule()
  if (!Notifications) return
  ensureHandler()

  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Processing your link',
      body: "We're importing your content...",
      data: { type: 'processing', url },
    },
    trigger: null,
  })
}

export async function notifyProcessingComplete(category: string, title: string, slug: string) {
  const Notifications = getNotificationsModule()
  if (!Notifications) return
  ensureHandler()

  const label = category.toLowerCase()
  await Notifications.scheduleNotificationAsync({
    content: {
      title: `Your ${label} is ready!`,
      body: `"${title}" has been saved. Tap to view.`,
      data: { type: 'complete', category, slug },
    },
    trigger: null,
  })
}

export async function notifyUpgradeRequired() {
  const Notifications = getNotificationsModule()
  if (!Notifications) return
  ensureHandler()

  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Action not completed',
      body: "You've reached your library limit. Upgrade to Pro to save more.",
    },
    trigger: null,
  })
}

export async function notifyProcessingFailed() {
  const Notifications = getNotificationsModule()
  if (!Notifications) return
  ensureHandler()

  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Import failed',
      body: "We couldn't process that link. Try again from the Add tab.",
    },
    trigger: null,
  })
}

export function setupNotificationResponseHandler(router: Router) {
  const Notifications = getNotificationsModule()
  if (!Notifications) {
    return { remove: () => {} }
  }
  ensureHandler()

  const subscription = Notifications.addNotificationResponseReceivedListener(response => {
    const data = response.notification.request.content.data
    if (data?.type === 'complete' && data.category && data.slug) {
      const category = (data.category as string).toLowerCase()
      const slug = data.slug as string

      const routes: Record<string, string> = {
        recipe: `/recipes/${slug}`,
        place: `/places/${slug}`,
        product: `/products/${slug}`,
      }

      const route = routes[category]
      if (route) {
        router.push(route as any)
      }
    }
  })

  return subscription
}
