import { useEffect, useRef, lazy, Suspense } from 'react'
import { useUIStore } from '../stores/uiStore'
import { useAuthStore } from '../stores/authStore'
import { useProgressStore } from '../stores/progressStore'
import Nav from '../components/layout/Nav'
import Sidebar from '../components/layout/Sidebar'
import Dashboard from '../components/dashboard/Dashboard'
import TableView from '../components/views/TableView'
import KanbanView from '../components/views/KanbanView'
import AnalyticsView from '../components/views/AnalyticsView'
import EditModal from '../components/modals/EditModal'
import MockInterviewModal from '../components/modals/MockInterviewModal'
import ShortcutsModal from '../components/modals/ShortcutsModal'
import Toaster from '../components/ui/Toaster'
import { PROBLEMS } from '../data/problems'
import { today } from '../lib/sm2'

const PatternView = lazy(() => import('../components/views/PatternView'))

const VIEW_TABS = [
  { id: 'table' as const,     label: '📋 Table' },
  { id: 'kanban' as const,    label: '🗂 Kanban' },
  { id: 'pattern' as const,   label: '🧩 By Pattern' },
  { id: 'analytics' as const, label: '📊 Analytics' },
]

export default function TrackerPage() {
  const { user } = useAuthStore()
  const { view, setView, theme, openAdd, openMock, openShortcuts } = useUIStore()
  const { loadAll, progressMap } = useProgressStore()
  const initialized = useRef(false)

  useEffect(() => {
    if (user && !initialized.current) {
      initialized.current = true
      loadAll(user.id)
    }
  }, [user])

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (document.activeElement as HTMLElement)?.tagName
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(tag)) return
      if (e.key === 'Escape') return
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') { e.preventDefault(); document.querySelector<HTMLInputElement>('input[placeholder*="Search"]')?.focus() }
      if ((e.ctrlKey || e.metaKey) && e.key === 'n') { e.preventDefault(); openAdd() }
      if ((e.ctrlKey || e.metaKey) && e.key === 'm') { e.preventDefault(); openMock() }
      if ((e.ctrlKey || e.metaKey) && e.key === '1') { e.preventDefault(); setView('table') }
      if ((e.ctrlKey || e.metaKey) && e.key === '2') { e.preventDefault(); setView('kanban') }
      if ((e.ctrlKey || e.metaKey) && e.key === '3') { e.preventDefault(); setView('pattern') }
      if ((e.ctrlKey || e.metaKey) && e.key === '4') { e.preventDefault(); setView('analytics') }
      if ((e.ctrlKey || e.metaKey) && e.key === 'e') { e.preventDefault(); handleExport() }
      if ((e.ctrlKey || e.metaKey) && e.key === 'd') { e.preventDefault(); useUIStore.getState().toggleTheme() }
      if (e.key === '?') openShortcuts()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  const handleExport = () => {
    const data = { version: 4, exportDate: new Date().toISOString(), totalProblems: PROBLEMS.length, progress: progressMap }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = `dsa-progress-${today()}.json`; a.click()
    URL.revokeObjectURL(url)
  }

  const handleImport = () => {
    const input = document.createElement('input'); input.type = 'file'; input.accept = '.json'
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]; if (!file) return
      const text = await file.text()
      try {
        const data = JSON.parse(text)
        if (data.progress && user) {
          for (const [id, prog] of Object.entries(data.progress)) {
            useProgressStore.getState().updateProgress(user.id, id, prog as Record<string, unknown>)
          }
          alert(`✓ Imported ${Object.keys(data.progress).length} records!`)
        }
      } catch { alert('Invalid JSON file') }
    }
    input.click()
  }

  return (
    <div className="min-h-screen tracker-shell">
      {/* Sticky Nav */}
      <Nav onExport={handleExport} onImport={handleImport} />

      {/* Dashboard (scrolls away) */}
      <Dashboard />

      {/* Sticky tab bar below nav */}
      <div className="sticky top-12 z-40 flex overflow-x-auto"
        style={{ background: 'var(--bg-panel)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)', borderBottom: '1px solid var(--border)' }}>
        {VIEW_TABS.map(tab => (
          <button key={tab.id} onClick={() => setView(tab.id)} className={`view-tab ${view === tab.id ? 'active' : ''}`}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Main layout */}
      <div className="flex">
        <Sidebar />
        <main className="flex-1 min-w-0" style={{ background: 'var(--bg-main)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}>
          {view === 'table' && <TableView />}
          {view === 'kanban' && <KanbanView />}
          {view === 'pattern' && (
            <Suspense fallback={<div className="p-12 text-center text-gray-400 text-sm">Loading patterns…</div>}>
              <PatternView />
            </Suspense>
          )}
          {view === 'analytics' && <AnalyticsView />}
        </main>
      </div>

      {/* Modals — always rendered, conditionally shown */}
      <EditModal />
      <MockInterviewModal />
      <ShortcutsModal />
      <Toaster />
    </div>
  )
}
