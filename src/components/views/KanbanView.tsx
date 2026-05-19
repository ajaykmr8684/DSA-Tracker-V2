import { useMemo } from 'react'
import { PROBLEMS } from '../../data/problems'
import { GFG_SLUGS } from '../../data/gfgSlugs'
import { useProgressStore } from '../../stores/progressStore'
import { useUIStore } from '../../stores/uiStore'
import { useAuthStore } from '../../stores/authStore'
import { LC_BASE, GFG_BASE, STATUS_LABEL } from '../../types'
import { DiffBadge, CompanyBadge } from '../ui/BrandLogos'

const COLS = [
  { status: 0, label: '◻ Not Started', color: 'border-t-gray-400' },
  { status: 1, label: '🟡 Attempted',  color: 'border-t-amber-500' },
  { status: 2, label: '✅ Solved',     color: 'border-t-green-500' },
  { status: 3, label: '⭐ Mastered',   color: 'border-t-purple-500' },
]

export default function KanbanView() {
  const { progressMap, cycleStatus } = useProgressStore()
  const { openEdit, filters } = useUIStore()
  const { user } = useAuthStore()

  const buckets = useMemo(() => {
    const b: Record<number, typeof PROBLEMS> = { 0: [], 1: [], 2: [], 3: [] }
    PROBLEMS.forEach(p => {
      const s = progressMap[p.id]?.status ?? 0
      if (filters.topic && p.topic !== filters.topic) return
      if (filters.difficulty && p.difficulty !== filters.difficulty) return
      if (filters.search) { const q = filters.search.toLowerCase(); if (!p.name.toLowerCase().includes(q)) return }
      b[s].push(p)
    })
    return b
  }, [progressMap, filters])

  return (
    <div className="p-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 items-start">
      {COLS.map(col => (
        <div key={col.status} className={`card border-t-2 ${col.color} flex flex-col max-h-[calc(100vh-280px)]`}>
          <div className="px-3 py-2 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between flex-shrink-0">
            <span className="text-xs font-bold text-gray-600 dark:text-gray-300">{col.label}</span>
            <span className="text-[10px] font-semibold bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 px-1.5 py-0.5 rounded-full">{buckets[col.status].length}</span>
          </div>
          <div className="overflow-y-auto p-2 space-y-2 flex-1">
            {buckets[col.status].length === 0 ? (
              <div className="text-center text-xs text-gray-300 dark:text-gray-600 py-6">Empty</div>
            ) : buckets[col.status].map(p => {
              const gfgSlug = GFG_SLUGS[p.id as keyof typeof GFG_SLUGS]
              return (
                <div key={p.id} onClick={() => openEdit(p.id)}
                  className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-2.5 cursor-pointer hover:border-blue-500 hover:shadow-sm transition-all group">
                  <div className="text-xs font-semibold text-gray-800 dark:text-gray-200 mb-1.5 leading-tight">{p.name}</div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <DiffBadge diff={p.difficulty} />
                    <div className="flex items-center gap-1 ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
                      {(['Google','Amazon','Meta','Microsoft'] as const).filter(c => p.tags.includes(c)).map(c => <CompanyBadge key={c} company={c} />)}
                      {p.lcSlug && <a href={LC_BASE + p.lcSlug + '/'} target="_blank" rel="noopener" className="lc-badge" onClick={e => e.stopPropagation()}>LC</a>}
                      {gfgSlug && <a href={GFG_BASE + gfgSlug + '/1'} target="_blank" rel="noopener" className="gfg-badge" onClick={e => e.stopPropagation()}>GFG</a>}
                    </div>
                  </div>
                  <button onClick={e => { e.stopPropagation(); user && cycleStatus(user.id, p.id) }}
                    className="mt-2 w-full text-[10px] font-medium text-center py-1 rounded border border-gray-200 dark:border-gray-600 hover:border-blue-500 hover:text-blue-700 dark:hover:text-blue-300 transition-colors">
                    → Move to {STATUS_LABEL[((col.status + 1) % 4) as keyof typeof STATUS_LABEL]}
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
