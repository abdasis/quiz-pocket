declare global {
  interface Window {
    OneSignalDeferred?: Array<(OneSignal: any) => void>
    OneSignal?: any
  }
}

export const ONESIGNAL_APP_ID = import.meta.env.VITE_ONESIGNAL_APP_ID || 'd30c5e7b-8bb7-4f65-8b36-9d0426b38466'

let isInitialized = false

export function initOneSignal(onSubscriptionChange?: (isSubscribed: boolean) => void) {
  if (typeof window === 'undefined') return

  window.OneSignalDeferred = window.OneSignalDeferred || []
  window.OneSignalDeferred.push(async (OneSignal) => {
    if (isInitialized) return
    try {
      await OneSignal.init({
        appId: ONESIGNAL_APP_ID,
        allowLocalhostAsSecureOrigin: true,
        notifyButton: {
          enable: false, // Gunakan custom toggle Apple HIG di header UI
        },
      })
      isInitialized = true

      // Cek status subscription awal
      if (OneSignal.User && OneSignal.User.PushSubscription) {
        const isSubscribed = OneSignal.User.PushSubscription.optedIn
        if (onSubscriptionChange) {
          onSubscriptionChange(isSubscribed)
        }
        OneSignal.User.PushSubscription.addEventListener('change', (event: any) => {
          if (onSubscriptionChange) {
            onSubscriptionChange(Boolean(event?.current?.optedIn))
          }
        })
      }
    } catch (err) {
      console.warn('OneSignal init error:', err)
    }
  })
}

export async function togglePushSubscription(enable: boolean): Promise<boolean> {
  return new Promise((resolve) => {
    if (!window.OneSignal) {
      resolve(false)
      return
    }
    try {
      if (enable) {
        window.OneSignal.Notifications.requestPermission().then((granted: boolean) => {
          if (granted && window.OneSignal.User?.PushSubscription) {
            window.OneSignal.User.PushSubscription.optIn()
            resolve(true)
          } else {
            resolve(false)
          }
        }).catch(() => resolve(false))
      } else {
        if (window.OneSignal.User?.PushSubscription) {
          window.OneSignal.User.PushSubscription.optOut()
          resolve(false)
        } else {
          resolve(false)
        }
      }
    } catch (e) {
      console.error('togglePushSubscription error:', e)
      resolve(false)
    }
  })
}
