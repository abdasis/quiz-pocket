import { useState, useEffect, useRef } from 'react'
import { ArrowRight, RotateCcw, Award, Clock, Sparkles, Check, X, ArrowLeft, ShieldAlert, AlertTriangle } from 'lucide-react'
import confetti from 'canvas-confetti'

export interface Question {
  id: number
  category_id: number
  question: string
  options: string[]
  answer_index: number
  explanation: string
  level?: string
  points: number
}

interface QuizPlayerProps {
  slotId: number
  categoryTitle: string
  questions: Question[]
  secondsRemainingSlot: number
  onFinish: (score: number, total: number, correctCount: number) => void
  onExit: () => void
}

export function QuizPlayer({
  categoryTitle,
  questions,
  onFinish,
  onExit,
}: QuizPlayerProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedOption, setSelectedOption] = useState<number | null>(null)
  const [isAnswered, setIsAnswered] = useState(false)
  const [score, setScore] = useState(0)
  const [correctCount, setCorrectCount] = useState(0)
  const [secondsLeft, setSecondsLeft] = useState(30)
  const [isCompleted, setIsCompleted] = useState(false)

  // Anti-Cheat States
  const [tabSwitches, setTabSwitches] = useState(0)
  const [showWarning, setShowWarning] = useState<string | null>(null)
  const [isDisqualified, setIsDisqualified] = useState(false)
  const isCompletedRef = useRef(false)
  isCompletedRef.current = isCompleted

  const currentQ = questions[currentIndex]
  const progressPercent = Math.round(((currentIndex + 1) / questions.length) * 100)

  // 1. Anti-Cheat: Visibility Change & Blur Detection (Tab Switch / Window Switch)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && !isCompletedRef.current && !isDisqualified) {
        setTabSwitches((prev) => {
          const nextCount = prev + 1
          if (nextCount >= 3) {
            setIsDisqualified(true)
          } else {
            setShowWarning(`Peringatan: Berpindah tab/aplikasi terdeteksi! (${nextCount}/3). Kuis akan didiskualifikasi jika mengulang lagi.`)
          }
          return nextCount
        })
      }
    }

    const handleWindowBlur = () => {
      if (!isCompletedRef.current && !isDisqualified) {
        setTabSwitches((prev) => {
          const nextCount = prev + 1
          if (nextCount >= 3) {
            setIsDisqualified(true)
          } else {
            setShowWarning(`Fokus ujian hilang. Jangan berpindah jendela/aplikasi! (${nextCount}/3).`)
          }
          return nextCount
        })
      }
    }

    // 2. Anti-Cheat: Disable Context Menu (Right Click) & Copy Key Combinations
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault()
      setShowWarning('Tindakan klik kanan / inspect dinonaktifkan demi integritas ujian.')
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        (e.ctrlKey || e.metaKey) && 
        ['c', 'C', 'u', 'U', 's', 'S', 'a', 'A'].includes(e.key)
      ) {
        e.preventDefault()
        setShowWarning('Menyalin teks pertanyaan/jawaban dinonaktifkan.')
      }
      if (e.key === 'F12') {
        e.preventDefault()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('blur', handleWindowBlur)
    window.addEventListener('contextmenu', handleContextMenu)
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('blur', handleWindowBlur)
      window.removeEventListener('contextmenu', handleContextMenu)
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isDisqualified])

  // Countdown timer per question
  useEffect(() => {
    if (isAnswered || isCompleted || isDisqualified) return

    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          handleTimeOut()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [currentIndex, isAnswered, isCompleted, isDisqualified])

  const handleTimeOut = () => {
    setIsAnswered(true)
  }

  const handleSelectOption = (idx: number) => {
    if (isAnswered || isDisqualified) return
    setSelectedOption(idx)
    setIsAnswered(true)

    if (idx === currentQ.answer_index) {
      setScore((prev) => prev + (currentQ.points || 10))
      setCorrectCount((prev) => prev + 1)
    }
  }

  const handleNextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1)
      setSelectedOption(null)
      setIsAnswered(false)
      setSecondsLeft(30)
    } else {
      setIsCompleted(true)
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.6 },
      })
      const maxPoints = questions.reduce((acc, q) => acc + (q.points || 10), 0)
      onFinish(score, maxPoints, correctCount)
    }
  }

  const handleRestart = () => {
    setCurrentIndex(0)
    setSelectedOption(null)
    setIsAnswered(false)
    setScore(0)
    setCorrectCount(0)
    setSecondsLeft(30)
    setIsCompleted(false)
    setIsDisqualified(false)
    setTabSwitches(0)
    setShowWarning(null)
  }

  // State: Disqualified
  if (isDisqualified) {
    return (
      <div className="w-full max-w-4xl mx-auto py-6 animate-in fade-in zoom-in-95 duration-200">
        <div className="bg-white dark:bg-[#111114] rounded-3xl border border-rose-500/20 dark:border-rose-500/20 p-8 sm:p-12 text-center space-y-6">
          <div className="w-20 h-20 mx-auto rounded-3xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200/60 dark:border-rose-800/40 flex items-center justify-center text-rose-500">
            <ShieldAlert className="w-10 h-10" />
          </div>

          <div className="space-y-2 max-w-md mx-auto">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-rose-600 dark:text-rose-400">
              Sesi Didiskualifikasi
            </h2>
            <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
              Terdeteksi berpindah jendela/tab lebih dari batas yang diperbolehkan demi menjaga integritas dan kejujuran kuis. Poin sesi ini tidak dihitung.
            </p>
          </div>

          <div className="pt-2 flex justify-center">
            <button
              onClick={onExit}
              className="h-12 px-6 rounded-2xl bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 font-semibold text-xs inline-flex items-center gap-2 cursor-pointer pressable"
            >
              <span>Kembali ke Beranda</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (isCompleted) {
    const accuracy = Math.round((correctCount / questions.length) * 100)
    const maxScorePossible = questions.reduce((acc, q) => acc + (q.points || 10), 0)

    return (
      <div className="w-full max-w-4xl mx-auto py-2 sm:py-6 animate-in fade-in zoom-in-95 duration-200">
        <div className="bg-white dark:bg-[#111114] rounded-3xl border border-black/[0.06] dark:border-white/[0.08] p-6 sm:p-10 text-center space-y-8">
          <div className="w-20 h-20 mx-auto rounded-3xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/60 dark:border-amber-800/40 flex items-center justify-center text-amber-500">
            <Award className="w-10 h-10" />
          </div>

          <div className="space-y-2 max-w-md mx-auto">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900 dark:text-white">
              Sesi Kuis Selesai!
            </h2>
            <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed font-normal">
              Hasil dan akumulasi poin kamu telah berhasil dicatat ke sistem dan papan peringkat global secara valid.
            </p>
          </div>

          {/* Comprehensive Apple Stats Inset Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto">
            <div className="p-5 rounded-2xl bg-neutral-50/80 dark:bg-neutral-900/50 border border-black/[0.04] dark:border-white/[0.06] text-left">
              <span className="text-xs text-neutral-500 dark:text-neutral-400 font-medium">Poin Terkumpul</span>
              <p className="text-2xl sm:text-3xl font-extrabold font-mono text-indigo-600 dark:text-indigo-400 mt-1">
                +{score} <span className="text-xs font-normal text-neutral-400">/ {maxScorePossible}</span>
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-neutral-50/80 dark:bg-neutral-900/50 border border-black/[0.04] dark:border-white/[0.06] text-left">
              <span className="text-xs text-neutral-500 dark:text-neutral-400 font-medium">Jawaban Benar</span>
              <p className="text-2xl sm:text-3xl font-extrabold font-mono text-emerald-600 dark:text-emerald-400 mt-1">
                {correctCount} <span className="text-xs font-normal text-neutral-400">/ {questions.length}</span>
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-neutral-50/80 dark:bg-neutral-900/50 border border-black/[0.04] dark:border-white/[0.06] text-left">
              <span className="text-xs text-neutral-500 dark:text-neutral-400 font-medium">Tingkat Akurasi</span>
              <p className="text-2xl sm:text-3xl font-extrabold font-mono text-neutral-900 dark:text-white mt-1">
                {accuracy}%
              </p>
            </div>
          </div>

          {/* Action Footer Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2 max-w-md mx-auto">
            <button
              onClick={handleRestart}
              className="w-full sm:w-auto flex-1 h-12 px-6 rounded-2xl bg-black/[0.04] dark:bg-white/[0.06] hover:bg-black/[0.08] dark:hover:bg-white/[0.1] border border-black/[0.06] dark:border-white/[0.08] text-neutral-800 dark:text-neutral-200 font-semibold text-xs inline-flex items-center justify-center gap-2 cursor-pointer pressable"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Latihan Ulang</span>
            </button>
            <button
              onClick={onExit}
              className="w-full sm:w-auto flex-1 h-12 px-6 rounded-2xl bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 hover:bg-neutral-800 dark:hover:bg-neutral-100 font-semibold text-xs inline-flex items-center justify-center gap-2 cursor-pointer pressable"
            >
              <span>Kembali ke Beranda</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 sm:space-y-8 animate-in fade-in duration-200 select-none">
      {/* Anti-Cheat Toast Banner */}
      {showWarning && (
        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800/60 text-amber-900 dark:text-amber-200 text-xs flex items-center justify-between gap-3 animate-in slide-in-from-top duration-200">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
            <span className="font-medium">{showWarning}</span>
          </div>
          <button
            onClick={() => setShowWarning(null)}
            className="px-2 py-1 rounded-lg bg-amber-200/50 dark:bg-amber-800/50 hover:bg-amber-200 text-amber-900 dark:text-amber-100 text-[10px] font-bold cursor-pointer pressable"
          >
            Mengerti
          </button>
        </div>
      )}

      {/* Comprehensive Exam Navigation & Status Bar */}
      <div className="p-5 rounded-3xl bg-white dark:bg-[#111114] border border-black/[0.06] dark:border-white/[0.08] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <button
              onClick={onExit}
              className="h-8 w-8 rounded-xl bg-black/[0.04] dark:bg-white/[0.06] hover:bg-black/[0.08] dark:hover:bg-white/[0.1] border border-black/[0.06] dark:border-white/[0.08] flex items-center justify-center text-neutral-600 dark:text-neutral-300 cursor-pointer pressable"
              title="Keluar Sesi"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <span className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">
                {categoryTitle}
              </span>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-bold text-neutral-950 dark:text-white">
                  Soal No. {currentIndex + 1} <span className="text-neutral-400 font-normal text-xs">dari {questions.length}</span>
                </h3>
              </div>
            </div>
          </div>

          {/* Right Metrics: Anti-Cheat Tab Status + Tier Badge + Question Countdown */}
          <div className="flex flex-wrap items-center gap-2 self-end sm:self-auto">
            {tabSwitches > 0 && (
              <span className="px-2.5 py-1 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 text-xs font-semibold border border-amber-200/60 dark:border-amber-800/40 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3 text-amber-500" />
                <span>Pelanggaran: {tabSwitches}/3</span>
              </span>
            )}

            <span className="px-2.5 py-1 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 text-xs font-semibold border border-indigo-200/60 dark:border-indigo-800/40">
              {currentQ.level ? `Tingkat ${currentQ.level}` : 'Umum'} · +{currentQ.points || 10} Pts
            </span>

            <div className={`flex items-center gap-1.5 px-3 py-1 rounded-xl font-mono text-xs font-semibold border ${
              secondsLeft <= 5 
                ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 animate-pulse'
                : 'bg-neutral-100 dark:bg-neutral-800/60 border-black/[0.04] dark:border-white/[0.06] text-neutral-700 dark:text-neutral-300'
            }`}>
              <Clock className="w-3.5 h-3.5" />
              <span>00:{secondsLeft < 10 ? `0${secondsLeft}` : secondsLeft}</span>
            </div>
          </div>
        </div>

        {/* Global Exam Progress Bar */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[11px] font-mono text-neutral-400">
            <span>Kemajuan Pengerjaan</span>
            <span>{progressPercent}%</span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
            <div
              className="h-full bg-indigo-600 dark:bg-indigo-500 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main Question & Option Workspace Card */}
      <section className="bg-white dark:bg-[#111114] rounded-3xl border border-black/[0.06] dark:border-white/[0.08] p-6 sm:p-9 space-y-7">
        {/* Question Text Area */}
        <div className="space-y-3.5">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest px-2.5 py-0.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200/60 dark:border-indigo-800/40">
              Pertanyaan {currentIndex + 1}
            </span>
          </div>
          <h2 className="exam-question text-neutral-950 dark:text-neutral-50 leading-snug">
            {currentQ.question}
          </h2>
        </div>

        {/* Multiple Choice Grid */}
        <div className="grid grid-cols-1 gap-3 pt-1">
          {currentQ.options?.map((opt, idx) => {
            const isSelected = selectedOption === idx
            const isCorrect = idx === currentQ.answer_index

            let stateStyle = 'border-black/[0.06] dark:border-white/[0.08] bg-white dark:bg-[#141417] text-neutral-800 dark:text-neutral-200 hover:bg-neutral-50/80 dark:hover:bg-neutral-900/60'
            let pillStyle = 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'

            if (isAnswered) {
              if (isCorrect) {
                stateStyle = 'border-emerald-500/80 bg-emerald-50/70 dark:bg-emerald-950/30 text-emerald-950 dark:text-emerald-100'
                pillStyle = 'bg-emerald-500 text-white shadow-xs'
              } else if (isSelected && !isCorrect) {
                stateStyle = 'border-rose-500/80 bg-rose-50/70 dark:bg-rose-950/30 text-rose-950 dark:text-rose-100'
                pillStyle = 'bg-rose-500 text-white shadow-xs'
              } else {
                stateStyle = 'border-black/[0.04] dark:border-white/[0.04] bg-neutral-50/40 dark:bg-neutral-900/20 text-neutral-400 opacity-45'
                pillStyle = 'bg-neutral-100 dark:bg-neutral-800 text-neutral-400'
              }
            }

            return (
              <button
                key={idx}
                disabled={isAnswered || isDisqualified}
                onClick={() => handleSelectOption(idx)}
                className={`w-full min-h-[58px] p-4 sm:px-5 rounded-2xl border text-left font-medium exam-option-text flex items-center justify-between gap-3.5 cursor-pointer pressable transition-all ${stateStyle}`}
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <span className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-mono font-bold shrink-0 transition-colors ${pillStyle}`}>
                    {String.fromCharCode(65 + idx)}
                  </span>
                  <span className="leading-snug text-neutral-900 dark:text-neutral-100 font-medium">{opt}</span>
                </div>

                {isAnswered && (
                  <div className="shrink-0">
                    {isCorrect && (
                      <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center text-white">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                    )}
                    {isSelected && !isCorrect && (
                      <div className="w-6 h-6 rounded-full bg-rose-500 flex items-center justify-center text-white">
                        <X className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                    )}
                  </div>
                )}
              </button>
            )
          })}
        </div>

        {/* Explanation Card upon Answered */}
        {isAnswered && (
          <div className="p-5 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/20 border border-indigo-200/60 dark:border-indigo-800/40 space-y-1.5 animate-in fade-in duration-200">
            <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-900 dark:text-indigo-300">
              <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
              <span>Penjelasan Jawaban & Logika:</span>
            </div>
            <p className="exam-explanation text-indigo-950/90 dark:text-indigo-200/90 leading-relaxed">
              {currentQ.explanation || 'Jawaban di atas sesuai dengan prinsip sains dan fakta wawasan umum resmi.'}
            </p>
          </div>
        )}

        {/* Next Question Navigation */}
        {isAnswered && (
          <div className="pt-2 animate-in fade-in duration-200 flex justify-end">
            <button
              onClick={handleNextQuestion}
              className="w-full sm:w-auto min-w-[200px] h-12 px-6 rounded-2xl bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 hover:bg-neutral-800 dark:hover:bg-neutral-100 font-semibold text-xs sm:text-sm inline-flex items-center justify-center gap-2 cursor-pointer pressable transition-colors shadow-xs"
            >
              <span>{currentIndex < questions.length - 1 ? 'Soal Berikutnya' : 'Selesaikan Kuis & Klaim Poin'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </section>
    </div>
  )
}
