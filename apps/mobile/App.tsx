import React, { useState, useEffect } from 'react'
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
  Dimensions,
  Platform,
} from 'react-native'

const API_BASE = 'https://quiz.abdasis.my.id/api/v1'

interface Question {
  id: number
  question: string
  options: string[]
  answer_index: number
  explanation: string
  level?: string
  points: number
}

interface LiveSlotData {
  slot_id: number
  seconds_remaining: number
  questions: Question[]
  participants: number
}

interface LeaderboardItem {
  id: number
  name: string
  points: number
  weekly_points: number
  streak: number
  quizzes_completed: number
}

export default function App() {
  const [activeTab, setActiveTab] = useState<'home' | 'quiz' | 'leaderboard'>('home')
  const [liveSlot, setLiveSlot] = useState<LiveSlotData | null>(null)
  const [leaderboard, setLeaderboard] = useState<LeaderboardItem[]>([])
  const [loading, setLoading] = useState(true)
  const [secondsLeft, setSecondsLeft] = useState(0)

  // Quiz State
  const [currentIdx, setCurrentIdx] = useState(0)
  const [selectedOpt, setSelectedOpt] = useState<number | null>(null)
  const [isAnswered, setIsAnswered] = useState(false)
  const [score, setScore] = useState(0)
  const [correctCount, setCorrectCount] = useState(0)
  const [questionTimer, setQuestionTimer] = useState(30)
  const [isFinished, setIsFinished] = useState(false)

  // Fetch Live Slot & Leaderboard
  const loadData = async () => {
    try {
      setLoading(true)
      const [slotRes, leadRes] = await Promise.all([
        fetch(`${API_BASE}/live-slot`),
        fetch(`${API_BASE}/leaderboard?mode=weekly`),
      ])
      const slotData = await slotRes.json()
      const leadData = await leadRes.json()

      if (slotData.success) {
        setLiveSlot(slotData)
        setSecondsLeft(slotData.seconds_remaining)
      }
      if (leadData.success) {
        setLeaderboard(leadData.data || [])
      }
    } catch (e) {
      console.error('Error fetching mobile data:', e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
    const interval = setInterval(loadData, 20000)
    return () => clearInterval(interval)
  }, [])

  // Slot countdown timer
  useEffect(() => {
    if (secondsLeft <= 0) return
    const t = setInterval(() => {
      setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0))
    }, 1000)
    return () => clearInterval(t)
  }, [secondsLeft])

  // Question 30s countdown timer during quiz
  useEffect(() => {
    if (activeTab !== 'quiz' || isAnswered || isFinished) return
    const timer = setInterval(() => {
      setQuestionTimer((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          setIsAnswered(true)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [activeTab, isAnswered, isFinished, currentIdx])

  const startQuiz = () => {
    setCurrentIdx(0)
    setSelectedOpt(null)
    setIsAnswered(false)
    setScore(0)
    setCorrectCount(0)
    setQuestionTimer(30)
    setIsFinished(false)
    setActiveTab('quiz')
  }

  const handleSelectOption = (idx: number) => {
    if (isAnswered) return
    setSelectedOpt(idx)
    setIsAnswered(true)

    const questions = liveSlot?.questions || []
    const currentQ = questions[currentIdx]
    if (currentQ && idx === currentQ.answer_index) {
      setScore((s) => s + (currentQ.points || 10))
      setCorrectCount((c) => c + 1)
    }
  }

  const handleNext = () => {
    const questions = liveSlot?.questions || []
    if (currentIdx < questions.length - 1) {
      setCurrentIdx((i) => i + 1)
      setSelectedOpt(null)
      setIsAnswered(false)
      setQuestionTimer(30)
    } else {
      setIsFinished(true)
    }
  }

  const formatMinSec = (s: number) => {
    const m = Math.floor(s / 60)
    const sec = s % 60
    return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`
  }

  const currentQuestions = liveSlot?.questions || []
  const currentQ = currentQuestions[currentIdx]

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0a0a0c" />

      {/* Mobile App Header */}
      <View style={styles.header}>
        <View style={styles.headerTitleRow}>
          <Text style={styles.headerTitle}>Quiz Pocket</Text>
          <View style={styles.syncBadge}>
            <View style={styles.syncDot} />
            <Text style={styles.syncText}>Live 30m</Text>
          </View>
        </View>

        {activeTab !== 'quiz' && (
          <View style={styles.tabBar}>
            <TouchableOpacity
              onPress={() => setActiveTab('home')}
              style={[styles.tabButton, activeTab === 'home' && styles.tabButtonActive]}
            >
              <Text style={[styles.tabText, activeTab === 'home' && styles.tabTextActive]}>Beranda</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setActiveTab('leaderboard')}
              style={[styles.tabButton, activeTab === 'leaderboard' && styles.tabButtonActive]}
            >
              <Text style={[styles.tabText, activeTab === 'leaderboard' && styles.tabTextActive]}>Peringkat</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#6366f1" />
          <Text style={styles.loadingText}>Menghubungkan ke Server...</Text>
        </View>
      ) : activeTab === 'home' ? (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Main Hero Card */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardBadge}>KUIS WAWASAN TERPADU</Text>
              <Text style={styles.cardSlotText}>Slot #{liveSlot?.slot_id || '---'}</Text>
            </View>

            <Text style={styles.cardTitle}>Uji Nalar & Wawasan Kehidupan Nyata</Text>
            <Text style={styles.cardDesc}>
              Soal seimbang dasar, menengah, dan lanjutan lintas sains, logika kuantitatif, dan finansial.
            </Text>

            {/* Metrics */}
            <View style={styles.statsGrid}>
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>SISA WAKTU</Text>
                <Text style={styles.statValueTimer}>{formatMinSec(secondsLeft)}</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>TOTAL SOAL</Text>
                <Text style={styles.statValue}>{currentQuestions.length} Butir</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>PARTISIPAN</Text>
                <Text style={styles.statValue}>{liveSlot?.participants || 0} Pemain</Text>
              </View>
            </View>

            <TouchableOpacity activeOpacity={0.85} style={styles.primaryButton} onPress={startQuiz}>
              <Text style={styles.primaryButtonText}>Mulai Ujian Sesi</Text>
            </TouchableOpacity>
          </View>

          {/* Tier Cards */}
          <View style={styles.tierContainer}>
            <View style={styles.tierCard}>
              <Text style={styles.tierBadge}>+10 Pts</Text>
              <Text style={styles.tierTitle}>Wawasan Dasar</Text>
              <Text style={styles.tierDesc}>Sains alamiah, indra tubuh, dan logika hitung.</Text>
            </View>
            <View style={styles.tierCard}>
              <Text style={styles.tierBadge}>+20 Pts</Text>
              <Text style={styles.tierTitle}>Wawasan Menengah</Text>
              <Text style={styles.tierDesc}>Geografi nusantara, sejarah, dan fenomena alam.</Text>
            </View>
            <View style={styles.tierCard}>
              <Text style={styles.tierBadge}>+30 Pts</Text>
              <Text style={styles.tierTitle}>Wawasan Lanjutan</Text>
              <Text style={styles.tierDesc}>Logika kritis, finansial/ekonomi, dan sains terapan.</Text>
            </View>
          </View>
        </ScrollView>
      ) : activeTab === 'leaderboard' ? (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Text style={styles.sectionTitle}>Papan Peringkat Minggu Ini</Text>
          <View style={styles.leaderboardCard}>
            {leaderboard.map((item, idx) => (
              <View key={item.id || idx} style={styles.leadRow}>
                <Text style={[styles.leadRank, idx === 0 && { color: '#f59e0b' }]}>
                  {idx < 9 ? `0${idx + 1}` : idx + 1}
                </Text>
                <View style={styles.leadInfo}>
                  <Text style={styles.leadName}>{item.name || 'Pemain Anonim'}</Text>
                  <Text style={styles.leadSub}>{item.quizzes_completed || 0} Sesi Kuis</Text>
                </View>
                <Text style={styles.leadPoints}>{item.weekly_points || item.points || 0} Pts</Text>
              </View>
            ))}
          </View>
        </ScrollView>
      ) : (
        /* Quiz Screen */
        <View style={styles.quizWrapper}>
          {isFinished ? (
            <View style={styles.resultCard}>
              <Text style={styles.resultTitle}>Sesi Kuis Selesai!</Text>
              <Text style={styles.resultScore}>+{score} Pts</Text>
              <Text style={styles.resultDesc}>
                Anda berhasil menjawab {correctCount} dari {currentQuestions.length} butir soal dengan benar.
              </Text>
              <TouchableOpacity activeOpacity={0.85} style={styles.primaryButton} onPress={() => setActiveTab('home')}>
                <Text style={styles.primaryButtonText}>Kembali ke Beranda</Text>
              </TouchableOpacity>
            </View>
          ) : currentQ ? (
            <ScrollView contentContainerStyle={styles.quizContent}>
              {/* Question Header & 30s Countdown */}
              <View style={styles.quizHeaderRow}>
                <Text style={styles.quizIndexText}>
                  Soal {currentIdx + 1} / {currentQuestions.length}
                </Text>
                <View style={[styles.quizTimerBadge, questionTimer <= 5 && styles.quizTimerBadgeRed]}>
                  <Text style={[styles.quizTimerText, questionTimer <= 5 && styles.quizTimerTextRed]}>
                    00:{questionTimer.toString().padStart(2, '0')}
                  </Text>
                </View>
              </View>

              <Text style={styles.questionText}>{currentQ.question}</Text>

              {/* Options */}
              <View style={styles.optionsList}>
                {(currentQ.options || []).map((opt, idx) => {
                  const isSelected = selectedOpt === idx
                  const isCorrect = idx === currentQ.answer_index

                  let btnStyle = styles.optionButton
                  let textStyle = styles.optionText

                  if (isAnswered) {
                    if (isCorrect) {
                      btnStyle = styles.optionCorrect
                      textStyle = styles.optionTextCorrect
                    } else if (isSelected) {
                      btnStyle = styles.optionWrong
                      textStyle = styles.optionTextWrong
                    }
                  }

                  return (
                    <TouchableOpacity
                      key={idx}
                      disabled={isAnswered}
                      onPress={() => handleSelectOption(idx)}
                      style={btnStyle}
                      activeOpacity={0.7}
                    >
                      <View style={styles.optionCharBox}>
                        <Text style={styles.optionChar}>{String.fromCharCode(65 + idx)}</Text>
                      </View>
                      <Text style={textStyle}>{opt}</Text>
                    </TouchableOpacity>
                  )
                })}
              </View>

              {/* Explanation Card */}
              {isAnswered && (
                <View style={styles.explanationCard}>
                  <Text style={styles.explanationTitle}>Penjelasan Jawaban:</Text>
                  <Text style={styles.explanationText}>
                    {currentQ.explanation || 'Jawaban di atas sesuai dengan fakta dan prinsip sains resmi.'}
                  </Text>
                  <TouchableOpacity activeOpacity={0.85} style={styles.nextButton} onPress={handleNext}>
                    <Text style={styles.nextButtonText}>
                      {currentIdx < currentQuestions.length - 1 ? 'Soal Berikutnya' : 'Lihat Hasil Akhir'}
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </ScrollView>
          ) : (
            <View style={styles.centerContainer}>
              <Text style={styles.loadingText}>Menyiapkan paket soal...</Text>
            </View>
          )}
        </View>
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0c',
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? 36 : 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: -0.5,
  },
  syncBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16,185,129,0.12)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  syncDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10b981',
    marginRight: 6,
  },
  syncText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#34d399',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 10,
    padding: 3,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 6,
    alignItems: 'center',
    borderRadius: 8,
  },
  tabButtonActive: {
    backgroundColor: '#1c1c22',
  },
  tabText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8e8e93',
  },
  tabTextActive: {
    color: '#ffffff',
    fontWeight: '700',
  },
  scrollContent: {
    padding: 16,
    gap: 16,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 13,
    color: '#8e8e93',
  },
  card: {
    backgroundColor: '#111114',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    padding: 18,
    gap: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardBadge: {
    fontSize: 10,
    fontWeight: '700',
    color: '#818cf8',
    backgroundColor: 'rgba(99,102,241,0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  cardSlotText: {
    fontSize: 11,
    color: '#8e8e93',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
    lineHeight: 24,
  },
  cardDesc: {
    fontSize: 12,
    color: '#9ca3af',
    lineHeight: 18,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 8,
    marginVertical: 4,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#18181c',
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.04)',
  },
  statLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: '#6b7280',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  statValueTimer: {
    fontSize: 15,
    fontWeight: '800',
    color: '#818cf8',
    marginTop: 4,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  statValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
    marginTop: 4,
  },
  primaryButton: {
    backgroundColor: '#ffffff',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 4,
  },
  primaryButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0a0a0c',
  },
  tierContainer: {
    gap: 10,
  },
  tierCard: {
    backgroundColor: '#111114',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    padding: 14,
    gap: 4,
  },
  tierBadge: {
    alignSelf: 'flex-start',
    fontSize: 10,
    fontWeight: '700',
    color: '#34d399',
    backgroundColor: 'rgba(16,185,129,0.12)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 5,
  },
  tierTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
    marginTop: 2,
  },
  tierDesc: {
    fontSize: 11,
    color: '#9ca3af',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#ffffff',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  leaderboardCard: {
    backgroundColor: '#111114',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    overflow: 'hidden',
  },
  leadRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.04)',
    gap: 12,
  },
  leadRank: {
    fontSize: 13,
    fontWeight: '800',
    color: '#8e8e93',
    width: 24,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  leadInfo: {
    flex: 1,
  },
  leadName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#ffffff',
  },
  leadSub: {
    fontSize: 10,
    color: '#6b7280',
    marginTop: 2,
  },
  leadPoints: {
    fontSize: 13,
    fontWeight: '800',
    color: '#818cf8',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  quizWrapper: {
    flex: 1,
  },
  quizContent: {
    padding: 16,
    gap: 16,
  },
  quizHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  quizIndexText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#818cf8',
    textTransform: 'uppercase',
  },
  quizTimerBadge: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  quizTimerBadgeRed: {
    backgroundColor: 'rgba(239,68,68,0.2)',
  },
  quizTimerText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#ffffff',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  quizTimerTextRed: {
    color: '#ef4444',
  },
  questionText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
    lineHeight: 24,
  },
  optionsList: {
    gap: 10,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#141417',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    padding: 14,
    borderRadius: 16,
    gap: 12,
  },
  optionCorrect: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16,185,129,0.15)',
    borderWidth: 1,
    borderColor: '#10b981',
    padding: 14,
    borderRadius: 16,
    gap: 12,
  },
  optionWrong: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239,68,68,0.15)',
    borderWidth: 1,
    borderColor: '#ef4444',
    padding: 14,
    borderRadius: 16,
    gap: 12,
  },
  optionCharBox: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: '#202025',
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionChar: {
    fontSize: 12,
    fontWeight: '700',
    color: '#ffffff',
  },
  optionText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600' as const,
    color: '#e5e7eb',
    lineHeight: 18,
  },
  optionTextCorrect: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600' as const,
    color: '#34d399',
    lineHeight: 18,
  },
  optionTextWrong: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600' as const,
    color: '#f87171',
    lineHeight: 18,
  },
  explanationCard: {
    backgroundColor: 'rgba(99,102,241,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(99,102,241,0.3)',
    borderRadius: 16,
    padding: 16,
    gap: 8,
  },
  explanationTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#818cf8',
  },
  explanationText: {
    fontSize: 12,
    color: '#c7d2fe',
    lineHeight: 18,
  },
  nextButton: {
    backgroundColor: '#ffffff',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 6,
  },
  nextButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0a0a0c',
  },
  resultCard: {
    flex: 1,
    margin: 20,
    backgroundColor: '#111114',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  resultTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#ffffff',
  },
  resultScore: {
    fontSize: 36,
    fontWeight: '900',
    color: '#34d399',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  resultDesc: {
    fontSize: 13,
    color: '#9ca3af',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 8,
  },
})
