import { X, Flame, BookOpen, Compass, GraduationCap, Award, Zap } from 'lucide-react'
import type { AuthUser } from './app-header'
import { getUserTitle, getNextTitleProgress } from './user-ranks'

interface StatsModalProps {
  isOpen: boolean
  onClose: () => void
  user: AuthUser | null
}

export function StatsModal({ isOpen, onClose, user }: StatsModalProps) {
  if (!isOpen || !user) return null

  const userTitle = getUserTitle(user.points || 0)
  const rankProgress = getNextTitleProgress(user.points || 0)

  const sdTotal = user.sd_total || 0
  const sdCorrect = user.sd_correct || 0
  const sdAccuracy = sdTotal > 0 ? Math.round((sdCorrect / sdTotal) * 100) : 0

  const smpTotal = user.smp_total || 0
  const smpCorrect = user.smp_correct || 0
  const smpAccuracy = smpTotal > 0 ? Math.round((smpCorrect / smpTotal) * 100) : 0

  const smaTotal = user.sma_total || 0
  const smaCorrect = user.sma_correct || 0
  const smaAccuracy = smaTotal > 0 ? Math.round((smaCorrect / smaTotal) * 100) : 0

  const totalAnswered = sdTotal + smpTotal + smaTotal
  const totalCorrect = sdCorrect + smpCorrect + smaCorrect
  const overallAccuracy = totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 100) : 0

  const streakMultiplier = (user.streak || 1) >= 7 ? '1.5x' : (user.streak || 1) >= 3 ? '1.2x' : '1.0x'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white dark:bg-[#111114] rounded-3xl border border-black/[0.08] dark:border-white/[0.1] shadow-2xl p-6 sm:p-8 space-y-6 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200/60 dark:border-indigo-800/40 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-neutral-950 dark:text-white">Rapor Wawasan & Gelar</h3>
              <p className="text-xs text-neutral-500 font-medium">Evaluasi nalar berdasarkan jenjang pendidikan</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-black/[0.04] dark:bg-white/[0.06] hover:bg-black/[0.08] dark:hover:bg-white/[0.1] flex items-center justify-center text-neutral-500 cursor-pointer pressable"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* User Summary Top Card with Honor Title */}
        <div className="p-5 rounded-2xl bg-neutral-50 dark:bg-neutral-900/60 border border-black/[0.04] dark:border-white/[0.04] space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-neutral-200 dark:bg-neutral-800 overflow-hidden">
                {user.avatar_url ? (
                  <img src={user.avatar_url} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xs font-bold text-neutral-500">
                    {user.name ? user.name[0].toUpperCase() : 'U'}
                  </div>
                )}
              </div>
              <div>
                <p className="text-sm font-bold text-neutral-900 dark:text-white">{user.name}</p>
                <div className="flex items-center gap-2 text-xs text-neutral-400 font-mono">
                  <span>{user.points || 0} Pts</span>
                  <span>•</span>
                  <span className="text-indigo-600 dark:text-indigo-400 font-bold">
                    ⚔️ {user.duel_total && user.duel_total > 0 ? `${Math.round(((user.duel_wins || 0) / user.duel_total) * 100)}% WR` : '0% WR'} ({user.duel_wins || 0}M/{user.duel_total || 0}T)
                  </span>
                </div>
              </div>
            </div>

            <div className="text-right">
              <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 text-xs font-bold font-mono border border-amber-200/60 dark:border-amber-800/40">
                <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                <span>{user.streak || 1} Hari ({streakMultiplier})</span>
              </div>
            </div>
          </div>

          {/* Honor Title Banner & Level Progress */}
          <div className={`p-4 rounded-2xl border space-y-2.5 ${userTitle.bgClass} ${userTitle.borderClass}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-white/80 dark:bg-black/40 flex items-center justify-center shadow-2xs">
                  <Zap className={`w-4 h-4 ${userTitle.colorClass}`} />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-1.5 py-0.2 rounded bg-black/5 dark:bg-white/10 text-neutral-500">
                      Tier {userTitle.tier} / 10
                    </span>
                    <span className={`text-xs font-bold font-mono ${userTitle.colorClass}`}>
                      {userTitle.title}
                    </span>
                  </div>
                  <p className="text-[11px] text-neutral-600 dark:text-neutral-400 mt-0.5">{userTitle.description}</p>
                </div>
              </div>
              <span className="text-[10px] font-mono font-bold text-neutral-400">Min {userTitle.minPoints} pts</span>
            </div>

            {/* Next Tier Progress Bar */}
            {rankProgress.nextTitle ? (
              <div className="pt-2 border-t border-black/[0.05] dark:border-white/[0.05] space-y-1.5">
                <div className="flex items-center justify-between text-[10px] font-mono">
                  <span className="text-neutral-500">
                    Menuju <strong className="text-neutral-800 dark:text-neutral-200">{rankProgress.nextTitle.title}</strong>
                  </span>
                  <span className="font-bold text-indigo-600 dark:text-indigo-400">
                    Kurang {rankProgress.pointsNeeded} Pts ({rankProgress.progressPercent}%)
                  </span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-black/10 dark:bg-white/10 overflow-hidden">
                  <div
                    className="h-full bg-indigo-500 rounded-full transition-all duration-500"
                    style={{ width: `${rankProgress.progressPercent}%` }}
                  />
                </div>
              </div>
            ) : (
              <div className="pt-1.5 border-t border-black/[0.05] dark:border-white/[0.05] text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                👑 Anda telah mencapai Gelar Tertinggi di Quiz Pocket!
              </div>
            )}
          </div>
        </div>

        {/* 3 Tiers Performance Breakdown */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-wider font-mono">
            Akurasi per Tingkatan
          </h4>

          {/* SD Tier */}
          <div className="p-4 rounded-2xl bg-white dark:bg-[#151518] border border-black/[0.06] dark:border-white/[0.08] space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-neutral-900 dark:text-white flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-emerald-500" />
                Tingkat SD (Sains & Alam)
              </span>
              <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                {sdAccuracy}% ({sdCorrect}/{sdTotal})
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                style={{ width: `${sdAccuracy}%` }}
              />
            </div>
          </div>

          {/* SMP Tier */}
          <div className="p-4 rounded-2xl bg-white dark:bg-[#151518] border border-black/[0.06] dark:border-white/[0.08] space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-neutral-900 dark:text-white flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-blue-500" />
                Tingkat SMP (Geografi & Fisika)
              </span>
              <span className="font-mono font-bold text-blue-600 dark:text-blue-400">
                {smpAccuracy}% ({smpCorrect}/{smpTotal})
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
              <div
                className="h-full bg-blue-500 rounded-full transition-all duration-500"
                style={{ width: `${smpAccuracy}%` }}
              />
            </div>
          </div>

          {/* SMA Tier */}
          <div className="p-4 rounded-2xl bg-white dark:bg-[#151518] border border-black/[0.06] dark:border-white/[0.08] space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-neutral-900 dark:text-white flex items-center gap-1.5">
                <GraduationCap className="w-3.5 h-3.5 text-purple-500" />
                Tingkat SMA (Logika & Finansial)
              </span>
              <span className="font-mono font-bold text-purple-600 dark:text-purple-400">
                {smaAccuracy}% ({smaCorrect}/{smaTotal})
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
              <div
                className="h-full bg-purple-500 rounded-full transition-all duration-500"
                style={{ width: `${smaAccuracy}%` }}
              />
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="pt-2 flex items-center justify-between text-xs text-neutral-400 font-mono">
          <span>{user.quizzes_completed || 0} Sesi Selesai</span>
          <span>Akurasi Global: {overallAccuracy}%</span>
        </div>
      </div>
    </div>
  )
}
