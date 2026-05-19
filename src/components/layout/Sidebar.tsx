import { useMemo } from 'react'
import { PROBLEMS } from '../../data/problems'
import { useProgressStore } from '../../stores/progressStore'
import { useUIStore } from '../../stores/uiStore'

export default function Sidebar() {
  const { filters, setFilter, sidebarOpen } = useUIStore()
  const { progressMap } = useProgressStore()

  const topicStats = useMemo(() => {
    const map: Record<string, { total: number; solved: number }> = {}
    PROBLEMS.forEach(p => {
      if (!map[p.topic]) map[p.topic] = { total: 0, solved: 0 }
      map[p.topic].total++
      if ((progressMap[p.id]?.status ?? 0) >= 2) map[p.topic].solved++
    })
    return map
  }, [progressMap])

  if (!sidebarOpen) return null

  const totalSolved = Object.values(topicStats).reduce((a, b) => a + b.solved, 0)
  const totalProbs = Object.values(topicStats).reduce((a, b) => a + b.total, 0)
  const overallPct = totalProbs ? Math.round(totalSolved / totalProbs * 100) : 0

  return (
    <aside className="w-52 flex-shrink-0 sticky top-12 h-[calc(100vh-48px)] flex flex-col overflow-hidden fade-in"
      style={{ background: 'var(--bg-sidebar)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)', borderRight: '1px solid var(--border)' }}>

      {/* Header */}
      <div className="px-4 py-3 border-b flex-shrink-0" style={{ borderColor: 'var(--border)' }}>
        <div className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--text-3)' }}>Topics</div>
        <div className="prog-bar"><div className="prog-fill" style={{ width: `${overallPct}%` }} /></div>
        <div className="text-[10px] mt-1 text-right" style={{ color: 'var(--text-3)' }}>{totalSolved}/{totalProbs} overall</div>
      </div>

      {/* Topic list */}
      <div className="overflow-y-auto flex-1 py-1">
        {Object.entries(topicStats).map(([topic, { total, solved }]) => {
          const pct = total ? Math.round(solved / total * 100) : 0
          const active = filters.topic === topic
          const shortName = topic.includes(' - ') ? topic.split(' - ').slice(1).join(' - ') : topic
          const barColor = pct >= 80 ? '#22c55e' : pct >= 50 ? '#f59e0b' : '#a1a1aa'

          return (
            <button key={topic} onClick={() => setFilter('topic', active ? '' : topic)}
              className={`sidebar-item w-full text-left ${active ? 'active' : ''}`}>
              <div className="flex items-center justify-between">
                <span className="sidebar-label text-[11px] font-medium truncate max-w-[130px]"
                  style={{ color: active ? 'var(--accent)' : 'var(--text-2)' }}
                  title={topic}>{shortName}</span>
                <span className="text-[9.5px] flex-shrink-0 ml-1" style={{ color: 'var(--text-3)' }}>{solved}/{total}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="flex-1 h-1 rounded-full" style={{ background: 'var(--border)' }}>
                  <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: barColor, boxShadow: pct > 0 ? `0 0 4px ${barColor}80` : 'none' }} />
                </div>
              </div>
            </button>
          )
        })}
      </div>
    </aside>
  )
}
