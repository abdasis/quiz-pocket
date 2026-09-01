export interface UserRankTitle {
  title: string
  minPoints: number
  colorClass: string
  bgClass: string
  borderClass: string
  description: string
}

export const USER_TITLES: UserRankTitle[] = [
  {
    title: 'Suhu Nalar',
    minPoints: 2000,
    colorClass: 'text-amber-500 dark:text-amber-400',
    bgClass: 'bg-amber-50 dark:bg-amber-950/50',
    borderClass: 'border-amber-200/80 dark:border-amber-800/60',
    description: 'Puncak penguasaan wawasan, sains & logika',
  },
  {
    title: 'Cendekiawan',
    minPoints: 1000,
    colorClass: 'text-purple-600 dark:text-purple-400',
    bgClass: 'bg-purple-50 dark:bg-purple-950/50',
    borderClass: 'border-purple-200/80 dark:border-purple-800/60',
    description: 'Pemikir tajam dengan literasi tingkat tinggi',
  },
  {
    title: 'Penjelajah',
    minPoints: 400,
    colorClass: 'text-blue-600 dark:text-blue-400',
    bgClass: 'bg-blue-50 dark:bg-blue-950/50',
    borderClass: 'border-blue-200/80 dark:border-blue-800/60',
    description: 'Rasa ingin tahu luas melintasi aneka disiplin',
  },
  {
    title: 'Pengelana',
    minPoints: 150,
    colorClass: 'text-emerald-600 dark:text-emerald-400',
    bgClass: 'bg-emerald-50 dark:bg-emerald-950/50',
    borderClass: 'border-emerald-200/80 dark:border-emerald-800/60',
    description: 'Mulai konsisten mengasah nalar sains dan umum',
  },
  {
    title: 'Pemula',
    minPoints: 0,
    colorClass: 'text-neutral-600 dark:text-neutral-400',
    bgClass: 'bg-neutral-100 dark:bg-neutral-800/60',
    borderClass: 'border-black/[0.04] dark:border-white/[0.06]',
    description: 'Langkah awal menguji wawasan kehidupan nyata',
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
