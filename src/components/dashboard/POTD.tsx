import { useMemo } from 'react'
import { PROBLEMS } from '../../data/problems'
import { GFG_SLUGS } from '../../data/gfgSlugs'
import { useProgressStore } from '../../stores/progressStore'
import { useUIStore } from '../../stores/uiStore'
import { LC_BASE, GFG_BASE } from '../../types'
import { DiffBadge } from '../ui/BrandLogos'

export default function POTD() {
  const { progressMap } = useProgressStore()
  const { openEdit } = useUIStore()

  const potd = useMemo(() => {
    const td = new Date().toISOString().slice(0, 10)
    const seed = parseInt(td.replace(/-/g, ''), 10)
    const candidates = PROBLEMS.filter(p => {
      const pr = progressMap[p.id]
      return (!pr || pr.status < 2) && p.tags.includes('Frequently Asked')
    })
    const pool = candidates.length > 0 ? candidates : PROBLEMS
    return pool[seed % pool.length]
  }, [progressMap])

  if (!potd) return null
  const gfgSlug = GFG_SLUGS[potd.id as keyof typeof GFG_SLUGS]

  return (
    <div className="stat-card" style={{ borderColor: 'var(--accent-border)', background: 'var(--accent-softer)' }}>
      <div className="glow-blob" style={{ background: 'var(--accent-glow)' }} />
      <div className="flex items-center gap-1.5 mb-2">
        <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full"
          style={{ background: 'var(--accent-soft)', color: 'var(--accent)', border: '1px solid var(--accent-border)' }}>
          ⭐ Problem of the Day
        </span>
      </div>
      <div className="font-bold text-sm leading-tight mb-2" style={{ color: 'var(--text)' }}>{potd.name}</div>
      <div className="flex items-center gap-1.5 mb-3">
        <DiffBadge diff={potd.difficulty} />
        <span className="text-[10px]" style={{ color: 'var(--text-3)' }}>{potd.topic.split(' - ')[0]}</span>
      </div>
      <div className="flex items-center gap-1.5 flex-wrap">
        <button onClick={() => openEdit(potd.id)} className="btn btn-primary btn-sm text-[10.5px]">✏️ Track</button>
        {potd.lcSlug && <a href={LC_BASE + potd.lcSlug + '/'} target="_blank" rel="noopener" className="lc-badge">LC ↗</a>}
        {gfgSlug && <a href={GFG_BASE + gfgSlug + '/1'} target="_blank" rel="noopener" className="gfg-badge">GFG ↗</a>}
      </div>
    </div>
  )
}
