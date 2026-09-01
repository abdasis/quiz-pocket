import { useState } from 'react'
import { Trophy, Flame, Moon, Sun, ArrowLeft, LogIn, LogOut, Award } from 'lucide-react'

export interface AuthUser {
  id: number
  email: string
  name: string
  avatar_url?: string
  points?: number
  streak?: number
  quizzes_completed?: number
}

interface AppHeaderProps {
  theme: 'light' | 'dark'
  onToggleTheme: () => void
  onHomeClick: () => void
  currentTitle?: string
  streak?: number
  user: AuthUser | null
  onOpenLogin: () => void
  onLogout: () => void
}

export function AppHeader({
  theme,
  onToggleTheme,
  onHomeClick,
  currentTitle,
  user,
  onOpenLogin,
  onLogout,
}: AppHeaderProps) {
  const [showUserMenu, setShowUserMenu] = useState(false)

  return (
    <header className="sticky top-0 z-50 w-full bg-white/80 dark:bg-[#090a0f]/80 backdrop-blur-2xl border-b border-black/[0.06] dark:border-white/[0.08] transition-colors">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand Logo & Back Action */}
        <div className="flex items-center gap-3">
          {currentTitle ? (
            <button
              onClick={onHomeClick}
              className="h-10 w-10 rounded-2xl bg-black/[0.04] dark:bg-white/[0.06] hover:bg-black/[0.08] dark:hover:bg-white/[0.1] border border-black/[0.06] dark:border-white/[0.08] flex items-center justify-center cursor-pointer pressable"
              title="Kembali ke Beranda"
            >
              <ArrowLeft className="w-5 h-5 text-neutral-800 dark:text-neutral-200" />
            </button>
          ) : (
            <button
              onClick={onHomeClick}
              className="flex items-center gap-2.5 cursor-pointer text-left pressable"
            >
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 flex items-center justify-center text-white shadow-sm">
                <Trophy className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-base font-bold text-neutral-900 dark:text-white leading-tight flex items-center gap-1.5">
                  Quiz Pocket
                  <span className="text-[10px] uppercase tracking-wider font-semibold px-1.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/60">
                    Live
                  </span>
                </h1>
                <p className="text-[11px] text-neutral-500 font-medium">Rotasi kuis tiap 30 menit</p>
              </div>
            </button>
          )}

          {currentTitle && (
            <div className="truncate max-w-[180px] sm:max-w-xs">
              <h2 className="text-sm font-bold text-neutral-900 dark:text-white truncate">{currentTitle}</h2>
              <p className="text-[11px] text-neutral-500">Sesi 30 Menit Sedang Berjalan</p>
            </div>
          )}
        </div>

        {/* Right Stats & Theme Switcher & User Profile */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* User Points Badge */}
          {user && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200/80 dark:border-indigo-800/40 text-indigo-900 dark:text-indigo-300">
              <Award className="w-4 h-4 text-indigo-500" />
              <span className="text-xs font-extrabold font-mono">{user.points || 0} pts</span>
            </div>
          )}

          {/* Streak Counter */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800/40 text-amber-900 dark:text-amber-300">
            <Flame className="w-4 h-4 text-amber-500 fill-amber-500" />
            <span className="text-xs font-bold font-mono">{user?.streak || 1}</span>
          </div>

          {/* Theme Switcher Button */}
          <button
            onClick={onToggleTheme}
            className="h-10 w-10 rounded-2xl bg-black/[0.04] dark:bg-white/[0.06] hover:bg-black/[0.08] dark:hover:bg-white/[0.1] border border-black/[0.06] dark:border-white/[0.08] flex items-center justify-center cursor-pointer pressable"
            title="Ganti Tema"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-neutral-700" />
            )}
          </button>

          {/* User Auth Profile / Login Button */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="h-10 px-2 sm:px-3 rounded-2xl bg-black/[0.04] dark:bg-white/[0.06] hover:bg-black/[0.08] dark:hover:bg-white/[0.1] border border-black/[0.06] dark:border-white/[0.08] flex items-center gap-2 cursor-pointer pressable"
              >
                {user.avatar_url ? (
                  <img src={user.avatar_url} alt={user.name} className="w-6 h-6 rounded-full object-cover" />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center">
                    {user.name ? user.name[0].toUpperCase() : 'U'}
                  </div>
                )}
                <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200 hidden sm:inline max-w-[100px] truncate">
                  {user.name || user.email.split('@')[0]}
                </span>
              </button>

              {/* User Dropdown Menu */}
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-56 p-2 rounded-2xl bg-white dark:bg-[#12131a] border border-black/[0.08] dark:border-white/[0.1] shadow-xl z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="p-2 border-b border-black/[0.06] dark:border-white/[0.08]">
                    <p className="text-xs font-bold text-neutral-900 dark:text-white truncate">{user.name || 'User'}</p>
                    <p className="text-[11px] text-neutral-500 truncate">{user.email}</p>
                    <div className="mt-1.5 flex items-center justify-between text-[10px] text-neutral-500">
                      <span>Total Poin:</span>
                      <b className="text-indigo-600 dark:text-indigo-400 font-mono">{user.points || 0}</b>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setShowUserMenu(false)
                      onLogout()
                    }}
                    className="w-full mt-1 p-2 rounded-xl text-left text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center gap-2 cursor-pointer pressable"
                  >
                    <LogOut className="w-4 h-4" />
                    Keluar Akun
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={onOpenLogin}
              className="h-10 px-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs flex items-center gap-1.5 cursor-pointer pressable shadow-xs"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Masuk</span>
            </button>
          )}
        </div>
      </div>
    </header>
  )
}
