import { useState, useEffect } from 'react'
import { CheckCircle2, XCircle, ArrowRight, RotateCcw, Award, Clock, Sparkles } from 'lucide-react'
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
  const [secondsLeft, setSecondsLeft] = useState(25)
  const [isCompleted, setIsCompleted] = useState(false)

  const currentQ = questions[currentIndex]
  const progressPercent = Math.round(((currentIndex + 1) / questions.length) * 100)

  // Countdown timer per question
  useEffect(() => {
    if (isAnswered || isCompleted) return

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
  }, [currentIndex, isAnswered, isCompleted])

  const handleTimeOut = () => {
    setIsAnswered(true)
  }

  const handleSelectOption = (idx: number) => {
    if (isAnswered) return
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
      setSecondsLeft(25)
    } else {
      setIsCompleted(true)
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.6 },
      })
      const finalScore = score + (selectedOption === currentQ.answer_index ? 0 : 0)
      const finalCorrect = correctCount
      onFinish(finalScore, questions.length * 10, finalCorrect)
    }
  }

  const handleRestart = () => {
    setCurrentIndex(0)
    setSelectedOption(null)
    setIsAnswered(false)
    setScore(0)
    setCorrectCount(0)
    setSecondsLeft(25)
    setIsCompleted(false)
  }

  if (isCompleted) {
    const accuracy = Math.round((correctCount / questions.length) * 100)
    return (
      <div className="w-full max-w-xl mx-auto py-6 animate-in fade-in zoom-in-95 duration-200">
        <div className="bg-white dark:bg-[#12131a] rounded-3xl border border-black/[0.06] dark:border-white/[0.08] p-6 sm:p-8 text-center space-y-6">
          <div className="w-20 h-20 mx-auto rounded-3xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-500">
            <Award className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">Kuis Sesi Selesai! 🎉</h2>
            <p className="text-xs text-neutral-500 font-medium">
              Poin kamu telah ditambahkan ke akumulasi profil & leaderboard!
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-900/60 border border-black/[0.04] dark:border-white/[0.04]">
              <p className="text-xs text-neutral-500 font-medium">Poin Diperoleh</p>
              <p className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400 mt-1">+{score}</p>
            </div>
            <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-900/60 border border-black/[0.04] dark:border-white/[0.04]">
              <p className="text-xs text-neutral-500 font-medium">Benar</p>
              <p className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">
                {correctCount}/{questions.length}
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-900/60 border border-black/[0.04] dark:border-white/[0.04]">
              <p className="text-xs text-neutral-500 font-medium">Akurasi</p>
              <p className="text-2xl font-extrabold text-amber-600 dark:text-amber-400 mt-1">{accuracy}%</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row items-center gap-3 pt-4">
            <button
              onClick={handleRestart}
              className="w-full sm:flex-1 h-12 rounded-2xl bg-black/[0.05] dark:bg-white/[0.06] hover:bg-black/[0.08] dark:hover:bg-white/[0.1] border border-black/[0.08] dark:border-white/[0.1] text-neutral-900 dark:text-white font-semibold text-sm flex items-center justify-center gap-2 cursor-pointer pressable"
            >
              <RotateCcw className="w-4 h-4" />
              Latihan Ulang
            </button>
            <button
              onClick={onExit}
              className="w-full sm:flex-1 h-12 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm flex items-center justify-center gap-2 cursor-pointer pressable"
            >
              Kembali ke Beranda
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Quiz Progress & Timer Header */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs font-semibold text-neutral-500">
          <span>
            Soal <b className="text-neutral-900 dark:text-white">{currentIndex + 1}</b> dari {questions.length} •{' '}
            <span className="text-indigo-600 dark:text-indigo-400">{categoryTitle}</span>
          </span>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-neutral-100 dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 font-mono">
            <Clock className="w-3.5 h-3.5" />
            <span>00:{secondsLeft < 10 ? `0${secondsLeft}` : secondsLeft}</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-2 rounded-full bg-neutral-200 dark:bg-neutral-800 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-300 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Question Card */}
      <div className="bg-white dark:bg-[#12131a] rounded-3xl border border-black/[0.06] dark:border-white/[0.08] p-6 sm:p-8 space-y-6">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/60">
              {currentQ.level ? `Tingkat ${currentQ.level}` : 'Umum'}
            </span>
            <span className="text-xs font-semibold text-neutral-400">+{currentQ.points || 10} Poin</span>
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-neutral-900 dark:text-white leading-snug">
            {currentQ.question}
          </h3>
        </div>

        {/* Multiple Choice Options */}
        <div className="space-y-3">
          {currentQ.options?.map((opt, idx) => {
            const isSelected = selectedOption === idx
            const isCorrect = idx === currentQ.answer_index

            let btnStyle = 'border-black/[0.08] dark:border-white/[0.08] bg-neutral-50/60 dark:bg-neutral-900/40 text-neutral-800 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-900'

            if (isAnswered) {
              if (isCorrect) {
                btnStyle = 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200'
              } else if (isSelected && !isCorrect) {
                btnStyle = 'border-rose-500 bg-rose-50 dark:bg-rose-950/40 text-rose-900 dark:text-rose-200'
              } else {
                btnStyle = 'border-black/[0.04] dark:border-white/[0.04] opacity-50'
              }
            }

            return (
              <button
                key={idx}
                disabled={isAnswered}
                onClick={() => handleSelectOption(idx)}
                className={`w-full min-h-[52px] p-4 rounded-2xl border text-left font-medium text-sm flex items-center justify-between gap-3 cursor-pointer pressable transition-all ${btnStyle}`}
              >
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-lg bg-black/[0.05] dark:bg-white/[0.08] flex items-center justify-center text-xs font-mono font-bold">
                    {String.fromCharCode(65 + idx)}
                  </span>
                  <span>{opt}</span>
                </div>

                {isAnswered && (
                  <div>
                    {isCorrect && <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />}
                    {isSelected && !isCorrect && <XCircle className="w-5 h-5 text-rose-500 shrink-0" />}
                  </div>
                )}
              </button>
            )
          })}
        </div>

        {/* Explanation Card upon Answered */}
        {isAnswered && currentQ.explanation && (
          <div className="p-4 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-200/60 dark:border-indigo-800/40 space-y-1 animate-in fade-in duration-200">
            <p className="text-xs font-bold text-indigo-900 dark:text-indigo-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
              Penjelasan Jawaban:
            </p>
            <p className="text-xs text-indigo-950/80 dark:text-indigo-200/80 leading-relaxed">
              {currentQ.explanation}
            </p>
          </div>
        )}

        {/* Next Question Button */}
        {isAnswered && (
          <div className="pt-2 animate-in fade-in duration-200">
            <button
              onClick={handleNextQuestion}
              className="w-full h-12 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm flex items-center justify-center gap-2 cursor-pointer pressable"
            >
              {currentIndex < questions.length - 1 ? 'Soal Berikutnya' : 'Selesaikan Kuis & Simpan Poin'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
