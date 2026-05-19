import { useMemo } from 'react'
import { PROBLEMS } from '../../data/problems'
import { useProgressStore } from '../../stores/progressStore'
import { useUIStore } from '../../stores/uiStore'
import { today } from '../../lib/sm2'
import Heatmap from './Heatmap'
import POTD from './POTD'

interface StatCardProps { label: string; value: number | string; sub: string; color: string; glow: string; icon: string; onClick?: () => void }

function StatCard({ label, value, sub, color, glow, icon, onClick }: StatCardProps) {
  return (
    <div onClick={onClick} className={`stat-card fade-up ${onClick ? 'cursor-pointer' : ''}`}
      style={{ animationDelay: '0.05s' }}>
      <div className="glow-blob" style={{ background: glow }} />
      <div className="flex items-start justify-between mb-3">
        <span className="text-lg">{icon}</span>
        <span className="text-[10px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded-md" style={{ color, background: color + '18', border: `1px solid ${color}25` }}>{label}</span>
      </div>
      <div className="text-3xl font-black" style={{ color }}>{value}</div>
      <div className="text-[10.5px] mt-1" style={{ color: 'var(--text-3)' }}>{sub}</div>
    </div>
  )
}

export default function Dashboard() {
  const { progressMap, activityMap } = useProgressStore()
  const { setFilter, setView } = useUIStore()

  const stats = useMemo(() => {
    const td = today()
    let solved = 0, mastered = 0, googleSolved = 0, hardSolved = 0, revDue = 0
    PROBLEMS.forEach(p => {
      const pr = progressMap[p.id]
      if (pr?.status >= 2) {
        solved++
        if (p.tags.includes('Google')) googleSolved++
        if (p.difficulty === 'Hard') hardSolved++
      }
      if (pr?.status === 3) mastered++
      if (pr?.nextRevision && pr.nextRevision <= td) revDue++
    })
    return { total: PROBLEMS.length, solved, mastered, googleSolved, hardSolved, revDue }
  }, [progressMap])

  const streak = useMemo(() => {
    let s = 0; const d = new Date()
    while (true) {
      const ds = d.toISOString().slice(0, 10)
      if ((activityMap[ds] ?? 0) > 0) { s++; d.setDate(d.getDate() - 1) } else break
    }
    return s
  }, [activityMap])

  const readiness = useMemo(() => {
    const total = PROBLEMS.length, hardTotal = PROBLEMS.filter(p => p.difficulty === 'Hard').length
    let solved = 0, hardSolved = 0, confSum = 0, confCnt = 0, rev = 0
    PROBLEMS.forEach(p => {
      const pr = progressMap[p.id]
      if (pr?.status >= 2) { solved++; if (p.difficulty === 'Hard') hardSolved++ }
      if (pr?.status === 3) rev++
      if ((pr?.confidence ?? 0) > 0) { confSum += pr!.confidence; confCnt++ }
    })
    return Math.min(100, Math.round((solved / total) * 55 + (hardTotal ? (hardSolved / hardTotal) * 20 : 0) + (confCnt ? (confSum / (confCnt * 5)) * 15 : 0) + (rev / Math.max(solved, 1)) * 10))
  }, [progressMap])

  const pct = stats.total ? Math.round(stats.solved / stats.total * 100) : 0
  const readColor = readiness < 30 ? '#ef4444' : readiness < 60 ? '#f59e0b' : '#22c55e'

  return (
    <div className="border-b" style={{ borderColor: 'var(--border)', background: 'transparent' }}>
      {/* ── STAT CARDS ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 p-4">
        <StatCard label="Total" value={stats.total} sub="Problems loaded" color="#2563eb" glow="rgba(37,99,235,0.28)" icon="📚" />
        <StatCard label="Solved" value={stats.solved} sub="Status ≥ 2" color="#4ade80" glow="rgba(34,197,94,0.4)" icon="✅" />
        <StatCard label="Mastered" value={stats.mastered} sub="Interview ready" color="#a78bfa" glow="rgba(139,92,246,0.4)" icon="⭐" />
        <StatCard label="Google" value={stats.googleSolved} sub="Google-tagged" color="#60a5fa" glow="rgba(59,130,246,0.4)" icon="🔵" />
        <StatCard label="Hard" value={stats.hardSolved} sub="Hard difficulty" color="#f87171" glow="rgba(239,68,68,0.4)" icon="🔴" />
        <StatCard label="Rev Due" value={stats.revDue} sub="Tap to review" color={stats.revDue > 0 ? '#fb923c' : '#6b7280'} glow={stats.revDue > 0 ? 'rgba(251,146,60,0.4)' : 'transparent'} icon="⏰"
          onClick={() => { setFilter('tag', 'revision'); setView('table') }} />
      </div>

      {/* ── PROGRESS BAR ── */}
      <div className="flex items-center gap-4 px-4 pb-3">
        <span className="text-[10.5px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-3)' }}>Progress</span>
        <div className="prog-bar flex-1"><div className="prog-fill" style={{ width: `${pct}%` }} /></div>
        <span className="text-sm font-black gradient-text">{pct}%</span>
        <span className="text-xs" style={{ color: 'var(--text-3)' }}>{stats.solved}/{stats.total}</span>
      </div>

      {/* ── ROW 2: STREAK + POTD + READINESS ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 px-4 pb-4">
        {/* Streak */}
        <div className="stat-card flex items-center gap-4">
          <div className="text-4xl" style={{ filter: streak > 0 ? 'drop-shadow(0 0 12px rgba(251,191,36,0.6))' : 'none', animation: streak > 0 ? 'bouncy 2s ease-in-out infinite' : 'none' }}>🔥</div>
          <div>
            <div className="text-2xl font-black" style={{ color: streak > 0 ? '#fbbf24' : 'var(--text-3)' }}>{streak}d</div>
            <div className="text-[10.5px]" style={{ color: 'var(--text-3)' }}>Current Streak</div>
          </div>
        </div>
        {/* POTD */}
        <POTD />
        {/* Readiness */}
        <div className="stat-card">
          <div className="glow-blob" style={{ background: readColor + '60' }} />
          <div className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--text-3)' }}>Interview Readiness</div>
          <div className="flex items-baseline gap-1 mb-2">
            <span className="text-3xl font-black" style={{ color: readColor }}>{readiness}</span>
            <span className="text-sm" style={{ color: 'var(--text-3)' }}>/100</span>
          </div>
          <div className="prog-bar mb-1.5"><div style={{ height: '100%', width: `${readiness}%`, borderRadius: 99, background: readColor, boxShadow: `0 0 8px ${readColor}60`, transition: 'width 0.7s' }} /></div>
          <div className="text-[10.5px]" style={{ color: 'var(--text-3)' }}>
            {readiness < 30 ? '💪 Keep grinding!' : readiness < 60 ? '📈 Making progress!' : readiness < 80 ? '🎯 Almost ready!' : '🏆 Interview ready!'}
          </div>
        </div>
      </div>

      {/* ── HEATMAP ── */}
      <Heatmap />
    </div>
  )
}
