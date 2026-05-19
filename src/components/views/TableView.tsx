import { useMemo, useCallback } from 'react'
import { PROBLEMS } from '../../data/problems'
import { GFG_SLUGS } from '../../data/gfgSlugs'
import { useProgressStore } from '../../stores/progressStore'
import { useUIStore } from '../../stores/uiStore'
import { useAuthStore } from '../../stores/authStore'
import { today } from '../../lib/sm2'
import type { Problem } from '../../types'
import { STATUS_LABEL, SOURCE_COLORS, LC_BASE, GFG_BASE, DIFF_ORDER } from '../../types'
import { ChevronDown, ChevronRight, Edit2, RotateCcw, RefreshCw } from 'lucide-react'
import { DiffBadge, CompanyBadge } from '../ui/BrandLogos'

// ─── FILTERS ─────────────────────────────────────────────────────
const TAG_BTNS = [
  { tag: 'a2z', label: '📚 A2Z' },
  { tag: 'google', label: '🔵 Google' },
  { tag: 'amazon', label: '🟠 Amazon' },
  { tag: 'meta', label: '🩷 Meta' },
  { tag: 'frequent', label: '⭐ Frequent' },
  { tag: 'recent', label: '🆕 Recent (2024-26)' },
  { tag: 'hard', label: '🔴 Hard' },
  { tag: 'revision', label: '⏰ Revision Due' },
  { tag: 'unsolved', label: '◻ Unsolved' },
]

function useFiltered() {
  const { filters, sort } = useUIStore()
  const { progressMap } = useProgressStore()
  return useMemo(() => {
    const { topic, difficulty, source, status, tag, search } = filters
    let res = PROBLEMS as Problem[]
    if (topic) res = res.filter(p => p.topic === topic)
    if (difficulty) res = res.filter(p => p.difficulty === difficulty)
    if (source) res = res.filter(p => p.tags.includes(source))
    if (status !== '') res = res.filter(p => (progressMap[p.id]?.status ?? 0) === parseInt(status))
    if (search) {
      const q = search.toLowerCase()
      res = res.filter(p => p.name.toLowerCase().includes(q) || p.topic.toLowerCase().includes(q) || p.tags.some(t => t.toLowerCase().includes(q)))
    }
    const td = today()
    if (tag === 'a2z') res = res.filter(p => p.tags.includes('A2Z'))
    else if (tag === 'google') res = res.filter(p => p.tags.includes('Google'))
    else if (tag === 'amazon') res = res.filter(p => p.tags.includes('Amazon'))
    else if (tag === 'meta') res = res.filter(p => p.tags.includes('Meta'))
    else if (tag === 'frequent') res = res.filter(p => p.tags.includes('Frequently Asked'))
    else if (tag === 'recent') res = res.filter(p => p.tags.includes('Recent'))
    else if (tag === 'hard') res = res.filter(p => p.difficulty === 'Hard')
    else if (tag === 'revision') res = res.filter(p => { const pr = progressMap[p.id]; return pr?.nextRevision && pr.nextRevision <= td })
    else if (tag === 'unsolved') res = res.filter(p => (progressMap[p.id]?.status ?? 0) === 0)
    if (sort.col) {
      res = [...res].sort((a, b) => {
        const pa = progressMap[a.id], pb = progressMap[b.id]
        let va: string | number = '', vb: string | number = ''
        if (sort.col === 'topic') { va = a.topic; vb = b.topic }
        else if (sort.col === 'name') { va = a.name; vb = b.name }
        else if (sort.col === 'diff') { va = DIFF_ORDER[a.difficulty]; vb = DIFF_ORDER[b.difficulty] }
        else if (sort.col === 'status') { va = pa?.status ?? 0; vb = pb?.status ?? 0 }
        else if (sort.col === 'attempts') { va = pa?.attempts ?? 0; vb = pb?.attempts ?? 0 }
        else if (sort.col === 'confidence') { va = pa?.confidence ?? 0; vb = pb?.confidence ?? 0 }
        else if (sort.col === 'revision') { va = pa?.nextRevision ?? '9999'; vb = pb?.nextRevision ?? '9999' }
        return va < vb ? -sort.dir : va > vb ? sort.dir : 0
      })
    }
    return res
  }, [filters, sort, progressMap])
}

