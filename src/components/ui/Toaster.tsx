import { useToastStore } from '../../stores/toastStore'
import type { ToastType } from '../../stores/toastStore'
import { X } from 'lucide-react'

const ICONS: Record<ToastType, string> = {
  success: '✓', error: '✕', info: 'ℹ', warning: '⚠',
}

const COLORS: Record<ToastType, string> = {
  success: 'bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900',
  error:   'bg-red-600 text-white',
  info:    'bg-blue-600 text-white',
  warning: 'bg-amber-500 text-white',
}

export default function Toaster() {
  const { toasts, dismiss } = useToastStore()

  return (
    <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-[9999] flex flex-col gap-2 items-center pointer-events-none">
      {toasts.map((t) => (
        <div key={t.id}
          className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl shadow-2xl text-sm font-medium pointer-events-auto animate-[fadeIn_.2s_ease] max-w-sm ${COLORS[t.type]}`}
          onClick={() => dismiss(t.id)}
          style={{ cursor: 'pointer' }}>
          <span className="font-bold text-base leading-none">{ICONS[t.type]}</span>
          <span className="flex-1">{t.message}</span>
          <X size={13} className="opacity-60 flex-shrink-0" />
        </div>
      ))}
    </div>
  )
}
