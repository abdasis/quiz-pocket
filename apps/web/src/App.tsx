import { useState, useEffect } from 'react'
import { AppHeader, type AuthUser } from './app-header'
import { QuizPlayer, type Question } from './quiz-player'
import { LoginModal } from './login-modal'
import { BookOpen, Code, Server, Cpu, Shuffle, Sparkles, ChevronRight, Trophy, LogIn } from 'lucide-react'

interface Category {
  id: number
  slug: string
  title: string
  description: string
  icon: string
  question_count: number
}

const iconMap: Record<string, React.ReactNode> = {
  BookOpen: <BookOpen className="w-6 h-6" />,
  Code: <Code className="w-6 h-6" />,
  Server: <Server className="w-6 h-6" />,
  Cpu: <Cpu className="w-6 h-6" />,
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
  const [pendingCategory, setPendingCategory] = useState<Category | null>(null)

  const [categories, setCategories] = useState<Category[]>([])
  const [activeCategory, setActiveCategory] = useState<Category | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [streak, setStreak] = useState(() => {
    return parseInt(localStorage.getItem('quiz_pocket_streak') || '1', 10)
  })

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
    localStorage.setItem('quiz_pocket_theme', theme)
  }, [theme])

  // Fetch Categories on mount
  useEffect(() => {
    fetch('/api/v1/categories')
      .then((res) => res.json())
      .then((json) => {
        if (json.success) {
          setCategories(json.data)
        }
      })
      .catch((err) => console.error('Failed to fetch categories:', err))
  }, [])

  const handleToggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))
  }

  const handleLoginSuccess = (loggedInUser: AuthUser) => {
    setUser(loggedInUser)
    localStorage.setItem('quiz_pocket_user', JSON.stringify(loggedInUser))
    if (pendingCategory) {
      if (pendingCategory.id === 0) {
        startRandomQuizInternal()
      } else {
        startCategoryInternal(pendingCategory)
      }
      setPendingCategory(null)
    }
  }

  const handleLogout = () => {
    setUser(null)
    localStorage.removeItem('quiz_pocket_user')
    setActiveCategory(null)
    setQuestions([])
  }

  const startCategoryInternal = async (cat: Category) => {
    setIsLoading(true)
    try {
      const res = await fetch(`/api/v1/quiz/${cat.slug}`)
      const json = await res.json()
      if (json.success) {
        setQuestions(json.data)
        setActiveCategory(cat)
      }
    } catch (err) {
      console.error('Failed to load quiz:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleStartCategory = (cat: Category) => {
    if (!user) {
      setPendingCategory(cat)
      setIsLoginModalOpen(true)
      return
    }
    startCategoryInternal(cat)
  }

  const startRandomQuizInternal = async () => {
    setIsLoading(true)
    try {
      const res = await fetch('/api/v1/quiz-random?limit=10')
      const json = await res.json()
      if (json.success) {
        setQuestions(json.data)
        setActiveCategory({
          id: 0,
          slug: 'random',
          title: 'Kuis Acak Campuran',
          description: '10 Soal acak gabungan seluruh kategori materi',
          icon: 'Cpu',
          question_count: json.total,
        })
      }
    } catch (err) {
      console.error('Failed to load random quiz:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleStartRandomQuiz = () => {
    if (!user) {
      setPendingCategory({
        id: 0,
        slug: 'random',
        title: 'Kuis Acak Campuran',
        description: '10 Soal acak gabungan seluruh kategori materi',
        icon: 'Cpu',
        question_count: 10,
      })
      setIsLoginModalOpen(true)
      return
    }
    startRandomQuizInternal()
  }

  const handleFinishQuiz = (score: number, total: number) => {
    const newStreak = streak + 1
    setStreak(newStreak)
    localStorage.setItem('quiz_pocket_streak', newStreak.toString())

    if (activeCategory && user) {
      fetch('/api/v1/quiz/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          user_email: user.email,
          user_name: user.name,
          category_id: activeCategory.id,
          score,
          total,
          correct_count: Math.round(score / 10),
          time_spent_sec: 60,
        }),
      }).catch((e) => console.error('Submit error:', e))
    }
  }

  const handleExitQuiz = () => {
    setActiveCategory(null)
    setQuestions([])
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#090a0f] text-neutral-900 dark:text-neutral-100 flex flex-col transition-colors">
      <AppHeader
        theme={theme}
        onToggleTheme={handleToggleTheme}
        onHomeClick={handleExitQuiz}
        currentTitle={activeCategory?.title}
        streak={streak}
        user={user}
        onOpenLogin={() => setIsLoginModalOpen(true)}
        onLogout={handleLogout}
      />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {activeCategory && questions.length > 0 ? (
          <QuizPlayer
            categoryTitle={activeCategory.title}
            questions={questions}
            onFinish={handleFinishQuiz}
            onExit={handleExitQuiz}
          />
        ) : (
          <div className="space-y-8 animate-in fade-in duration-200">
            {/* Hero Banner */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800 text-white p-6 sm:p-8 border border-white/10 shadow-sm">
              <div className="relative z-10 max-w-xl space-y-3">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold border border-white/15">
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  Tantangan Harian & Leaderboard
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                  Uji Pengetahuan & Kecepatan Berpikir
                </h2>
                <p className="text-sm text-indigo-100/90 leading-relaxed">
                  {user
                    ? `Selamat datang, ${user.name || user.email}! Pilih topik untuk mulai uji kemampuan.`
                    : 'Masuk dengan Gmail untuk mencatat riwayat skor, leaderboard dan streak harian.'}
                </p>

                <div className="pt-2 flex flex-wrap items-center gap-3">
                  <button
                    onClick={handleStartRandomQuiz}
                    disabled={isLoading}
                    className="h-11 px-5 rounded-2xl bg-white text-indigo-950 font-bold text-sm flex items-center gap-2 hover:bg-neutral-100 cursor-pointer pressable"
                  >
                    <Shuffle className="w-4 h-4 text-indigo-600" />
                    Main Kuis Acak (10 Soal)
                  </button>

                  {!user && (
                    <button
                      onClick={() => setIsLoginModalOpen(true)}
                      className="h-11 px-5 rounded-2xl bg-white/15 hover:bg-white/20 text-white font-semibold text-sm border border-white/20 flex items-center gap-2 cursor-pointer pressable"
                    >
                      <LogIn className="w-4 h-4" />
                      Masuk dengan Gmail
                    </button>
                  )}
                </div>
              </div>

              {/* Decorative Background Circles */}
              <div className="absolute -right-10 -bottom-10 w-64 h-64 rounded-full bg-white/5 pointer-events-none" />
              <div className="absolute right-20 -top-10 w-48 h-48 rounded-full bg-purple-500/20 blur-2xl pointer-events-none" />
            </div>

            {/* Category Grid Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-neutral-900 dark:text-white">Kategori Kuis</h3>
                  <p className="text-xs text-neutral-500">Pilih modul materi untuk mulai latihan</p>
                </div>
                <span className="text-xs font-semibold text-neutral-400 font-mono">
                  {categories.length} Topik
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {categories.map((cat) => (
                  <div
                    key={cat.id}
                    onClick={() => handleStartCategory(cat)}
                    className="group p-5 rounded-3xl bg-white dark:bg-[#12131a] border border-black/[0.06] dark:border-white/[0.08] hover:border-indigo-500/50 dark:hover:border-indigo-500/50 card-hover cursor-pointer pressable flex flex-col justify-between space-y-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-800/40 flex items-center justify-center shrink-0">
                        {iconMap[cat.icon] || <Trophy className="w-6 h-6" />}
                      </div>
                      <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-neutral-100 dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 font-mono">
                        {cat.question_count} Soal
                      </span>
                    </div>

                    <div className="space-y-1">
                      <h4 className="text-base font-bold text-neutral-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors flex items-center justify-between">
                        {cat.title}
                        <ChevronRight className="w-4 h-4 text-neutral-400 group-hover:translate-x-1 transition-transform" />
                      </h4>
                      <p className="text-xs text-neutral-500 leading-relaxed line-clamp-2">
                        {cat.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Login Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => {
          setIsLoginModalOpen(false)
          setPendingCategory(null)
        }}
        onLoginSuccess={handleLoginSuccess}
      />

      {/* Minimal Footer */}
      <footer className="w-full border-t border-black/[0.06] dark:border-white/[0.08] py-6 text-center text-xs text-neutral-500 transition-colors">
        <div className="max-w-4xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>© {new Date().getFullYear()} Quiz Pocket. Built with Go Fiber & React Apple HIG.</p>
          <p className="font-mono text-[11px]">quiz.abdasis.my.id</p>
        </div>
      </footer>
    </div>
  )
}
