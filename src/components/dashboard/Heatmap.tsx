import { useMemo, useState } from 'react'
import { useProgressStore } from '../../stores/progressStore'

function cellColor(count: number) {
  if (count === 0) return 'bg-gray-100 dark:bg-gray-800'
  if (count === 1) return 'bg-green-200 dark:bg-green-900'
  if (count === 2) return 'bg-green-400 dark:bg-green-700'
  if (count === 3) return 'bg-green-600 dark:bg-green-500'
  return 'bg-green-800 dark:bg-green-400'
}

export default function Heatmap() {
  const { activityMap } = useProgressStore()
  const [tooltip, setTooltip] = useState<{ text: string; x: number; y: number } | null>(null)

  const { weeks, totalThisYear } = useMemo(() => {
    const WEEKS = 26
    const cells: { date: string; count: number }[][] = []
    const now = new Date()
    const start = new Date(now)
    start.setDate(start.getDate() - WEEKS * 7 + 1)
    start.setDate(start.getDate() - start.getDay()) // align to Sunday

    let totalThisYear = 0
    for (let w = 0; w < WEEKS; w++) {
      const col: { date: string; count: number }[] = []
      for (let d = 0; d < 7; d++) {
        const dt = new Date(start)
        dt.setDate(dt.getDate() + w * 7 + d)
        const ds = dt.toISOString().slice(0, 10)
        const count = activityMap[ds] ?? 0
        totalThisYear += count
        col.push({ date: ds, count })
      }
      cells.push(col)
    }
    return { weeks: cells, totalThisYear }
  }, [activityMap])

  return (
    <div className="px-3 pb-3">
      <div className="flex items-center justify-between mb-1.5 text-[10.5px] text-gray-400">
        <span className="font-medium text-gray-500 dark:text-gray-400">📅 Activity — Last 6 Months</span>
        <span>{totalThisYear} submissions</span>
      </div>
      <div className="overflow-x-auto">
        <div className="flex gap-0.5 w-max">
          {weeks.map((col, wi) => (
            <div key={wi} className="flex flex-col gap-0.5">
              {col.map((cell, di) => (
                <div key={di}
                  className={`heatmap-cell rounded-[2px] cursor-default transition-transform hover:scale-125 ${cellColor(cell.count)}`}
                  onMouseEnter={(e) => setTooltip({ text: `${cell.count} on ${cell.date}`, x: e.clientX, y: e.clientY })}
                  onMouseLeave={() => setTooltip(null)}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-1 mt-1.5 text-[9.5px] text-gray-400">
        Less {['bg-gray-100 dark:bg-gray-800','bg-green-200','bg-green-400','bg-green-600','bg-green-800'].map((c, i) => (
          <div key={i} className={`heatmap-cell rounded-[2px] ${c}`} />
        ))} More
      </div>
      {tooltip && (
        <div className="fixed z-50 bg-gray-900 text-white text-[10.5px] font-medium px-2 py-1 rounded pointer-events-none shadow-lg"
          style={{ left: tooltip.x + 12, top: tooltip.y - 28 }}>
          {tooltip.text}
        </div>
      )}
    </div>
  )
}
