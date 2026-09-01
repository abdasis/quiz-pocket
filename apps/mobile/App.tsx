import React, { useState, useEffect } from 'react'
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  Platform,
  Alert,
  TextInput,
  Image,
  useColorScheme,
} from 'react-native'
import { SafeAreaProvider, SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
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

  const [activeTab, setActiveTab] = useState<'home' | 'quiz' | 'leaderboard' | 'profile'>('home')
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

  // Quiz State
  const [currentIdx, setCurrentIdx] = useState(0)
  const [selectedOpt, setSelectedOpt] = useState<number | null>(null)
  const [isAnswered, setIsAnswered] = useState(false)
  const [score, setScore] = useState(0)
  const [correctCount, setCorrectCount] = useState(0)
  const [questionTimer, setQuestionTimer] = useState(30)
  const [isFinished, setIsFinished] = useState(false)

  // OTA Auto-Update Check on App Launch
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
      setLoading(true)
      const [slotRes, leadRes] = await Promise.all([
        fetch(`${API_BASE}/live-slot`),
        fetch(`${API_BASE}/leaderboard?period=weekly`),
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

  // Question countdown timer in quiz mode
  useEffect(() => {
    if (activeTab !== 'quiz' || isAnswered || isFinished) return
    if (questionTimer <= 0) {
      handleSelectOption(-1)
      return
    }
    const t = setInterval(() => {
      setQuestionTimer((prev) => prev - 1)
    }, 1000)
    return () => clearInterval(t)
  }, [activeTab, questionTimer, isAnswered, isFinished])

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
      if (data.success && data.user) {
        setUser(data.user)
        setIsAuthModalOpen(false)
        setAuthEmail('')
        setAuthName('')
        Alert.alert('Berhasil Masuk', `Selamat datang, ${data.user.name}!`)
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

  const startQuiz = () => {
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
    setActiveTab('quiz')
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
    bg: isDark ? '#090a0f' : '#f5f5f7',
    card: isDark ? '#111218' : '#ffffff',
    cardBorder: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
    cardSubtle: isDark ? '#171821' : '#f0f0f3',
    text: isDark ? '#f9fafb' : '#111827',
    textMuted: isDark ? '#9ca3af' : '#6b7280',
    primary: '#4f46e5',
    emerald: '#10b981',
    rose: '#ef4444',
    amber: '#f59e0b',
    navBg: isDark ? 'rgba(17,18,24,0.94)' : 'rgba(255,255,255,0.94)',
    navBorder: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
  }

  return (
    <View style={[styles.root, { backgroundColor: colors.bg }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />

      {/* Top Header with Safe Area Inset */}
      <View
        style={[
          styles.header,
          {
            paddingTop: Math.max(insets.top, 16),
            backgroundColor: colors.card,
            borderBottomColor: colors.cardBorder,
          },
        ]}
      >
        <View style={styles.headerRow}>
          <View style={styles.brandRow}>
            <View style={styles.brandBadge}>
              <Text style={styles.brandBadgeText}>QP</Text>
            </View>
            <View>
              <Text style={[styles.headerTitle, { color: colors.text }]}>Quiz Pocket</Text>
              <Text style={[styles.headerSubtitle, { color: colors.textMuted }]}>
                Uji Wawasan Terpadu
              </Text>
            </View>
          </View>

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
                onPress={() => setActiveTab('profile')}
                style={[styles.userPill, { backgroundColor: colors.cardSubtle, borderColor: colors.cardBorder }]}
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

      {/* Main Body Content */}
      <View style={styles.contentContainer}>
        {loading && !liveSlot ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={[styles.loadingText, { color: colors.textMuted }]}>
              Menghubungkan ke Server...
            </Text>
          </View>
        ) : (
          <>
            {/* HOME VIEW */}
            {activeTab === 'home' && (
              <ScrollView
                style={styles.scrollArea}
                contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 80 }]}
                showsVerticalScrollIndicator={false}
              >
                {/* Live Synchronized Card */}
                <View style={[styles.heroCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
                  <View style={styles.badgeRow}>
                    <View style={styles.liveIndicator}>
                      <View style={styles.liveDot} />
                      <Text style={styles.liveText}>SESI LIVE 30 MENIT</Text>
                    </View>
                    <View style={[styles.timerBadge, { backgroundColor: colors.cardSubtle }]}>
                      <Text style={[styles.timerText, { color: colors.primary }]}>
                        ⏳ {formatCountdown(secondsLeft)}
                      </Text>
                    </View>
                  </View>

                  <Text style={[styles.heroTitle, { color: colors.text }]}>Kuis Wawasan Terpadu</Text>
                  <Text style={[styles.heroDesc, { color: colors.textMuted }]}>
                    Soal teracak deterministik lintas mata pelajaran SD, SMP, dan SMA secara seimbang di seluruh Indonesia.
                  </Text>

                  {/* Level Info Breakdown */}
                  <View style={styles.infoRow}>
                    <View style={[styles.infoBox, { backgroundColor: colors.cardSubtle }]}>
                      <Text style={[styles.infoVal, { color: colors.text }]}>+10 Pts</Text>
                      <Text style={[styles.infoLbl, { color: colors.textMuted }]}>Dasar</Text>
                    </View>
                    <View style={[styles.infoBox, { backgroundColor: colors.cardSubtle }]}>
                      <Text style={[styles.infoVal, { color: colors.text }]}>+20 Pts</Text>
                      <Text style={[styles.infoLbl, { color: colors.textMuted }]}>Menengah</Text>
                    </View>
                    <View style={[styles.infoBox, { backgroundColor: colors.cardSubtle }]}>
                      <Text style={[styles.infoVal, { color: colors.text }]}>+30 Pts</Text>
                      <Text style={[styles.infoLbl, { color: colors.textMuted }]}>Lanjutan</Text>
                    </View>
                  </View>

                  <TouchableOpacity
                    style={styles.startBtn}
                    onPress={startQuiz}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.startBtnText}>
                      {user ? 'Ikuti Ujian Sesi Sekarang ⚡' : 'Masuk untuk Mulai Kuis 🚀'}
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Retensi / Tips Card */}
                <View style={[styles.tipCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
                  <Text style={[styles.tipTitle, { color: colors.text }]}>🛡️ Sistem Anti-Cheat & Fair Play</Text>
                  <Text style={[styles.tipText, { color: colors.textMuted }]}>
                    Tiap butir soal memiliki timer 30 detik. Poin mingguan akan di-reset setiap hari Senin pukul 00:00 WIB untuk menjaga kompetisi tetap segar.
                  </Text>
                </View>
              </ScrollView>
            )}

            {/* QUIZ WORKSPACE VIEW */}
            {activeTab === 'quiz' && (
              <ScrollView
                style={styles.scrollArea}
                contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 80 }]}
                showsVerticalScrollIndicator={false}
              >
                {!isFinished && currentQ ? (
                  <View style={[styles.quizCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
                    {/* Progress Bar & Header */}
                    <View style={styles.quizHeader}>
                      <Text style={[styles.qCounter, { color: colors.textMuted }]}>
                        Soal {currentIdx + 1} dari {questions.length}
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
                      Hebat! Kamu telah menyelesaikan sesi kuis terpadu.
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
                      onPress={() => setActiveTab('home')}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.backHomeText}>Kembali ke Beranda</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </ScrollView>
            )}

            {/* LEADERBOARD VIEW */}
            {activeTab === 'leaderboard' && (
              <ScrollView
                style={styles.scrollArea}
                contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 80 }]}
                showsVerticalScrollIndicator={false}
              >
                <View style={[styles.leadHeaderCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
                  <Text style={[styles.leadTitle, { color: colors.text }]}>👑 Klasemen Musim Ini</Text>
                  <Text style={[styles.leadSubtitle, { color: colors.textMuted }]}>
                    Poin di-reset otomatis setiap hari Senin pukul 00:00 WIB.
                  </Text>
                </View>

                {leaderboard.map((item, index) => {
                  return (
                    <View
                      key={item.id}
                      style={[styles.rankItem, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}
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
                            {item.quizzes_completed || 0} Sesi Kuis • 🔥 {item.streak || 1} Hari
                          </Text>
                        </View>
                      </View>
                      <View style={styles.rankRight}>
                        <Text style={[styles.rankPoints, { color: colors.primary }]}>
                          {item.weekly_points || item.points || 0}
                        </Text>
                        <Text style={[styles.rankPtsLbl, { color: colors.textMuted }]}>Pts</Text>
                      </View>
                    </View>
                  )
                })}
              </ScrollView>
            )}

            {/* PROFILE VIEW */}
            {activeTab === 'profile' && (
              <ScrollView
                style={styles.scrollArea}
                contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 80 }]}
                showsVerticalScrollIndicator={false}
              >
                <View style={[styles.profileCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
                  <View style={styles.avatarBig}>
                    <Text style={styles.avatarBigText}>
                      {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                    </Text>
                  </View>
                  <Text style={[styles.profileName, { color: colors.text }]}>{user?.name || 'Pengguna'}</Text>
                  <Text style={[styles.profileEmail, { color: colors.textMuted }]}>{user?.email || '-'}</Text>

                  <View style={styles.profileStatsRow}>
                    <View style={[styles.pStatBox, { backgroundColor: colors.cardSubtle }]}>
                      <Text style={[styles.pStatVal, { color: colors.primary }]}>{user?.points || 0}</Text>
                      <Text style={[styles.pStatLbl, { color: colors.textMuted }]}>Total Poin</Text>
                    </View>
                    <View style={[styles.pStatBox, { backgroundColor: colors.cardSubtle }]}>
                      <Text style={[styles.pStatVal, { color: colors.amber }]}>🔥 {user?.streak || 1}</Text>
                      <Text style={[styles.pStatLbl, { color: colors.textMuted }]}>Daily Streak</Text>
                    </View>
                  </View>

                  <TouchableOpacity
                    style={styles.logoutBtn}
                    onPress={() => {
                      setUser(null)
                      setActiveTab('home')
                    }}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.logoutBtnText}>Keluar Akun</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            )}
          </>
        )}
      </View>

      {/* Bottom Navigation Bar with Safe Area Insets */}
      <View
        style={[
          styles.bottomNav,
          {
            paddingBottom: Math.max(insets.bottom, 12),
            backgroundColor: colors.navBg,
            borderTopColor: colors.navBorder,
          },
        ]}
      >
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => setActiveTab('home')}
          activeOpacity={0.7}
        >
          <Text style={[styles.navIcon, activeTab === 'home' && { color: colors.primary }]}>🏠</Text>
          <Text
            style={[
              styles.navLabel,
              { color: activeTab === 'home' ? colors.primary : colors.textMuted },
            ]}
          >
            Beranda
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={startQuiz}
          activeOpacity={0.7}
        >
          <Text style={[styles.navIcon, activeTab === 'quiz' && { color: colors.primary }]}>⚡</Text>
          <Text
            style={[
              styles.navLabel,
              { color: activeTab === 'quiz' ? colors.primary : colors.textMuted },
            ]}
          >
            Kuis Live
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => setActiveTab('leaderboard')}
          activeOpacity={0.7}
        >
          <Text style={[styles.navIcon, activeTab === 'leaderboard' && { color: colors.primary }]}>👑</Text>
          <Text
            style={[
              styles.navLabel,
              { color: activeTab === 'leaderboard' ? colors.primary : colors.textMuted },
            ]}
          >
            Klasemen
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => {
            if (!user) setIsAuthModalOpen(true)
            else setActiveTab('profile')
          }}
          activeOpacity={0.7}
        >
          <Text style={[styles.navIcon, activeTab === 'profile' && { color: colors.primary }]}>👤</Text>
          <Text
            style={[
              styles.navLabel,
              { color: activeTab === 'profile' ? colors.primary : colors.textMuted },
            ]}
          >
            {user ? 'Profil' : 'Masuk'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Simple Clean Auth Modal */}
      {isAuthModalOpen && (
        <View style={styles.modalOverlay}>
          <View style={[styles.authCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            <Text style={[styles.authTitle, { color: colors.text }]}>Masuk ke Quiz Pocket</Text>
            <Text style={[styles.authSubtitle, { color: colors.textMuted }]}>
              Gunakan email Gmail Anda untuk mencatat poin ranking dan streak belajar.
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
      )}
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
    maxWidth: 90,
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
    gap: 16,
  },
  heroCard: {
    padding: 20,
    borderRadius: 24,
    borderWidth: StyleSheet.hairlineWidth,
    gap: 12,
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
  timerBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  timerText: {
    fontSize: 11,
    fontWeight: '700',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  heroTitle: {
    fontSize: 20,
    fontWeight: '800',
  },
  heroDesc: {
    fontSize: 12,
    lineHeight: 18,
  },
  infoRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  infoBox: {
    flex: 1,
    padding: 10,
    borderRadius: 14,
    alignItems: 'center',
    gap: 2,
  },
  infoVal: {
    fontSize: 12,
    fontWeight: '700',
  },
  infoLbl: {
    fontSize: 10,
  },
  startBtn: {
    backgroundColor: '#4f46e5',
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 6,
  },
  startBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  tipCard: {
    padding: 16,
    borderRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
    gap: 6,
  },
  tipTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  tipText: {
    fontSize: 11,
    lineHeight: 16,
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
  leadHeaderCard: {
    padding: 16,
    borderRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
    gap: 4,
  },
  leadTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  leadSubtitle: {
    fontSize: 11,
  },
  rankItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderRadius: 18,
    borderWidth: StyleSheet.hairlineWidth,
  },
  rankLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  rankBadge: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: 'rgba(0,0,0,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#111827',
  },
  rankName: {
    fontSize: 13,
    fontWeight: '700',
  },
  rankMeta: {
    fontSize: 10,
  },
  rankRight: {
    alignItems: 'flex-end',
  },
  rankPoints: {
    fontSize: 15,
    fontWeight: '800',
  },
  rankPtsLbl: {
    fontSize: 9,
  },
  profileCard: {
    padding: 24,
    borderRadius: 24,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    gap: 10,
  },
  avatarBig: {
    width: 64,
    height: 64,
    borderRadius: 22,
    backgroundColor: '#4f46e5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarBigText: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: '800',
  },
  profileName: {
    fontSize: 18,
    fontWeight: '800',
  },
  profileEmail: {
    fontSize: 12,
  },
  profileStatsRow: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
    marginVertical: 10,
  },
  pStatBox: {
    flex: 1,
    padding: 14,
    borderRadius: 16,
    alignItems: 'center',
    gap: 4,
  },
  pStatVal: {
    fontSize: 18,
    fontWeight: '800',
  },
  pStatLbl: {
    fontSize: 10,
  },
  logoutBtn: {
    backgroundColor: 'rgba(239,68,68,0.1)',
    width: '100%',
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
  },
  logoutBtnText: {
    color: '#ef4444',
    fontSize: 12,
    fontWeight: '700',
  },
  bottomNav: {
    flexDirection: 'row',
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: 8,
    paddingHorizontal: 8,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },
  navIcon: {
    fontSize: 18,
  },
  navLabel: {
    fontSize: 10,
    fontWeight: '600',
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    zIndex: 100,
  },
  authCard: {
    width: '100%',
    maxWidth: 340,
    padding: 24,
    borderRadius: 24,
    borderWidth: StyleSheet.hairlineWidth,
    gap: 12,
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
