import { useState, useEffect, useCallback } from 'react'
import { AppHeader, type AuthUser } from './app-header'
import { QuizPlayer, type Question } from './quiz-player'
import { DuelArena } from './duel-arena'
import { ArticlesView } from './articles-view'
import { LoginModal } from './login-modal'
import { StatsModal } from './stats-modal'
import { SessionHistoryModal } from './session-history-modal'
import { EditProfileModal } from './edit-profile-modal'
import { initOneSignal, togglePushSubscription } from './onesignal-service'
import { getUserTitle } from './user-ranks'
import { 
  Trophy, 
  Clock, 
  CheckCircle2, 
  Play, 
  Sparkles, 
  Compass, 
  GraduationCap, 
  BookOpen, 
  ShieldCheck,
  Flame,
  Gamepad2,
  CalendarDays,
  Smartphone,
  Swords
} from 'lucide-react'

interface LeaderboardUser {
  id: number
  name: string
  email: string
  avatar_url: string
  points: number
  weekly_points: number
  quizzes_completed: number
  streak: number
  duel_wins?: number
  duel_losses?: number
  duel_draws?: number
  duel_total?: number
}

interface LiveSlotResponse {
  slot_id: number
  slot_start: string
  slot_end: string
  seconds_remaining: number
  category: {
    id: number
    title: string
    description: string
    level: string
  }
  questions: Question[]
  user_submitted: boolean
  user_submission: {
    score: number
    correct_count: number
    total: number
  } | null
  participants: number
}

