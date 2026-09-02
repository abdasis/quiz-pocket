declare global {
  interface Window {
    OneSignalDeferred?: Array<(OneSignal: any) => void>
    OneSignal?: any
  }
}

export const ONESIGNAL_APP_ID = 'df0ede01-ed1f-47c0-b68f-e4eff0f080d8'
export const ONESIGNAL_SAFARI_WEB_ID = 'web.onesignal.auto.35c3b21f-3634-4ed2-bd52-fd09e2637415'

let isInitialized = false

/**
 * Inisialisasi OneSignal Web SDK
 */
export function initOneSignal(onSubscriptionChange?: (isSubscribed: boolean) => void) {
  if (typeof window === 'undefined') return

  window.OneSignalDeferred = window.OneSignalDeferred || []
  window.OneSignalDeferred.push(async (OneSignal) => {
    if (!isInitialized) {
      await OneSignal.init({
        appId: ONESIGNAL_APP_ID,
        safari_web_id: ONESIGNAL_SAFARI_WEB_ID,
        notifyButton: {
          enable: false, // Dikelola via custom header toggle button
        },
        allowLocalhostAsSecureOrigin: true,
      })
      isInitialized = true
    }

    // Check status langganan saat ini
    const isSubscribed = OneSignal.User?.PushSubscription?.optedIn ?? false
    if (onSubscriptionChange) {
      onSubscriptionChange(isSubscribed)
    }

    // Listener jika status berubah
    OneSignal.User?.PushSubscription?.addEventListener('change', (event: any) => {
      if (onSubscriptionChange) {
        onSubscriptionChange(Boolean(event.current?.optedIn))
      }
    })
  })
}

/**
 * Toggle status langganan push notification user
 */
export async function togglePushSubscription(enable: boolean): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') return resolve(false)

    window.OneSignalDeferred = window.OneSignalDeferred || []
    window.OneSignalDeferred.push(async (OneSignal) => {
      try {
        if (enable) {
          await OneSignal.User?.PushSubscription?.optIn()
        } else {
          await OneSignal.User?.PushSubscription?.optOut()
        }
        const state = OneSignal.User?.PushSubscription?.optedIn ?? false
        resolve(state)
      } catch (err) {
        console.error('Failed to toggle push subscription:', err)
        resolve(false)
      }
    })
  })
}
