import { useState, useEffect } from 'react'
import { X, Mail, Sparkles, ShieldCheck } from 'lucide-react'
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
  const [emailInput, setEmailInput] = useState('')
  const [nameInput, setNameInput] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  // Initialize Google One Tap / Sign-In if available
  useEffect(() => {
    if (!isOpen) return

    // Helper decode JWT
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

        // Login via backend
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
        if (json.success) {
          onLoginSuccess(json.data)
          onClose()
        }
      } catch (err) {
        console.error('Google Auth Error:', err)
      }
    }

    if (window.google?.accounts?.id) {
      window.google.accounts.id.initialize({
        client_id: '940601303-runcntjqat1j56ghqlip78eejl4pdakm.apps.googleusercontent.com',
        callback: handleCredentialResponse,
      })
      const btnParent = document.getElementById('googleSignInBtn')
      if (btnParent) {
        window.google.accounts.id.renderButton(btnParent, {
          theme: 'outline',
          size: 'large',
          width: '100%',
          text: 'signin_with',
          shape: 'pill',
        })
      }
    }
  }, [isOpen, onLoginSuccess, onClose])

  const handleManualEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!emailInput || !emailInput.includes('@')) {
      setErrorMsg('Masukkan alamat Gmail yang valid.')
      return
    }

    setIsSubmitting(true)
    setErrorMsg('')

    try {
      const res = await fetch('/api/v1/auth/google-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: emailInput.trim(),
          name: nameInput.trim() || emailInput.split('@')[0],
          avatar_url: `https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(emailInput)}`,
          google_id: '',
        }),
      })
      const json = await res.json()
      if (json.success) {
        onLoginSuccess(json.data)
        onClose()
      } else {
        setErrorMsg(json.error || 'Gagal masuk akun.')
      }
    } catch (err) {
      setErrorMsg('Terjadi kesalahan jaringan.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-md bg-white dark:bg-[#12131a] rounded-3xl border border-black/[0.08] dark:border-white/[0.1] shadow-2xl p-6 sm:p-8 space-y-6 animate-in zoom-in-95 duration-150">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-500 hover:text-neutral-900 dark:hover:text-white cursor-pointer pressable"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/60 dark:border-indigo-800/40 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
            <Sparkles className="w-7 h-7" />
          </div>
          <h3 className="text-xl font-bold text-neutral-900 dark:text-white">Masuk dengan Gmail</h3>
          <p className="text-xs text-neutral-500 max-w-xs mx-auto">
            Simpan pencapaian kuis, ranking leaderboard, dan riwayat skor belajar kamu.
          </p>
        </div>

        {/* Google One-Tap / Official Button */}
        <div id="googleSignInBtn" className="w-full flex justify-center min-h-[44px]"></div>

        {/* Divider */}
        <div className="relative flex items-center justify-center">
          <div className="border-t border-black/[0.08] dark:border-white/[0.08] w-full" />
          <span className="bg-white dark:bg-[#12131a] px-3 text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
            Atau Email Gmail
          </span>
        </div>

        {/* Form Quick Login */}
        <form onSubmit={handleManualEmailLogin} className="space-y-3.5">
          <div>
            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
              Alamat Gmail
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3.5" />
              <input
                type="email"
                required
                placeholder="nama@gmail.com"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                className="w-full h-11 pl-10 pr-3.5 rounded-2xl bg-neutral-50 dark:bg-neutral-900/60 border border-black/[0.08] dark:border-white/[0.08] text-sm text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
              Nama Lengkap (Opsional)
            </label>
            <input
              type="text"
              placeholder="Contoh: Abd. Asis"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              className="w-full h-11 px-3.5 rounded-2xl bg-neutral-50 dark:bg-neutral-900/60 border border-black/[0.08] dark:border-white/[0.08] text-sm text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            />
          </div>

          {errorMsg && <p className="text-xs text-rose-500 font-medium">{errorMsg}</p>}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-12 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm flex items-center justify-center gap-2 cursor-pointer pressable shadow-xs disabled:opacity-50"
          >
            {isSubmitting ? 'Memproses...' : 'Lanjutkan Masuk'}
          </button>
        </form>

        <div className="flex items-center justify-center gap-1.5 text-[11px] text-neutral-400">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          <span>Privasi terjaga, tanpa password rumit</span>
        </div>
      </div>
    </div>
  )
}
