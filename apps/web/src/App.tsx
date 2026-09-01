import { useState, useEffect } from 'react'
import { AppHeader, type AuthUser } from './app-header'
import { QuizPlayer, type Question } from './quiz-player'
import { LoginModal } from './login-modal'
import { Trophy, Clock, CheckCircle2, Play, AlertCircle, Users } from 'lucide-react'

interface Category {
  id: number
  slug: string
  title: string
  description: string
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

  // Live 30-Min Slot State
  const [liveSlot, setLiveSlot] = useState<LiveSlotResponse | null>(null)
  const [secondsRemaining, setSecondsRemaining] = useState<number>(0)
  const [isPlaying, setIsPlaying] = useState(false)
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
          // Slot Expired! Auto reload next 30-min slot
          fetchLiveSlot()
          fetchLeaderboard()
          setIsPlaying(false)
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
    setIsPlaying(true)
  }

  const handleFinishLiveQuiz = async (score: number, total: number, correctCount: number) => {
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
          time_spent_sec: 60,
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

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#090a0f] text-neutral-900 dark:text-neutral-100 flex flex-col transition-colors">
      <AppHeader
        theme={theme}
        onToggleTheme={handleToggleTheme}
        onHomeClick={() => setIsPlaying(false)}
        currentTitle={isPlaying ? liveSlot?.category.title : undefined}
        user={user}
        onOpenLogin={() => setIsLoginModalOpen(true)}
        onLogout={handleLogout}
      />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {isPlaying && liveSlot && liveSlot.questions?.length > 0 ? (
          <QuizPlayer
            slotId={liveSlot.slot_id}
            categoryTitle={liveSlot.category.title}
            questions={liveSlot.questions}
            secondsRemainingSlot={secondsRemaining}
            onFinish={handleFinishLiveQuiz}
            onExit={() => {
              setIsPlaying(false)
              fetchLiveSlot()
            }}
          />
        ) : (
          <div className="space-y-8 animate-in fade-in duration-200">
            {/* Live 30-Minute Quiz Featured Card */}
            {liveSlot ? (
              <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800 text-white p-6 sm:p-8 border border-white/10 shadow-sm">
                <div className="relative z-10 space-y-4">
                  {/* Top Badges & Countdown */}
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-bold border border-white/20">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                      <span>KUIS SESI 30 MENIT AKTIF</span>
                    </div>

                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-black/30 backdrop-blur-md text-white border border-white/15 font-mono text-sm font-bold">
                      <Clock className="w-4 h-4 text-amber-300 animate-pulse" />
                      <span>Sisa Waktu: {formatCountdown(secondsRemaining)}</span>
                    </div>
                  </div>

                  {/* Slot Title & Topic */}
                  <div className="space-y-2 max-w-xl">
                    <div className="flex items-center gap-2 text-indigo-200 text-xs font-semibold uppercase tracking-wider">
                      <span>Topik Sesi Ini:</span>
                      <span className="px-2 py-0.5 rounded-md bg-white/20 text-white font-bold">
                        {liveSlot.category.title}
                      </span>
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                      Selesaikan 5 Soal & Kumpulkan Poin!
                    </h2>
                    <p className="text-sm text-indigo-100/90 leading-relaxed">
                      {liveSlot.category.description}. Kuis ini akan otomatis berganti dengan kuis topik baru dalam{' '}
                      <b className="font-mono text-amber-300">{formatCountdown(secondsRemaining)}</b>.
                    </p>
                  </div>

                  {/* Status & CTA Button */}
                  <div className="pt-3 flex flex-wrap items-center gap-3">
                    {liveSlot.is_completed ? (
                      <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-emerald-500/30 border border-emerald-400/40 text-emerald-200 font-semibold text-sm">
                        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                        <span>
                          Kamu sudah menyelesaikan sesi ini (+{liveSlot.submission?.score || 0} Poin). Tunggu sesi berikutnya!
                        </span>
                      </div>
                    ) : (
                      <button
                        onClick={handleStartLiveQuiz}
                        disabled={isLoading}
                        className="h-12 px-6 rounded-2xl bg-white text-indigo-950 hover:bg-neutral-100 font-bold text-sm flex items-center gap-2.5 cursor-pointer pressable shadow-md"
                      >
                        <Play className="w-4 h-4 fill-indigo-950 text-indigo-950" />
                        <span>Mulai Kerjakan Kuis Sekarang</span>
                      </button>
                    )}

                    {!user && (
                      <p className="text-xs text-indigo-200 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        Wajib masuk dengan Gmail untuk mencatat skor
                      </p>
                    )}
                  </div>
                </div>

                {/* Decorative Background */}
                <div className="absolute -right-10 -bottom-10 w-72 h-72 rounded-full bg-white/5 pointer-events-none" />
                <div className="absolute right-20 -top-10 w-48 h-48 rounded-full bg-purple-500/20 blur-2xl pointer-events-none" />
              </div>
            ) : null}

            {/* Global Leaderboard Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200/60 dark:border-amber-800/40 flex items-center justify-center text-amber-500">
                    <Trophy className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-neutral-900 dark:text-white">Papan Peringkat (Leaderboard)</h3>
                    <p className="text-xs text-neutral-500">Pemain teratas berdasarkan total akumulasi poin kuis</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-neutral-400 font-mono">
                  <Users className="w-3.5 h-3.5" />
                  <span>{leaderboard.length} Pemain</span>
                </div>
              </div>

              {/* Leaderboard Table / Cards */}
              <div className="bg-white dark:bg-[#12131a] rounded-3xl border border-black/[0.06] dark:border-white/[0.08] overflow-hidden divide-y divide-black/[0.04] dark:divide-white/[0.04]">
                {leaderboard.length === 0 ? (
                  <div className="p-8 text-center text-neutral-400 text-xs">
                    Belum ada riwayat pemain. Jadilah yang pertama menyelesaikan kuis!
                  </div>
                ) : (
                  leaderboard.map((lbUser, idx) => {
                    const isCurrentUser = user?.email === lbUser.email
                    const rank = idx + 1
                    let rankBadge = (
                      <span className="w-6 h-6 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-500 text-xs font-mono font-bold flex items-center justify-center">
                        {rank}
                      </span>
                    )
                    if (rank === 1) {
                      rankBadge = (
                        <span className="w-6 h-6 rounded-lg bg-amber-500 text-white text-xs font-mono font-bold flex items-center justify-center shadow-xs">
                          🥇
                        </span>
                      )
                    } else if (rank === 2) {
                      rankBadge = (
                        <span className="w-6 h-6 rounded-lg bg-neutral-300 text-neutral-800 text-xs font-mono font-bold flex items-center justify-center">
                          🥈
                        </span>
                      )
                    } else if (rank === 3) {
                      rankBadge = (
                        <span className="w-6 h-6 rounded-lg bg-amber-700/80 text-white text-xs font-mono font-bold flex items-center justify-center">
                          🥉
                        </span>
                      )
                    }

                    return (
                      <div
                        key={lbUser.id}
                        className={`p-4 sm:p-5 flex items-center justify-between gap-3 ${
                          isCurrentUser
                            ? 'bg-indigo-50/50 dark:bg-indigo-950/20'
                            : 'hover:bg-neutral-50/50 dark:hover:bg-neutral-900/30'
                        } transition-colors`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          {rankBadge}
                          <div className="w-8 h-8 rounded-full bg-neutral-200 dark:bg-neutral-800 overflow-hidden shrink-0">
                            {lbUser.avatar_url ? (
                              <img src={lbUser.avatar_url} alt={lbUser.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-xs font-bold text-neutral-500">
                                {lbUser.name ? lbUser.name[0].toUpperCase() : 'U'}
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs sm:text-sm font-bold text-neutral-900 dark:text-white truncate flex items-center gap-1.5">
                              <span>{lbUser.name || lbUser.email.split('@')[0]}</span>
                              {isCurrentUser && (
                                <span className="text-[9px] uppercase tracking-wider font-bold px-1.5 py-0.2 rounded-md bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300">
                                  Kamu
                                </span>
                              )}
                            </p>
                            <p className="text-[10px] text-neutral-400 font-mono">
                              {lbUser.quizzes_completed || 0} sesi kuis selesai
                            </p>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <p className="text-sm sm:text-base font-extrabold text-indigo-600 dark:text-indigo-400 font-mono">
                            {lbUser.points || 0} pts
                          </p>
                          <span className="text-[10px] text-neutral-400 font-medium">Akumulasi Skor</span>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Login Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />

      {/* Minimal Footer */}
      <footer className="w-full border-t border-black/[0.06] dark:border-white/[0.08] py-6 text-center text-xs text-neutral-500 transition-colors">
        <div className="max-w-4xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>© {new Date().getFullYear()} Quiz Pocket. Kuis live rotasi 30 menit & akumulasi skor.</p>
          <p className="font-mono text-[11px]">quiz.abdasis.my.id</p>
        </div>
      </footer>
    </div>
  )
}
