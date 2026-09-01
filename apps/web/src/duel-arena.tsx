import { useState, useEffect, useRef } from 'react'
import {
  Swords,
  Clock,
  AlertTriangle
} from 'lucide-react'
import confetti from 'canvas-confetti'

interface Question {
  id: number
  question: string
  options: string[]
  option_explanations?: string[]
  answer_index: number
  explanation: string
  level?: string
  points: number
}

interface DuelMatchData {
  id: number
  match_code: string
  player1_email: string
  player1_name: string
  player1_avatar: string
  player1_score: number
  player1_correct: number
  player1_done: boolean
  player2_email: string
  player2_name: string
  player2_avatar: string
  player2_score: number
  player2_correct: number
  player2_done: boolean
  status: 'waiting' | 'matched' | 'finished'
  winner_email?: string
  questions?: Question[]
}

interface DuelArenaProps {
  userEmail: string
  userName: string
  userAvatar: string
  onExit: () => void
  onUserUpdate?: (user: any) => void
}

export function DuelArena({
  userEmail,
  userName,
  userAvatar,
  onExit,
}: DuelArenaProps) {
  const [phase, setPhase] = useState<'matchmaking' | 'playing' | 'waiting_opponent' | 'finished'>('matchmaking')
  const [matchData, setMatchData] = useState<DuelMatchData | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  
  // Game states
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedOption, setSelectedOption] = useState<number | null>(null)
  const [isAnswered, setIsAnswered] = useState(false)
  const [score, setScore] = useState(0)
  const [correctCount, setCorrectCount] = useState(0)
  const [secondsLeft, setSecondsLeft] = useState(25)
  const [questionDeadline, setQuestionDeadline] = useState<number>(Date.now() + 25000)
  
  // Anti-cheat penalty
  const [, setTabSwitches] = useState(0)
  const [warningMsg, setWarningMsg] = useState<string | null>(null)

  const pollingRef = useRef<any>(null)
  const matchCodeRef = useRef<string | null>(null)

  // 1. Initial Matchmaking Request
  useEffect(() => {
    let isMounted = true
    async function startMatchmaking() {
      try {
        const res = await fetch('/api/v1/duel/matchmake', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: userEmail,
            name: userName,
            avatar_url: userAvatar,
          })
        })
        const data = await res.json()
        if (!isMounted) return

        if (data.success && data.match) {
          setMatchData(data.match)
          matchCodeRef.current = data.match.match_code
          if (data.match.questions && data.match.questions.length > 0) {
            setQuestions(data.match.questions)
          }

          if (data.matched || data.match.status === 'matched') {
            setPhase('playing')
            setQuestionDeadline(Date.now() + 25000)
          } else {
            // Start polling waiting status
            startPolling(data.match.match_code)
          }
        }
      } catch (err) {
        console.error('Matchmaking error:', err)
      }
    }

    startMatchmaking()

    return () => {
      isMounted = false
      if (pollingRef.current) clearInterval(pollingRef.current)
    }
  }, [userEmail, userName, userAvatar])

  // Polling waiting room
  const startPolling = (code: string) => {
    if (pollingRef.current) clearInterval(pollingRef.current)
    pollingRef.current = setInterval(async () => {
      try {
        const res = await fetch(`/api/v1/duel/status/${code}`)
        const data = await res.json()
        if (data.success && data.match) {
          setMatchData(data.match)
          if (data.match.questions && data.match.questions.length > 0) {
            setQuestions(data.match.questions)
          }
          if (data.match.status === 'matched' || data.match.status === 'finished') {
            clearInterval(pollingRef.current)
            setPhase('playing')
            setQuestionDeadline(Date.now() + 25000)
          }
        }
      } catch (e) {
        console.log('Polling err:', e)
      }
    }, 2000)
  }

  // Timer per soal (25s)
  useEffect(() => {
    if (phase !== 'playing' || isAnswered) return
    const timer = setInterval(() => {
      const remaining = Math.max(0, Math.ceil((questionDeadline - Date.now()) / 1000))
      setSecondsLeft(remaining)
      if (remaining <= 0) {
        handleSelectOption(-1)
      }
    }, 250)
    return () => clearInterval(timer)
  }, [phase, questionDeadline, isAnswered])

  // Anti cheat tab switch
  useEffect(() => {
    if (phase !== 'playing') return
    const handleVis = () => {
      if (document.hidden) {
        setTabSwitches(p => {
          const next = p + 1
          setScore(s => Math.max(0, s - 15))
          setWarningMsg(`Pelanggaran: Berpindah tab terdeteksi (${next}/3). Penalti -15 poin!`)
          return next
        })
      }
    }
    document.addEventListener('visibilitychange', handleVis)
    return () => document.removeEventListener('visibilitychange', handleVis)
  }, [phase])

  const currentQ = questions[currentIndex]

  const handleSelectOption = (idx: number) => {
    if (isAnswered) return
    setSelectedOption(idx)
    setIsAnswered(true)

    if (currentQ && idx === currentQ.answer_index) {
      const pts = currentQ.points || 10
      setScore(s => s + pts)
      setCorrectCount(c => c + 1)
    }
  }

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1)
      setSelectedOption(null)
      setIsAnswered(false)
      setSecondsLeft(25)
      setQuestionDeadline(Date.now() + 25000)
    } else {
      submitDuelResult()
    }
  }

  const submitDuelResult = async () => {
    if (!matchData) return
    setPhase('waiting_opponent')
    try {
      const res = await fetch('/api/v1/duel/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          match_code: matchData.match_code,
          user_email: userEmail,
          score,
          correct_count: correctCount,
        })
      })
      const data = await res.json()
      if (data.success && data.match) {
        setMatchData(data.match)
        if (data.match.status === 'finished') {
          finalizeMatch(data.match)
        } else {
          // Poll until opponent completes
          pollUntilFinished(data.match.match_code)
        }
      }
    } catch (err) {
      console.error('Submit duel error:', err)
    }
  }

  const pollUntilFinished = (code: string) => {
    const t = setInterval(async () => {
      try {
        const res = await fetch(`/api/v1/duel/status/${code}`)
        const data = await res.json()
        if (data.success && data.match && data.match.status === 'finished') {
          clearInterval(t)
          setMatchData(data.match)
          finalizeMatch(data.match)
        }
      } catch (e) {
        console.error(e)
      }
    }, 2000)
  }

  const finalizeMatch = (match: DuelMatchData) => {
    setPhase('finished')
    if (match.winner_email === userEmail) {
      confetti({ particleCount: 120, spread: 90, origin: { y: 0.6 } })
    }
  }

  const isPlayer1 = matchData?.player1_email === userEmail
  const opponentName = isPlayer1 ? (matchData?.player2_name || 'Lawan') : (matchData?.player1_name || 'Lawan')
  const opponentScore = isPlayer1 ? (matchData?.player2_score || 0) : (matchData?.player1_score || 0)
  const opponentCorrect = isPlayer1 ? (matchData?.player2_correct || 0) : (matchData?.player1_correct || 0)

  return (
    <div className="w-full max-w-3xl mx-auto space-y-4 sm:space-y-6 animate-in fade-in duration-300">
      
      {/* 1. MATCHMAKING SCREEN */}
      {phase === 'matchmaking' && (
        <div className="p-8 sm:p-12 rounded-3xl bg-white dark:bg-[#111114] border border-black/[0.06] dark:border-white/[0.08] text-center space-y-6">
          <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-30"></span>
            <div className="relative w-16 h-16 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md">
              <Swords className="w-8 h-8 animate-pulse" />
            </div>
          </div>

          <div className="space-y-2 max-w-md mx-auto">
            <h2 className="text-xl sm:text-2xl font-bold text-neutral-900 dark:text-white">
              Mencari Lawan Bertanding 1 vs 1...
            </h2>
            <p className="text-xs sm:text-sm text-neutral-500 leading-relaxed">
              Sistem mencocokkan Anda dengan pemain lain secara adil untuk paket soal sesi sinkron aktif berkecepatan tinggi.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-[#18181c] border border-black/[0.04] dark:border-white/[0.04] max-w-sm mx-auto flex items-center justify-between text-xs font-mono">
            <span className="text-neutral-400">Kode Pertandingan:</span>
            <span className="font-bold text-indigo-600 dark:text-indigo-400">{matchData?.match_code || 'Menghubungkan...'}</span>
          </div>

          <div className="pt-2">
            <button
              onClick={onExit}
              className="px-6 py-2.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 text-xs font-semibold hover:bg-neutral-200 transition-colors pressable"
            >
              Batalkan Pencarian
            </button>
          </div>
        </div>
      )}

      {/* 2. PLAYING WORKSPACE */}
      {phase === 'playing' && currentQ && (
        <div className="space-y-4">
          
          {/* Duel Top Header: You VS Opponent */}
          <div className="grid grid-cols-3 items-center p-4 rounded-2xl bg-white dark:bg-[#111114] border border-black/[0.06] dark:border-white/[0.08]">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white font-bold flex items-center justify-center text-xs shrink-0">
                {userName.charAt(0).toUpperCase()}
              </div>
              <div className="truncate">
                <p className="text-xs font-bold text-neutral-900 dark:text-white truncate">{userName} (Anda)</p>
                <p className="text-[11px] font-mono font-bold text-indigo-600 dark:text-indigo-400">{score} Pts</p>
              </div>
            </div>

            <div className="text-center">
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-neutral-100 dark:bg-neutral-800 text-neutral-500 uppercase">
                Soal {currentIndex + 1}/{questions.length || 10}
              </span>
            </div>

            <div className="flex items-center justify-end gap-3 text-right">
              <div className="truncate">
                <p className="text-xs font-bold text-neutral-900 dark:text-white truncate">{opponentName}</p>
                <p className="text-[11px] font-mono text-neutral-400">Live Duel</p>
              </div>
              <div className="w-9 h-9 rounded-xl bg-rose-600 text-white font-bold flex items-center justify-center text-xs shrink-0">
                {opponentName.charAt(0).toUpperCase()}
              </div>
            </div>
          </div>

          {/* Warning banner */}
          {warningMsg && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200/50 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{warningMsg}</span>
            </div>
          )}

          {/* Question Card */}
          <div className="p-5 sm:p-7 rounded-3xl bg-white dark:bg-[#111114] border border-black/[0.06] dark:border-white/[0.08] space-y-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400">
                +{currentQ.points || 10} Pts
              </span>
              <div className={`px-2.5 py-1 rounded-xl text-xs font-mono font-bold text-white flex items-center gap-1.5 ${
                secondsLeft <= 5 ? 'bg-rose-500' : 'bg-indigo-600'
              }`}>
                <Clock className="w-3.5 h-3.5" />
                {secondsLeft}s
              </div>
            </div>

            <h3 className="text-base sm:text-lg font-bold text-neutral-900 dark:text-white leading-snug">
              {currentQ.question}
            </h3>

            {/* Options */}
            <div className="space-y-2.5">
              {(currentQ.options || []).map((opt, idx) => {
                let btnStyle = "bg-neutral-50 dark:bg-[#18181c] border-black/[0.06] dark:border-white/[0.08] text-neutral-800 dark:text-neutral-200"
                if (isAnswered) {
                  if (idx === currentQ.answer_index) {
                    btnStyle = "bg-emerald-500/10 border-emerald-500 text-emerald-600 dark:text-emerald-400 font-bold"
                  } else if (idx === selectedOption) {
                    btnStyle = "bg-rose-500/10 border-rose-500 text-rose-600 dark:text-rose-400"
                  }
                }

                return (
                  <button
                    key={idx}
                    disabled={isAnswered}
                    onClick={() => handleSelectOption(idx)}
                    className={`w-full p-3.5 sm:p-4 rounded-2xl border text-left text-xs sm:text-sm font-medium transition-all flex items-center gap-3 pressable ${btnStyle}`}
                  >
                    <span className="w-6 h-6 rounded-lg bg-black/[0.05] dark:bg-white/[0.08] flex items-center justify-center text-xs font-bold shrink-0">
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span className="flex-1">{opt}</span>
                  </button>
                )
              })}
            </div>

            {/* Unified Apple-Design Explanation & Next */}
            {isAnswered && (
              <div className="rounded-3xl border border-black/[0.08] dark:border-white/[0.08] bg-white/90 dark:bg-[#121318]/90 backdrop-blur-2xl p-5 space-y-4 shadow-xs">
                {/* Status Indicator */}
                <div className="flex items-center gap-2 pb-2.5 border-b border-black/[0.06] dark:border-white/[0.06]">
                  {selectedOption === currentQ.answer_index ? (
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                      ✓ Jawaban Tepat (+{currentQ.points || 10} Pts)
                    </span>
                  ) : (
                    <span className="text-xs font-bold text-rose-600 dark:text-rose-400">
                      ✗ Evaluasi & Analisis Jawaban
                    </span>
                  )}
                </div>

                {/* Inset Group Table */}
                <div className="rounded-2xl border border-black/[0.06] dark:border-white/[0.06] bg-neutral-50/70 dark:bg-black/30 divide-y divide-black/[0.06] dark:divide-white/[0.06] overflow-hidden text-xs">
                  {/* Wrong pick row */}
                  {selectedOption !== currentQ.answer_index && (
                    <div className="p-3.5 space-y-1 bg-rose-500/[0.03]">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[10px] font-bold text-rose-600 dark:text-rose-400 uppercase">
                          Pilihan Anda ({selectedOption !== null && selectedOption >= 0 ? String.fromCharCode(65 + selectedOption) : 'Timeout'})
                        </span>
                        <span className="font-semibold text-neutral-900 dark:text-white">
                          {selectedOption !== null && selectedOption >= 0 && currentQ.options[selectedOption]
                            ? currentQ.options[selectedOption]
                            : 'Waktu Habis'}
                        </span>
                      </div>
                      <p className="text-[11px] text-neutral-600 dark:text-neutral-400 leading-relaxed pl-2.5 border-l-2 border-rose-500/40">
                        <strong className="text-neutral-800 dark:text-neutral-200">Mengapa salah: </strong>
                        {selectedOption !== null && selectedOption >= 0 && currentQ.option_explanations && currentQ.option_explanations[selectedOption]
                          ? currentQ.option_explanations[selectedOption]
                          : selectedOption !== null && selectedOption >= 0
                            ? `Pilihan ${currentQ.options[selectedOption]} bukan jawaban tepat untuk pertanyaan ini.`
                            : 'Waktu habis.'}
                      </p>
                    </div>
                  )}

                  {/* Correct answer row */}
                  <div className="p-3.5 space-y-1 bg-emerald-500/[0.03]">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase">
                        Kunci Jawaban ({String.fromCharCode(65 + currentQ.answer_index)})
                      </span>
                      <span className="font-semibold text-neutral-900 dark:text-white">
                        {currentQ.options[currentQ.answer_index]}
                      </span>
                    </div>
                    <p className="text-[11px] text-neutral-600 dark:text-neutral-400 leading-relaxed pl-2.5 border-l-2 border-emerald-500/40">
                      <strong className="text-neutral-800 dark:text-neutral-200">Alasan tepat: </strong>
                      {currentQ.option_explanations && currentQ.option_explanations[currentQ.answer_index]
                        ? currentQ.option_explanations[currentQ.answer_index]
                        : currentQ.explanation}
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleNext}
                  className="w-full py-3 rounded-2xl bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 font-bold text-xs transition-colors flex items-center justify-center gap-2 pressable"
                >
                  {currentIndex < questions.length - 1 ? 'Soal Berikutnya ➔' : 'Selesai & Lihat Skor Duel ➔'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3. WAITING OPPONENT SCREEN */}
      {phase === 'waiting_opponent' && (
        <div className="p-8 sm:p-12 rounded-3xl bg-white dark:bg-[#111114] border border-black/[0.06] dark:border-white/[0.08] text-center space-y-6">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 mx-auto flex items-center justify-center">
            <Clock className="w-7 h-7 animate-spin" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-neutral-900 dark:text-white">
              Menunggu Lawan Menyelesaikan Soal...
            </h2>
            <p className="text-xs text-neutral-500">
              Anda telah menyelesaikan seluruh soal dengan perolehan <span className="font-bold text-indigo-600">{score} Pts</span> ({correctCount} Benar). Hasil akhir akan dihitung secara instan.
            </p>
          </div>
        </div>
      )}

      {/* 4. FINISHED RESULT SCREEN */}
      {phase === 'finished' && matchData && (
        <div className="p-6 sm:p-10 rounded-3xl bg-white dark:bg-[#111114] border border-black/[0.06] dark:border-white/[0.08] text-center space-y-6">
          
          {/* Winner Banner */}
          <div>
            {matchData.winner_email === userEmail ? (
              <div className="space-y-2">
                <div className="text-5xl">👑</div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 dark:text-white">
                  Kemenangan Mutlak!
                </h2>
                <p className="text-xs text-emerald-600 font-bold font-mono">
                  +50 Pts Bonus Kemenangan Ditambahkan ke Akun
                </p>
              </div>
            ) : matchData.winner_email === 'draw' ? (
              <div className="space-y-2">
                <div className="text-5xl">🤝</div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 dark:text-white">
                  Pertandingan Seri!
                </h2>
                <p className="text-xs text-indigo-600 font-bold font-mono">
                  +20 Pts Bonus Fair Play Ditambahkan ke Akun
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="text-5xl">🛡️</div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 dark:text-white">
                  Tetap Semangat!
                </h2>
                <p className="text-xs text-neutral-500">
                  Lawan berhasil unggul di duel kali ini. Poin soal Anda tetap tersimpan.
                </p>
              </div>
            )}
          </div>

          {/* Versus Score Card */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4 max-w-md mx-auto">
            <div className={`p-4 rounded-2xl border text-center space-y-1 ${
              matchData.winner_email === userEmail ? 'bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-500/40' : 'bg-neutral-50 dark:bg-[#18181c] border-black/[0.06]'
            }`}>
              <span className="text-[10px] font-mono font-bold text-neutral-400 uppercase">Skor Anda</span>
              <p className="text-2xl sm:text-3xl font-bold font-mono text-neutral-900 dark:text-white">{score}</p>
              <p className="text-[11px] text-neutral-500">{correctCount}/{questions.length || 10} Benar</p>
            </div>

            <div className={`p-4 rounded-2xl border text-center space-y-1 ${
              matchData.winner_email === (isPlayer1 ? matchData.player2_email : matchData.player1_email) ? 'bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-500/40' : 'bg-neutral-50 dark:bg-[#18181c] border-black/[0.06]'
            }`}>
              <span className="text-[10px] font-mono font-bold text-neutral-400 uppercase">Skor Lawan</span>
              <p className="text-2xl sm:text-3xl font-bold font-mono text-neutral-900 dark:text-white">{opponentScore}</p>
              <p className="text-[11px] text-neutral-500">{opponentCorrect}/{questions.length || 10} Benar</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center max-w-sm mx-auto">
            <button
              onClick={() => {
                setPhase('matchmaking')
                setCurrentIndex(0)
                setSelectedOption(null)
                setIsAnswered(false)
                setScore(0)
                setCorrectCount(0)
              }}
              className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition-colors flex items-center justify-center gap-2 pressable"
            >
              <Swords className="w-4 h-4" />
              Tanding Lagi 1 vs 1
            </button>

            <button
              onClick={onExit}
              className="w-full py-3 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 font-bold text-xs hover:bg-neutral-200 transition-colors pressable"
            >
              Kembali ke Beranda
            </button>
          </div>

        </div>
      )}

    </div>
  )
}
