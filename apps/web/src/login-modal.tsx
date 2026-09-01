import { useEffect, useState } from 'react'
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
  const [isSdkLoaded, setIsSdkLoaded] = useState(false)

  // Initialize Google Sign-In SDK
  useEffect(() => {
    if (!isOpen) return

    const handleCredentialResponse = async (response: any) => {
      try {
        const base64Url = response.credential.split('.')[1]
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
        const jsonPayload = decodeURIComponent(
          atob(base64)
            .split('')
            .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
            .join('')
        )
        const payload = JSON.parse(jsonPayload)

        // Login & sync profile via backend
        const res = await fetch('/api/v1/auth/google-login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: payload.email,
            name: payload.name,
            avatar_url: payload.picture,
            google_id: payload.sub,
          }),
        })
        const json = await res.json()
        if (json.success && (json.user || json.data)) {
          const authUser = json.user || json.data
          onLoginSuccess(authUser)
          onClose()
        } else {
          setErrorMsg(json.error || 'Gagal autentikasi akun Google.')
        }
      } catch (err) {
        console.error('Google Auth Error:', err)
        setErrorMsg('Gagal memproses data akun Google.')
      }
    }

    const checkAndInitGoogle = () => {
      if (window.google?.accounts?.id) {
        setIsSdkLoaded(true)
        window.google.accounts.id.initialize({
          client_id: '188996269809-l276mh1sbhtikbo9kvvprs9r80bul633.apps.googleusercontent.com',
          callback: handleCredentialResponse,
          auto_select: false,
        })
        const btnParent = document.getElementById('googleSignInBtn')
        if (btnParent) {
          btnParent.innerHTML = ''
          window.google.accounts.id.renderButton(btnParent, {
            theme: 'filled_blue',
            size: 'large',
            width: 320,
            text: 'continue_with',
            shape: 'pill',
          })
        }
      }
    }

    const timer = setTimeout(checkAndInitGoogle, 100)
    return () => clearTimeout(timer)
  }, [isOpen, onLoginSuccess, onClose])

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

        {/* Single Google Sign-In Button */}
        <div className="flex flex-col items-center justify-center min-h-[50px] py-2">
          <div id="googleSignInBtn" className="flex justify-center w-full"></div>
          {!isSdkLoaded && (
            <p className="text-xs text-neutral-400 animate-pulse">Memuat Google Sign-In...</p>
          )}
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