// ─── SORT HEADER ─────────────────────────────────────────────────
function Th({ col, label, cls = '' }: { col: string; label: string; cls?: string }) {
  const { sort, setSort } = useUIStore()
  const active = sort.col === col
  return (
    <th onClick={() => setSort(col)}
      className={`px-3 py-2.5 text-left text-[10.5px] font-bold uppercase tracking-wider cursor-pointer select-none whitespace-nowrap transition-colors ${cls}`}
      style={{ color: active ? 'var(--accent)' : 'var(--text-3)' }}>
      {label}{active ? <span className="ml-0.5">{sort.dir === 1 ? ' ↑' : ' ↓'}</span> : ''}
    </th>
  )
}
function NoSortTh({ label, cls = '' }: { label: string; cls?: string }) {
  return <th className={`px-3 py-2.5 text-left text-[10.5px] font-bold uppercase tracking-wider whitespace-nowrap ${cls}`} style={{ color: 'var(--text-3)' }}>{label}</th>
}

// ─── REV TEXT ─────────────────────────────────────────────────────
function RevText({ nextRevision }: { nextRevision?: string }) {
  if (!nextRevision) return <span className="text-xs" style={{ color: 'var(--border-strong)' }}>—</span>
  const td = today()
  const diffMs = new Date(nextRevision).getTime() - new Date(td).getTime()
  const diffD = Math.round(diffMs / 86400000)
  if (diffMs < 0) return <span className="text-xs font-bold" style={{ color: '#f87171' }}>⚠ {Math.abs(diffD)}d ago</span>
  if (diffD === 0) return <span className="text-xs font-bold" style={{ color: '#fbbf24', textShadow: '0 0 8px rgba(251,191,36,0.4)' }}>Today!</span>
  if (diffD <= 3) return <span className="text-xs" style={{ color: '#fb923c' }}>in {diffD}d</span>
  return <span className="text-xs" style={{ color: '#4ade80' }}>in {diffD}d</span>
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────
export default function TableView() {
  const filtered = useFiltered()
  const { page, perPage, setPage, setPerPage, filters, setFilter, clearFilters, collapsedTopics, toggleTopic, collapseAll, expandAll, openEdit } = useUIStore()
  const { progressMap, cycleStatus, markRevDone, markAllRevDue, resetOne, loaded, loadError } = useProgressStore()
  const { user } = useAuthStore()

  const start = (page - 1) * perPage
  const pageData = filtered.slice(start, start + perPage)
  const totalPages = Math.ceil(filtered.length / perPage)
  const end = Math.min(start + pageData.length, filtered.length)

  const topicStats = useMemo(() => {
    const m: Record<string, { s: number; t: number }> = {}
    PROBLEMS.forEach(p => {
      if (!m[p.topic]) m[p.topic] = { s: 0, t: 0 }
      m[p.topic].t++
      if ((progressMap[p.id]?.status ?? 0) >= 2) m[p.topic].s++
    })
    return m
  }, [progressMap])

  const cycle = useCallback((id: string) => { if (user) cycleStatus(user.id, id) }, [user, cycleStatus])

  // Build grouped items for current page
  type GItem = { type: 'header'; topic: string } | { type: 'row'; p: Problem }
  const grouped = useMemo<GItem[]>(() => {
    const items: GItem[] = []
    let last = ''
    pageData.forEach(p => {
      if (p.topic !== last) { items.push({ type: 'header', topic: p.topic }); last = p.topic }
      items.push({ type: 'row', p })
    })
    return items
  }, [pageData])

  const allTopics = useMemo(() => [...new Set(filtered.map(p => p.topic))], [filtered])

  // Loading / error states
  if (loadError) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center px-6">
        <div className="text-5xl mb-4">⚠️</div>
        <div className="text-base font-semibold text-red-600 dark:text-red-400 mb-2">Failed to load your progress</div>
        <div className="text-sm text-gray-400 mb-4 max-w-md">{loadError}</div>
        <div className="text-xs text-gray-400 bg-gray-50 dark:bg-gray-800 rounded-lg px-4 py-3 max-w-sm text-left font-mono">
          Check your <code>.env.local</code> has the correct<br />VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
        </div>
      </div>
    )
  }

  if (!loaded) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="text-4xl mb-4 animate-pulse">🚀</div>
        <div className="text-sm font-medium text-gray-400">Loading your progress from Supabase…</div>
        <div className="mt-4 flex gap-1">
          {[0,1,2].map(i => (
            <div key={i} className="w-2 h-2 rounded-full animate-bounce bg-neutral-400" style={{ animationDelay: `${i * 0.15}s` }} />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col">
      {/* ── FILTER BAR ── */}
      <div className="px-4 py-3 space-y-2.5" style={{ borderBottom: '1px solid var(--border)', background: 'transparent' }}>
        {/* Row 1: search + selects */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs pointer-events-none">🔍</span>
            <input type="text" value={filters.search} onChange={e => setFilter('search', e.target.value)}
              placeholder="Search problems…" className="form-input pl-7 py-1.5 text-xs w-52" />
          </div>
          <select value={filters.topic} onChange={e => setFilter('topic', e.target.value)} className="form-input py-1.5 text-xs">
            <option value="">All Topics</option>
            {[...new Set(PROBLEMS.map(p => p.topic))].map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          <select value={filters.difficulty} onChange={e => setFilter('difficulty', e.target.value)} className="form-input py-1.5 text-xs">
            <option value="">All Difficulties</option>
            <option>Easy</option><option>Medium</option><option>Hard</option>
          </select>
          <select value={filters.source} onChange={e => setFilter('source', e.target.value)} className="form-input py-1.5 text-xs">
            <option value="">All Sources</option>
            <option value="A2Z">A2Z</option><option value="Google">Google</option>
            <option value="Amazon">Amazon</option><option value="Meta">Meta</option><option value="Microsoft">Microsoft</option>
          </select>
          <select value={filters.status} onChange={e => setFilter('status', e.target.value)} className="form-input py-1.5 text-xs">
            <option value="">All Status</option>
            <option value="0">Not Started</option><option value="1">Attempted</option>
            <option value="2">Solved</option><option value="3">Mastered</option>
          </select>
          {(filters.search || filters.topic || filters.difficulty || filters.source || filters.status || filters.tag) && (
            <button onClick={clearFilters} className="btn btn-sm text-xs text-red-500 border-red-200 hover:bg-red-50">✕ Clear</button>
          )}
        </div>
        {/* Row 2: quick tags */}
        <div className="flex flex-wrap gap-1.5">
          {TAG_BTNS.map(({ tag, label }) => (
            <button key={tag} onClick={() => setFilter('tag', filters.tag === tag ? '' : tag)}
              className="px-2.5 py-1 rounded-full text-[11px] font-medium border transition-all"
              style={filters.tag === tag
                ? { background: 'linear-gradient(135deg, var(--accent-from), var(--accent-to))', color: '#fff', borderColor: 'transparent', boxShadow: '0 0 14px var(--accent-glow)' }
                : { background: 'var(--bg-card)', color: 'var(--text-3)', borderColor: 'var(--border)' }}
              onMouseEnter={e => { if (filters.tag !== tag) { (e.currentTarget as HTMLElement).style.borderColor = 'var(--accent)'; (e.currentTarget as HTMLElement).style.color = 'var(--accent)' } }}
              onMouseLeave={e => { if (filters.tag !== tag) { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'; (e.currentTarget as HTMLElement).style.color = 'var(--text-3)' } }}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* ── TABLE CONTROLS ── */}
      <div className="flex items-center justify-between px-4 py-2" style={{ borderBottom: '1px solid var(--border)' }}>
        <span className="text-xs text-gray-400">
          {filtered.length === 0 ? 'No problems match' : `${start + 1}–${end} of ${filtered.length} problems`}
          {filtered.length > 0 && (
            <span className="text-[10px] opacity-70 ml-2 hidden sm:inline">· Click a row to edit</span>
          )}
        </span>
        <div className="flex items-center gap-2">
          <button onClick={() => collapseAll(allTopics)} className="btn btn-sm text-[10.5px]">⊟ Collapse All</button>
          <button onClick={() => expandAll()} className="btn btn-sm text-[10.5px]">⊞ Expand All</button>
          <button onClick={() => user && markAllRevDue(user.id)} className="btn btn-sm text-[10.5px] btn-success">✓ Mark All Rev Due</button>
          <select value={perPage} onChange={e => setPerPage(Number(e.target.value))} className="form-input py-1 text-xs">
            <option value={50}>50/page</option><option value={100}>100/page</option>
            <option value={200}>200/page</option><option value={9999}>All</option>
          </select>
        </div>
      </div>

      {/* ── TABLE ── */}
      <div className="overflow-x-auto">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="text-5xl mb-4">🔍</div>
            <div className="text-base font-semibold text-gray-500 dark:text-gray-400 mb-2">No problems found</div>
            <div className="text-sm text-gray-400 mb-4">Try adjusting your filters or search query</div>
            <button onClick={clearFilters} className="btn btn-primary btn-sm">Clear all filters</button>
          </div>
        ) : (
          <table className="w-full border-collapse" style={{ minWidth: 920 }}>
              <thead className="table-dsa-thead">
              <tr>
                <Th col="name" label="Problem" cls="min-w-[200px]" />
                <th />
                <Th col="diff" label="Diff" cls="min-w-[72px]" />
                <NoSortTh label="Source · Companies" cls="min-w-[140px]" />
                <th />
                <Th col="status" label="Status" cls="min-w-[108px]" />
                <NoSortTh label="Time" cls="min-w-[52px]" />
                <Th col="attempts" label="Tries" cls="min-w-[44px] text-center" />
                <NoSortTh label="Pattern" cls="min-w-[88px]" />
                <NoSortTh label="Last Solved" cls="min-w-[78px]" />
                <Th col="revision" label="Next Rev" cls="min-w-[72px]" />
                <Th col="confidence" label="★" cls="!text-center w-10 min-w-[2.5rem] max-w-[2.5rem] px-1" />
                <th className="sticky-actions-col px-0 py-2.5" aria-label="Quick actions" />
              </tr>
            </thead>
            <tbody>
              {grouped.map((item, idx) => {
                if (item.type === 'header') {
                  const { topic } = item
                  const ts = topicStats[topic] ?? { s: 0, t: 0 }
                  const pct = ts.t ? Math.round(ts.s / ts.t * 100) : 0
                  const collapsed = collapsedTopics.has(topic)
                  return (
                    <tr key={`h-${topic}-${idx}`} onClick={() => toggleTopic(topic)}
                      className="cursor-pointer transition-colors" style={{ background: 'var(--bg-hover)' }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'var(--accent-soft)')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'var(--bg-hover)')}>
                      <td colSpan={13} className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                        <div className="flex items-center gap-2.5">
                          {collapsed
                            ? <ChevronRight size={13} className="flex-shrink-0" style={{ color: 'var(--text-3)' }} />
                            : <ChevronDown size={13} className="flex-shrink-0" style={{ color: 'var(--accent)' }} />}
                          <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-2)' }}>{topic}</span>
                          <div className="flex items-center gap-1.5 ml-1">
                            <div className="w-14 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                              <div className={`h-full rounded-full transition-all ${pct >= 80 ? 'bg-green-500' : pct >= 50 ? 'bg-amber-500' : 'bg-neutral-400'}`} style={{ width: `${pct}%` }} />
                            </div>
                            <span className="text-[10px] font-semibold text-gray-400">{ts.s}/{ts.t}</span>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )
                }

                const { p } = item
                if (collapsedTopics.has(p.topic)) return null

                const pr = progressMap[p.id]
                const status = (pr?.status ?? 0) as 0|1|2|3
                const gfgSlug = GFG_SLUGS[p.id as keyof typeof GFG_SLUGS]
                const srcColor = SOURCE_COLORS[p.source] ?? '#64748b'
                  const rowBgStyle = status === 3 ? 'rgba(139,92,246,0.04)' : status === 2 ? 'rgba(34,197,94,0.04)' : 'transparent'
                  const conf = pr?.confidence

                  return (
                    <tr key={p.id} className="group transition-colors cursor-pointer"
                      style={{ background: rowBgStyle, borderBottom: '1px solid var(--border)' }}
                      onClick={e => {
                        if ((e.target as HTMLElement).closest('a, button')) return
                        openEdit(p.id)
                      }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-hover)')}
                      onMouseLeave={e => (e.currentTarget.style.background = rowBgStyle)}>
                    {/* Problem Name — wider, with topic subtitle + links */}
                    <td className="px-3 py-2" colSpan={2}>
                      <div className="flex flex-col gap-0.5 max-w-[200px]">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[12.5px] font-semibold truncate flex-1" style={{ color: 'var(--text)' }} title={p.name}>{p.name}</span>
                          {/* Links — always visible, small */}
                          {p.lcSlug && (
                            <a href={LC_BASE + p.lcSlug + '/'} target="_blank" rel="noopener"
                              className="lc-badge flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={e => e.stopPropagation()}>LC</a>
                          )}
                          {gfgSlug && (
                            <a href={GFG_BASE + gfgSlug + '/1'} target="_blank" rel="noopener"
                              className="gfg-badge flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={e => e.stopPropagation()}>GFG</a>
                          )}
                        </div>
                        {/* Topic subtitle */}
                        <span className="text-[10px] truncate" style={{ color: 'var(--text-3)' }}>
                          {p.topic.split(' - ')[0]}
                        </span>
                      </div>
                    </td>
                    {/* Diff — glowing pill */}
                    <td className="px-3 py-2">
                      <DiffBadge diff={p.difficulty} />
                    </td>
                    {/* Source + Company brand logos */}
                    <td className="px-3 py-2" colSpan={2}>
                      <div className="flex items-center gap-1.5 flex-nowrap">
                        {/* Source */}
                        <span className="text-[9.5px] font-bold px-1.5 py-0.5 rounded-md flex-shrink-0 whitespace-nowrap"
                          style={{ background: srcColor + '15', color: srcColor, border: `1px solid ${srcColor}25` }}>
                          {p.source}
                        </span>
                        {/* Brand logos */}
                        {(['Google','Amazon','Meta','Microsoft'] as const).filter(c => p.tags.includes(c)).map(c => (
                          <CompanyBadge key={c} company={c} />
                        ))}
                        {/* Special badges */}
                        {p.tags.includes('Frequently Asked') && (
                          <span title="Frequently Asked" className="text-sm leading-none" style={{ filter:'drop-shadow(0 0 4px rgba(251,191,36,0.6))' }}>⭐</span>
                        )}
                        {p.tags.includes('Recent') && (
                          <span className="text-[8px] font-black px-1.5 py-0.5 rounded-full flex-shrink-0 whitespace-nowrap tracking-wide"
                            style={{ background:'rgba(167,139,250,0.15)', color:'#a78bfa', border:'1px solid rgba(167,139,250,0.25)' }}>
                            NEW
                          </span>
                        )}
                      </div>
                    </td>
                    {/* Status */}
                    <td className="px-3 py-2">
                      <button onClick={() => cycle(p.id)} title="Click to cycle: Not Started → Attempted → Solved → Mastered"
                        className={`status-btn s${status}`}>
                        <span className="status-dot" />
                        {STATUS_LABEL[status]}
                      </button>
                    </td>
                    <td className="px-3 py-2 text-xs whitespace-nowrap" style={{ color: 'var(--text-3)' }}>{pr?.timeTaken || '—'}</td>
                    <td className="px-3 py-2 text-xs text-center" style={{ color: 'var(--text-3)' }}>{pr?.attempts || '—'}</td>
                    <td className="px-3 py-2 text-xs max-w-[110px] truncate" style={{ color: 'var(--text-3)' }} title={pr?.pattern}>{pr?.pattern || '—'}</td>
                    <td className="px-3 py-2 text-xs whitespace-nowrap" style={{ color: 'var(--text-3)' }}>{pr?.lastSolved || '—'}</td>
                    <td className="px-3 py-2"><RevText nextRevision={pr?.nextRevision} /></td>
                    <td className="px-1 py-2 text-center align-middle">
                      <button
                        type="button"
                        className="text-[10px] font-semibold tabular-nums rounded px-1 py-0.5 min-w-[1.25rem] transition-colors hover:bg-black/[0.05] dark:hover:bg-white/[0.06]"
                        style={{ color: conf ? '#d97706' : 'var(--text-3)' }}
                        onClick={e => { e.stopPropagation(); openEdit(p.id) }}
                        title={conf ? `${conf}/5 confidence — click to edit` : 'Set confidence in edit'}
                      >
                        {conf ? conf : '—'}
                      </button>
                    </td>
                    <td className="sticky-actions-col px-1 py-1.5 align-middle">
                      <div className="flex items-center justify-center gap-0.5">
                        <button type="button" onClick={() => openEdit(p.id)} className="table-action-btn" title="Edit">
                          <Edit2 size={13} strokeWidth={2} />
                        </button>
                        <button type="button" onClick={() => user && markRevDone(user.id, p.id)} className="table-action-btn" title="Mark revision done">
                          <RefreshCw size={13} strokeWidth={2} />
                        </button>
                        <button type="button" onClick={() => user && window.confirm(`Reset "${p.name}"?`) && resetOne(user.id, p.id)} className="table-action-btn" title="Reset">
                          <RotateCcw size={13} strokeWidth={2} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* ── PAGINATION ── */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-1.5 py-5" style={{ borderTop: '1px solid var(--border)' }}>
          <button onClick={() => setPage(1)} disabled={page === 1} className="btn btn-sm disabled:opacity-30 text-xs">«</button>
          <button onClick={() => setPage(page - 1)} disabled={page === 1} className="btn btn-sm disabled:opacity-30">‹</button>
          {(() => {
            const range: number[] = []
            const s = Math.max(1, page - 2), e = Math.min(totalPages, page + 2)
            for (let i = s; i <= e; i++) range.push(i)
            return range.map(n => (
              <button key={n} onClick={() => setPage(n)} className={`btn btn-sm min-w-[34px] ${n === page ? 'btn-primary' : ''}`}>{n}</button>
            ))
          })()}
          <button onClick={() => setPage(page + 1)} disabled={page === totalPages} className="btn btn-sm disabled:opacity-30">›</button>
          <button onClick={() => setPage(totalPages)} disabled={page === totalPages} className="btn btn-sm disabled:opacity-30 text-xs">»</button>
          <span className="text-xs text-gray-400 ml-2">Page {page} of {totalPages}</span>
        </div>
      )}
    </div>
  )
}
