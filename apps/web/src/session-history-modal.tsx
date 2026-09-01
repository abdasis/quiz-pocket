import { useState, useEffect } from 'react'
import { X, History, Users, Calendar, ChevronRight } from 'lucide-react'

interface SessionHistoryItem {
  session: {
    id: number
    slot_id: number
    slot_start: string
    slot_end: string
    category_title: string
    question_count: number
  }
  participants: number
  submissions?: Array<{
    id: number
    user_email: string
    user_name: string
    avatar_url?: string
    score: number
    total: number
    correct_count: number
    time_spent_sec?: number
    created_at: string
  }>
}

interface SessionHistoryModalProps {
  isOpen: boolean
  onClose: () => void
}

export function SessionHistoryModal({ isOpen, onClose }: SessionHistoryModalProps) {
  const [history, setHistory] = useState<SessionHistoryItem[]>([])
  const [selectedSession, setSelectedSession] = useState<SessionHistoryItem | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isOpen) return
    const fetchHistory = async () => {
      setLoading(true)
      try {
        const res = await fetch('/api/v1/sessions/history')
        const json = await res.json()
        if (json.success && json.data) {
          setHistory(json.data)
        }
      } catch (err) {
        console.error('Failed to fetch session history:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchHistory()
  }, [isOpen])

  if (!isOpen) return null

  const formatSlotTime = (isoString: string) => {
    try {
      const date = new Date(isoString)
      return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
    } catch {
      return isoString
    }
  }

  const formatSlotDate = (isoString: string) => {
    try {
      const date = new Date(isoString)
      return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
    } catch {
      return isoString
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white dark:bg-[#111114] rounded-3xl border border-black/[0.08] dark:border-white/[0.1] shadow-2xl p-6 sm:p-8 space-y-6 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200/60 dark:border-indigo-800/40 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-neutral-950 dark:text-white">Arsip Sesi & Partisipan</h3>
              <p className="text-xs text-neutral-500 font-medium">Rekaman snapshot soal dan hasil nilai peserta per 30 menit</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-black/[0.04] dark:bg-white/[0.06] hover:bg-black/[0.08] dark:hover:bg-white/[0.1] flex items-center justify-center text-neutral-500 cursor-pointer pressable"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Selected Session Drilldown */}
        {selectedSession ? (
          <div className="space-y-4 animate-in fade-in duration-150">
            <button
              onClick={() => setSelectedSession(null)}
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 flex items-center gap-1 cursor-pointer pressable"
            >
              ← Kembali ke Daftar Sesi
            </button>

            <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-900/60 border border-black/[0.04] dark:border-white/[0.04]">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-neutral-900 dark:text-white">
                    Sesi #{selectedSession.session.slot_id} ({formatSlotDate(selectedSession.session.slot_start)})
                  </h4>
                  <p className="text-xs text-neutral-500 font-mono mt-0.5">
                    Pukul {formatSlotTime(selectedSession.session.slot_start)} - {formatSlotTime(selectedSession.session.slot_end)} WIB • {selectedSession.session.question_count} Butir Soal
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 text-xs font-bold font-mono border border-indigo-200/60 dark:border-indigo-800/40">
                  {selectedSession.participants || (selectedSession.submissions?.length || 0)} Partisipan
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <h5 className="text-xs font-bold font-mono text-neutral-400 uppercase tracking-wider">
                Daftar Nilai Peserta Sesi Ini
              </h5>

              {(!selectedSession.submissions || selectedSession.submissions.length === 0) ? (
                <div className="p-8 text-center text-xs text-neutral-400">
                  Tidak ada peserta yang menyelesaikan kuis pada sesi ini.
                </div>
              ) : (
                <div className="divide-y divide-black/[0.04] dark:divide-white/[0.04] rounded-2xl bg-white dark:bg-[#151518] border border-black/[0.06] dark:border-white/[0.08] overflow-hidden">
                  {selectedSession.submissions.map((p, idx) => (
                    <div key={p.id || idx} className="p-3.5 sm:px-4 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-3">
                        <span className="w-5 font-mono font-bold text-neutral-400">{idx + 1}</span>
                        <div className="w-7 h-7 rounded-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
                          {p.avatar_url ? (
                            <img src={p.avatar_url} alt={p.user_name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center font-bold text-[10px] text-neutral-500">
                              {p.user_name ? p.user_name[0].toUpperCase() : 'U'}
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-neutral-900 dark:text-white">{p.user_name || p.user_email}</p>
                          <p className="text-[10px] text-neutral-400 font-mono">
                            {p.correct_count} Benar {p.time_spent_sec ? `• ${Math.floor(p.time_spent_sec / 60)}m ${p.time_spent_sec % 60}s` : ''}
                          </p>
                        </div>
                      </div>

                      <div className="text-right font-mono font-bold text-indigo-600 dark:text-indigo-400">
                        +{p.score} pts
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Session List */
          <div className="space-y-3">
            {loading ? (
              <div className="p-8 text-center text-xs text-neutral-400">Memuat arsip sesi kuis...</div>
            ) : history.length === 0 ? (
              <div className="p-8 text-center text-xs text-neutral-400">Belum ada rekaman sesi lampau.</div>
            ) : (
              history.map((item) => (
                <div
                  key={item.session.id}
                  onClick={() => setSelectedSession(item)}
                  className="p-4 rounded-2xl bg-white dark:bg-[#151518] border border-black/[0.06] dark:border-white/[0.08] hover:border-indigo-500/50 flex items-center justify-between gap-3 cursor-pointer pressable transition-all"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-500 shrink-0">
                      <Calendar className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-neutral-900 dark:text-white">
                          Sesi #{item.session.slot_id}
                        </span>
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400">
                          {item.session.question_count} Soal
                        </span>
                      </div>
                      <p className="text-[11px] text-neutral-500 font-mono mt-0.5">
                        {formatSlotDate(item.session.slot_start)} • {formatSlotTime(item.session.slot_start)} - {formatSlotTime(item.session.slot_end)} WIB
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs font-mono font-semibold text-neutral-600 dark:text-neutral-400 flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-indigo-500" />
                      {item.participants || (item.submissions?.length || 0)} Peserta
                    </span>
                    <ChevronRight className="w-4 h-4 text-neutral-400" />
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  )
}
