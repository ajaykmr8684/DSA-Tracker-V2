import { create } from 'zustand'
import { supabase } from '../lib/supabase'
import type { Progress, Status } from '../types'
import { sm2, addDays, today, revDays } from '../lib/sm2'
import { toast } from './toastStore'

type ProgressMap = Record<string, Progress>
type ActivityMap = Record<string, number>

const DEFAULT_PROGRESS = (problemId: string): Progress => ({
  problemId, status: 0, timeTaken: '', attempts: 0, pattern: '',
  lastSolved: '', nextRevision: '', revisionCount: 0, confidence: 0,
  notes: '', code: '', sm2Ef: 2.5, sm2Interval: 1, sm2Reps: 0,
})

interface ProgressState {
  progressMap: ProgressMap
  activityMap: ActivityMap
  loaded: boolean
  loadError: string | null

  loadAll: (userId: string) => Promise<void>
  getP: (id: string) => Progress
  saveP: (userId: string, p: Progress) => Promise<void>
  cycleStatus: (userId: string, problemId: string) => void
  rateSM2: (userId: string, problemId: string, quality: number) => void
  markRevDone: (userId: string, problemId: string) => void
  markAllRevDue: (userId: string) => void
  updateProgress: (userId: string, id: string, updates: Partial<Progress>) => void
  resetOne: (userId: string, id: string) => void
  logActivity: (userId: string) => void
}

function rowToProgress(row: Record<string, unknown>): Progress {
  return {
    problemId: row.problem_id as string,
    status: (row.status ?? 0) as Status,
    timeTaken: (row.time_taken ?? '') as string,
    attempts: (row.attempts ?? 0) as number,
    pattern: (row.pattern ?? '') as string,
    lastSolved: (row.last_solved ?? '') as string,
    nextRevision: (row.next_revision ?? '') as string,
    revisionCount: (row.revision_count ?? 0) as number,
    confidence: (row.confidence ?? 0) as number,
    notes: (row.notes ?? '') as string,
    code: (row.code ?? '') as string,
    sm2Ef: (row.sm2_ef ?? 2.5) as number,
    sm2Interval: (row.sm2_interval ?? 1) as number,
    sm2Reps: (row.sm2_reps ?? 0) as number,
  }
}

function progressToRow(userId: string, p: Progress) {
  return {
    user_id: userId, problem_id: p.problemId, status: p.status,
    time_taken: p.timeTaken || null, attempts: p.attempts,
    pattern: p.pattern || null, last_solved: p.lastSolved || null,
    next_revision: p.nextRevision || null, revision_count: p.revisionCount,
    confidence: p.confidence, notes: p.notes || null, code: p.code || null,
    sm2_ef: p.sm2Ef, sm2_interval: p.sm2Interval, sm2_reps: p.sm2Reps,
  }
}

