import { useState, useEffect } from 'react'
import { useProgressStore } from '../../stores/progressStore'
import { useUIStore } from '../../stores/uiStore'
import { useAuthStore } from '../../stores/authStore'
import { PROBLEM_MAP, PROBLEMS } from '../../data/problems'
import { GFG_SLUGS } from '../../data/gfgSlugs'
import { today, addDays, revDays } from '../../lib/sm2'
import { LC_BASE, GFG_BASE, STATUS_LABEL } from '../../types'
import { X } from 'lucide-react'

const SM2_RATINGS = [
  { q: 0, emoji: '😵', label: 'Blackout', cls: 'border-red-400 text-red-600 bg-red-50 dark:bg-red-950' },
  { q: 1, emoji: '😓', label: 'Wrong', cls: 'border-orange-400 text-orange-600 bg-orange-50 dark:bg-orange-950' },
  { q: 2, emoji: '😐', label: 'Hard', cls: 'border-yellow-400 text-yellow-600 bg-yellow-50 dark:bg-yellow-950' },
  { q: 3, emoji: '🙂', label: 'Correct', cls: 'border-green-400 text-green-700 bg-green-50 dark:bg-green-950' },
  { q: 4, emoji: '😊', label: 'Easy', cls: 'border-blue-400 text-blue-600 bg-blue-50 dark:bg-blue-950' },
  { q: 5, emoji: '🤩', label: 'Perfect', cls: 'border-purple-400 text-purple-600 bg-purple-50 dark:bg-purple-950' },
]

