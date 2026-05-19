import { useMemo } from 'react'
import { useUIStore } from '../../stores/uiStore'
import { useAuthStore } from '../../stores/authStore'
import { useProgressStore } from '../../stores/progressStore'
import { PROBLEMS } from '../../data/problems'
import { today } from '../../lib/sm2'
import { Moon, Sun, Target, Keyboard, Plus, Upload, Download, Menu, LogOut, BarChart2 } from 'lucide-react'

export default function Nav({ onExport, onImport }: { onExport: () => void; onImport: () => void }) {
  const { theme, toggleTheme, toggleSidebar, openAdd, openMock, openShortcuts, setView } = useUIStore()
  const { user, signOut } = useAuthStore()
  const { activityMap, progressMap } = useProgressStore()

  const streak = useMemo(() => {
    let s = 0; const d = new Date()
    while (true) {
      const ds = d.toISOString().slice(0, 10)
      if ((activityMap[ds] ?? 0) > 0) { s++; d.setDate(d.getDate() - 1) } else break
    }
    return s
  }, [activityMap])

  const revDue = useMemo(() => {
    const td = today()
    return PROBLEMS.filter(p => { const pr = progressMap[p.id]; return pr?.nextRevision && pr.nextRevision <= td }).length
  }, [progressMap])

  return (
    <nav className="glass-nav sticky top-0 z-50 h-12 flex items-center gap-2 px-4">
      {/* Menu + Logo */}
      <button onClick={toggleSidebar} className="btn btn-ghost btn-sm p-1.5 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"><Menu size={16} /></button>
      <div className="font-black text-sm flex items-center gap-2 whitespace-nowrap">
        <span className="text-base">🚀</span>
        <span className="gradient-text hidden sm:inline">DSA Super Tracker</span>
      </div>

      {/* Badges */}
      {revDue > 0 && (
        <button onClick={() => { useUIStore.getState().setFilter('tag', 'revision'); setView('table') }}
          className="hidden sm:flex items-center gap-1 text-[10.5px] font-bold px-2 py-0.5 rounded-full transition-all"
          style={{ background: 'rgba(239,68,68,0.12)', color: '#f87171', border: '1px solid rgba(239,68,68,0.25)' }}>
          ⏰ {revDue} due
        </button>
      )}
      {streak > 0 && (
        <div className="hidden sm:flex items-center gap-1 text-[10.5px] font-bold px-2 py-0.5 rounded-full"
          style={{ background: 'rgba(245,158,11,0.12)', color: '#fbbf24', border: '1px solid rgba(245,158,11,0.25)' }}>
          🔥 {streak}d
        </div>
      )}

      <div className="flex-1" />

      {/* Actions */}
      <div className="hidden sm:flex items-center gap-1">
        <button onClick={() => setView('analytics')} className="btn btn-ghost btn-sm gap-1" style={{ color: 'var(--text-3)' }}>
          <BarChart2 size={13} /><span className="hidden md:inline text-xs">Analytics</span>
        </button>
        <button onClick={openMock} className="btn btn-ghost btn-sm gap-1" style={{ color: 'var(--text-3)' }}>
          <Target size={13} /><span className="hidden md:inline text-xs">Mock</span>
        </button>
        <button onClick={openShortcuts} className="btn btn-ghost btn-sm p-1.5" style={{ color: 'var(--text-3)' }}><Keyboard size={13} /></button>
      </div>

      <div className="hidden sm:block w-px h-5" style={{ background: 'var(--border)' }} />

      <div className="hidden sm:flex items-center gap-1.5">
        <button onClick={openAdd} className="btn btn-primary btn-sm gap-1"><Plus size={13} />Add</button>
        <button onClick={onImport} className="btn btn-ghost btn-sm p-1.5" style={{ color: 'var(--text-3)' }} title="Import"><Upload size={12} /></button>
        <button onClick={onExport} className="btn btn-ghost btn-sm p-1.5" style={{ color: 'var(--text-3)' }} title="Export"><Download size={12} /></button>
      </div>

      <div className="w-px h-5" style={{ background: 'var(--border)' }} />

      <button onClick={toggleTheme} className="btn btn-ghost btn-sm p-1.5" style={{ color: 'var(--text-3)' }}>
        {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
      </button>

      {/* Avatar + sign out */}
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white"
          style={{ background: 'linear-gradient(135deg, var(--accent-from), var(--accent-to))', boxShadow: '0 0 12px var(--accent-glow)' }}>
          {user?.email?.[0]?.toUpperCase() ?? '?'}
        </div>
        <button onClick={signOut} className="btn btn-ghost btn-sm p-1.5" style={{ color: 'var(--text-3)' }} title="Sign out"><LogOut size={13} /></button>
      </div>
    </nav>
  )
}
