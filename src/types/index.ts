export type Difficulty = 'Easy' | 'Medium' | 'Hard'
export type Status = 0 | 1 | 2 | 3

export interface Problem {
  id: string
  topic: string
  name: string
  difficulty: Difficulty
  source: string
  tags: string[]
  lcSlug: string
}

export interface Progress {
  problemId: string
  status: Status
  timeTaken: string
  attempts: number
  pattern: string
  lastSolved: string
  nextRevision: string
  revisionCount: number
  confidence: number
  notes: string
  code: string
  sm2Ef: number
  sm2Interval: number
  sm2Reps: number
}

export type View = 'table' | 'kanban' | 'pattern' | 'analytics'

export interface Filters {
  topic: string
  difficulty: string
  source: string
  status: string
  tag: string
  search: string
}

export const STATUS_LABEL: Record<Status, string> = {
  0: 'Not Started', 1: 'Attempted', 2: 'Solved', 3: 'Mastered',
}

export const STATUS_COLORS: Record<Status, string> = {
  0: 'text-gray-400', 1: 'text-amber-600', 2: 'text-green-600', 3: 'text-purple-600',
}

export const STATUS_BG: Record<Status, string> = {
  0: 'bg-gray-50 border-gray-200 dark:bg-gray-900 dark:border-gray-700',
  1: 'bg-amber-50 border-amber-300 dark:bg-amber-950 dark:border-amber-700',
  2: 'bg-green-50 border-green-300 dark:bg-green-950 dark:border-green-700',
  3: 'bg-purple-50 border-purple-300 dark:bg-purple-950 dark:border-purple-700',
}

export const DIFF_ORDER: Record<Difficulty, number> = { Easy: 1, Medium: 2, Hard: 3 }

export const SOURCE_COLORS: Record<string, string> = {
  A2Z: '#16a34a', Google: '#2563eb', Amazon: '#d97706',
  Meta: '#e11d48', Microsoft: '#0ea5e9', LeetCode: '#0891b2',
}

export const LC_BASE = 'https://leetcode.com/problems/'
export const GFG_BASE = 'https://www.geeksforgeeks.org/problems/'
