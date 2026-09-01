import { useState, useRef } from 'react'
import { X, Camera, User, Check, Sparkles } from 'lucide-react'
import type { AuthUser } from './app-header'

interface EditProfileModalProps {
  isOpen: boolean
  onClose: () => void
  user: AuthUser | null
  onProfileUpdated: (updated: AuthUser) => void
}

export function EditProfileModal({ isOpen, onClose, user, onProfileUpdated }: EditProfileModalProps) {
  if (!isOpen || !user) return null

  const [name, setName] = useState(user.name || '')
  const [avatarUrl, setAvatarUrl] = useState(user.avatar_url || '')
  const [isSaving, setIsSaving] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 2 * 1024 * 1024) {
      setErrorMsg('Ukuran file foto maksimal 2MB')
      return
    }

    const reader = new FileReader()
    reader.onload = (event) => {
      if (event.target?.result) {
        setAvatarUrl(event.target.result as string)
        setErrorMsg(null)
      }
    }
    reader.readAsDataURL(file)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      setErrorMsg('Nama tampilan tidak boleh kosong')
      return
    }

    setIsSaving(true)
    setErrorMsg(null)

    try {
      const res = await fetch('/api/v1/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user.email,
          name: name.trim(),
          avatar_url: avatarUrl,
        }),
      })
      const json = await res.json()
      if (json.success && json.data) {
        onProfileUpdated(json.data)
        onClose()
      } else {
        setErrorMsg(json.error || 'Gagal memperbarui profil')
      }
    } catch {
      setErrorMsg('Terjadi kesalahan jaringan saat menyimpan')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white dark:bg-[#111114] rounded-3xl border border-black/[0.08] dark:border-white/[0.1] shadow-2xl p-6 sm:p-8 space-y-6 animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200/60 dark:border-indigo-800/40 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-neutral-950 dark:text-white">Edit Profil Akun</h3>
              <p className="text-xs text-neutral-500 font-medium">Ubah nama dan foto profil Anda</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-black/[0.04] dark:bg-white/[0.06] hover:bg-black/[0.08] dark:hover:bg-white/[0.1] flex items-center justify-center text-neutral-500 cursor-pointer pressable"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 text-rose-600 dark:text-rose-300 text-xs font-medium">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-5">
          {/* Avatar Upload Preview */}
          <div className="flex flex-col items-center justify-center gap-3">
            <div className="relative group">
              <div className="w-24 h-24 rounded-full bg-neutral-100 dark:bg-neutral-800 border-2 border-black/[0.08] dark:border-white/[0.1] overflow-hidden shadow-xs">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Avatar Preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-neutral-400">
                    {name ? name[0].toUpperCase() : 'U'}
                  </div>
                )}
              </div>

              {/* Upload Trigger Badge */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 flex items-center justify-center shadow-md cursor-pointer pressable"
                title="Ganti Foto"
              >
                <Camera className="w-4 h-4" />
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>

            <p className="text-[11px] text-neutral-400 font-mono">Format JPG/PNG maks 2MB</p>
          </div>

          {/* Name Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
              Nama Tampilan (Username)
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Masukkan nama tampilan..."
              className="w-full h-11 px-4 rounded-xl bg-neutral-50 dark:bg-[#161619] border border-black/[0.08] dark:border-white/[0.1] text-xs sm:text-sm font-medium text-neutral-900 dark:text-white focus:outline-hidden focus:border-indigo-500 transition-colors"
            />
          </div>

          {/* Email Read-only */}
          <div className="space-y-1.5 opacity-60">
            <label className="text-xs font-semibold text-neutral-500">
              Email Akun Google (Tetap)
            </label>
            <input
              type="text"
              disabled
              value={user.email}
              className="w-full h-11 px-4 rounded-xl bg-neutral-100 dark:bg-neutral-800/60 border border-black/[0.04] dark:border-white/[0.04] text-xs font-mono text-neutral-500 cursor-not-allowed"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="h-11 px-5 rounded-xl bg-black/[0.04] dark:bg-white/[0.06] hover:bg-black/[0.08] text-xs font-semibold text-neutral-700 dark:text-neutral-300 cursor-pointer pressable"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="h-11 px-6 rounded-xl bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 hover:bg-neutral-800 dark:hover:bg-neutral-100 text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer pressable"
            >
              {isSaving ? (
                <Sparkles className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Check className="w-3.5 h-3.5" />
              )}
              <span>{isSaving ? 'Menyimpan...' : 'Simpan Perubahan'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