export function App() {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('theme') as 'light' | 'dark') || 'light'
  })
  
  const [user, setUser] = useState<AuthUser | null>(() => {
    try {
      const saved = localStorage.getItem('quiz_pocket_user')
      return (saved && saved !== 'undefined') ? JSON.parse(saved) : null
    } catch {
      return null
    }
  })
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)
  const [isStatsModalOpen, setIsStatsModalOpen] = useState(false)
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false)
  const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState(false)

  // Live Slot & Practice Mode State
  const [liveSlot, setLiveSlot] = useState<LiveSlotResponse | null>(null)
  const [secondsLeft, setSecondsLeft] = useState<number>(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isPlayingDuel, setIsPlayingDuel] = useState(false)
  const [isArticlesMode, setIsArticlesMode] = useState(false)
  const [isPracticeMode, setIsPracticeMode] = useState(false)
  const [practiceQuestions, setPracticeQuestions] = useState<Question[]>([])

  // Leaderboard State & Tab (Weekly vs All-Time)
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([])
  const [leaderboardTab, setLeaderboardTab] = useState<'weekly' | 'alltime'>('weekly')
  const [currentWeekKey, setCurrentWeekKey] = useState<string>('')

  // Push Notification State (OneSignal)
  const [isNotificationEnabled, setIsNotificationEnabled] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('quiz_pocket_push_opted_in')
      if (saved === 'true') return true
      if (typeof Notification !== 'undefined' && Notification.permission === 'granted' && saved !== 'false') {
        return true
      }
    }
    return false
  })

  // OneSignal Init on Mount
  useEffect(() => {
    initOneSignal((subscribed) => {
      setIsNotificationEnabled(subscribed)
    })
  }, [])

  const handleToggleNotification = async () => {
    const nextState = !isNotificationEnabled
    const result = await togglePushSubscription(nextState)
    setIsNotificationEnabled(result)
  }

  // Theme Sync
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
    localStorage.setItem('theme', theme)
  }, [theme])

  const handleToggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'))
  }

  // Fetch Live Slot Info
  const fetchLiveSlot = async () => {
    try {
      const emailQuery = user?.email ? `?email=${encodeURIComponent(user.email)}` : ''
      const res = await fetch(`/api/v1/live-slot${emailQuery}`)
      const data = await res.json()
      if (data.success) {
        setLiveSlot(data)
        setSecondsLeft(data.seconds_remaining)
      }
    } catch (err) {
      console.error('Failed to fetch live slot:', err)
    }
  }

  // Fetch Leaderboard
  const fetchLeaderboard = async (tab = leaderboardTab) => {
    try {
      const res = await fetch(`/api/v1/leaderboard?mode=${tab}`)
      const data = await res.json()
      if (data.success) {
        setLeaderboard(data.data || [])
        if (data.week) setCurrentWeekKey(data.week)
      }
    } catch (err) {
      console.error('Failed to fetch leaderboard:', err)
    }
  }

  // Sync Live Slot and Leaderboard
  useEffect(() => {
    fetchLiveSlot()
    fetchLeaderboard(leaderboardTab)

    // Check initial path for SEO articles mode
    const path = window.location.pathname
    if (path.startsWith('/buku-wawasan')) {
      setIsArticlesMode(true)
    }

    const handlePopState = () => {
      const p = window.location.pathname
      if (p.startsWith('/buku-wawasan')) {
        setIsArticlesMode(true)
      } else {
        setIsArticlesMode(false)
      }
    }
    window.addEventListener('popstate', handlePopState)

    const interval = setInterval(() => {
      fetchLiveSlot()
      fetchLeaderboard(leaderboardTab)
    }, 15000)

    return () => {
      clearInterval(interval)
      window.removeEventListener('popstate', handlePopState)
    }
  }, [user?.email, leaderboardTab])

  // Countdown Timer
  useEffect(() => {
    if (secondsLeft <= 0) return

    const timer = setInterval(() => {
      setSecondsLeft(prev => {
        if (prev <= 1) {
          fetchLiveSlot()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [secondsLeft])

  // Handle Start Live Quiz
  const handleStartLiveQuiz = () => {
    if (!user) {
      setIsLoginModalOpen(true)
      return
    }
    setIsPracticeMode(false)
    setIsPlaying(true)
  }

  // Handle Start Practice Mode
  const handleStartPracticeMode = async () => {
    try {
      const res = await fetch('/api/v1/practice-questions')
      const data = await res.json()
      if (data.success && data.questions) {
        setPracticeQuestions(data.questions)
        setIsPracticeMode(true)
        setIsPlaying(true)
        setIsPlayingDuel(false)
      }
    } catch (err) {
      console.error('Failed to fetch practice questions:', err)
    }
  }

  const handleStartDuel = () => {
    if (!user) {
      setIsLoginModalOpen(true)
      return
    }
    setIsPlaying(false)
    setIsPracticeMode(false)
    setIsPlayingDuel(true)
  }

  const formatCountdown = (secs: number) => {
    const m = Math.floor(secs / 60)
    const s = secs % 60
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  const handleLoginSuccess = useCallback((loggedUser: AuthUser) => {
    setUser(loggedUser)
    localStorage.setItem('quiz_pocket_user', JSON.stringify(loggedUser))
    setIsLoginModalOpen(false)
    fetchLiveSlot()
    fetchLeaderboard(leaderboardTab)
  }, [fetchLiveSlot, fetchLeaderboard, leaderboardTab])

  return (
    <div className="min-h-screen bg-[#f5f5f7] dark:bg-[#000000] text-neutral-900 dark:text-neutral-100 flex flex-col font-sans transition-colors duration-200">
      <AppHeader
        theme={theme}
        onToggleTheme={handleToggleTheme}
        onHomeClick={() => {
          setIsPlaying(false)
          setIsPracticeMode(false)
          setIsArticlesMode(false)
          window.history.pushState({}, '', '/')
        }}
        onOpenLogin={() => setIsLoginModalOpen(true)}
        onOpenProfileModal={() => setIsStatsModalOpen(true)}
        onOpenEditProfileModal={() => setIsEditProfileModalOpen(true)}
        user={user}
        onLogout={() => {
          setUser(null)
          localStorage.removeItem('quiz_pocket_user')
        }}
        isNotificationEnabled={isNotificationEnabled}
        onToggleNotification={handleToggleNotification}
      />

      <main className="flex-1 w-full max-w-4xl mx-auto px-3 sm:px-6 py-4 sm:py-6">
        {isPlayingDuel && user ? (
          <DuelArena
            userEmail={user.email}
            userName={user.name}
            userAvatar={user.avatar_url || ''}
            onExit={() => {
              setIsPlayingDuel(false)
              fetchLiveSlot()
              fetchLeaderboard(leaderboardTab)
            }}
            onUserUpdate={(updated) => {
              setUser(updated)
              localStorage.setItem('quiz_pocket_user', JSON.stringify(updated))
            }}
          />
        ) : isArticlesMode ? (
          <ArticlesView />
        ) : isPlaying ? (
          <QuizPlayer
            questions={isPracticeMode ? practiceQuestions : (liveSlot?.questions || [])}
            categoryTitle={isPracticeMode ? 'Mode Latihan Mandiri' : (liveSlot?.category?.title || 'Kuis Terpadu (SD · SMP · SMA)')}
            slotId={isPracticeMode ? 0 : (liveSlot?.slot_id || 0)}
            secondsRemainingSlot={liveSlot?.seconds_remaining || 1800}
            isPracticeMode={isPracticeMode}
            streak={user?.streak || 1}
            onFinish={async (score, total, correctCount, sdCorrect, sdTotal, smpCorrect, smpTotal, smaCorrect, smaTotal) => {
              if (!isPracticeMode && user && liveSlot) {
                try {
                  const res = await fetch('/api/v1/live-slot/submit', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      slot_id: liveSlot.slot_id,
                      user_email: user.email,
                      score,
                      total,
                      correct_count: correctCount,
                      time_spent_sec: 1800 - (liveSlot.seconds_remaining || 0),
                      sd_correct: sdCorrect,
                      sd_total: sdTotal,
                      smp_correct: smpCorrect,
                      smp_total: smpTotal,
                      sma_correct: smaCorrect,
                      sma_total: smaTotal,
                    })
                  })
                  const data = await res.json()
                  if (data.success && data.user) {
                    setUser(data.user)
                    localStorage.setItem('quiz_pocket_user', JSON.stringify(data.user))
                  }
                } catch (err) {
                  console.error('Submit error:', err)
                }
              }
              fetchLiveSlot()
              fetchLeaderboard(leaderboardTab)
            }}
            onExit={() => {
              setIsPlaying(false)
              setIsPracticeMode(false)
              fetchLiveSlot()
              fetchLeaderboard(leaderboardTab)
            }}
          />
        ) : (
          <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
            
            {/* Live 30-Minute Synchronized Hero Card */}
            <div className="relative overflow-hidden rounded-3xl bg-white dark:bg-[#111114] border border-black/[0.06] dark:border-white/[0.08] p-5 sm:p-8 space-y-5 sm:space-y-6">
              
              {/* Top Banner Status Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-black/[0.04] dark:border-white/[0.04]">
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                  </span>
                  <span className="text-[11px] font-mono font-bold tracking-wider uppercase text-emerald-600 dark:text-emerald-400">
                    Sesi Live Sinkron 30 Menit
                  </span>
                </div>

                {/* Live Slot Status Pill & History Quick Button */}
                <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
                  <button
                    onClick={() => setIsHistoryModalOpen(true)}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-neutral-100 dark:bg-neutral-800/80 text-neutral-600 dark:text-neutral-300 text-xs font-medium hover:bg-neutral-200/80 dark:hover:bg-neutral-700/80 transition-colors pressable"
                  >
                    <Clock className="w-3.5 h-3.5" />
                    Arsip Sesi
                  </button>

                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-neutral-100 dark:bg-neutral-900 border border-black/[0.04] dark:border-white/[0.06] text-xs font-mono">
                    <span className="text-neutral-400">Slot #</span>
                    <span className="font-bold text-neutral-900 dark:text-white">{liveSlot?.slot_id || '---'}</span>
                  </div>
                </div>
              </div>

              {/* Main Information Block */}
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 text-xs font-medium border border-indigo-200/30">
                  <Sparkles className="w-3.5 h-3.5" />
                  Kuis Wawasan Terpadu
                </div>
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-950 dark:text-white">
                  Uji Nalar & Wawasan Kehidupan Nyata
                </h2>
                <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed max-w-2xl">
                  Komposisi butir soal komprehensif sains, logika kuantitatif, literasi bahasa, sejarah, dan finansial.
                </p>
              </div>

              {/* Live Info Grid: Countdown & Participants */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-4">
                <div className="p-3.5 sm:p-4 rounded-2xl bg-neutral-50 dark:bg-[#18181c] border border-black/[0.04] dark:border-white/[0.04]">
                  <span className="text-[10px] sm:text-xs text-neutral-400 uppercase tracking-wider font-mono">Sisa Waktu Sesi</span>
                  <div className="mt-1 flex items-center gap-1.5 text-base sm:text-xl font-bold font-mono text-indigo-600 dark:text-indigo-400">
                    <Clock className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
                    {formatCountdown(secondsLeft)}
                  </div>
                </div>

                <div className="p-3.5 sm:p-4 rounded-2xl bg-neutral-50 dark:bg-[#18181c] border border-black/[0.04] dark:border-white/[0.04]">
                  <span className="text-[10px] sm:text-xs text-neutral-400 uppercase tracking-wider font-mono">Jumlah Butir Soal</span>
                  <div className="mt-1 flex items-center gap-1.5 text-base sm:text-xl font-bold font-mono text-neutral-900 dark:text-white">
                    <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-neutral-400 shrink-0" />
                    {liveSlot?.questions ? `${liveSlot.questions.length} Butir` : 'Acak'}
                  </div>
                </div>

                <div className="col-span-2 sm:col-span-1 p-3.5 sm:p-4 rounded-2xl bg-neutral-50 dark:bg-[#18181c] border border-black/[0.04] dark:border-white/[0.04]">
                  <span className="text-[10px] sm:text-xs text-neutral-400 uppercase tracking-wider font-mono">Partisipan Slot</span>
                  <div className="mt-1 text-base sm:text-xl font-bold font-mono text-neutral-900 dark:text-white">
                    {liveSlot?.participants || 0} Pemain
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row gap-3">
                {liveSlot?.user_submitted ? (
                  <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-900/40">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                        <CheckCircle2 className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-neutral-900 dark:text-white">Sesi Ini Telah Anda Selesaikan</h4>
                        <p className="text-xs text-neutral-500 mt-0.5">
                          Perolehan Skor: <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">{liveSlot.user_submission?.score || 0} Pts</span> ({liveSlot.user_submission?.correct_count || 0} Benar)
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                      <button
                        onClick={() => {
                          setIsArticlesMode(true)
                          window.history.pushState({}, '', '/buku-wawasan')
                        }}
                        className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors flex items-center justify-center gap-2 pressable shadow-xs"
                      >
                        <BookOpen className="w-4 h-4" />
                        Baca Artikel
                      </button>

                      <button
                        onClick={handleStartDuel}
                        className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition-colors flex items-center justify-center gap-2 pressable shadow-xs"
                      >
                        <Swords className="w-4 h-4" />
                        Tanding 1 vs 1
                      </button>

                      <button
                        onClick={handleStartPracticeMode}
                        className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-white dark:bg-[#1c1c22] border border-black/[0.08] dark:border-white/[0.12] text-xs font-semibold text-neutral-800 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors flex items-center justify-center gap-2 pressable"
                      >
                        <Gamepad2 className="w-4 h-4 text-amber-500" />
                        Mode Latihan
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row gap-3 w-full">
                    <button
                      onClick={handleStartLiveQuiz}
                      className="flex-1 sm:flex-initial px-7 py-3.5 rounded-2xl bg-neutral-900 hover:bg-black dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-neutral-900 font-bold text-sm transition-all flex items-center justify-center gap-2.5 pressable shadow-none"
                    >
                      <Play className="w-4 h-4 fill-current" />
                      Ikuti Ujian Sesi Sekarang
                    </button>

                    <button
                      onClick={handleStartDuel}
                      className="px-6 py-3.5 rounded-2xl bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:hover:bg-indigo-900/60 border border-indigo-200/50 dark:border-indigo-800/40 text-indigo-700 dark:text-indigo-300 font-bold text-sm transition-all flex items-center justify-center gap-2 pressable"
                    >
                      <Swords className="w-4 h-4" />
                      Tanding 1 vs 1
                    </button>

                    <button
                      onClick={() => {
                        setIsArticlesMode(true)
                        window.history.pushState({}, '', '/buku-wawasan')
                      }}
                      className="px-5 py-3.5 rounded-2xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/60 border border-emerald-200/50 dark:border-emerald-800/40 text-emerald-700 dark:text-emerald-300 font-bold text-sm transition-all flex items-center justify-center gap-2 pressable"
                    >
                      <BookOpen className="w-4 h-4" />
                      Modul Artikel
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Educational Tier Breakdown */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 px-1">
                <ShieldCheck className="w-4 h-4 text-indigo-500" />
                <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider font-mono text-neutral-400">
                  Komposisi & Nilai Berjenjang
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                {/* SD Card */}
                <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#111114] border border-black/[0.06] dark:border-white/[0.08] space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                      <BookOpen className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200/40">
                      Tingkat Dasar · +10 Pts
                    </span>
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-neutral-950 dark:text-white">Wawasan Dasar</h4>
                    <p className="text-[11px] text-neutral-500 mt-0.5 leading-relaxed">
                      Sains alamiah, indra tubuh, flora & fauna, dan logika hitung.
                    </p>
                  </div>
                </div>

                {/* SMP Card */}
                <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#111114] border border-black/[0.06] dark:border-white/[0.08] space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center text-blue-600 dark:text-blue-400">
                      <Compass className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200/40">
                      Tingkat Menengah · +20 Pts
                    </span>
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-neutral-950 dark:text-white">Wawasan Menengah</h4>
                    <p className="text-[11px] text-neutral-500 mt-0.5 leading-relaxed">
                      Geografi nusantara, sejarah peradaban, dan fenomena alam.
                    </p>
                  </div>
                </div>

                {/* SMA Card */}
                <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#111114] border border-black/[0.06] dark:border-white/[0.08] space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950/50 flex items-center justify-center text-purple-600 dark:text-purple-400">
                      <GraduationCap className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200/40">
                      Tingkat Lanjutan · +30 Pts
                    </span>
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-neutral-950 dark:text-white">Wawasan Lanjutan</h4>
                    <p className="text-[11px] text-neutral-500 mt-0.5 leading-relaxed">
                      Logika kritis, finansial/ekonomi, sains terapan, dan penalaran ilmiah.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Apple Inset Grouped Table: Leaderboard with Weekly Season Tabs */}
            <section className="space-y-3 sm:space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-1">
                <div className="flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-amber-500" />
                  <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider font-mono text-neutral-400">
                    Papan Peringkat
                  </h3>
                </div>

                {/* Season Tabs: Musim Mingguan vs All-Time */}
                <div className="inline-flex p-0.5 rounded-xl bg-neutral-200/70 dark:bg-neutral-800 self-start sm:self-auto text-xs font-medium">
                  <button
                    onClick={() => {
                      setLeaderboardTab('weekly')
                      fetchLeaderboard('weekly')
                    }}
                    className={`px-3 py-1 rounded-lg transition-all flex items-center gap-1.5 ${
                      leaderboardTab === 'weekly'
                        ? 'bg-white dark:bg-[#111114] text-neutral-900 dark:text-white font-bold shadow-xs'
                        : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
                    }`}
                  >
                    <CalendarDays className="w-3.5 h-3.5 text-indigo-500" />
                    Musim Minggu Ini ({currentWeekKey || 'Reset Senin'})
                  </button>
                  <button
                    onClick={() => {
                      setLeaderboardTab('alltime')
                      fetchLeaderboard('alltime')
                    }}
                    className={`px-3 py-1 rounded-lg transition-all ${
                      leaderboardTab === 'alltime'
                        ? 'bg-white dark:bg-[#111114] text-neutral-900 dark:text-white font-bold shadow-xs'
                        : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
                    }`}
                  >
                    Sepanjang Masa
                  </button>
                </div>
              </div>

              <div className="rounded-3xl bg-white dark:bg-[#111114] border border-black/[0.06] dark:border-white/[0.08] divide-y divide-black/[0.04] dark:divide-white/[0.04] overflow-hidden">
                {leaderboard.length === 0 ? (
                  <div className="p-8 text-center text-xs text-neutral-400">
                    {leaderboardTab === 'weekly' 
                      ? 'Belum ada data untuk musim minggu ini. Jadilah yang pertama di papan peringkat!'
                      : 'Belum ada data peringkat kuis.'}
                  </div>
                ) : (
                  leaderboard.map((item, index) => {
                    const displayPoints = leaderboardTab === 'weekly' ? (item.weekly_points || item.points || 0) : (item.points || 0)
                    const title = getUserTitle(displayPoints)
                    const isCurrentUser = user && user.email === item.email

                    return (
                      <div
                        key={item.id || index}
                        className={`p-3.5 sm:px-6 flex items-center justify-between gap-2.5 sm:gap-4 transition-colors ${
                          isCurrentUser 
                            ? 'bg-indigo-50/50 dark:bg-indigo-950/20' 
                            : 'hover:bg-neutral-50/50 dark:hover:bg-neutral-900/30'
                        }`}
                      >
                        {/* Rank + User Identity */}
                        <div className="flex items-center gap-2.5 sm:gap-4 min-w-0">
                          <span className={`w-5 sm:w-6 font-mono text-xs sm:text-sm font-bold shrink-0 ${
                            index === 0 
                              ? 'text-amber-500' 
                              : index === 1 
                              ? 'text-neutral-400 dark:text-neutral-300' 
                              : index === 2 
                              ? 'text-amber-700 dark:text-amber-600' 
                              : 'text-neutral-400'
                          }`}>
                            {index < 9 ? `0${index + 1}` : index + 1}
                          </span>

                          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden shrink-0 border border-black/[0.04] dark:border-white/[0.08]">
                            {item.avatar_url ? (
                              <img src={item.avatar_url} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center font-bold text-xs text-neutral-500">
                                {item.name ? item.name.charAt(0).toUpperCase() : 'U'}
                              </div>
                            )}
                          </div>

                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-xs sm:text-sm font-bold text-neutral-900 dark:text-white truncate">
                                {item.name || 'Pemain Anonim'}
                              </span>
                              {isCurrentUser && (
                                <span className="text-[9px] font-mono uppercase px-1.5 py-0.2 rounded bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                                  Anda
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                              <span className={`text-[9px] font-medium px-1.5 py-0.2 rounded-md ${title.bgClass} ${title.colorClass} ${title.borderClass}`}>
                                {title.title}
                              </span>
                              {item.streak >= 3 && (
                                <span className="text-[9px] font-mono text-orange-600 dark:text-orange-400 flex items-center gap-0.5">
                                  <Flame className="w-2.5 h-2.5 fill-current" />
                                  {item.streak}d
                                </span>
                              )}
                              {item.duel_total && item.duel_total > 0 ? (
                                <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-200/30">
                                  ⚔️ WR {Math.round((item.duel_wins || 0) / item.duel_total * 100)}% ({item.duel_wins}M)
                                </span>
                              ) : null}
                            </div>
                          </div>
                        </div>

                        {/* User Points */}
                        <div className="text-right shrink-0">
                          <div className="font-mono text-xs sm:text-sm font-bold text-neutral-900 dark:text-white">
                            {displayPoints.toLocaleString()} <span className="text-[10px] text-neutral-400">Pts</span>
                          </div>
                          <div className="text-[10px] text-neutral-400 font-mono">
                            {item.quizzes_completed || 0} Sesi
                          </div>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </section>
          </div>
        )}
      </main>

      {/* Footer with Android APK Download Link */}
      {!isPlaying && !isPlayingDuel && (
        <footer className="w-full max-w-4xl mx-auto px-4 py-8 border-t border-black/[0.06] dark:border-white/[0.06] mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-500">
          <div className="flex items-center gap-2">
            <span className="font-bold text-neutral-900 dark:text-white">Quiz Pocket</span>
            <span>•</span>
            <span>Platform Kuis & Uji Nalar Terpadu</span>
          </div>

          <a
            href="https://quiz.abdasis.my.id/downloads/quiz-pocket-latest.apk"
            download
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-semibold hover:bg-neutral-800 dark:hover:bg-neutral-100 transition-colors pressable"
          >
            <Smartphone className="w-4 h-4 text-emerald-400 dark:text-emerald-600" />
            <span>Download APK Android</span>
          </a>
        </footer>
      )}

      {/* Login Modal */}
      {/* Login Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />

      {/* Stats / Report Modal */}
      <StatsModal
        isOpen={isStatsModalOpen}
        onClose={() => setIsStatsModalOpen(false)}
        user={user}
      />

      {/* Session History Modal */}
      <SessionHistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
      />

      {/* Edit Profile Modal */}
      <EditProfileModal
        isOpen={isEditProfileModalOpen}
        onClose={() => setIsEditProfileModalOpen(false)}
        user={user}
        onProfileUpdated={(updatedUser) => {
          setUser(updatedUser)
          localStorage.setItem('quiz_pocket_user', JSON.stringify(updatedUser))
          fetchLeaderboard(leaderboardTab)
        }}
      />
    </div>
  )
}