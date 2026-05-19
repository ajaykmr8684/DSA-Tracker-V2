import { useMemo } from 'react'
import { PROBLEMS } from '../../data/problems'
import { useProgressStore } from '../../stores/progressStore'
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, Tooltip, LineChart, Line, CartesianGrid
} from 'recharts'

const CATEGORY_TOPICS: Record<string, string[]> = {
  'Arrays': ['Arrays - Easy', 'Arrays - Medium', 'Arrays - Hard'],
  'Strings': ['Strings - Basic', 'Strings - Advanced'],
  'Trees': ['Binary Trees - Traversals', 'Binary Trees - Medium & Hard', 'Binary Search Trees', 'Trees - Advanced'],
  'Graphs': ['Graphs - BFS & DFS', 'Graphs - Topological Sort', 'Graphs - Shortest Paths', 'Graphs - MST & DSU', 'Advanced Graphs'],
  'DP': ['DP - 1D', 'DP - 2D & Grid', 'DP - Subsequences', 'DP - Strings', 'DP - Stocks', 'DP - LIS', 'DP - MCM & Partitions', 'Advanced DP'],
  'Design': ['Design Problems', 'Stack & Queue - Implementation', 'Heaps'],
}

export default function AnalyticsView() {
  const { progressMap, activityMap } = useProgressStore()

  const radarData = useMemo(() =>
    Object.entries(CATEGORY_TOPICS).map(([cat, topics]) => {
      const probs = PROBLEMS.filter(p => topics.includes(p.topic))
      const solved = probs.filter(p => (progressMap[p.id]?.status ?? 0) >= 2).length
      return { category: cat, score: probs.length ? Math.round(solved / probs.length * 100) : 0, fullMark: 100 }
    }), [progressMap])

  const diffData = useMemo(() =>
    (['Easy', 'Medium', 'Hard'] as const).map(d => {
      const total = PROBLEMS.filter(p => p.difficulty === d).length
      const solved = PROBLEMS.filter(p => p.difficulty === d && (progressMap[p.id]?.status ?? 0) >= 2).length
      return { name: d, Solved: solved, Total: total, Remaining: total - solved }
    }), [progressMap])

  const velocityData = useMemo(() => {
    const days = 30
    return Array.from({ length: days }, (_, i) => {
      const d = new Date(); d.setDate(d.getDate() - (days - 1 - i))
      const ds = d.toISOString().slice(0, 10)
      return { day: `${d.getMonth() + 1}/${d.getDate()}`, solved: activityMap[ds] ?? 0 }
    })
  }, [activityMap])

  const topicData = useMemo(() => {
    const map: Record<string, { solved: number; total: number }> = {}
    PROBLEMS.forEach(p => {
      if (!map[p.topic]) map[p.topic] = { solved: 0, total: 0 }
      map[p.topic].total++
      if ((progressMap[p.id]?.status ?? 0) >= 2) map[p.topic].solved++
    })
    return Object.entries(map)
      .map(([topic, { solved, total }]) => ({ topic: topic.split(' - ').pop() ?? topic, pct: total ? Math.round(solved / total * 100) : 0, solved, total }))
      .sort((a, b) => b.pct - a.pct)
  }, [progressMap])

  const confData = useMemo(() => {
    const counts = [0, 0, 0, 0, 0, 0]
    PROBLEMS.forEach(p => counts[progressMap[p.id]?.confidence ?? 0]++)
    return counts.map((count, i) => ({ label: i === 0 ? 'None' : '★'.repeat(i), count }))
  }, [progressMap])

  return (
    <div className="p-4 space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Radar */}
        <div className="card p-4">
          <h3 className="text-sm font-bold text-gray-700 dark:text-gray-200 mb-3">📡 Category Radar</h3>
          <ResponsiveContainer width="100%" height={260}>
            <RadarChart data={radarData} margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
              <PolarGrid />
              <PolarAngleAxis dataKey="category" tick={{ fontSize: 11 }} />
              <Radar name="Score %" dataKey="score" stroke="#4f46e5" fill="#4f46e5" fillOpacity={0.25} />
              <Tooltip formatter={(v) => `${v}%`} />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Difficulty breakdown */}
        <div className="card p-4">
          <h3 className="text-sm font-bold text-gray-700 dark:text-gray-200 mb-3">📊 Difficulty Breakdown</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={diffData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip />
              <Bar dataKey="Solved" fill="#4f46e5" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Remaining" fill="#e5e7eb" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Velocity */}
        <div className="card p-4 md:col-span-2">
          <h3 className="text-sm font-bold text-gray-700 dark:text-gray-200 mb-3">📈 Solving Velocity — Last 30 Days</h3>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={velocityData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="day" tick={{ fontSize: 9 }} interval={4} />
              <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
              <Tooltip />
              <Line type="monotone" dataKey="solved" stroke="#4f46e5" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Topic progress */}
        <div className="card p-4">
          <h3 className="text-sm font-bold text-gray-700 dark:text-gray-200 mb-3">🎯 Topic Progress (Top 20)</h3>
          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
            {topicData.slice(0, 20).map(({ topic, pct, solved, total }) => (
              <div key={topic}>
                <div className="flex justify-between text-xs mb-0.5">
                  <span className="text-gray-600 dark:text-gray-300 truncate max-w-[180px]">{topic}</span>
                  <span className="text-gray-400 flex-shrink-0 ml-2">{solved}/{total}</span>
                </div>
                <div className="h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full transition-all duration-500 ${pct >= 80 ? 'bg-green-500' : pct >= 50 ? 'bg-amber-500' : 'bg-neutral-400'}`} style={{ width: `${pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Confidence */}
        <div className="card p-4">
          <h3 className="text-sm font-bold text-gray-700 dark:text-gray-200 mb-3">⭐ Confidence Distribution</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={confData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="label" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" fill="#4f46e5" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
