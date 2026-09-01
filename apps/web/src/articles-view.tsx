import { useState, useEffect } from 'react'
import { BookOpen, Clock, ArrowRight, ChevronLeft, Zap, HelpCircle } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import type { Question } from './quiz-player'

export interface ArticleItem {
  id: number
  slug: string
  title: string
  summary: string
  content: string
  category: string
  level: string
  read_time_minutes: number
  icon: string
  questions?: Question[]
}

interface ArticlesViewProps {
  onStartPracticeWithQuestions?: (questions: Question[], title: string) => void
}

export function ArticlesView({ onStartPracticeWithQuestions }: ArticlesViewProps) {
  const [articles, setArticles] = useState<ArticleItem[]>([])
  const [selectedArticle, setSelectedArticle] = useState<ArticleItem | null>(null)
  const [, setIsLoading] = useState(true)
  const [selectedLevel, setSelectedLevel] = useState<string>('ALL')

  useEffect(() => {
    fetchArticles()
  }, [])

  const fetchArticles = async () => {
    setIsLoading(true)
    try {
      const res = await fetch('/api/v1/articles')
      const json = await res.json()
      if (json.success && json.articles) {
        setArticles(json.articles)
      }
    } catch (e) {
      console.error('Failed to fetch articles:', e)
    } finally {
      setIsLoading(false)
    }
  }

  const handleOpenArticle = async (slug: string) => {
    setIsLoading(true)
    try {
      const res = await fetch(`/api/v1/articles/${slug}`)
      const json = await res.json()
      if (json.success && json.article) {
        setSelectedArticle(json.article)
      }
    } catch (e) {
      console.error('Failed to fetch article detail:', e)
    } finally {
      setIsLoading(false)
    }
  }

  const filteredArticles = selectedLevel === 'ALL' 
    ? articles 
    : articles.filter(a => a.level === selectedLevel)

  if (selectedArticle) {
    const questions = selectedArticle.questions || []
    return (
      <div className="space-y-6 animate-in fade-in duration-200">
        {/* Top Navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => setSelectedArticle(null)}
            className="pressable inline-flex items-center gap-1.5 px-3.5 py-2 rounded-2xl border border-black/[0.06] dark:border-white/[0.08] bg-white/70 dark:bg-neutral-900/70 text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
          >
            <ChevronLeft className="w-4 h-4" />
            Kembali ke Daftar Artikel
          </button>
          
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-800/40">
              Jenjang {selectedArticle.level}
            </span>
            <span className="text-[11px] font-mono text-neutral-400 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {selectedArticle.read_time_minutes} menit baca
            </span>
          </div>
        </div>

        {/* Article Reading Card */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white/80 dark:bg-[#090a0f]/80 backdrop-blur-2xl border border-black/[0.06] dark:border-white/[0.08] shadow-2xs space-y-6">
          <div className="space-y-2.5 border-b border-black/[0.06] dark:border-white/[0.08] pb-5">
            <span className="text-xs font-mono font-bold text-neutral-400 uppercase tracking-wider">
              {selectedArticle.category}
            </span>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900 dark:text-white leading-snug">
              {selectedArticle.title}
            </h1>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 italic leading-relaxed">
              "{selectedArticle.summary}"
            </p>
          </div>

          {/* Article ReactMarkdown Body with Apple HIG styling */}
          <div className="text-sm sm:text-base leading-relaxed text-neutral-800 dark:text-neutral-200 space-y-4">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                h1: ({ ...props }) => (
                  <h1 className="text-xl sm:text-2xl font-bold text-neutral-900 dark:text-white mt-6 mb-3 tracking-tight" {...props} />
                ),
                h2: ({ ...props }) => (
                  <h2 className="text-lg sm:text-xl font-bold text-neutral-900 dark:text-white mt-6 mb-2 tracking-tight" {...props} />
                ),
                h3: ({ ...props }) => (
                  <h3 className="text-base sm:text-lg font-bold text-neutral-900 dark:text-white mt-5 mb-2 tracking-tight" {...props} />
                ),
                p: ({ ...props }) => (
                  <p className="text-sm sm:text-[15px] leading-relaxed text-neutral-700 dark:text-neutral-300 my-3" {...props} />
                ),
                ul: ({ ...props }) => (
                  <ul className="list-disc pl-5 my-3 space-y-1.5 text-sm sm:text-[15px] text-neutral-700 dark:text-neutral-300" {...props} />
                ),
                ol: ({ ...props }) => (
                  <ol className="list-decimal pl-5 my-3 space-y-1.5 text-sm sm:text-[15px] text-neutral-700 dark:text-neutral-300" {...props} />
                ),
                li: ({ ...props }) => (
                  <li className="leading-relaxed" {...props} />
                ),
                strong: ({ ...props }) => (
                  <strong className="font-bold text-neutral-900 dark:text-white" {...props} />
                ),
                blockquote: ({ ...props }) => (
                  <blockquote className="border-l-2 border-indigo-500 pl-4 py-1 italic my-3 text-neutral-600 dark:text-neutral-400 bg-neutral-50 dark:bg-neutral-900/40 rounded-r-xl" {...props} />
                ),
                code: ({ ...props }) => (
                  <code className="px-1.5 py-0.5 rounded-md font-mono text-xs bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 border border-black/[0.04] dark:border-white/[0.06]" {...props} />
                ),
              }}
            >
              {selectedArticle.content}
            </ReactMarkdown>
          </div>

          {/* Uji Pemahaman: Soal Kuis Terkait Artikel */}
          <div className="pt-6 border-t border-black/[0.06] dark:border-white/[0.08] space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/60 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
                  <HelpCircle className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-neutral-900 dark:text-white">
                    Uji Pemahaman Artikel ({questions.length} Butir Soal Terkait)
                  </h4>
                  <p className="text-xs text-neutral-500">
                    Asah daya serap bacaan dengan mengerjakan butir soal yang diangkat dari konsep artikel ini.
                  </p>
                </div>
              </div>

              {onStartPracticeWithQuestions && questions.length > 0 && (
                <button
                  onClick={() => onStartPracticeWithQuestions(questions, `Uji Pemahaman: ${selectedArticle.title}`)}
                  className="pressable inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-2xl bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-100 text-white dark:text-neutral-900 text-xs font-bold transition shadow-xs self-start sm:self-auto shrink-0"
                >
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  Mulai Kuis Artikel Ini
                </button>
              )}
            </div>

            {/* List Preview Soal Terkait */}
            <div className="grid grid-cols-1 gap-2.5 pt-2">
              {questions.slice(0, 4).map((q, qIdx) => (
                <div
                  key={q.id || qIdx}
                  className="p-3.5 rounded-2xl border border-black/[0.04] dark:border-white/[0.06] bg-neutral-50/70 dark:bg-neutral-900/50 flex items-start gap-3"
                >
                  <span className="w-5 h-5 rounded-lg bg-neutral-200 dark:bg-neutral-800 text-[11px] font-mono font-bold flex items-center justify-center text-neutral-600 dark:text-neutral-400 shrink-0">
                    {qIdx + 1}
                  </span>
                  <div className="flex-1 space-y-1">
                    <p className="text-xs sm:text-sm font-medium text-neutral-800 dark:text-neutral-200">
                      {q.question}
                    </p>
                    <div className="flex items-center gap-2 text-[10px] font-mono text-neutral-400">
                      <span className="px-1.5 py-0.2 rounded bg-black/[0.04] dark:bg-white/[0.06]">
                        {q.level}
                      </span>
                      <span>+{q.points} Pts</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-white/80 dark:bg-[#090a0f]/80 backdrop-blur-2xl border border-black/[0.06] dark:border-white/[0.08] shadow-2xs">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/60 dark:border-emerald-800/40 text-emerald-600 dark:text-emerald-400 text-[11px] font-mono font-bold">
            <BookOpen className="w-3.5 h-3.5" />
            Modul Wawasan & Literasi
          </div>
          <h2 className="text-lg sm:text-xl font-bold tracking-tight text-neutral-900 dark:text-white">
            Artikel Sains, Logika & Pengetahuan Terpadu
          </h2>
          <p className="text-xs sm:text-sm text-neutral-500 max-w-xl">
            Tingkatkan pemahaman konsep dengan membaca artikel terstruktur, lalu uji langsung nalar Anda pada butir-butir soal yang relevan.
          </p>
        </div>

        {/* Level Filters */}
        <div className="flex items-center gap-1 p-1 rounded-2xl bg-neutral-100 dark:bg-neutral-900 border border-black/[0.04] dark:border-white/[0.06] self-start sm:self-auto">
          {['ALL', 'SD', 'SMP', 'SMA'].map((lvl) => (
            <button
              key={lvl}
              onClick={() => setSelectedLevel(lvl)}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition ${
                selectedLevel === lvl
                  ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-2xs'
                  : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
              }`}
            >
              {lvl === 'ALL' ? 'Semua' : lvl}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Articles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {filteredArticles.map((art) => (
          <div
            key={art.id}
            onClick={() => handleOpenArticle(art.slug)}
            className="pressable p-5 rounded-3xl bg-white/80 dark:bg-[#090a0f]/80 backdrop-blur-2xl border border-black/[0.06] dark:border-white/[0.08] hover:border-neutral-300 dark:hover:border-neutral-700 transition cursor-pointer flex flex-col justify-between space-y-4 shadow-2xs group"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono font-bold text-neutral-400 uppercase tracking-wider">
                  {art.category}
                </span>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 border border-black/[0.04] dark:border-white/[0.06]">
                  {art.level}
                </span>
              </div>
              <h3 className="text-sm sm:text-base font-bold text-neutral-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition line-clamp-2">
                {art.title}
              </h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 line-clamp-2 leading-relaxed">
                {art.summary}
              </p>
            </div>

            <div className="pt-3 border-t border-black/[0.04] dark:border-white/[0.06] flex items-center justify-between text-xs font-semibold text-neutral-500">
              <span className="flex items-center gap-1 text-[11px] font-mono text-neutral-400">
                <Clock className="w-3.5 h-3.5" />
                {art.read_time_minutes} menit baca
              </span>
              <span className="inline-flex items-center gap-1 text-indigo-600 dark:text-indigo-400 font-bold group-hover:translate-x-0.5 transition">
                Baca & Latihan <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