export default function EditModal() {
  const { editModalId, isAddModal, closeModal } = useUIStore()
  const { getP, updateProgress, rateSM2 } = useProgressStore()
  const { user } = useAuthStore()

  const problem = editModalId ? PROBLEM_MAP.get(editModalId) : null
  const pr = editModalId ? getP(editModalId) : null
  const gfgSlug = problem ? GFG_SLUGS[problem.id as keyof typeof GFG_SLUGS] : undefined

  const [form, setForm] = useState({
    status: 0, confidence: 0, timeTaken: '', attempts: 0, pattern: '',
    lastSolved: '', nextRevision: '', revisionCount: 0, notes: '', code: '',
    // add fields
    name: '', topic: '', difficulty: 'Medium', source: 'LeetCode', lcSlug: '',
  })
  const [activeTab, setActiveTab] = useState<'progress' | 'code'>('progress')

  useEffect(() => {
    if (!editModalId) return
    if (pr && !isAddModal) {
      setForm(f => ({
        ...f, status: pr.status, confidence: pr.confidence, timeTaken: pr.timeTaken,
        attempts: pr.attempts, pattern: pr.pattern, lastSolved: pr.lastSolved,
        nextRevision: pr.nextRevision, revisionCount: pr.revisionCount,
        notes: pr.notes, code: pr.code,
      }))
    } else {
      setForm({ status: 0, confidence: 0, timeTaken: '', attempts: 0, pattern: '', lastSolved: '', nextRevision: '', revisionCount: 0, notes: '', code: '', name: '', topic: '', difficulty: 'Medium', source: 'LeetCode', lcSlug: '' })
    }
    setActiveTab('progress')
  }, [editModalId])

  if (!editModalId) return null

  const set = (k: string, v: string | number) => setForm(f => ({ ...f, [k]: v }))

  const autoRevision = () => {
    const base = form.lastSolved || today()
    const interval = pr?.sm2Interval ?? revDays(form.revisionCount)
    set('nextRevision', addDays(base, interval))
  }

  const save = () => {
    if (!editModalId || !user) return
    if (isAddModal) {
      if (!form.name.trim() || !form.topic.trim()) { alert('Name and Topic are required'); return }
      PROBLEMS.push({ id: editModalId, topic: form.topic, name: form.name, difficulty: form.difficulty as 'Easy'|'Medium'|'Hard', source: form.source, tags: [form.source], lcSlug: form.lcSlug })
    }
    updateProgress(user.id, editModalId, {
      problemId: editModalId, status: form.status as 0|1|2|3, confidence: form.confidence,
      timeTaken: form.timeTaken, attempts: form.attempts, pattern: form.pattern,
      lastSolved: form.lastSolved, nextRevision: form.nextRevision, revisionCount: form.revisionCount,
      notes: form.notes, code: form.code,
    })
    closeModal()
  }

  const rate = (q: number) => { if (editModalId && user) { rateSM2(user.id, editModalId, q); closeModal() } }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={e => { if (e.target === e.currentTarget) closeModal() }}>
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 w-full max-w-xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl fade-in">
        {/* Header */}
        <div className="px-5 pt-5 pb-3 border-b border-gray-100 dark:border-gray-800 flex-shrink-0">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <h2 className="font-bold text-gray-900 dark:text-white text-sm leading-tight">{isAddModal ? '➕ Add Custom Problem' : `✏️ ${problem?.name ?? editModalId}`}</h2>
              {!isAddModal && problem && (
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-[10.5px] text-gray-400">{problem.topic} · {problem.difficulty} · {problem.source}</p>
                  {problem.lcSlug && <a href={LC_BASE + problem.lcSlug + '/'} target="_blank" rel="noopener" className="lc-badge">LC ↗</a>}
                  {gfgSlug && <a href={GFG_BASE + gfgSlug + '/1'} target="_blank" rel="noopener" className="gfg-badge">GFG ↗</a>}
                </div>
              )}
            </div>
            <button onClick={closeModal} className="btn btn-ghost p-1.5 flex-shrink-0"><X size={16} /></button>
          </div>
          <div className="flex gap-3 mt-3 border-b border-gray-100 dark:border-gray-800 -mb-3">
            {(['progress', 'code'] as const).map(t => (
              <button key={t} onClick={() => setActiveTab(t)}
                className={`pb-2 text-xs font-semibold capitalize border-b-2 transition-colors ${activeTab === t ? 'border-blue-500 text-blue-700 dark:text-blue-400' : 'border-transparent text-gray-400 hover:text-gray-600'}`}>
                {t === 'progress' ? '📊 Progress' : '💻 My Solution'}
              </button>
            ))}
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* ADD-ONLY FIELDS */}
          {isAddModal && (
            <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-xl p-4 space-y-3">
              <p className="text-[10.5px] font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wider">Problem Details</p>
              <div className="space-y-2">
                <div><label className="form-label">Problem Name <span className="text-red-500">*</span></label><input className="form-input" value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. Two Sum" autoFocus /></div>
                <div><label className="form-label">Topic <span className="text-red-500">*</span></label><input className="form-input" value={form.topic} onChange={e => set('topic', e.target.value)} placeholder="e.g. Arrays - Medium" /></div>
                <div className="grid grid-cols-2 gap-2">
                  <div><label className="form-label">Difficulty</label>
                    <select className="form-input" value={form.difficulty} onChange={e => set('difficulty', e.target.value)}>
                      <option>Easy</option><option>Medium</option><option>Hard</option>
                    </select>
                  </div>
                  <div><label className="form-label">Source</label>
                    <select className="form-input" value={form.source} onChange={e => set('source', e.target.value)}>
                      <option value="LeetCode">LeetCode</option><option value="Google">Google</option><option value="Amazon">Amazon</option><option value="A2Z">A2Z</option>
                    </select>
                  </div>
                </div>
                <div><label className="form-label">LeetCode Slug <span className="text-gray-300 font-normal">(e.g. two-sum)</span></label><input className="form-input font-mono text-xs" value={form.lcSlug} onChange={e => set('lcSlug', e.target.value)} placeholder="two-sum" /></div>
              </div>
            </div>
          )}

          {activeTab === 'progress' && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="form-label">Status</label>
                  <select className="form-input" value={form.status} onChange={e => set('status', parseInt(e.target.value))}>
                    {Object.entries(STATUS_LABEL).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                  </select>
                </div>
                <div><label className="form-label">Confidence</label>
                  <select className="form-input" value={form.confidence} onChange={e => set('confidence', parseInt(e.target.value))}>
                    {[0,1,2,3,4,5].map(n => <option key={n} value={n}>{n} {'★'.repeat(n)}</option>)}
                  </select>
                </div>
                <div><label className="form-label">Time Taken</label><input className="form-input" value={form.timeTaken} onChange={e => set('timeTaken', e.target.value)} placeholder="25 min" /></div>
                <div><label className="form-label">Attempts</label><input type="number" className="form-input" value={form.attempts} onChange={e => set('attempts', parseInt(e.target.value) || 0)} min={0} /></div>
              </div>
              <div><label className="form-label">Pattern / Approach</label><input className="form-input" value={form.pattern} onChange={e => set('pattern', e.target.value)} placeholder="Sliding Window, BFS, DP…" /></div>
              <div className="grid grid-cols-3 gap-3">
                <div><label className="form-label">Last Solved</label><input type="date" className="form-input" value={form.lastSolved} onChange={e => set('lastSolved', e.target.value)} /></div>
                <div>
                  <div className="flex items-center justify-between mb-1"><label className="form-label mb-0">Next Revision</label><button onClick={autoRevision} className="text-[9px] text-blue-600 dark:text-blue-400 hover:underline">Auto-set</button></div>
                  <input type="date" className="form-input" value={form.nextRevision} onChange={e => set('nextRevision', e.target.value)} />
                </div>
                <div><label className="form-label">Rev Count</label><input type="number" className="form-input" value={form.revisionCount} onChange={e => set('revisionCount', parseInt(e.target.value) || 0)} min={0} /></div>
              </div>
              <div><label className="form-label">Notes / Key Insights</label><textarea className="form-input resize-none" rows={3} value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="Key observations, edge cases, complexity…" /></div>

              {/* SM-2 Rating */}
              {!isAddModal && (
                <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3">
                  <p className="text-[10.5px] font-bold text-gray-400 uppercase tracking-wider mb-2">⚡ Rate Your Recall (SM-2 — auto-saves)</p>
                  <div className="grid grid-cols-3 gap-1.5">
                    {SM2_RATINGS.map(({ q, emoji, label, cls }) => (
                      <button key={q} onClick={() => rate(q)}
                        className={`flex flex-col items-center gap-0.5 py-2 rounded-lg border-2 font-semibold text-xs cursor-pointer transition-all hover:scale-105 ${cls}`}>
                        <span className="text-base">{emoji}</span>
                        <span>{q} – {label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {activeTab === 'code' && (
            <div>
              <label className="form-label">My Solution Code</label>
              <textarea className="form-input font-mono text-xs leading-relaxed resize-none w-full" rows={16}
                value={form.code} onChange={e => set('code', e.target.value)}
                placeholder="// Paste your accepted solution here…&#10;// Language, complexity, key notes" />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-gray-100 dark:border-gray-800 flex justify-end gap-2 flex-shrink-0">
          <button onClick={closeModal} className="btn">Cancel</button>
          <button onClick={save} className="btn btn-primary">Save Changes</button>
        </div>
      </div>
    </div>
  )
}
