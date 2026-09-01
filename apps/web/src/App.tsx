import { useState, useEffect } from 'react'
import { AppHeader, type AuthUser } from './app-header'
import { QuizPlayer, type Question } from './quiz-player'
import { LoginModal } from './login-modal'
import { StatsModal } from './stats-modal'
import { SessionHistoryModal } from './session-history-modal'
import { EditProfileModal } from './edit-profile-modal'
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
  BarChart3,
  History
} from 'lucide-react'

interface Category {
  id: number
  slug: string
  title: string
  description: string
  level?: string
  icon?: string
}

interface LiveSlotResponse {
  slot_id: number
  slot_start: string
  slot_end: string
  seconds_remaining: number
  category: Category
  questions: Question[]
  is_completed?: boolean
  submission?: {
    score: number
    correct_count: number
    time_spent_sec: number
  }
}

export function App() {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('quiz_pocket_theme') as 'light' | 'dark') || 'light'
  })

  useEffect(() => {
    const root = document.documentElement
    if (theme === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
    localStorage.setItem('quiz_pocket_theme', theme)
  }, [theme])

  const handleToggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'))
  }

  // Auth User
  const [user, setUser] = useState<AuthUser | null>(() => {
    const saved = localStorage.getItem('quiz_pocket_user')
    return saved ? JSON.parse(saved) : null
  })
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)
  const [isStatsModalOpen, setIsStatsModalOpen] = useState(false)
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false)
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false)

  // Live 30-Min Slot State
  const [liveSlot, setLiveSlot] = useState<LiveSlotResponse | null>(null)
  const [secondsRemaining, setSecondsRemaining] = useState<number>(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isPracticeMode, setIsPracticeMode] = useState(false)
  const [practiceQuestions, setPracticeQuestions] = useState<Question[]>([])

  // Global Leaderboard
  const [leaderboard, setLeaderboard] = useState<AuthUser[]>([])

  const fetchLiveSlot = async () => {
    try {
      const emailQuery = user?.email ? `?email=${encodeURIComponent(user.email)}` : ''
      const res = await fetch(`/api/v1/live-slot${emailQuery}`)
      const data: LiveSlotResponse = await res.json()
      setLiveSlot(data)
      setSecondsRemaining(data.seconds_remaining)
    } catch (err) {
      console.error('Failed to fetch live slot:', err)
    }
  }

  const fetchLeaderboard = async () => {
    try {
      const res = await fetch('/api/v1/leaderboard')
      const json = await res.json()
      if (json.success && json.data) {
        setLeaderboard(json.data)
      }
    } catch (err) {
      console.error('Failed to fetch leaderboard:', err)
    }
  }

  const fetchPracticeQuestions = async () => {
    try {
      const res = await fetch('/api/v1/practice-questions')
      const json = await res.json()
      if (json.success && json.questions) {
        setPracticeQuestions(json.questions)
        setIsPracticeMode(true)
        setIsPlaying(true)
      }
    } catch (err) {
      console.error('Failed to fetch practice questions:', err)
    }
  }

  const syncUserProfile = async (email: string) => {
    try {
      const res = await fetch(`/api/v1/user/profile?email=${encodeURIComponent(email)}`)
      const json = await res.json()
      if (json.success && json.data) {
        setUser(json.data)
        localStorage.setItem('quiz_pocket_user', JSON.stringify(json.data))
      }
    } catch (err) {
      console.error('Failed to sync profile:', err)
    }
  }

  useEffect(() => {
    fetchLiveSlot()
    fetchLeaderboard()
    if (user?.email) {
      syncUserProfile(user.email)
    }
  }, [user?.email])

  // Countdown Interval for Live Slot
  useEffect(() => {
    if (secondsRemaining <= 0) {
      fetchLiveSlot()
      return
    }

    const timer = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          fetchLiveSlot()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [secondsRemaining])

  const formatCountdown = (totalSeconds: number) => {
    const m = Math.floor(totalSeconds / 60)
    const s = totalSeconds % 60
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  const handleStartQuiz = () => {
    if (!user) {
      setIsLoginModalOpen(true)
      return
    }
    setIsPracticeMode(false)
    setIsPlaying(true)
  }

  const handleLogout = () => {
    setUser(null)
    localStorage.removeItem('quiz_pocket_user')
    fetchLiveSlot()
  }

  const handleFinishQuiz = async (
    score: number, 
    total: number, 
    correctCount: number,
    sdCorrect: number,
    sdTotal: number,
    smpCorrect: number,
    smpTotal: number,
    smaCorrect: number,
    smaTotal: number
  ) => {
    if (isPracticeMode) {
      return
    }

    if (!user || !liveSlot) return

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
          time_spent_sec: 1800 - secondsRemaining,
          sd_correct: sdCorrect,
          sd_total: sdTotal,
          smp_correct: smpCorrect,
          smp_total: smpTotal,
          sma_correct: smaCorrect,
          sma_total: smaTotal,
        }),
      })
      const json = await res.json()
      if (json.success) {
        syncUserProfile(user.email)
        fetchLeaderboard()
        fetchLiveSlot()
      }
    } catch (err) {
      console.error('Submit live slot error:', err)
    }
  }

  const totalQuestions = isPracticeMode 
    ? practiceQuestions.length 
    : (liveSlot?.questions?.length || 10)

  const activeQuestions = isPracticeMode ? practiceQuestions : (liveSlot?.questions || [])
  const progressPercent = Math.max(0, Math.min(100, (1 - secondsRemaining / 1800) * 100))

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#000000] text-neutral-900 dark:text-neutral-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white transition-colors duration-200">
      <AppHeader
        theme={theme}
        onToggleTheme={handleToggleTheme}
        onHomeClick={() => {
          setIsPlaying(false)
          setIsPracticeMode(false)
        }}
        onOpenProfileModal={() => setIsStatsModalOpen(true)}
        onOpenEditProfileModal={() => setIsEditProfileOpen(true)}
        currentTitle={isPlaying ? (isPracticeMode ? 'Mode Latihan Mandiri' : 'Kuis Terpadu (SD · SMP · SMA)') : undefined}
        user={user}
        onOpenLogin={() => setIsLoginModalOpen(true)}
        onLogout={handleLogout}
      />

      <main className="flex-1 max-w-4xl w-full mx-auto px-3 sm:px-6 py-4 sm:py-10">
        {isPlaying && activeQuestions.length > 0 ? (
          <QuizPlayer
            slotId={isPracticeMode ? 999999 : (liveSlot?.slot_id || 0)}
            categoryTitle={isPracticeMode ? 'Mode Latihan Santai (Tanpa Poin)' : 'Kuis Terpadu (SD · SMP · SMA)'}
            questions={activeQuestions}
            secondsRemainingSlot={secondsRemaining}
            isPracticeMode={isPracticeMode}
            streak={user?.streak || 1}
            onFinish={handleFinishQuiz}
            onExit={() => {
              setIsPlaying(false)
              setIsPracticeMode(false)
              fetchLiveSlot()
            }}
          />
        ) : (
          <div className="space-y-6 sm:space-y-10 animate-in fade-in duration-300">
            {/* Top Sub-Navigation / Quick Status Row */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 pb-2 border-b border-black/[0.04] dark:border-white/[0.04]">
              <div className="space-y-0.5 sm:space-y-1">
                <h2 className="text-xl sm:text-3xl font-semibold tracking-tight text-neutral-950 dark:text-white">
                  Kuis Pengetahuan Nyata
                </h2>
                <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 font-normal leading-relaxed">
                  Asah pemahaman logika, sains alam, dan literasi esensial jenjang SD sampai SMA.
                </p>
              </div>

              {/* Action Buttons Row */}
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                <button
                  onClick={() => setIsHistoryModalOpen(true)}
                  className="inline-flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full bg-neutral-100 dark:bg-neutral-800/80 hover:bg-neutral-200/80 dark:hover:bg-neutral-700/60 border border-black/[0.04] dark:border-white/[0.06] text-[11px] sm:text-xs font-semibold text-neutral-700 dark:text-neutral-300 cursor-pointer pressable"
                >
                  <History className="w-3.5 h-3.5" />
                  <span>Arsip Sesi</span>
                </button>

                {user && (
                  <button
                    onClick={() => setIsStatsModalOpen(true)}
                    className="inline-flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200/60 dark:border-indigo-800/40 text-[11px] sm:text-xs font-semibold text-indigo-700 dark:text-indigo-300 cursor-pointer pressable"
                  >
                    <BarChart3 className="w-3.5 h-3.5" />
                    <span>Rapor & Gelar</span>
                  </button>
                )}

                <div className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-full bg-white/80 dark:bg-[#141416]/80 backdrop-blur-xl border border-black/[0.06] dark:border-white/[0.08] text-[11px] sm:text-xs font-medium text-neutral-700 dark:text-neutral-300">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  <span className="font-mono text-neutral-900 dark:text-neutral-100 font-semibold">{formatCountdown(secondsRemaining)}</span>
                  <span className="text-neutral-400 dark:text-neutral-500 hidden xs:inline">rotasi</span>
                </div>
              </div>
            </div>

            {/* Apple-Style Hero Feature Card */}
            {liveSlot && (
              <section className="relative overflow-hidden rounded-3xl bg-white dark:bg-[#111114] border border-black/[0.06] dark:border-white/[0.08] p-5 sm:p-8 transition-all">
                <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/[0.04] dark:bg-indigo-500/[0.08] blur-3xl pointer-events-none rounded-full" />
                <div className="absolute bottom-0 left-0 w-80 h-80 bg-purple-500/[0.03] dark:bg-purple-500/[0.06] blur-3xl pointer-events-none rounded-full" />

                <div className="relative z-10 space-y-4 sm:space-y-6">
                  {/* Category Level & Slot Timer Header */}
                  <div className="flex flex-wrap items-center justify-between gap-2 sm:gap-3">
                    <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                      <span className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 text-[11px] sm:text-xs font-semibold border border-indigo-200/60 dark:border-indigo-800/40">
                        <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                        <span>Sesi Live Multi-Jenjang</span>
                      </span>
                      <span className="inline-flex items-center px-2 sm:px-2.5 py-1 rounded-xl bg-neutral-100 dark:bg-neutral-800/60 text-neutral-600 dark:text-neutral-300 text-[11px] sm:text-xs font-medium border border-black/[0.04] dark:border-white/[0.06]">
                        {totalQuestions} Butir Soal
                      </span>
                    </div>

                    <div className="inline-flex items-center gap-1.5 text-[11px] sm:text-xs text-neutral-500 dark:text-neutral-400 font-mono">
                      <Clock className="w-3.5 h-3.5 text-neutral-400" />
                      <span>{formatCountdown(secondsRemaining)} Tersisa</span>
                    </div>
                  </div>

                  {/* Main Subject & Description */}
                  <div className="space-y-1.5 sm:space-y-2 max-w-2xl">
                    <h3 className="text-lg sm:text-2xl font-bold tracking-tight text-neutral-950 dark:text-white leading-tight">
                      Kuis Terpadu Wawasan Nyata & Sains
                    </h3>
                    <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed font-normal">
                      Paket soal acak berkualitas tinggi menggabungkan materi esensial SD (+10 Pts), SMP (+20 Pts), dan SMA (+30 Pts).
                    </p>
                  </div>

                  {/* 30-Minute Cycle Timeline Bar */}
                  <div className="space-y-1.5 pt-1">
                    <div className="flex items-center justify-between text-[10px] sm:text-[11px] font-mono text-neutral-400">
                      <span>Timeline Sesi 30 Menit</span>
                      <span>Sisa {Math.ceil(secondsRemaining / 60)} menit</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-neutral-100 dark:bg-neutral-800/80 overflow-hidden">
                      <div
                        className="h-full bg-indigo-600 dark:bg-indigo-500 rounded-full transition-all duration-1000 ease-linear"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                  </div>

                  {/* Action CTA or Completed Status */}
                  <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3">
                    {liveSlot.is_completed ? (
                      <div className="w-full flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-800/40">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                            <CheckCircle2 className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="text-xs sm:text-sm font-semibold text-emerald-950 dark:text-emerald-100">
                              Kuis Sesi Ini Selesai Dikerjakan!
                            </p>
                            <p className="text-[11px] text-emerald-800/80 dark:text-emerald-300/80 font-mono">
                              Skor Diperoleh: +{liveSlot.submission?.score} Poin • {liveSlot.submission?.correct_count} Benar
                            </p>
                          </div>
                        </div>

                        {/* Practice Mode Trigger button for idle waiting */}
                        <button
                          onClick={fetchPracticeQuestions}
                          className="h-10 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs inline-flex items-center justify-center gap-2 cursor-pointer pressable shrink-0"
                        >
                          <Gamepad2 className="w-4 h-4" />
                          <span>Main Mode Latihan</span>
                        </button>
                      </div>
                    ) : (
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3 w-full sm:w-auto">
                        <button
                          onClick={handleStartQuiz}
                          className="h-11 sm:h-12 px-6 sm:px-8 rounded-2xl bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 hover:bg-neutral-800 dark:hover:bg-neutral-100 font-semibold text-xs sm:text-sm inline-flex items-center justify-center gap-2 cursor-pointer pressable shadow-xs"
                        >
                          <Play className="w-4 h-4 fill-current" />
                          <span>Mulai Kuis Sesi Ini</span>
                        </button>

                        <button
                          onClick={fetchPracticeQuestions}
                          className="h-11 sm:h-12 px-4 sm:px-6 rounded-2xl bg-black/[0.04] dark:bg-white/[0.06] hover:bg-black/[0.08] dark:hover:bg-white/[0.1] border border-black/[0.06] dark:border-white/[0.08] text-neutral-800 dark:text-neutral-200 font-semibold text-xs inline-flex items-center justify-center gap-2 cursor-pointer pressable"
                        >
                          <Gamepad2 className="w-4 h-4" />
                          <span>Mode Latihan</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </section>
            )}

            {/* Apple Inset Group: 3 Tiers of Questions Grid */}
            <div className="space-y-3 sm:space-y-4">
              <div className="flex items-center justify-between px-1">
                <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider font-mono text-neutral-400">
                  Tingkatan Soal Terpadu
                </h3>
                <span className="text-[11px] text-neutral-400 font-mono">3 Pilar Sains & Logika</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                {/* SD Card */}
                <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#111114] border border-black/[0.06] dark:border-white/[0.08] space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                      <BookOpen className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200/40">
                      +10 Pts
                    </span>
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-neutral-950 dark:text-white">Tingkat SD (Dasar)</h4>
                    <p className="text-[11px] text-neutral-500 mt-0.5 leading-relaxed">
                      Sains alamiah, flora & fauna, serta pengetahuan lingkungan dasar.
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
                      +20 Pts
                    </span>
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-neutral-950 dark:text-white">Tingkat SMP (Menengah)</h4>
                    <p className="text-[11px] text-neutral-500 mt-0.5 leading-relaxed">
                      Geografi nusantara, sejarah nasional, dan fenomena fisika bumi.
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
                      +30 Pts
                    </span>
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-neutral-950 dark:text-white">Tingkat SMA (Lanjutan)</h4>
                    <p className="text-[11px] text-neutral-500 mt-0.5 leading-relaxed">
                      Logika kritis, finansial/ekonomi, sains terapan, dan penalaran ilmiah.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Apple Inset Grouped Table: Leaderboard */}
            <section className="space-y-3 sm:space-y-4">
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-amber-500" />
                  <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider font-mono text-neutral-400">
                    Papan Peringkat Global
                  </h3>
                </div>
                <span className="text-[11px] text-neutral-400 font-mono">Real-Time Update</span>
              </div>

              <div className="rounded-3xl bg-white dark:bg-[#111114] border border-black/[0.06] dark:border-white/[0.08] divide-y divide-black/[0.04] dark:divide-white/[0.04] overflow-hidden">
                {leaderboard.length === 0 ? (
                  <div className="p-8 text-center text-xs text-neutral-400">
                    Belum ada data peringkat kuis.
                  </div>
                ) : (
                  leaderboard.map((item, index) => {
                    const title = getUserTitle(item.points || 0)
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

                          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-neutral-100 dark:bg-neutral-800 border border-black/[0.04] dark:border-white/[0.06] overflow-hidden flex items-center justify-center shrink-0">
                            {item.avatar_url ? (
                              <img src={item.avatar_url} alt={item.name} className="w-full h-full object-cover" />
                            ) : (
                              <span className="text-xs font-bold text-neutral-500">
                                {item.name ? item.name[0].toUpperCase() : 'U'}
                              </span>
                            )}
                          </div>

                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-1 sm:gap-1.5">
                              <p className="text-xs sm:text-sm font-semibold text-neutral-900 dark:text-white truncate">
                                {item.name || item.email.split('@')[0]}
                              </p>
                              {/* Title Badge */}
                              <span className={`text-[9px] sm:text-[10px] font-bold px-1.5 py-0.2 rounded-md ${title.bgClass} ${title.colorClass} border ${title.borderClass}`}>
                                {title.title}
                              </span>
                              {isCurrentUser && (
                                <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-semibold font-mono">
                                  Kamu
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-[10px] sm:text-[11px] text-neutral-400 font-mono mt-0.5">
                              <span className="flex items-center gap-0.5">
                                <Flame className="w-3 h-3 text-amber-500" />
                                {item.streak || 1}d
                              </span>
                              <span>•</span>
                              <span>{item.quizzes_completed || 0} Sesi</span>
                            </div>
                          </div>
                        </div>

                        {/* Points Badge */}
                        <div className="text-right font-mono shrink-0">
                          <span className="text-xs sm:text-base font-bold text-neutral-900 dark:text-white">
                            {item.points?.toLocaleString('id-ID') || 0}
                          </span>
                          <span className="text-[10px] sm:text-xs text-neutral-400 ml-1">pts</span>
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

      {/* Modern Clean Footer */}
      <footer className="w-full border-t border-black/[0.04] dark:border-white/[0.04] py-6 text-center text-xs text-neutral-400 font-normal">
        <div className="max-w-4xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>© 2026 Quiz Pocket. Mengasah wawasan & logika kehidupan nyata.</p>
          <div className="flex items-center gap-4 text-[11px] font-mono text-neutral-500">
            <span>Rotasi 30 Menit</span>
            <span>•</span>
            <span className="flex items-center gap-1 text-emerald-500">
              <ShieldCheck className="w-3.5 h-3.5" />
              Sistem Terproteksi
            </span>
          </div>
        </div>
      </footer>

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
        isOpen={isEditProfileOpen}
        onClose={() => setIsEditProfileOpen(false)}
        user={user}
        onProfileUpdated={(updated) => {
          setUser(updated)
          localStorage.setItem('quiz_pocket_user', JSON.stringify(updated))
          fetchLeaderboard()
          fetchLiveSlot()
        }}
      />

      {/* Login Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLoginSuccess={(loggedUser) => {
          setUser(loggedUser)
          localStorage.setItem('quiz_pocket_user', JSON.stringify(loggedUser))
          setIsLoginModalOpen(false)
          fetchLiveSlot()
          fetchLeaderboard()
        }}
      />
    </div>
  )
}
