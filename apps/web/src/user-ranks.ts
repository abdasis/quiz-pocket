export interface UserRankTitle {
  title: string
  minPoints: number
  colorClass: string
  bgClass: string
  borderClass: string
  description: string
  tier: number
}

export const USER_TITLES: UserRankTitle[] = [
  {
    title: 'Begawan Nalar',
    minPoints: 5000,
    colorClass: 'text-rose-500 dark:text-rose-400',
    bgClass: 'bg-rose-50 dark:bg-rose-950/50',
    borderClass: 'border-rose-200/80 dark:border-rose-800/60',
    description: 'Tingkat tertinggi: Penguasa mutlak seluruh wawasan & sains',
    tier: 10,
  },
  {
    title: 'Mahaguru',
    minPoints: 3500,
    colorClass: 'text-amber-500 dark:text-amber-400',
    bgClass: 'bg-amber-50 dark:bg-amber-950/50',
    borderClass: 'border-amber-200/80 dark:border-amber-800/60',
    description: 'Intelektual ulung dengan ketajaman berpikir paripurna',
    tier: 9,
  },
  {
    title: 'Suhu Nalar',
    minPoints: 2200,
    colorClass: 'text-orange-500 dark:text-orange-400',
    bgClass: 'bg-orange-50 dark:bg-orange-950/50',
    borderClass: 'border-orange-200/80 dark:border-orange-800/60',
    description: 'Puncak kemahiran logika, wawasan umum, dan sains',
    tier: 8,
  },
  {
    title: 'Cendekiawan Utama',
    minPoints: 1500,
    colorClass: 'text-violet-600 dark:text-violet-400',
    bgClass: 'bg-violet-50 dark:bg-violet-950/50',
    borderClass: 'border-violet-200/80 dark:border-violet-800/60',
    description: 'Pemikir tajam dengan literasi tingkat lanjut',
    tier: 7,
  },
  {
    title: 'Cendekiawan Muda',
    minPoints: 1000,
    colorClass: 'text-purple-600 dark:text-purple-400',
    bgClass: 'bg-purple-50 dark:bg-purple-950/50',
    borderClass: 'border-purple-200/80 dark:border-purple-800/60',
    description: 'Menguasai konsep sains dasar, menengah, dan penalaran lanjutan',
    tier: 6,
  },
  {
    title: 'Pakar Penjelajah',
    minPoints: 650,
    colorClass: 'text-indigo-600 dark:text-indigo-400',
    bgClass: 'bg-indigo-50 dark:bg-indigo-950/50',
    borderClass: 'border-indigo-200/80 dark:border-indigo-800/60',
    description: 'Rasa ingin tahu tinggi melintasi berbagai bidang ilmu',
    tier: 5,
  },
  {
    title: 'Penjelajah Wawasan',
    minPoints: 350,
    colorClass: 'text-blue-600 dark:text-blue-400',
    bgClass: 'bg-blue-50 dark:bg-blue-950/50',
    borderClass: 'border-blue-200/80 dark:border-blue-800/60',
    description: 'Aktif mendalami fakta sains dan wawasan kehidupan nyata',
    tier: 4,
  },
  {
    title: 'Pengelana Gigih',
    minPoints: 180,
    colorClass: 'text-teal-600 dark:text-teal-400',
    bgClass: 'bg-teal-50 dark:bg-teal-950/50',
    borderClass: 'border-teal-200/80 dark:border-teal-800/60',
    description: 'Konsisten mengasah nalar harian dan mengumpulkan poin',
    tier: 3,
  },
  {
    title: 'Pencari Ilmu',
    minPoints: 60,
    colorClass: 'text-emerald-600 dark:text-emerald-400',
    bgClass: 'bg-emerald-50 dark:bg-emerald-950/50',
    borderClass: 'border-emerald-200/80 dark:border-emerald-800/60',
    description: 'Langkah awal yang mantap dalam membangun wawasan',
    tier: 2,
  },
  {
    title: 'Pemula Penasaran',
    minPoints: 0,
    colorClass: 'text-neutral-600 dark:text-neutral-400',
    bgClass: 'bg-neutral-100 dark:bg-neutral-800/60',
    borderClass: 'border-black/[0.04] dark:border-white/[0.06]',
    description: 'Baru memulai petualangan menguji wawasan',
    tier: 1,
  },
]

export function getUserTitle(points: number = 0): UserRankTitle {
  for (const t of USER_TITLES) {
    if (points >= t.minPoints) {
      return t
    }
  }
  return USER_TITLES[USER_TITLES.length - 1]
}

export function getNextTitleProgress(points: number = 0): {
  currentTitle: UserRankTitle
  nextTitle: UserRankTitle | null
  pointsNeeded: number
  progressPercent: number
} {
  const currentTitle = getUserTitle(points)
  const currentIndex = USER_TITLES.findIndex((t) => t.title === currentTitle.title)
  
  if (currentIndex <= 0) {
    // Top tier reached
    return {
      currentTitle,
      nextTitle: null,
      pointsNeeded: 0,
      progressPercent: 100,
    }
  }

  const nextTitle = USER_TITLES[currentIndex - 1]
  const prevMin = currentTitle.minPoints
  const nextMin = nextTitle.minPoints
  const pointsInTier = points - prevMin
  const tierRange = nextMin - prevMin
  const progressPercent = Math.min(100, Math.max(0, Math.round((pointsInTier / tierRange) * 100)))

  return {
    currentTitle,
    nextTitle,
    pointsNeeded: Math.max(0, nextMin - points),
    progressPercent,
  }
}
