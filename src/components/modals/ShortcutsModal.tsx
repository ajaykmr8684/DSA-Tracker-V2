import { useUIStore } from '../../stores/uiStore'
import { X } from 'lucide-react'

const SHORTCUTS = [
  { keys: ['Ctrl', 'K'], desc: 'Focus search' },
  { keys: ['Ctrl', 'N'], desc: 'Add problem' },
  { keys: ['Ctrl', 'M'], desc: 'Mock interview' },
  { keys: ['Ctrl', '1'], desc: 'Table view' },
  { keys: ['Ctrl', '2'], desc: 'Kanban view' },
  { keys: ['Ctrl', '3'], desc: 'Pattern view' },
  { keys: ['Ctrl', '4'], desc: 'Analytics' },
  { keys: ['Ctrl', 'E'], desc: 'Export JSON' },
  { keys: ['Ctrl', 'D'], desc: 'Toggle theme' },
  { keys: ['?'], desc: 'This panel' },
  { keys: ['Esc'], desc: 'Close modal' },
]

export default function ShortcutsModal() {
  const { shortcutsOpen, closeShortcuts } = useUIStore()
  if (!shortcutsOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={e => { if (e.target === e.currentTarget) closeShortcuts() }}>
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 w-full max-w-sm shadow-2xl">
        <div className="px-5 pt-5 pb-3 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <h2 className="font-bold text-gray-900 dark:text-white">⌨ Keyboard Shortcuts</h2>
          <button onClick={closeShortcuts} className="btn btn-ghost p-1"><X size={15} /></button>
        </div>
        <div className="p-4 space-y-1.5">
          {SHORTCUTS.map(({ keys, desc }) => (
            <div key={desc} className="flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
              <span className="text-sm text-gray-600 dark:text-gray-300">{desc}</span>
              <div className="flex gap-1">
                {keys.map(k => (
                  <kbd key={k} className="inline-block bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded px-1.5 py-0.5 text-[10.5px] font-mono text-gray-600 dark:text-gray-300">{k}</kbd>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
