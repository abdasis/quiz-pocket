import { useState, useEffect } from 'react'
import { BookOpen, Clock, ArrowRight, ChevronLeft, Bookmark } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

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
}

export function ArticlesView() {
  const [articles, setArticles] = useState<ArticleItem[]>([])
  const [selectedArticle, setSelectedArticle] = useState<ArticleItem | null>(null)
  const [, setIsLoading] = useState(true)
  const [selectedLevel, setSelectedLevel] = useState<string>('ALL')

  useEffect(() => {
    fetchArticles()
    // Handle URL Deep-linking / SEO Clean Routing (/buku-wawasan/:slug atau /buku-wawasan)
    const checkUrlRoute = () => {
      const path = window.location.pathname
      if (path.startsWith('/buku-wawasan/')) {
        const slug = path.replace('/buku-wawasan/', '')
        if (slug) handleOpenArticle(slug, false)
      } else if (path === '/buku-wawasan') {
        setSelectedArticle(null)
      }
    }
    checkUrlRoute()

    window.addEventListener('popstate', checkUrlRoute)
    return () => window.removeEventListener('popstate', checkUrlRoute)
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

  const handleOpenArticle = async (slug: string, updateHistory = true) => {
    setIsLoading(true)
    try {
      const res = await fetch(`/api/v1/articles/${slug}`)
      const json = await res.json()
      if (json.success && json.article) {
        setSelectedArticle(json.article)
        if (updateHistory) {
          window.history.pushState({ slug }, '', `/buku-wawasan/${slug}`)
        }
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }
    } catch (e) {
      console.error('Failed to fetch article detail:', e)
    } finally {
      setIsLoading(false)
    }
  }

  const handleBackToList = () => {
    setSelectedArticle(null)
    window.history.pushState({}, '', '/buku-wawasan')
  }

  const currentIndex = selectedArticle 
    ? articles.findIndex(a => a.id === selectedArticle.id) 
    : -1

  const prevArticle = currentIndex > 0 ? articles[currentIndex - 1] : null
  const nextArticle = currentIndex >= 0 && currentIndex < articles.length - 1 ? articles[currentIndex + 1] : null

  const filteredArticles = selectedLevel === 'ALL' 
    ? articles 
    : articles.filter(a => a.level === selectedLevel)

  if (selectedArticle) {
    return (
      <div className="space-y-6 animate-in fade-in duration-200 w-full">
        {/* Top Book Navigation Header */}
        <div className="flex items-center justify-between pb-2 border-b border-black/[0.04] dark:border-white/[0.04]">
          <button
            onClick={handleBackToList}
            className="pressable inline-flex items-center gap-1.5 px-3.5 py-2 rounded-2xl border border-black/[0.06] dark:border-white/[0.08] bg-white/70 dark:bg-neutral-900/70 text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
            Daftar Bab & Buku
          </button>
          
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-800/40">
              Jenjang {selectedArticle.level}
            </span>
            <span className="text-[11px] font-mono text-neutral-400 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {selectedArticle.read_time_minutes} mnt baca
            </span>
          </div>
        </div>

        {/* Book Chapter Sheet (Reading View) */}
        <article className="p-6 sm:p-10 rounded-3xl bg-white/90 dark:bg-[#0c0d12]/90 backdrop-blur-2xl border border-black/[0.06] dark:border-white/[0.08] shadow-2xs space-y-8">
          
          {/* Chapter Heading */}
          <div className="space-y-3 text-center sm:text-left border-b border-black/[0.06] dark:border-white/[0.08] pb-6">
            <div className="inline-flex items-center gap-1.5 text-xs font-mono font-bold uppercase tracking-wider text-neutral-400">
              <Bookmark className="w-3.5 h-3.5 text-indigo-500" />
              {selectedArticle.category} · Bab {currentIndex + 1}
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-950 dark:text-white leading-tight">
              {selectedArticle.title}
            </h2>
            <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400 italic leading-relaxed pt-1">
              "{selectedArticle.summary}"
            </p>
          </div>

          {/* Book Content Typography */}
          <div className="text-neutral-800 dark:text-neutral-200 leading-relaxed space-y-5 text-[15px] sm:text-base break-words overflow-hidden">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                h1: ({ ...props }) => (
                  <h2 className="text-xl sm:text-2xl font-bold text-neutral-950 dark:text-white mt-8 mb-3 tracking-tight border-b border-black/[0.04] dark:border-white/[0.04] pb-2" {...props} />
                ),
                h2: ({ ...props }) => (
                  <h3 className="text-lg sm:text-xl font-bold text-neutral-950 dark:text-white mt-7 mb-2 tracking-tight" {...props} />
                ),
                h3: ({ ...props }) => (
                  <h4 className="text-base sm:text-lg font-bold text-neutral-950 dark:text-white mt-6 mb-2 tracking-tight" {...props} />
                ),
                p: ({ ...props }) => (
                  <p className="text-sm sm:text-[15px] leading-relaxed text-neutral-700 dark:text-neutral-300 my-3.5 text-left" {...props} />
                ),
                ul: ({ ...props }) => (
                  <ul className="list-disc pl-5 my-3.5 space-y-2 text-sm sm:text-[15px] text-neutral-700 dark:text-neutral-300" {...props} />
                ),
                ol: ({ ...props }) => (
                  <ol className="list-decimal pl-5 my-3.5 space-y-2 text-sm sm:text-[15px] text-neutral-700 dark:text-neutral-300" {...props} />
                ),
                li: ({ ...props }) => (
                  <li className="leading-relaxed" {...props} />
                ),
                strong: ({ ...props }) => (
                  <strong className="font-bold text-neutral-950 dark:text-white" {...props} />
                ),
                blockquote: ({ ...props }) => (
                  <blockquote className="border-l-2 border-indigo-500 pl-4 py-2 italic my-4 text-neutral-600 dark:text-neutral-400 bg-neutral-50 dark:bg-neutral-900/50 rounded-r-2xl text-sm" {...props} />
                ),
                code: ({ className, children, ...props }) => {
                  const isBlock = !className && String(children).includes('\n')
                  if (isBlock) {
                    return (
                      <pre className="p-3 sm:p-4 rounded-2xl bg-neutral-950 dark:bg-black text-neutral-100 font-mono text-[11px] sm:text-xs overflow-x-auto my-4 border border-white/10 leading-snug">
                        <code>{children}</code>
                      </pre>
                    )
                  }
                  return (
                    <code className="px-1.5 py-0.5 rounded-md font-mono text-xs bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 border border-black/[0.04] dark:border-white/[0.06] break-all" {...props}>
                      {children}
                    </code>
                  )
                },
                pre: ({ children }) => <>{children}</>,
                img: ({ alt, src, ...props }) => (
                  <figure className="my-6 space-y-2">
                    <div className="overflow-hidden rounded-2xl border border-black/[0.06] dark:border-white/[0.08] bg-neutral-100 dark:bg-neutral-900/60 flex items-center justify-center">
                      <img
                        src={src}
                        alt={alt || 'Ilustrasi Wawasan'}
                        className="w-full max-h-[420px] object-contain rounded-2xl transition hover:scale-[1.01]"
                        loading="lazy"
                        {...props}
                      />
                    </div>
                    {alt && (
                      <figcaption className="text-center text-xs font-mono text-neutral-500 dark:text-neutral-400 italic">
                        {alt}
                      </figcaption>
                    )}
                  </figure>
                ),
                table: ({ ...props }) => (
                  <div className="w-full overflow-x-auto my-4 rounded-2xl border border-black/[0.06] dark:border-white/[0.08]">
                    <table className="w-full text-xs sm:text-sm text-left border-collapse" {...props} />
                  </div>
                ),
                th: ({ ...props }) => (
                  <th className="p-3 bg-neutral-100/70 dark:bg-neutral-900/70 font-bold border-b border-black/[0.06] dark:border-white/[0.08]" {...props} />
                ),
                td: ({ ...props }) => (
                  <td className="p-3 border-b border-black/[0.04] dark:border-white/[0.04]" {...props} />
                ),
              }}
            >
              {selectedArticle.content}
            </ReactMarkdown>
          </div>

          {/* Book Bottom Navigation (Next / Previous Chapter) */}
          <div className="pt-8 border-t border-black/[0.06] dark:border-white/[0.08] flex flex-col sm:flex-row items-center justify-between gap-4">
            {prevArticle ? (
              <button
                onClick={() => handleOpenArticle(prevArticle.slug)}
                className="pressable w-full sm:w-auto p-3.5 rounded-2xl border border-black/[0.06] dark:border-white/[0.08] bg-neutral-50/70 dark:bg-neutral-900/50 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition flex items-center gap-3 text-left"
              >
                <ChevronLeft className="w-5 h-5 text-neutral-400 shrink-0" />
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase text-neutral-400 block">Bab Sebelumnya</span>
                  <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200 line-clamp-1 max-w-[200px]">{prevArticle.title}</span>
                </div>
              </button>
            ) : <div className="hidden sm:block" />}

            {nextArticle && (
              <button
                onClick={() => handleOpenArticle(nextArticle.slug)}
                className="pressable w-full sm:w-auto p-3.5 rounded-2xl border border-black/[0.06] dark:border-white/[0.08] bg-neutral-50/70 dark:bg-neutral-900/50 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition flex items-center justify-between gap-3 text-right"
              >
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase text-indigo-500 block">Bab Selanjutnya</span>
                  <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200 line-clamp-1 max-w-[200px]">{nextArticle.title}</span>
                </div>
                <ArrowRight className="w-5 h-5 text-indigo-500 shrink-0" />
              </button>
            )}
          </div>
        </article>
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
            Buku Wawasan & Sains
          </div>
          <h2 className="text-lg sm:text-xl font-bold tracking-tight text-neutral-900 dark:text-white">
            Pustaka Literasi Sains, Logika & Pengetahuan
          </h2>
          <p className="text-xs sm:text-sm text-neutral-500 max-w-xl">
            Buku wawasan digital terpadu untuk memperkaya literasi, sains alam, sejarah kebangsaan, dan logika berpikir.
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

      {/* Grid of Book Chapters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {filteredArticles.map((art, idx) => (
          <div
            key={art.id}
            onClick={() => handleOpenArticle(art.slug)}
            className="pressable p-5 rounded-3xl bg-white/80 dark:bg-[#090a0f]/80 backdrop-blur-2xl border border-black/[0.06] dark:border-white/[0.08] hover:border-neutral-300 dark:hover:border-neutral-700 transition cursor-pointer flex flex-col justify-between space-y-4 shadow-2xs group"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono font-bold text-neutral-400 uppercase tracking-wider">
                  Bab {idx + 1} · {art.category}
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
                {art.read_time_minutes} mnt baca
              </span>
              <span className="inline-flex items-center gap-1 text-indigo-600 dark:text-indigo-400 font-bold group-hover:translate-x-0.5 transition">
                Buka Bab <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
