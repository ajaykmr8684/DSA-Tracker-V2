import { useEffect } from 'react'
import { supabase } from './lib/supabase'
import { useAuthStore } from './stores/authStore'
import { useUIStore } from './stores/uiStore'
import AuthPage from './pages/AuthPage'
import TrackerPage from './pages/TrackerPage'

export default function App() {
  const { user, loading, setUser } = useAuthStore()
  const { theme } = useUIStore()

  useEffect(() => {
    // Apply saved theme
    document.documentElement.classList.toggle('dark', theme === 'dark')

    // Guard: if env vars are missing, don't hang on loading
    const url = import.meta.env.VITE_SUPABASE_URL
    const key = import.meta.env.VITE_SUPABASE_ANON_KEY
    if (!url || !key || url.includes('your-project')) {
      setUser(null, null) // stops the loading spinner
      return
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null, session)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null, session)
    })
    return () => subscription.unsubscribe()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-3 animate-pulse">🚀</div>
          <div className="text-sm text-gray-400">Loading DSA Super Tracker…</div>
        </div>
      </div>
    )
  }

  return user ? <TrackerPage /> : <AuthPage />
}
