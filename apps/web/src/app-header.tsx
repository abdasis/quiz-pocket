import { useState } from 'react'
import { Trophy, Flame, Moon, Sun, ArrowLeft, LogIn, LogOut, Award, BarChart2, UserCog, Bell, BellOff } from 'lucide-react'

export interface AuthUser {
  id: number
  email: string
  name: string
  avatar_url?: string
  points?: number
  weekly_points?: number
  streak?: number
  duel_wins?: number
  duel_losses?: number
  duel_draws?: number
  duel_total?: number
  quizzes_completed?: number
  last_active_date?: string
  sd_correct?: number
  sd_total?: number
  smp_correct?: number
  smp_total?: number
  sma_correct?: number
  sma_total?: number
}

interface AppHeaderProps {
  theme: 'light' | 'dark'
  onToggleTheme: () => void
  onHomeClick: () => void
  onOpenProfileModal?: () => void
  onOpenEditProfileModal?: () => void
  currentTitle?: string
  user: AuthUser | null
  onOpenLogin: () => void
  onLogout: () => void
  isNotificationEnabled?: boolean
  onToggleNotification?: () => void
}

export function AppHeader({
  theme,
  onToggleTheme,
  onHomeClick,
  onOpenProfileModal,
  onOpenEditProfileModal,
  currentTitle,
  user,
  onOpenLogin,
  onLogout,
  isNotificationEnabled = false,
  onToggleNotification,
}: AppHeaderProps) {
  const [showUserMenu, setShowUserMenu] = useState(false)

  return (
    <header className="sticky top-0 z-50 w-full bg-white/85 dark:bg-[#000000]/85 backdrop-blur-2xl border-b border-black/[0.06] dark:border-white/[0.08] transition-colors">
      <div className="max-w-4xl mx-auto px-3 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-2">
        {/* Brand Logo & Back Action */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          {currentTitle ? (
            <button
              onClick={onHomeClick}
              className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl sm:rounded-2xl bg-black/[0.04] dark:bg-white/[0.06] hover:bg-black/[0.08] dark:hover:bg-white/[0.1] border border-black/[0.06] dark:border-white/[0.08] flex items-center justify-center cursor-pointer pressable shrink-0"
              title="Kembali ke Beranda"
            >
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 text-neutral-800 dark:text-neutral-200" />
            </button>
          ) : (
            <button
              onClick={onHomeClick}
              className="flex items-center gap-2 sm:gap-2.5 cursor-pointer text-left pressable shrink-0"
            >
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-neutral-950 dark:bg-white flex items-center justify-center text-white dark:text-neutral-950 shadow-xs">
                <Trophy className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div>
                <h1 className="text-sm sm:text-base font-bold text-neutral-900 dark:text-white leading-tight flex items-center gap-1">
                  Quiz Pocket
                  <span className="text-[9px] sm:text-[10px] uppercase tracking-wider font-semibold px-1 sm:px-1.5 py-0.2 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-800/60">
                    Live
                  </span>
                </h1>
                <p className="text-[10px] sm:text-[11px] text-neutral-500 font-medium hidden sm:block">Rotasi kuis tiap 30 menit</p>
              </div>
            </button>
          )}

          {currentTitle && (
            <div className="truncate max-w-[130px] xs:max-w-[180px] sm:max-w-xs">
              <h2 className="text-xs sm:text-sm font-bold text-neutral-900 dark:text-white truncate">{currentTitle}</h2>
              <p className="text-[10px] sm:text-[11px] text-neutral-500 hidden sm:block">Sesi Sedang Berjalan</p>
            </div>
          )}
        </div>

        {/* Right Stats & Theme Switcher & User Profile */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          {/* User Points Badge */}
          {user && (
            <div className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 rounded-xl sm:rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200/80 dark:border-indigo-800/40 text-indigo-900 dark:text-indigo-300">
              <Award className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-indigo-500 shrink-0" />
              <span className="text-[11px] sm:text-xs font-extrabold font-mono">{user.points || 0} pts</span>
            </div>
          )}

          {/* Streak Counter with Bonus Multiplier Indicator */}
          <div 
            onClick={onOpenProfileModal}
            className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 rounded-xl sm:rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800/40 text-amber-900 dark:text-amber-300 cursor-pointer pressable"
            title="Daily Streak (Klik untuk lihat statistik)"
          >
            <Flame className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-500 fill-amber-500 shrink-0" />
            <span className="text-[11px] sm:text-xs font-bold font-mono">{user?.streak || 1}d</span>
            {user && (user.streak || 1) >= 3 && (
              <span className="text-[8px] sm:text-[9px] font-extrabold px-1 rounded bg-amber-500 text-white font-mono">
                {(user.streak || 1) >= 7 ? '1.5x' : '1.2x'}
              </span>
            )}
          </div>

          {/* Notification Toggle Button */}
          {onToggleNotification && (
            <button
              onClick={onToggleNotification}
              className={`h-8 w-8 sm:h-10 sm:w-10 rounded-xl sm:rounded-2xl border flex items-center justify-center cursor-pointer pressable transition-all ${
                isNotificationEnabled
                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400'
                  : 'bg-black/[0.04] dark:bg-white/[0.06] hover:bg-black/[0.08] dark:hover:bg-white/[0.1] border-black/[0.06] dark:border-white/[0.08] text-neutral-400 dark:text-neutral-500'
              }`}
              title={isNotificationEnabled ? 'Pemberitahuan Sesi Baru Aktif' : 'Aktifkan Pemberitahuan Sesi Baru'}
            >
              {isNotificationEnabled ? (
                <Bell className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-amber-500/20" />
              ) : (
                <BellOff className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              )}
            </button>
          )}

          {/* Theme Switcher Button */}
          <button
            onClick={onToggleTheme}
            className="h-8 w-8 sm:h-10 sm:w-10 rounded-xl sm:rounded-2xl bg-black/[0.04] dark:bg-white/[0.06] hover:bg-black/[0.08] dark:hover:bg-white/[0.1] border border-black/[0.06] dark:border-white/[0.08] flex items-center justify-center cursor-pointer pressable"
            title="Ganti Tema"
          >
            {theme === 'dark' ? (
              <Sun className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400" />
            ) : (
              <Moon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-neutral-700" />
            )}
          </button>

          {/* User Auth Profile / Login Button */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="h-8 sm:h-10 px-1.5 sm:px-3 rounded-xl sm:rounded-2xl bg-black/[0.04] dark:bg-white/[0.06] hover:bg-black/[0.08] dark:hover:bg-white/[0.1] border border-black/[0.06] dark:border-white/[0.08] flex items-center gap-1.5 cursor-pointer pressable"
              >
                {user.avatar_url ? (
                  <img src={user.avatar_url} alt={user.name} className="w-5 h-5 sm:w-6 sm:h-6 rounded-full object-cover" />
                ) : (
                  <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-indigo-600 text-white text-[10px] sm:text-xs font-bold flex items-center justify-center">
                    {user.name ? user.name[0].toUpperCase() : 'U'}
                  </div>
                )}
                <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200 hidden sm:inline max-w-[100px] truncate">
                  {user.name || user.email.split('@')[0]}
                </span>
              </button>

              {/* Dropdown Menu */}
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-52 sm:w-56 bg-white dark:bg-[#141416] rounded-2xl border border-black/[0.08] dark:border-white/[0.08] shadow-lg py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-4 py-2 border-b border-black/[0.04] dark:border-white/[0.04]">
                    <p className="text-xs font-bold text-neutral-900 dark:text-white truncate">{user.name}</p>
                    <p className="text-[10px] sm:text-[11px] text-neutral-400 truncate">{user.email}</p>
                  </div>

                  <button
                    onClick={() => {
                      setShowUserMenu(false)
                      if (onOpenEditProfileModal) onOpenEditProfileModal()
                    }}
                    className="w-full px-4 py-2.5 text-left text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-900/60 flex items-center gap-2 cursor-pointer"
                  >
                    <UserCog className="w-4 h-4 text-indigo-500" />
                    <span>Edit Nama & Foto</span>
                  </button>

                  <button
                    onClick={() => {
                      setShowUserMenu(false)
                      if (onOpenProfileModal) onOpenProfileModal()
                    }}
                    className="w-full px-4 py-2.5 text-left text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-900/60 flex items-center gap-2 cursor-pointer"
                  >
                    <BarChart2 className="w-4 h-4 text-indigo-500" />
                    <span>Rapor & Statistik</span>
                  </button>

                  <button
                    onClick={() => {
                      setShowUserMenu(false)
                      onLogout()
                    }}
                    className="w-full px-4 py-2.5 text-left text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 flex items-center gap-2 cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Keluar Akun</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={onOpenLogin}
              className="h-8 sm:h-10 px-2.5 sm:px-4 rounded-xl sm:rounded-2xl bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 hover:bg-neutral-800 dark:hover:bg-neutral-100 font-semibold text-[11px] sm:text-xs flex items-center gap-1.5 cursor-pointer pressable"
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
