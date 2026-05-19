import { useState } from 'react'
import { PROBLEMS } from '../../data/problems'
import { GFG_SLUGS } from '../../data/gfgSlugs'
import { useProgressStore } from '../../stores/progressStore'
import { useUIStore } from '../../stores/uiStore'
import { useAuthStore } from '../../stores/authStore'
import { LC_BASE, GFG_BASE, STATUS_LABEL, STATUS_BG } from '../../types'
import { DiffBadge, CompanyBadge } from '../ui/BrandLogos'
import { ChevronDown, ChevronRight } from 'lucide-react'

const PATTERN_GROUPS = [
  { name: 'Array & Hashing', icon: '🔢', topics: ['Basics - Math','Basics - Hashing','Arrays - Easy','Arrays - Medium','Arrays - Hard','Array & String - Advanced','High Frequency Classics'] },
  { name: 'Sliding Window', icon: '🪟', topics: ['Sliding Window & Two Pointer','Sliding Window - Advanced'] },
  { name: 'Binary Search', icon: '🔍', topics: ['Binary Search - 1D','Binary Search - Search Space','Binary Search - 2D'] },
  { name: 'Stack & Monotonic Stack', icon: '📚', topics: ['Stack & Queue - Learning','Stack & Queue - Monotonic','Stack & Queue - Implementation'] },
  { name: 'Linked List', icon: '🔗', topics: ['Linked List - Easy','Linked List - Medium','Linked List - Hard'] },
  { name: 'Strings & KMP', icon: '📝', topics: ['Strings - Basic','Strings - Advanced'] },
  { name: 'Recursion & Backtracking', icon: '🔄', topics: ['Basics - Recursion','Recursion & Backtracking'] },
  { name: 'Sorting', icon: '🔃', topics: ['Sorting'] },
  { name: 'Heap / Priority Queue', icon: '⛰️', topics: ['Heaps','Heap - Advanced'] },
  { name: 'Greedy', icon: '💰', topics: ['Greedy'] },
  { name: 'Bit Manipulation', icon: '⚡', topics: ['Bit Manipulation'] },
  { name: 'Trees', icon: '🌲', topics: ['Binary Trees - Traversals','Binary Trees - Medium & Hard','Trees - Advanced'] },
  { name: 'Binary Search Trees', icon: '🌳', topics: ['Binary Search Trees'] },
  { name: 'Graphs — BFS & DFS', icon: '🕸️', topics: ['Graphs - BFS & DFS','Advanced Graphs'] },
  { name: 'Topological Sort', icon: '📊', topics: ['Graphs - Topological Sort'] },
  { name: 'Shortest Path & MST', icon: '🛣️', topics: ['Graphs - Shortest Paths','Graphs - MST & DSU'] },
  { name: 'Dynamic Programming', icon: '🧩', topics: ['DP - 1D','DP - 2D & Grid','DP - Subsequences','DP - Strings','DP - Stocks','DP - LIS','DP - MCM & Partitions','Advanced DP'] },
  { name: 'Trie', icon: '🌱', topics: ['Tries'] },
  { name: 'Design & System', icon: '🏗️', topics: ['Design Problems'] },
  { name: 'Intervals & Scheduling', icon: '📅', topics: ['Intervals & Scheduling'] },
  { name: 'Math & Geometry', icon: '📐', topics: ['Geometry & Math'] },
  { name: 'Recent & Company Mix', icon: '🏢', topics: ['Meta - Specific','Microsoft - Specific','Recent Google 2024-26','Recent Amazon 2024-26','Recent Meta 2024-26','Recent Microsoft 2024-26','Recent Interviews 2024-26'] },
]

export default function PatternView() {
  const { progressMap, cycleStatus } = useProgressStore()
  const { openEdit } = useUIStore()
  const { user } = useAuthStore()
  const [openGroups, setOpenGroups] = useState<Set<string>>(new Set())

  const toggle = (name: string) => setOpenGroups(s => { const n = new Set(s); n.has(name) ? n.delete(name) : n.add(name); return n })

  return (
    <div className="p-3 space-y-2">
      {PATTERN_GROUPS.map(group => {
        const problems = PROBLEMS.filter(p => group.topics.includes(p.topic))
        if (!problems.length) return null
        const solved = problems.filter(p => (progressMap[p.id]?.status ?? 0) >= 2).length
        const pct = Math.round(solved / problems.length * 100)
        const isOpen = openGroups.has(group.name)

        return (
          <div key={group.name} className="card overflow-hidden">
            <button onClick={() => toggle(group.name)} className="w-full px-4 py-3 flex items-center justify-between bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-750 transition-colors text-left">
              <div className="flex items-center gap-2.5">
                <span className="text-lg">{group.icon}</span>
                <span className="font-semibold text-sm text-gray-800 dark:text-gray-200">{group.name}</span>
                <span className="text-xs text-gray-400">{problems.length} problems</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-gray-500">{solved}/{problems.length}</span>
                  <div className="w-16 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${pct >= 80 ? 'bg-green-500' : pct >= 50 ? 'bg-amber-500' : 'bg-neutral-400'}`} style={{ width: `${pct}%` }} />
                  </div>
                  <span className="text-xs font-semibold text-gray-400">{pct}%</span>
                </div>
                {isOpen ? <ChevronDown size={15} className="text-gray-400" /> : <ChevronRight size={15} className="text-gray-400" />}
              </div>
            </button>

            {isOpen && (
              <div className="divide-y divide-gray-100 dark:divide-gray-800">
                {problems.map(p => {
                  const pr = progressMap[p.id]
                  const status = pr?.status ?? 0
                  const gfgSlug = GFG_SLUGS[p.id as keyof typeof GFG_SLUGS]
                  return (
                    <div key={p.id} className={`px-4 py-2.5 flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 group ${status === 3 ? 'bg-purple-50/30 dark:bg-purple-950/10' : status === 2 ? 'bg-green-50/30 dark:bg-green-950/10' : ''}`}>
                      <div className="flex-1 min-w-0">
                        <span className="text-xs font-medium text-gray-800 dark:text-gray-200">{p.name}</span>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <DiffBadge diff={p.difficulty} />
                      <div className="flex gap-1">{(['Google','Amazon','Meta','Microsoft'] as const).filter(c=>p.tags.includes(c)).map(c=><CompanyBadge key={c} company={c}/>)}</div>
                        {p.lcSlug && <a href={LC_BASE + p.lcSlug + '/'} target="_blank" rel="noopener" className="lc-badge opacity-0 group-hover:opacity-100 transition-opacity">LC</a>}
                        {gfgSlug && <a href={GFG_BASE + gfgSlug + '/1'} target="_blank" rel="noopener" className="gfg-badge opacity-0 group-hover:opacity-100 transition-opacity">GFG</a>}
                        <button onClick={() => user && cycleStatus(user.id, p.id)}
                          className={`text-[10.5px] font-semibold px-2 py-0.5 rounded-md border cursor-pointer transition-all hover:opacity-80 ${STATUS_BG[status as keyof typeof STATUS_BG]}`}>
                          {STATUS_LABEL[status as keyof typeof STATUS_LABEL]}
                        </button>
                        <button onClick={() => openEdit(p.id)} className="btn btn-sm py-0.5 opacity-0 group-hover:opacity-100 transition-opacity text-[10.5px]">✏️</button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
