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
 * Check apakah user sudah subscribe push notification
 */
export function checkSubscriptionState(OneSignal: any): boolean {
  if (typeof Notification !== 'undefined' && Notification.permission !== 'granted') {
    return false
  }
  const optedIn = OneSignal?.User?.PushSubscription?.optedIn
  const hasToken = Boolean(OneSignal?.User?.PushSubscription?.token || OneSignal?.User?.PushSubscription?.id)
  if (typeof optedIn === 'boolean') {
    return optedIn
  }
  return hasToken || (typeof Notification !== 'undefined' && Notification.permission === 'granted')
}

/**
 * Inisialisasi OneSignal Web SDK
 */
export function initOneSignal(onSubscriptionChange?: (isSubscribed: boolean) => void) {
  if (typeof window === 'undefined') return

  // Status awal dari Notification API browser jika ada
  if (typeof Notification !== 'undefined') {
    if (Notification.permission === 'granted') {
      const saved = localStorage.getItem('quiz_pocket_push_opted_in')
      if (saved !== 'false' && onSubscriptionChange) {
        onSubscriptionChange(true)
      }
    } else if (Notification.permission === 'denied') {
      if (onSubscriptionChange) {
        onSubscriptionChange(false)
      }
    }
  }

  window.OneSignalDeferred = window.OneSignalDeferred || []
  window.OneSignalDeferred.push(async (OneSignal) => {
    if (!isInitialized) {
      await OneSignal.init({
        appId: ONESIGNAL_APP_ID,
        safari_web_id: ONESIGNAL_SAFARI_WEB_ID,
        notifyButton: {
          enable: false,
        },
        allowLocalhostAsSecureOrigin: true,
      })
      isInitialized = true
    }

    const updateState = () => {
      const active = checkSubscriptionState(OneSignal)
      localStorage.setItem('quiz_pocket_push_opted_in', active ? 'true' : 'false')
      if (onSubscriptionChange) {
        onSubscriptionChange(active)
      }
    }

    updateState()

    // Event listeners saat subscription / permission berubah
    OneSignal.User?.PushSubscription?.addEventListener('change', () => {
      updateState()
    })

    OneSignal.Notifications?.addEventListener('permissionChange', () => {
      updateState()
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
          // Minta permission browser jika belum diizinkan
          if (typeof Notification !== 'undefined' && Notification.permission !== 'granted') {
            await OneSignal.Notifications?.requestPermission()
          }
          await OneSignal.User?.PushSubscription?.optIn()
        } else {
          await OneSignal.User?.PushSubscription?.optOut()
        }

        const state = checkSubscriptionState(OneSignal)
        localStorage.setItem('quiz_pocket_push_opted_in', state ? 'true' : 'false')
        resolve(state)
      } catch (err) {
        console.error('Failed to toggle push subscription:', err)
        resolve(false)
      }
    })
  })
}
