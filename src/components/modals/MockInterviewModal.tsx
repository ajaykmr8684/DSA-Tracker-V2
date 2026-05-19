import { useState, useEffect, useRef } from 'react'
import { useUIStore } from '../../stores/uiStore'
import { useProgressStore } from '../../stores/progressStore'
import { useAuthStore } from '../../stores/authStore'
import { PROBLEMS } from '../../data/problems'
import { GFG_SLUGS } from '../../data/gfgSlugs'
import { LC_BASE, GFG_BASE, STATUS_LABEL } from '../../types'
import type { Problem } from '../../types'
import { X, Clock, CheckCircle2, Circle, XCircle } from 'lucide-react'

type Stage = 'setup' | 'active' | 'result'

const DURATIONS = [30, 45, 60, 90]
const COMPANIES = ['', 'Google', 'Amazon', 'Meta', 'Microsoft']
const DIFFS = ['mixed', 'Easy', 'Medium', 'Hard']

function OptionBtn({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick}
      className={`px-4 py-2 rounded-lg border-2 text-sm font-semibold transition-all ${selected
        ? 'border-blue-500 bg-blue-50 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
        : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
      }`}>
      {label}
    </button>
  )
}

export default function MockInterviewModal() {
  const { mockOpen, closeMock } = useUIStore()
  const { progressMap, updateProgress } = useProgressStore()
  const { user } = useAuthStore()

  const [stage, setStage] = useState<Stage>('setup')
  const [duration, setDuration] = useState(45)
  const [company, setCompany] = useState('')
  const [diff, setDiff] = useState('mixed')
  const [problems, setProblems] = useState<Problem[]>([])
  const [statuses, setStatuses] = useState<Record<string, number>>({})
  const [timeLeft, setTimeLeft] = useState(0)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  // Refs to avoid stale closures in timer callback
  const statusesRef = useRef<Record<string, number>>({})
  const problemsRef = useRef<Problem[]>([])

  useEffect(() => {
    if (!mockOpen) { setStage('setup'); clearInterval(timerRef.current!) }
  }, [mockOpen])

  useEffect(() => {
    return () => clearInterval(timerRef.current!)
  }, [])

  if (!mockOpen) return null

  const startMock = () => {
    let pool = PROBLEMS.filter(p => (progressMap[p.id]?.status ?? 0) < 3)
    if (company) pool = pool.filter(p => p.tags.includes(company))
    if (diff !== 'mixed') pool = pool.filter(p => p.difficulty === diff)
    if (pool.length < 3) pool = PROBLEMS

    const shuffled = [...pool].sort(() => Math.random() - .5)
    const count = duration <= 30 ? 2 : duration <= 45 ? 3 : 4
    const picked = shuffled.slice(0, count)

    const initialStatuses = Object.fromEntries(picked.map(p => [p.id, 0]))
    setProblems(picked)
    setStatuses(initialStatuses)
    problemsRef.current = picked
    statusesRef.current = initialStatuses
    setTimeLeft(duration * 60)
    setStage('active')

    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(timerRef.current!)
          // Use refs to avoid stale closure
          submitMockWithRefs()
          return 0
        }
        return t - 1
      })
    }, 1000)
  }

  const doSaveResults = (probs: Problem[], stats: Record<string, number>) => {
    if (user) {
      probs.forEach(p => {
        const s = stats[p.id] ?? 0
        if (s > 0) updateProgress(user.id, p.id, { status: s as 0|1|2|3, lastSolved: new Date().toISOString().slice(0,10) })
      })
    }
    setStage('result')
  }

  // Uses refs — safe to call from stale timer callback
  const submitMockWithRefs = () => {
    clearInterval(timerRef.current!)
    doSaveResults(problemsRef.current, statusesRef.current)
  }

  // Normal submit from button — uses current state
  const submitMock = () => {
    clearInterval(timerRef.current!)
    doSaveResults(problems, statuses)
  }

  // Keep ref in sync whenever statuses changes
  const handleStatusChange = (id: string, val: number) => {
    const next = { ...statuses, [id]: val }
    setStatuses(next)
    statusesRef.current = next
  }

  const mm = String(Math.floor(timeLeft / 60)).padStart(2, '0')
  const ss = String(timeLeft % 60).padStart(2, '0')
  const urgent = timeLeft < 300 && timeLeft > 0
  const solved = problems.filter(p => (statuses[p.id] ?? 0) === 2).length
  const attempted = problems.filter(p => (statuses[p.id] ?? 0) === 1).length

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4" onClick={e => { if (e.target === e.currentTarget) closeMock() }}>
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh]">

        {/* SETUP STAGE */}
        {stage === 'setup' && (
          <>
            <div className="px-6 pt-6 pb-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-black text-gray-900 dark:text-white">🎯 Mock Interview</h2>
                <p className="text-xs text-gray-400 mt-0.5">Simulate a real coding interview</p>
              </div>
              <button onClick={closeMock} className="btn btn-ghost p-1.5"><X size={16} /></button>
            </div>
            <div className="p-6 space-y-5 overflow-y-auto">
              <div>
                <p className="form-label mb-2">Duration</p>
                <div className="flex gap-2 flex-wrap">{DURATIONS.map(d => <OptionBtn key={d} label={`${d} min`} selected={duration === d} onClick={() => setDuration(d)} />)}</div>
              </div>
              <div>
                <p className="form-label mb-2">Company Focus</p>
                <div className="flex gap-2 flex-wrap">{COMPANIES.map(c => <OptionBtn key={c} label={c || 'Any'} selected={company === c} onClick={() => setCompany(c)} />)}</div>
              </div>
              <div>
                <p className="form-label mb-2">Difficulty</p>
                <div className="flex gap-2 flex-wrap">{DIFFS.map(d => <OptionBtn key={d} label={d === 'mixed' ? 'Mixed' : d} selected={diff === d} onClick={() => setDiff(d)} />)}</div>
              </div>
              <div className="bg-blue-50 dark:bg-blue-950 border border-blue-100 dark:border-blue-800 rounded-xl p-3 text-xs text-blue-800 dark:text-blue-300">
                💡 You'll get {duration <= 30 ? 2 : duration <= 45 ? 3 : 4} problems weighted toward your weak areas. Results auto-save to your tracker.
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-800 flex gap-3">
              <button onClick={closeMock} className="btn flex-1 justify-center">Cancel</button>
              <button onClick={startMock} className="btn btn-primary flex-1 justify-center gap-2"><Clock size={15} />Start Interview</button>
            </div>
          </>
        )}

        {/* ACTIVE STAGE */}
        {stage === 'active' && (
          <>
            <div className="px-6 pt-5 pb-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-gray-900 dark:text-white">Mock Interview {company && `· ${company}`}</h2>
                <p className="text-xs text-gray-400">{problems.length} problems · {diff === 'mixed' ? 'Mixed difficulty' : diff}</p>
              </div>
              <div className={`text-3xl font-black tabular-nums ${urgent ? 'text-red-500 animate-pulse' : 'text-blue-600 dark:text-blue-400'}`}>
                {mm}:{ss}
              </div>
            </div>
            <div className="p-5 space-y-3 overflow-y-auto flex-1">
              {problems.map((p, i) => {
                const gfg = GFG_SLUGS[p.id as keyof typeof GFG_SLUGS]
                const s = statuses[p.id] ?? 0
                return (
                  <div key={p.id} className="border border-gray-200 dark:border-gray-700 rounded-xl p-4 flex items-start gap-4">
                    <span className="text-2xl font-black text-gray-200 dark:text-gray-700 w-8 flex-shrink-0 text-center">{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-gray-900 dark:text-white text-sm mb-1">{p.name}</div>
                      <div className="flex items-center gap-2 mb-3">
                        <span className={`badge-${p.difficulty.toLowerCase()}`}>{p.difficulty}</span>
                        <span className="text-xs text-gray-400">{p.topic.split(' - ').pop()}</span>
                        {p.lcSlug && <a href={LC_BASE + p.lcSlug + '/'} target="_blank" rel="noopener" className="lc-badge">LC ↗</a>}
                        {gfg && <a href={GFG_BASE + gfg + '/1'} target="_blank" rel="noopener" className="gfg-badge">GFG ↗</a>}
                      </div>
                      <div className="flex gap-2">
                        {[{v:0,label:'Not done',icon:<Circle size={13}/>},{v:1,label:'Attempted',icon:<XCircle size={13}/>},{v:2,label:'Solved ✓',icon:<CheckCircle2 size={13}/>}].map(opt => (
                          <button key={opt.v} onClick={() => handleStatusChange(p.id, opt.v)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${s === opt.v
                              ? opt.v === 0 ? 'border-gray-400 bg-gray-100 text-gray-700 dark:bg-gray-800' : opt.v === 1 ? 'border-amber-400 bg-amber-50 text-amber-700 dark:bg-amber-950' : 'border-green-500 bg-green-50 text-green-700 dark:bg-green-950'
                              : 'border-gray-200 dark:border-gray-700 text-gray-400 hover:border-gray-300'}`}>
                            {opt.icon}{opt.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
            <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-800 flex gap-3">
              <button onClick={closeMock} className="btn btn-danger">✕ Quit</button>
              <button onClick={submitMock} className="btn btn-primary flex-1 justify-center">Submit & See Results</button>
            </div>
          </>
        )}

        {/* RESULT STAGE */}
        {stage === 'result' && (
          <>
            <div className="px-6 pt-6 pb-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
              <h2 className="text-lg font-black text-gray-900 dark:text-white">Interview Results 📊</h2>
              <button onClick={closeMock} className="btn btn-ghost p-1.5"><X size={16} /></button>
            </div>
            <div className="p-6 overflow-y-auto space-y-4">
              <div className="text-center py-4">
                <div className="text-5xl mb-3">{solved === problems.length ? '🏆' : solved > 0 ? '✅' : '💪'}</div>
                <div className="text-xl font-black text-gray-900 dark:text-white">{solved === problems.length ? 'Perfect!' : solved > 0 ? 'Good effort!' : 'Keep practicing!'}</div>
                <div className="text-sm text-gray-400 mt-1">{solved}/{problems.length} solved · {attempted} attempted</div>
                <div className="text-xs text-green-600 dark:text-green-400 mt-1 font-medium">✓ Results saved to your tracker</div>
              </div>
              {problems.map((p, i) => {
                const s = statuses[p.id] ?? 0
                return (
                  <div key={p.id} className="flex items-center gap-3 p-3 border border-gray-200 dark:border-gray-700 rounded-xl">
                    <span className="text-xl">{s === 2 ? '✅' : s === 1 ? '🟡' : '❌'}</span>
                    <div className="flex-1"><div className="text-sm font-semibold text-gray-800 dark:text-gray-200">{i+1}. {p.name}</div><div className="text-xs text-gray-400">{p.difficulty} · {p.topic.split(' - ').pop()}</div></div>
                  </div>
                )
              })}
            </div>
            <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-800">
              <button onClick={closeMock} className="btn btn-primary w-full justify-center">Done</button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