export const useProgressStore = create<ProgressState>((set, get) => ({
  progressMap: {},
  activityMap: {},
  loaded: false,
  loadError: null,

  loadAll: async (userId) => {
    set({ loaded: false, loadError: null })
    const [progRes, actRes] = await Promise.all([
      supabase.from('problem_progress').select('*').eq('user_id', userId),
      supabase.from('activity_log').select('*').eq('user_id', userId),
    ])
    if (progRes.error) {
      const msg = progRes.error.message
      set({ loaded: true, loadError: msg })
      toast.error(`Failed to load progress: ${msg}`)
      return
    }
    const progressMap: ProgressMap = {}
    ;(progRes.data ?? []).forEach((row) => {
      progressMap[row.problem_id] = rowToProgress(row as Record<string, unknown>)
    })
    const activityMap: ActivityMap = {}
    ;(actRes.data ?? []).forEach((row) => { activityMap[row.date] = row.count })
    set({ progressMap, activityMap, loaded: true })
  },

  getP: (id) => get().progressMap[id] ?? DEFAULT_PROGRESS(id),

  saveP: async (userId, p) => {
    // Optimistic update
    set((s) => ({ progressMap: { ...s.progressMap, [p.problemId]: p } }))
    const { error } = await supabase
      .from('problem_progress')
      .upsert(progressToRow(userId, p), { onConflict: 'user_id,problem_id' })
    if (error) {
      toast.error('Save failed — check your connection')
      console.error('saveP error:', error)
    }
  },

  cycleStatus: (userId, problemId) => {
    const p = { ...get().getP(problemId) }
    const prev = p.status
    p.status = ((p.status + 1) % 4) as Status
    if (p.status >= 2 && prev < 2) {
      const td = today()
      if (!p.lastSolved) p.lastSolved = td
      p.nextRevision = addDays(td, p.sm2Interval || revDays(p.revisionCount))
      get().logActivity(userId)
    }
    get().saveP(userId, p)
  },

  rateSM2: (userId, problemId, quality) => {
    const p = { ...get().getP(problemId) }
    const result = sm2(quality, { ef: p.sm2Ef, interval: p.sm2Interval, reps: p.sm2Reps })
    p.sm2Ef = result.ef; p.sm2Interval = result.interval; p.sm2Reps = result.reps
    p.revisionCount = (p.revisionCount || 0) + 1
    p.lastSolved = today()
    p.nextRevision = addDays(today(), result.interval)
    if (quality >= 3) p.status = Math.max(p.status, 2) as Status
    get().logActivity(userId)
    get().saveP(userId, p)
    const labels = ['Blackout','Wrong','Hard','Correct','Easy','Perfect']
    toast.info(`SM-2: "${labels[quality]}" — next review in ${result.interval}d (EF: ${result.ef.toFixed(1)})`)
  },

  markRevDone: (userId, problemId) => {
    const p = { ...get().getP(problemId) }
    if (p.status < 2) { toast.warning('Mark as Solved first!'); return }
    const result = sm2(4, { ef: p.sm2Ef, interval: p.sm2Interval, reps: p.sm2Reps })
    p.sm2Ef = result.ef; p.sm2Interval = result.interval; p.sm2Reps = result.reps
    p.revisionCount = (p.revisionCount || 0) + 1
    p.lastSolved = today()
    p.nextRevision = addDays(today(), result.interval)
    get().logActivity(userId)
    get().saveP(userId, p)
    toast.success(`Revision #${p.revisionCount} done! Next in ${result.interval}d`)
  },

  markAllRevDue: (userId) => {
    const { progressMap } = get()
    const td = today()
    let count = 0
    const updated = { ...progressMap }
    Object.entries(updated).forEach(([id, p]) => {
      if (p.nextRevision && p.nextRevision <= td && p.status >= 2) {
        const result = sm2(4, { ef: p.sm2Ef, interval: p.sm2Interval, reps: p.sm2Reps })
        const np = { ...p, sm2Ef: result.ef, sm2Interval: result.interval, sm2Reps: result.reps,
          revisionCount: (p.revisionCount || 0) + 1, lastSolved: td,
          nextRevision: addDays(td, result.interval) }
        updated[id] = np
        get().saveP(userId, np)
        count++
      }
    })
    if (count > 0) {
      set({ progressMap: updated })
      get().logActivity(userId)
      toast.success(`${count} revision(s) marked done!`)
    } else {
      toast.info('No revisions due today')
    }
  },

  updateProgress: (userId, id, updates) => {
    const p = { ...get().getP(id), ...updates }
    if (p.status >= 2 && !p.lastSolved) { p.lastSolved = today(); get().logActivity(userId) }
    if (p.status >= 2 && !p.nextRevision)
      p.nextRevision = addDays(today(), p.sm2Interval || revDays(p.revisionCount))
    get().saveP(userId, p)
    toast.success('Progress saved ✓')
  },

  resetOne: (userId, id) => {
    const p = DEFAULT_PROGRESS(id)
    set((s) => ({ progressMap: { ...s.progressMap, [id]: p } }))
    supabase.from('problem_progress').delete().eq('user_id', userId).eq('problem_id', id)
    toast.info('Progress reset')
  },

  logActivity: async (userId) => {
    const td = today()
    const current = get().activityMap[td] || 0
    const newCount = current + 1
    set((s) => ({ activityMap: { ...s.activityMap, [td]: newCount } }))
    await supabase.from('activity_log')
      .upsert({ user_id: userId, date: td, count: newCount }, { onConflict: 'user_id,date' })
  },
}))
