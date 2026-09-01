import { useEffect, useState, useRef } from 'react'
import { X, Sparkles, ShieldCheck, AlertCircle } from 'lucide-react'
import type { AuthUser } from './app-header'

interface LoginModalProps {
  isOpen: boolean
  onClose: () => void
  onLoginSuccess: (user: AuthUser) => void
}

declare global {
  interface Window {
    google?: any
  }
}

export function LoginModal({ isOpen, onClose, onLoginSuccess }: LoginModalProps) {
  const [errorMsg, setErrorMsg] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const onLoginSuccessRef = useRef(onLoginSuccess)
  const onCloseRef = useRef(onClose)

  useEffect(() => {
    onLoginSuccessRef.current = onLoginSuccess
    onCloseRef.current = onClose
  }, [onLoginSuccess, onClose])

  // Custom Click Handler -> Trigger Google OAuth2 Token Client Popup
  const handleCustomGoogleLogin = () => {
    setErrorMsg('')
    const google = window.google
    if (!google?.accounts?.oauth2) {
      setErrorMsg('Google SDK sedang disiapkan, silakan klik kembali.')
      return
    }

    try {
      setIsLoading(true)
      const tokenClient = google.accounts.oauth2.initTokenClient({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID || '',
        scope: 'email profile openid',
        callback: async (tokenResponse: any) => {
          if (tokenResponse.error) {
            setIsLoading(false)
            setErrorMsg('Gagal menghubungkan akun Google.')
            return
          }

          try {
            // Send token ke backend untuk sinkronisasi data profil
            const res = await fetch('/api/v1/auth/google-login', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                token: tokenResponse.access_token,
              }),
            })
            const json = await res.json()
            if (json.success && (json.user || json.data)) {
              onLoginSuccessRef.current(json.user || json.data)
              onCloseRef.current()
            } else {
              setErrorMsg(json.error || 'Gagal memproses autentikasi profil.')
            }
          } catch (err) {
            console.error(err)
            setErrorMsg('Gagal menghubungi server.')
          } finally {
            setIsLoading(false)
          }
        },
      })

      // Membuka popup pilihan akun Google secara eksplisit & pasti muncul
      tokenClient.requestAccessToken({ prompt: 'select_account' })
    } catch (err) {
      console.error('OAuth Token Client Error:', err)
      setIsLoading(false)
      setErrorMsg('Gagal membuka popup pilihan akun.')
    }
  }

  // Pre-initialize Google script if not yet ready
  useEffect(() => {
    if (!isOpen) return
    if (!window.google?.accounts?.id) {
      const script = document.createElement('script')
      script.src = 'https://accounts.google.com/gsi/client'
      script.async = true
      script.defer = true
      document.body.appendChild(script)
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-sm bg-white dark:bg-[#12131a] rounded-3xl border border-black/[0.08] dark:border-white/[0.1] shadow-2xl p-6 sm:p-8 space-y-6 text-center animate-in zoom-in-95 duration-150">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-500 hover:text-neutral-900 dark:hover:text-white cursor-pointer pressable"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="space-y-2">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/60 dark:border-indigo-800/40 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
            <Sparkles className="w-7 h-7" />
          </div>
          <h3 className="text-xl font-bold text-neutral-900 dark:text-white">Masuk dengan Akun Google</h3>
          <p className="text-xs text-neutral-500 max-w-xs mx-auto leading-relaxed">
            Wajib masuk menggunakan akun Gmail / Google untuk mencatat poin, ranking, dan streak belajar kuis.
          </p>
        </div>

        {/* Native Stable Apple-Style Google Sign-In Button */}
        <div className="pt-2">
          <button
            onClick={handleCustomGoogleLogin}
            disabled={isLoading}
            className="w-full py-3.5 px-4 rounded-2xl bg-white dark:bg-[#1c1d24] hover:bg-neutral-50 dark:hover:bg-[#24252e] text-neutral-900 dark:text-white font-bold text-xs sm:text-sm border border-black/[0.1] dark:border-white/[0.12] shadow-xs flex items-center justify-center gap-3 transition-all pressable cursor-pointer disabled:opacity-50"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.17 0 10.03 0 12s.45 3.83 1.25 5.42l4.03-3.15z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
              />
            </svg>
            <span>{isLoading ? 'Menghubungkan...' : 'Lanjutkan dengan Google'}</span>
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200/60 dark:border-rose-800/40 text-xs text-rose-600 dark:text-rose-400 flex items-center gap-2 text-left">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Security badge */}
        <div className="flex items-center justify-center gap-1.5 text-[11px] text-neutral-400 pt-2 border-t border-black/[0.06] dark:border-white/[0.08]">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          <span>Autentikasi resmi Google OAuth 2.0</span>
        </div>
      </div>
    </div>
  )
}
