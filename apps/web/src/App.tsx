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
  level: string
  icon: string
  question_count: number
}

interface LiveSlotResponse {
  slot_id: number
  slot_start: string
  slot_end: string
  seconds_remaining: number
  category: Category
  questions: Question[]
  question_count: number
  is_completed: boolean
  submission?: {
    score: number
    total: number
    correct_count: number
  }
}

interface LeaderboardUser {
  id: number
  name: string
  email: string
  avatar_url?: string
  points: number
  quizzes_completed: number
  streak: number
}

export function App() {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('quiz_pocket_theme')
    if (saved === 'light' || saved === 'dark') return saved
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  })

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

  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
    localStorage.setItem('quiz_pocket_theme', theme)
  }, [theme])

  // Fetch Live Slot Data
  const fetchLiveSlot = async () => {
    try {
      const emailParam = user?.email ? `?email=${encodeURIComponent(user.email)}` : ''
      const res = await fetch(`/api/v1/live-slot${emailParam}`)
      const json = await res.json()
      if (json.success) {
        setLiveSlot(json)
        setSecondsRemaining(json.seconds_remaining)
      }
    } catch (err) {
      console.error('Failed to fetch live slot:', err)
    } finally {
      setIsLoading(false)
    }
  }

  // Fetch Leaderboard
  const fetchLeaderboard = async () => {
    try {
      const res = await fetch('/api/v1/leaderboard')
      const json = await res.json()
      if (json.success) {
        setLeaderboard(json.data)
      }
    } catch (err) {
      console.error('Failed to fetch leaderboard:', err)
    }
  }

  // Sync user profile stats
  const syncUserProfile = async (email: string) => {
    try {
      const res = await fetch(`/api/v1/user/profile?email=${encodeURIComponent(email)}`)
      const json = await res.json()
      if (json.success) {
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

  // Live 30-Minute Countdown Clock & Auto-refresh on Slot Expiry
  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          fetchLiveSlot()
          fetchLeaderboard()
          setIsPlaying(false)
          setIsPracticeMode(false)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [liveSlot?.slot_id])

  const formatCountdown = (totalSec: number) => {
    const m = Math.floor(totalSec / 60)
    const s = totalSec % 60
    return `${m < 10 ? '0' + m : m}:${s < 10 ? '0' + s : s}`
  }

  const handleToggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))
  }

  const handleLoginSuccess = (loggedInUser: AuthUser) => {
    setUser(loggedInUser)
    localStorage.setItem('quiz_pocket_user', JSON.stringify(loggedInUser))
    fetchLiveSlot()
  }

  const handleLogout = () => {
    setUser(null)
    localStorage.removeItem('quiz_pocket_user')
    setIsPlaying(false)
    setIsPracticeMode(false)
    fetchLiveSlot()
  }

  const handleStartLiveQuiz = () => {
    if (!user) {
      setIsLoginModalOpen(true)
      return
    }
    if (liveSlot?.is_completed) {
      return
    }
    setIsPracticeMode(false)
    setIsPlaying(true)
  }

  const handleStartPracticeMode = async () => {
    try {
      const res = await fetch('/api/v1/practice-questions')
      const json = await res.json()
      if (json.success && json.questions.length > 0) {
        setPracticeQuestions(json.questions)
        setIsPracticeMode(true)
        setIsPlaying(true)
      }
    } catch (err) {
      console.error('Practice mode error:', err)
    }
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
    if (!user) return

    // If practice mode, just don't submit points
    if (isPracticeMode) {
      return
    }

    if (!liveSlot) return

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
          time_spent_sec: 60,
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

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-10">
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
          <div className="space-y-10 animate-in fade-in duration-300">
            {/* Top Sub-Navigation / Quick Status Row */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-black/[0.04] dark:border-white/[0.04]">
              <div className="space-y-1">
                <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-neutral-950 dark:text-white">
                  Kuis Pengetahuan Nyata
                </h2>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 font-normal leading-relaxed">
                  Asah pemahaman logika, sains alam, dan literasi esensial jenjang SD sampai SMA.
                </p>
              </div>

              {/* Live Slot Status Pill & Stats Quick Button */}
              <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
                <button
                  onClick={() => setIsHistoryModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-neutral-100 dark:bg-neutral-800/80 hover:bg-neutral-200/80 dark:hover:bg-neutral-700/60 border border-black/[0.04] dark:border-white/[0.06] text-xs font-semibold text-neutral-700 dark:text-neutral-300 cursor-pointer pressable"
                >
                  <History className="w-3.5 h-3.5" />
                  <span>Arsip Sesi</span>
                </button>

                {user && (
                  <button
                    onClick={() => setIsStatsModalOpen(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200/60 dark:border-indigo-800/40 text-xs font-semibold text-indigo-700 dark:text-indigo-300 cursor-pointer pressable"
                  >
                    <BarChart3 className="w-3.5 h-3.5" />
                    <span>Rapor & Gelar</span>
                  </button>
                )}

                <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-white/80 dark:bg-[#141416]/80 backdrop-blur-xl border border-black/[0.06] dark:border-white/[0.08] text-xs font-medium text-neutral-700 dark:text-neutral-300">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  <span className="font-mono text-neutral-900 dark:text-neutral-100 font-semibold">{formatCountdown(secondsRemaining)}</span>
                  <span className="text-neutral-400 dark:text-neutral-500">menuju rotasi</span>
                </div>
              </div>
            </div>

            {/* Apple-Style Hero Feature Card */}
            {liveSlot && (
              <section className="relative overflow-hidden rounded-3xl bg-white dark:bg-[#111114] border border-black/[0.06] dark:border-white/[0.08] p-6 sm:p-8 transition-all">
                <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/[0.04] dark:bg-indigo-500/[0.08] blur-3xl pointer-events-none rounded-full" />
                <div className="absolute bottom-0 left-0 w-80 h-80 bg-purple-500/[0.03] dark:bg-purple-500/[0.06] blur-3xl pointer-events-none rounded-full" />

                <div className="relative z-10 space-y-6">
                  {/* Category Level & Slot Timer Header */}
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 text-xs font-semibold border border-indigo-200/60 dark:border-indigo-800/40">
                        <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                        <span>Sesi Live Multi-Jenjang</span>
                      </span>
                      <span className="inline-flex items-center px-2.5 py-1 rounded-xl bg-neutral-100 dark:bg-neutral-800/60 text-neutral-600 dark:text-neutral-300 text-xs font-medium border border-black/[0.04] dark:border-white/[0.06]">
                        {totalQuestions} Butir Soal (SD · SMP · SMA)
                      </span>
                    </div>

                    <div className="inline-flex items-center gap-1.5 text-xs text-neutral-500 dark:text-neutral-400 font-mono">
                      <Clock className="w-3.5 h-3.5 text-neutral-400" />
                      <span>{formatCountdown(secondsRemaining)} Tersisa</span>
                    </div>
                  </div>

                  {/* Main Subject & Description */}
                  <div className="space-y-2 max-w-2xl">
                    <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
                      Kuis Terpadu Wawasan Nyata & Sains
                    </h3>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                      Kombinasi soal pilihan tingkat SD, SMP, dan SMA. Dapatkan <span className="font-semibold text-neutral-900 dark:text-white">Bonus Kecepatan (+5)</span> & <span className="font-semibold text-amber-500">Combo Multiplier (hingga 2.0x)</span> jika menjawab benar secara berturut-turut!
                    </p>
                  </div>

                  {/* 30-Min Timeline Bar */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] font-medium text-neutral-400 dark:text-neutral-500 font-mono">
                      <span>Waktu Window Sesi</span>
                      <span>{Math.round(100 - progressPercent)}% waktu tersisa</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
                      <div
                        className="h-full bg-indigo-600 dark:bg-indigo-500 rounded-full transition-all duration-1000 ease-linear"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                  </div>

                  {/* Actions & State */}
                  <div className="pt-2 flex flex-wrap items-center gap-3">
                    {liveSlot.is_completed ? (
                      <div className="flex flex-wrap items-center gap-3 w-full">
                        <div className="inline-flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/40 text-emerald-800 dark:text-emerald-300 font-medium text-sm">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                          <span>
                            Sesi ini telah selesai (+{liveSlot.submission?.score || 0} Poin).
                          </span>
                        </div>

                        {/* Practice Button for Waiting Period */}
                        <button
                          onClick={handleStartPracticeMode}
                          className="h-12 px-5 rounded-2xl bg-black/[0.04] dark:bg-white/[0.06] hover:bg-black/[0.08] dark:hover:bg-white/[0.1] border border-black/[0.06] dark:border-white/[0.08] font-semibold text-xs text-neutral-800 dark:text-neutral-200 inline-flex items-center gap-2 cursor-pointer pressable"
                        >
                          <Gamepad2 className="w-4 h-4 text-indigo-500" />
                          <span>Main Mode Latihan (Menunggu Sesi)</span>
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={handleStartLiveQuiz}
                        disabled={isLoading}
                        className="h-12 px-6 rounded-2xl bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 hover:bg-neutral-800 dark:hover:bg-neutral-100 font-semibold text-sm inline-flex items-center gap-2.5 cursor-pointer pressable transition-colors border border-transparent shadow-xs"
                      >
                        <Play className="w-4 h-4 fill-current" />
                        <span>Mulai Mengerjakan ({totalQuestions} Soal)</span>
                      </button>
                    )}

                    {!user && (
                      <button
                        onClick={() => setIsLoginModalOpen(true)}
                        className="h-12 px-5 rounded-2xl bg-black/[0.04] dark:bg-white/[0.06] hover:bg-black/[0.08] dark:hover:bg-white/[0.1] border border-black/[0.06] dark:border-white/[0.08] text-xs font-semibold text-neutral-800 dark:text-neutral-200 inline-flex items-center gap-2 cursor-pointer pressable"
                      >
                        <ShieldCheck className="w-4 h-4 text-indigo-500" />
                        <span>Masuk Akun Gmail</span>
                      </button>
                    )}
                  </div>
                </div>
              </section>
            )}

            {/* Educational Tier Breakdown & Rules Grid (Apple HIG Grid) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-5 rounded-3xl bg-white dark:bg-[#111114] border border-black/[0.06] dark:border-white/[0.08] space-y-3 transition-colors">
                <div className="w-9 h-9 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-800/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold text-neutral-900 dark:text-white">Tingkat SD</h4>
                    <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">+10 Pts</span>
                  </div>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 leading-relaxed">
                    Sains dasar, alam semesta, organ tubuh, rantai makanan, dan geografi nusantara.
                  </p>
                </div>
              </div>

              <div className="p-5 rounded-3xl bg-white dark:bg-[#111114] border border-black/[0.06] dark:border-white/[0.08] space-y-3 transition-colors">
                <div className="w-9 h-9 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200/60 dark:border-blue-800/40 flex items-center justify-center text-blue-600 dark:text-blue-400">
                  <Compass className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold text-neutral-900 dark:text-white">Tingkat SMP</h4>
                    <span className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400">+20 Pts</span>
                  </div>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 leading-relaxed">
                    Sejarah kemerdekaan, fenomena fisika sehari-hari, iklim, dan geografi regional.
                  </p>
                </div>
              </div>

              <div className="p-5 rounded-3xl bg-white dark:bg-[#111114] border border-black/[0.06] dark:border-white/[0.08] space-y-3 transition-colors">
                <div className="w-9 h-9 rounded-2xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200/60 dark:border-purple-800/40 flex items-center justify-center text-purple-600 dark:text-purple-400">
                  <GraduationCap className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold text-neutral-900 dark:text-white">Tingkat SMA</h4>
                    <span className="text-xs font-mono font-bold text-purple-600 dark:text-purple-400">+30 Pts</span>
                  </div>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 leading-relaxed">
                    Logika nalar, hukum sains terapan, literasi keuangan, dan dinamika lingkungan nyata.
                  </p>
                </div>
              </div>
            </div>

            {/* Global Leaderboard Section (Apple Inset Grouped Table Style) */}
            <section className="space-y-4 pt-2">
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/60 dark:border-amber-800/40 flex items-center justify-center text-amber-500">
                    <Trophy className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-neutral-900 dark:text-white">Papan Peringkat Global</h3>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">Akumulasi skor dan gelar kehormatan seluruh pemain</p>
                  </div>
                </div>
                <div className="text-xs text-neutral-400 font-mono">
                  {leaderboard.length} Pemain
                </div>
              </div>

              {/* Inset List Container */}
              <div className="bg-white dark:bg-[#111114] rounded-3xl border border-black/[0.06] dark:border-white/[0.08] overflow-hidden divide-y divide-black/[0.04] dark:divide-white/[0.04]">
                {leaderboard.length === 0 ? (
                  <div className="p-12 text-center text-neutral-400 text-xs font-normal">
                    Belum ada riwayat pengerjaan kuis. Jadilah yang pertama meraih skor!
                  </div>
                ) : (
                  leaderboard.map((lbUser, idx) => {
                    const isCurrentUser = user?.email === lbUser.email
                    const rank = idx + 1
                    const rankTitle = getUserTitle(lbUser.points || 0)

                    return (
                      <div
                        key={lbUser.id}
                        className={`p-4 sm:px-6 sm:py-4 flex items-center justify-between gap-3 ${
                          isCurrentUser
                            ? 'bg-indigo-50/40 dark:bg-indigo-950/20'
                            : 'hover:bg-neutral-50/50 dark:hover:bg-neutral-900/30'
                        } transition-colors`}
                      >
                        {/* Left Info: Rank + Avatar + Name + Title Badge */}
                        <div className="flex items-center gap-3.5 min-w-0">
                          <span className="w-6 text-center text-xs font-mono font-bold text-neutral-400 dark:text-neutral-500 shrink-0">
                            {rank === 1 ? '01' : rank === 2 ? '02' : rank === 3 ? '03' : rank < 10 ? `0${rank}` : rank}
                          </span>

                          <div className="w-8 h-8 rounded-full bg-neutral-100 dark:bg-neutral-800 border border-black/[0.04] dark:border-white/[0.06] overflow-hidden shrink-0">
                            {lbUser.avatar_url ? (
                              <img src={lbUser.avatar_url} alt={lbUser.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-xs font-bold text-neutral-500">
                                {lbUser.name ? lbUser.name[0].toUpperCase() : 'U'}
                              </div>
                            )}
                          </div>

                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="text-sm font-semibold text-neutral-900 dark:text-white truncate">
                                {lbUser.name || lbUser.email.split('@')[0]}
                              </p>
                              
                              {/* Honor Title Badge */}
                              <span className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded-lg border ${rankTitle.bgClass} ${rankTitle.colorClass} ${rankTitle.borderClass}`}>
                                {rankTitle.title}
                              </span>

                              {isCurrentUser && (
                                <span className="text-[9px] uppercase tracking-wider font-semibold px-1.5 py-0.5 rounded-md bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/40">
                                  Kamu
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-neutral-400 font-mono flex items-center gap-2 mt-0.5">
                              <span>{lbUser.quizzes_completed || 0} kuis selesai</span>
                              <span>•</span>
                              <span className="text-amber-500 flex items-center gap-0.5">
                                <Flame className="w-3 h-3 fill-amber-500" /> {lbUser.streak || 1} Hari
                              </span>
                            </p>
                          </div>
                        </div>

                        {/* Right Points Score */}
                        <div className="text-right shrink-0">
                          <p className="text-sm font-bold text-neutral-900 dark:text-white font-mono tracking-tight">
                            {lbUser.points || 0} <span className="text-xs font-normal text-neutral-400">pts</span>
                          </p>
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
        onLoginSuccess={handleLoginSuccess}
      />

      {/* Minimalistic Apple Footer */}
      <footer className="w-full border-t border-black/[0.06] dark:border-white/[0.08] py-6 text-xs text-neutral-400 dark:text-neutral-500 transition-colors">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© {new Date().getFullYear()} Quiz Pocket. Rotasi kuis 30 menit & Papan Peringkat Global.</p>
          <div className="flex items-center gap-4 font-mono text-[11px]">
            <span>SD · SMP · SMA</span>
            <span>quiz.abdasis.my.id</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
