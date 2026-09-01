import { Trophy, Flame, Moon, Sun, ArrowLeft } from 'lucide-react'

interface AppHeaderProps {
  theme: 'light' | 'dark'
  onToggleTheme: () => void
  onHomeClick: () => void
  currentTitle?: string
  streak?: number
}

export function AppHeader({ theme, onToggleTheme, onHomeClick, currentTitle, streak = 0 }: AppHeaderProps) {
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
                    Pro
                  </span>
                </h1>
                <p className="text-[11px] text-neutral-500 font-medium">Asah wawasan & logika</p>
              </div>
            </button>
          )}

          {currentTitle && (
            <div className="truncate max-w-[200px] sm:max-w-xs">
              <h2 className="text-sm font-bold text-neutral-900 dark:text-white truncate">{currentTitle}</h2>
              <p className="text-[11px] text-neutral-500">Mode Kuis Aktif</p>
            </div>
          )}
        </div>

        {/* Right Stats & Theme Switcher */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Streak Counter */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800/40 text-amber-900 dark:text-amber-300">
            <Flame className="w-4 h-4 text-amber-500 fill-amber-500" />
            <span className="text-xs font-bold font-mono">{streak}</span>
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
        </div>
      </div>
    </header>
  )
}
