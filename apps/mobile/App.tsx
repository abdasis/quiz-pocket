import React, { useState, useEffect } from 'react'
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  Alert,
  TextInput,
  Modal,
  useColorScheme,
} from 'react-native'
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'
import * as Updates from 'expo-updates'

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
  user_submitted?: boolean
  user_submission?: {
    score: number
    correct_count: number
    total: number
  } | null
}

interface LeaderboardItem {
  id: number
  name: string
  points: number
  weekly_points: number
  streak: number
  quizzes_completed: number
  avatar_url?: string
}

interface AuthUser {
  id: number
  email: string
  name: string
  avatar_url: string
  points: number
  weekly_points: number
  streak: number
}

function MainScreen() {
  const insets = useSafeAreaInsets()
  const systemScheme = useColorScheme()
  const [themeMode, setThemeMode] = useState<'system' | 'light' | 'dark'>('dark')
  const isDark = themeMode === 'system' ? systemScheme === 'dark' : themeMode === 'dark'

  // Navigation & View states
  const [isPlaying, setIsPlaying] = useState(false)
  const [leaderboardTab, setLeaderboardTab] = useState<'weekly' | 'all'>('weekly')
  const [liveSlot, setLiveSlot] = useState<LiveSlotData | null>(null)
  const [leaderboard, setLeaderboard] = useState<LeaderboardItem[]>([])
  const [loading, setLoading] = useState(true)
  const [secondsLeft, setSecondsLeft] = useState(0)

  // Auth state
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [authEmail, setAuthEmail] = useState('')
  const [authName, setAuthName] = useState('')
  const [authLoading, setAuthLoading] = useState(false)

  // Quiz Workspace State
  const [currentIdx, setCurrentIdx] = useState(0)
  const [selectedOpt, setSelectedOpt] = useState<number | null>(null)
  const [isAnswered, setIsAnswered] = useState(false)
  const [score, setScore] = useState(0)
  const [correctCount, setCorrectCount] = useState(0)
  const [questionTimer, setQuestionTimer] = useState(30)
  const [isFinished, setIsFinished] = useState(false)

  // OTA Auto-Update Check
  useEffect(() => {
    async function checkOTAUpdates() {
      if (__DEV__) return
      try {
        const update = await Updates.checkForUpdateAsync()
        if (update.isAvailable) {
          await Updates.fetchUpdateAsync()
          Alert.alert(
            'Pembaruan Ditemukan',
            'Versi terbaru kuis telah diunduh. Muat ulang sekarang?',
            [
              { text: 'Nanti', style: 'cancel' },
              { text: 'Muat Ulang', onPress: () => Updates.reloadAsync() },
            ]
          )
        }
      } catch (e) {
        console.log('OTA Check error:', e)
      }
    }
    checkOTAUpdates()
  }, [])

  // Fetch Live Slot & Leaderboard
  const loadData = async () => {
    try {
      const emailParam = user ? `?email=${encodeURIComponent(user.email)}` : ''
      const [slotRes, leadRes] = await Promise.all([
        fetch(`${API_BASE}/live-slot${emailParam}`),
        fetch(`${API_BASE}/leaderboard?period=${leaderboardTab}`),
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
    const interval = setInterval(loadData, 15000)
    return () => clearInterval(interval)
  }, [user?.email, leaderboardTab])

  // Slot countdown timer
  useEffect(() => {
    if (secondsLeft <= 0) return
    const t = setInterval(() => {
      setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0))
    }, 1000)
    return () => clearInterval(t)
  }, [secondsLeft])

  // Question countdown timer in quiz mode
  useEffect(() => {
    if (!isPlaying || isAnswered || isFinished) return
    if (questionTimer <= 0) {
      handleSelectOption(-1)
      return
    }
    const t = setInterval(() => {
      setQuestionTimer((prev) => prev - 1)
    }, 1000)
    return () => clearInterval(t)
  }, [isPlaying, questionTimer, isAnswered, isFinished])

  const formatCountdown = (secs: number) => {
    const m = Math.floor(secs / 60)
    const s = secs % 60
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  // Handle Login
  const handleLoginSubmit = async () => {
    if (!authEmail.trim()) {
      Alert.alert('Perhatian', 'Silakan masukkan alamat email Gmail Anda.')
      return
    }
    setAuthLoading(true)
    try {
      const res = await fetch(`${API_BASE}/auth/google-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: authEmail.trim().toLowerCase(),
          name: authName.trim() || authEmail.split('@')[0],
          avatar_url: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(authEmail.trim())}`,
          google_id: `mob_${Date.now()}`,
        }),
      })
      const data = await res.json()
      if (data.success && (data.user || data.data)) {
        const loggedUser = data.user || data.data
        setUser(loggedUser)
        setIsAuthModalOpen(false)
        setAuthEmail('')
        setAuthName('')
        Alert.alert('Berhasil Masuk', `Selamat datang, ${loggedUser.name}!`)
        loadData()
      } else {
        Alert.alert('Gagal Masuk', data.error || 'Terjadi kesalahan autentikasi.')
      }
    } catch (err: any) {
      Alert.alert('Koneksi Gagal', 'Tidak dapat terhubung ke server auth.')
    } finally {
      setAuthLoading(false)
    }
  }

  // Anti-Cheat: App State Detection in Mobile (Tab Switch / Background)
  const handleMobileViolation = () => {
    if (!isPlaying || isFinished) return
    setScore((s) => Math.max(0, s - 15))
    Alert.alert('Pelanggaran Terdeteksi', 'Meninggalkan aplikasi saat ujian kuis berlangsung dikenakan penalti -15 poin!')
  }
  const handleStartLiveQuiz = () => {
    if (!user) {
      setIsAuthModalOpen(true)
      return
    }
    if (!liveSlot || !liveSlot.questions || liveSlot.questions.length === 0) {
      Alert.alert('Memuat Soal', 'Sedang mempersiapkan soal kuis, tunggu sebentar...')
      return
    }
    setCurrentIdx(0)
    setSelectedOpt(null)
    setIsAnswered(false)
    setScore(0)
    setCorrectCount(0)
    setQuestionTimer(30)
    setIsFinished(false)
    setIsPlaying(true)
  }

  const handleSelectOption = (index: number) => {
    if (isAnswered) return
    setSelectedOpt(index)
    setIsAnswered(true)

    const currentQ = liveSlot?.questions[currentIdx]
    if (!currentQ) return

    const isCorrect = index === currentQ.answer_index
    if (isCorrect) {
      setCorrectCount((prev) => prev + 1)
      setScore((prev) => prev + (currentQ.points || 10))
    }
  }

  const handleNextQuestion = () => {
    if (!liveSlot) return
    if (currentIdx + 1 < liveSlot.questions.length) {
      setCurrentIdx((prev) => prev + 1)
      setSelectedOpt(null)
      setIsAnswered(false)
      setQuestionTimer(30)
    } else {
      setIsFinished(true)
      submitScore()
    }
  }

  const submitScore = async () => {
    if (!user || !liveSlot) return
    try {
      const res = await fetch(`${API_BASE}/live-slot/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slot_id: liveSlot.slot_id,
          user_email: user.email,
          score: score,
          total: liveSlot.questions.length * 20,
          correct_count: correctCount,
          time_spent_sec: 1800 - secondsLeft,
          sd_correct: correctCount,
          sd_total: liveSlot.questions.length,
          smp_correct: 0,
          smp_total: 0,
          sma_correct: 0,
          sma_total: 0,
        }),
      })
      const data = await res.json()
      if (data.success && data.user) {
        setUser(data.user)
      }
    } catch (e) {
      console.log('Failed submit score:', e)
    }
  }

  const questions = liveSlot?.questions || []
  const currentQ = questions[currentIdx]

  // Dynamic Theme Colors
  const colors = {
    bg: isDark ? '#000000' : '#f5f5f7',
    card: isDark ? '#111114' : '#ffffff',
    cardBorder: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
    cardSubtle: isDark ? '#18181c' : '#f4f4f6',
    text: isDark ? '#f9fafb' : '#0a0a0c',
    textMuted: isDark ? '#9ca3af' : '#6b7280',
    primary: '#4f46e5',
    emerald: '#10b981',
    rose: '#ef4444',
    amber: '#f59e0b',
  }

  return (
    <View style={[styles.root, { backgroundColor: colors.bg }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />

      {/* Top Header */}
      <View
        style={[
          styles.header,
          {
            paddingTop: Math.max(insets.top, 14),
            backgroundColor: colors.card,
            borderBottomColor: colors.cardBorder,
          },
        ]}
      >
        <View style={styles.headerRow}>
          <TouchableOpacity
            style={styles.brandRow}
            onPress={() => setIsPlaying(false)}
            activeOpacity={0.8}
          >
            <View style={styles.brandBadge}>
              <Text style={styles.brandBadgeText}>QP</Text>
            </View>
            <View>
              <Text style={[styles.headerTitle, { color: colors.text }]}>Quiz Pocket</Text>
              <Text style={[styles.headerSubtitle, { color: colors.textMuted }]}>
                Uji Wawasan Terpadu
              </Text>
            </View>
          </TouchableOpacity>

          {/* Right Action: Theme Switcher & User Profile */}
          <View style={styles.headerActions}>
            <TouchableOpacity
              onPress={() => setThemeMode(isDark ? 'light' : 'dark')}
              style={[styles.themeBtn, { backgroundColor: colors.cardSubtle, borderColor: colors.cardBorder }]}
              activeOpacity={0.7}
            >
              <Text style={{ fontSize: 13 }}>{isDark ? '☀️' : '🌙'}</Text>
            </TouchableOpacity>

            {user ? (
              <TouchableOpacity
                onPress={() => {
                  Alert.alert(
                    'Akun Anda',
                    `${user.name} (${user.email})\nTotal Poin: ${user.points} Pts\nStreak: 🔥 ${user.streak} Hari`,
                    [
                      { text: 'Tutup', style: 'cancel' },
                      { text: 'Keluar Akun', style: 'destructive', onPress: () => setUser(null) },
                    ]
                  )
                }}
                style={[styles.userPill, { backgroundColor: colors.cardSubtle, borderColor: colors.cardBorder }]}
                activeOpacity={0.8}
              >
                <Text style={[styles.userPillText, { color: colors.text }]} numberOfLines={1}>
                  {user.name}
                </Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                onPress={() => setIsAuthModalOpen(true)}
                style={styles.loginPill}
                activeOpacity={0.8}
              >
                <Text style={styles.loginPillText}>Masuk</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>

      {/* Main Content Area */}
      <View style={styles.contentContainer}>
        {loading && !liveSlot ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={[styles.loadingText, { color: colors.textMuted }]}>
              Menghubungkan ke Sesi Live...
            </Text>
          </View>
        ) : isPlaying ? (
          /* QUIZ WORKSPACE VIEW */
          <ScrollView
            style={styles.scrollArea}
            contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 40 }]}
            showsVerticalScrollIndicator={false}
          >
            {!isFinished && currentQ ? (
              <View style={[styles.quizCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
                {/* Progress Bar & Header */}
                <View style={styles.quizHeader}>
                  <TouchableOpacity
                    onPress={() => setIsPlaying(false)}
                    style={[styles.exitBtn, { backgroundColor: colors.cardSubtle, borderColor: colors.cardBorder }]}
                  >
                    <Text style={[styles.exitBtnText, { color: colors.text }]}>✕ Keluar</Text>
                  </TouchableOpacity>
                  <Text style={[styles.qCounter, { color: colors.textMuted }]}>
                    Soal {currentIdx + 1} / {questions.length}
                  </Text>
                  <View style={[styles.qTimerBox, { backgroundColor: questionTimer <= 5 ? colors.rose : colors.primary }]}>
                    <Text style={styles.qTimerText}>{questionTimer}s</Text>
                  </View>
                </View>

                {/* Question Text */}
                <Text style={[styles.qText, { color: colors.text }]}>{currentQ.question}</Text>

                {/* Options List */}
                <View style={styles.optionsContainer}>
                  {(currentQ.options || []).map((opt, idx) => {
                    let btnBg = colors.cardSubtle
                    let borderCol = colors.cardBorder
                    let textColor = colors.text

                    if (isAnswered) {
                      if (idx === currentQ.answer_index) {
                        btnBg = 'rgba(16,185,129,0.15)'
                        borderCol = colors.emerald
                        textColor = colors.emerald
                      } else if (idx === selectedOpt) {
                        btnBg = 'rgba(239,68,68,0.15)'
                        borderCol = colors.rose
                        textColor = colors.rose
                      }
                    }

                    return (
                      <TouchableOpacity
                        key={idx}
                        style={[styles.optBtn, { backgroundColor: btnBg, borderColor: borderCol }]}
                        onPress={() => handleSelectOption(idx)}
                        disabled={isAnswered}
                        activeOpacity={0.7}
                      >
                        <View style={[styles.optIndex, { backgroundColor: colors.card, borderColor: borderCol }]}>
                          <Text style={[styles.optIndexText, { color: textColor }]}>
                            {String.fromCharCode(65 + idx)}
                          </Text>
                        </View>
                        <Text style={[styles.optText, { color: textColor }]}>{opt}</Text>
                      </TouchableOpacity>
                    )
                  })}
                </View>

                {/* Explanation if Answered */}
                {isAnswered && (
                  <View style={[styles.expBox, { backgroundColor: colors.cardSubtle, borderColor: colors.cardBorder }]}>
                    <Text style={[styles.expTitle, { color: colors.text }]}>💡 Pembahasan:</Text>
                    <Text style={[styles.expText, { color: colors.textMuted }]}>{currentQ.explanation}</Text>

                    <TouchableOpacity
                      style={styles.nextBtn}
                      onPress={handleNextQuestion}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.nextBtnText}>
                        {currentIdx + 1 < questions.length ? 'Soal Berikutnya ➔' : 'Selesai & Lihat Skor 🎉'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            ) : (
              /* Result Screen */
              <View style={[styles.resultCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
                <Text style={styles.resultEmoji}>🏆</Text>
                <Text style={[styles.resultTitle, { color: colors.text }]}>Kuis Selesai!</Text>
                <Text style={[styles.resultSubtitle, { color: colors.textMuted }]}>
                  Hebat! Kamu telah menyelesaikan sesi kuis wawasan terpadu.
                </Text>

                <View style={styles.scoreGrid}>
                  <View style={[styles.scoreItem, { backgroundColor: colors.cardSubtle }]}>
                    <Text style={[styles.scoreVal, { color: colors.primary }]}>{score}</Text>
                    <Text style={[styles.scoreLbl, { color: colors.textMuted }]}>Poin Diperoleh</Text>
                  </View>
                  <View style={[styles.scoreItem, { backgroundColor: colors.cardSubtle }]}>
                    <Text style={[styles.scoreVal, { color: colors.emerald }]}>
                      {correctCount}/{questions.length}
                    </Text>
                    <Text style={[styles.scoreLbl, { color: colors.textMuted }]}>Jawaban Benar</Text>
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.backHomeBtn}
                  onPress={() => setIsPlaying(false)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.backHomeText}>Kembali ke Beranda</Text>
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>
        ) : (
          /* HOME LANDING VIEW (Mirip persis seperti web) */
          <ScrollView
            style={styles.scrollArea}
            contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 40 }]}
            showsVerticalScrollIndicator={false}
          >
            {/* Live 30-Minute Synchronized Hero Card */}
            <View style={[styles.heroCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
              {/* Top Banner Status Bar */}
              <View style={styles.badgeRow}>
                <View style={styles.liveIndicator}>
                  <View style={styles.liveDot} />
                  <Text style={styles.liveText}>SESI LIVE SINKRON 30 MENIT</Text>
                </View>
                <View style={[styles.slotPill, { backgroundColor: colors.cardSubtle }]}>
                  <Text style={[styles.slotPillText, { color: colors.textMuted }]}>
                    Slot #{liveSlot?.slot_id || '---'}
                  </Text>
                </View>
              </View>

              {/* Tag & Title */}
              <View style={styles.titleBlock}>
                <View style={styles.kategoriBadge}>
                  <Text style={styles.kategoriBadgeText}>✨ Kuis Wawasan Terpadu</Text>
                </View>
                <Text style={[styles.heroTitle, { color: colors.text }]}>
                  Uji Nalar & Wawasan Kehidupan Nyata
                </Text>
                <Text style={[styles.heroDesc, { color: colors.textMuted }]}>
                  Komposisi butir soal komprehensif sains, logika kuantitatif, literasi bahasa, sejarah, dan finansial.
                </Text>
              </View>

              {/* 3 Metric Insets */}
              <View style={styles.metricsGrid}>
                <View style={[styles.metricBox, { backgroundColor: colors.cardSubtle }]}>
                  <Text style={[styles.metricLbl, { color: colors.textMuted }]}>SISA WAKTU SESI</Text>
                  <Text style={[styles.metricValTime, { color: colors.primary }]}>
                    ⏳ {formatCountdown(secondsLeft)}
                  </Text>
                </View>
                <View style={[styles.metricBox, { backgroundColor: colors.cardSubtle }]}>
                  <Text style={[styles.metricLbl, { color: colors.textMuted }]}>JUMLAH SOAL</Text>
                  <Text style={[styles.metricVal, { color: colors.text }]}>
                    📖 {liveSlot?.questions?.length || 15} Butir
                  </Text>
                </View>
                <View style={[styles.metricBox, { backgroundColor: colors.cardSubtle }]}>
                  <Text style={[styles.metricLbl, { color: colors.textMuted }]}>PARTISIPAN</Text>
                  <Text style={[styles.metricVal, { color: colors.text }]}>
                    👥 {liveSlot?.participants || 0} Pemain
                  </Text>
                </View>
              </View>

              {/* CTA Action Button */}
              {liveSlot?.user_submitted ? (
                <View style={styles.submittedBox}>
                  <Text style={styles.submittedTitle}>✅ Sesi Ini Telah Anda Selesaikan</Text>
                  <Text style={styles.submittedDesc}>
                    Skor: {liveSlot.user_submission?.score || 0} Pts ({liveSlot.user_submission?.correct_count || 0} Benar)
                  </Text>
                </View>
              ) : (
                <TouchableOpacity
                  style={styles.startBtn}
                  onPress={handleStartLiveQuiz}
                  activeOpacity={0.8}
                >
                  <Text style={styles.startBtnText}>
                    {user ? 'Ikuti Ujian Sesi Sekarang ⚡' : 'Masuk untuk Mulai Kuis 🚀'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {/* 3 Points Level Cards */}
            <View style={styles.levelsGrid}>
              <View style={[styles.levelCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
                <Text style={styles.levelEmoji}>🌱</Text>
                <Text style={[styles.levelTitle, { color: colors.text }]}>Wawasan Dasar</Text>
                <Text style={[styles.levelPts, { color: colors.emerald }]}>+10 Pts</Text>
              </View>
              <View style={[styles.levelCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
                <Text style={styles.levelEmoji}>🧭</Text>
                <Text style={[styles.levelTitle, { color: colors.text }]}>Wawasan Menengah</Text>
                <Text style={[styles.levelPts, { color: colors.primary }]}>+20 Pts</Text>
              </View>
              <View style={[styles.levelCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
                <Text style={styles.levelEmoji}>🎓</Text>
                <Text style={[styles.levelTitle, { color: colors.text }]}>Wawasan Lanjutan</Text>
                <Text style={[styles.levelPts, { color: colors.amber }]}>+30 Pts</Text>
              </View>
            </View>

            {/* Leaderboard Section with Tab Switcher */}
            <View style={[styles.leadSection, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
              <View style={styles.leadHeaderRow}>
                <Text style={[styles.leadSectionTitle, { color: colors.text }]}>🏆 Papan Peringkat</Text>
                <View style={[styles.tabSwitch, { backgroundColor: colors.cardSubtle }]}>
                  <TouchableOpacity
                    style={[styles.tabBtn, leaderboardTab === 'weekly' && styles.tabBtnActive]}
                    onPress={() => setLeaderboardTab('weekly')}
                  >
                    <Text style={[styles.tabBtnText, leaderboardTab === 'weekly' && styles.tabBtnTextActive]}>
                      Minggu Ini
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.tabBtn, leaderboardTab === 'all' && styles.tabBtnActive]}
                    onPress={() => setLeaderboardTab('all')}
                  >
                    <Text style={[styles.tabBtnText, leaderboardTab === 'all' && styles.tabBtnTextActive]}>
                      All-Time
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.rankList}>
                {leaderboard.map((item, index) => (
                  <View
                    key={item.id}
                    style={[styles.rankRow, { borderBottomColor: colors.cardBorder }]}
                  >
                    <View style={styles.rankLeft}>
                      <View
                        style={[
                          styles.rankBadge,
                          index === 0 && { backgroundColor: '#fef08a' },
                          index === 1 && { backgroundColor: '#e2e8f0' },
                          index === 2 && { backgroundColor: '#fed7aa' },
                        ]}
                      >
                        <Text style={styles.rankBadgeText}>#{index + 1}</Text>
                      </View>
                      <View>
                        <Text style={[styles.rankName, { color: colors.text }]} numberOfLines={1}>
                          {item.name}
                        </Text>
                        <Text style={[styles.rankMeta, { color: colors.textMuted }]}>
                          {item.quizzes_completed || 0} Sesi • 🔥 {item.streak || 1} Hari
                        </Text>
                      </View>
                    </View>
                    <View style={styles.rankRight}>
                      <Text style={[styles.rankPoints, { color: colors.primary }]}>
                        {leaderboardTab === 'weekly' ? item.weekly_points : item.points}
                      </Text>
                      <Text style={[styles.rankPtsLbl, { color: colors.textMuted }]}>Pts</Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          </ScrollView>
        )}
      </View>

      {/* Clean Auth Modal */}
      <Modal
        visible={isAuthModalOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsAuthModalOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.authCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            <View style={styles.authEmblem}>
              <Text style={{ fontSize: 24 }}>✨</Text>
            </View>
            <Text style={[styles.authTitle, { color: colors.text }]}>Masuk ke Quiz Pocket</Text>
            <Text style={[styles.authSubtitle, { color: colors.textMuted }]}>
              Wajib masuk menggunakan akun Gmail untuk mencatat skor ujian, poin ranking, dan streak belajar kuis.
            </Text>

            <View style={styles.authForm}>
              <TextInput
                style={[
                  styles.authInput,
                  { backgroundColor: colors.cardSubtle, color: colors.text, borderColor: colors.cardBorder },
                ]}
                placeholder="Nama Pengguna (Opsional)"
                placeholderTextColor={colors.textMuted}
                value={authName}
                onChangeText={setAuthName}
                autoCapitalize="words"
              />

              <TextInput
                style={[
                  styles.authInput,
                  { backgroundColor: colors.cardSubtle, color: colors.text, borderColor: colors.cardBorder },
                ]}
                placeholder="Alamat Email (Gmail)"
                placeholderTextColor={colors.textMuted}
                value={authEmail}
                onChangeText={setAuthEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />

              <TouchableOpacity
                style={styles.authSubmitBtn}
                onPress={handleLoginSubmit}
                disabled={authLoading}
                activeOpacity={0.8}
              >
                {authLoading ? (
                  <ActivityIndicator color="#ffffff" size="small" />
                ) : (
                  <Text style={styles.authSubmitText}>Lanjut Masuk ➔</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.authCloseBtn}
                onPress={() => setIsAuthModalOpen(false)}
                activeOpacity={0.7}
              >
                <Text style={[styles.authCloseText, { color: colors.textMuted }]}>Batal</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  )
}

export default function App() {
  return (
    <SafeAreaProvider>
      <MainScreen />
    </SafeAreaProvider>
  )
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  brandBadge: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#4f46e5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandBadgeText: {
    color: '#ffffff',
    fontWeight: '900',
    fontSize: 13,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  headerSubtitle: {
    fontSize: 11,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  themeBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userPill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    maxWidth: 100,
  },
  userPillText: {
    fontSize: 11,
    fontWeight: '600',
  },
  loginPill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 14,
    backgroundColor: '#4f46e5',
  },
  loginPillText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  contentContainer: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  loadingText: {
    fontSize: 13,
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    gap: 14,
  },
  heroCard: {
    padding: 20,
    borderRadius: 24,
    borderWidth: StyleSheet.hairlineWidth,
    gap: 14,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10b981',
  },
  liveText: {
    color: '#10b981',
    fontSize: 10,
    fontWeight: '800',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  slotPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  slotPillText: {
    fontSize: 10,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontWeight: '700',
  },
  titleBlock: {
    gap: 6,
  },
  kategoriBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(79,70,229,0.1)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  kategoriBadgeText: {
    color: '#4f46e5',
    fontSize: 11,
    fontWeight: '700',
  },
  heroTitle: {
    fontSize: 20,
    fontWeight: '800',
    lineHeight: 26,
  },
  heroDesc: {
    fontSize: 12,
    lineHeight: 18,
  },
  metricsGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  metricBox: {
    flex: 1,
    padding: 10,
    borderRadius: 14,
    gap: 3,
  },
  metricLbl: {
    fontSize: 9,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontWeight: '700',
  },
  metricVal: {
    fontSize: 12,
    fontWeight: '700',
  },
  metricValTime: {
    fontSize: 12,
    fontWeight: '800',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  startBtn: {
    backgroundColor: '#4f46e5',
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 4,
  },
  startBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  submittedBox: {
    backgroundColor: 'rgba(16,185,129,0.1)',
    padding: 12,
    borderRadius: 14,
    gap: 2,
    alignItems: 'center',
  },
  submittedTitle: {
    color: '#10b981',
    fontSize: 12,
    fontWeight: '700',
  },
  submittedDesc: {
    color: '#10b981',
    fontSize: 11,
  },
  levelsGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  levelCard: {
    flex: 1,
    padding: 12,
    borderRadius: 18,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    gap: 3,
  },
  levelEmoji: {
    fontSize: 20,
  },
  levelTitle: {
    fontSize: 10,
    fontWeight: '600',
    textAlign: 'center',
  },
  levelPts: {
    fontSize: 11,
    fontWeight: '800',
  },
  leadSection: {
    padding: 16,
    borderRadius: 24,
    borderWidth: StyleSheet.hairlineWidth,
    gap: 12,
  },
  leadHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  leadSectionTitle: {
    fontSize: 15,
    fontWeight: '800',
  },
  tabSwitch: {
    flexDirection: 'row',
    padding: 3,
    borderRadius: 12,
  },
  tabBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 9,
  },
  tabBtnActive: {
    backgroundColor: '#4f46e5',
  },
  tabBtnText: {
    fontSize: 10,
    color: '#9ca3af',
    fontWeight: '600',
  },
  tabBtnTextActive: {
    color: '#ffffff',
    fontWeight: '700',
  },
  rankList: {
    gap: 2,
  },
  rankRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  rankLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  rankBadge: {
    width: 26,
    height: 26,
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#111827',
  },
  rankName: {
    fontSize: 12,
    fontWeight: '700',
  },
  rankMeta: {
    fontSize: 10,
  },
  rankRight: {
    alignItems: 'flex-end',
  },
  rankPoints: {
    fontSize: 13,
    fontWeight: '800',
  },
  rankPtsLbl: {
    fontSize: 8,
  },
  quizCard: {
    padding: 18,
    borderRadius: 24,
    borderWidth: StyleSheet.hairlineWidth,
    gap: 14,
  },
  quizHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  exitBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
  },
  exitBtnText: {
    fontSize: 11,
    fontWeight: '600',
  },
  qCounter: {
    fontSize: 12,
    fontWeight: '600',
  },
  qTimerBox: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  qTimerText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '800',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  qText: {
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 22,
  },
  optionsContainer: {
    gap: 10,
  },
  optBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    gap: 10,
  },
  optIndex: {
    width: 28,
    height: 28,
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optIndexText: {
    fontSize: 11,
    fontWeight: '700',
  },
  optText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
  expBox: {
    padding: 14,
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    gap: 8,
    marginTop: 4,
  },
  expTitle: {
    fontSize: 12,
    fontWeight: '700',
  },
  expText: {
    fontSize: 11,
    lineHeight: 16,
  },
  nextBtn: {
    backgroundColor: '#4f46e5',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 4,
  },
  nextBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  resultCard: {
    padding: 24,
    borderRadius: 24,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    gap: 12,
  },
  resultEmoji: {
    fontSize: 48,
  },
  resultTitle: {
    fontSize: 22,
    fontWeight: '800',
  },
  resultSubtitle: {
    fontSize: 12,
    textAlign: 'center',
  },
  scoreGrid: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
    marginVertical: 8,
  },
  scoreItem: {
    flex: 1,
    padding: 14,
    borderRadius: 16,
    alignItems: 'center',
    gap: 4,
  },
  scoreVal: {
    fontSize: 20,
    fontWeight: '800',
  },
  scoreLbl: {
    fontSize: 10,
  },
  backHomeBtn: {
    backgroundColor: '#4f46e5',
    width: '100%',
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
  },
  backHomeText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  authCard: {
    width: '100%',
    maxWidth: 340,
    padding: 24,
    borderRadius: 24,
    borderWidth: StyleSheet.hairlineWidth,
    gap: 12,
  },
  authEmblem: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: 'rgba(79,70,229,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  authTitle: {
    fontSize: 18,
    fontWeight: '800',
    textAlign: 'center',
  },
  authSubtitle: {
    fontSize: 11,
    textAlign: 'center',
    lineHeight: 16,
  },
  authForm: {
    gap: 10,
    marginTop: 6,
  },
  authInput: {
    height: 46,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 14,
    fontSize: 13,
  },
  authSubmitBtn: {
    backgroundColor: '#4f46e5',
    height: 46,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  authSubmitText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
  authCloseBtn: {
    alignItems: 'center',
    paddingVertical: 6,
  },
  authCloseText: {
    fontSize: 12,
  },
})
