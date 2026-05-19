import { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function AuthPage() {
  const [mode, setMode] = useState<'login' | 'signup' | 'reset'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null)
  const googleEnabled = false

  const handle = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setMsg(null)
    try {
      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
      } else if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({ email, password })
        if (error) throw error
        setMsg({ text: '✓ Check your email to confirm your account', ok: true })
      } else {
        const { error } = await supabase.auth.resetPasswordForEmail(email)
        if (error) throw error
        setMsg({ text: '✓ Reset link sent to your email', ok: true })
      }
    } catch (err: unknown) {
      setMsg({ text: (err as Error).message, ok: false })
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden" style={{ background: 'var(--bg-base)' }}>
      {/* Ambient blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" aria-hidden>
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full" style={{ background: 'radial-gradient(circle, rgba(0,0,0,0.04) 0%, transparent 70%)', filter: 'blur(40px)', animation: 'pulse-glow 4s ease-in-out infinite' }} />
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full" style={{ background: 'radial-gradient(circle, rgba(0,0,0,0.035) 0%, transparent 70%)', filter: 'blur(40px)', animation: 'pulse-glow 5s ease-in-out infinite 1s' }} />
        <div className="absolute top-[40%] right-[20%] w-[300px] h-[300px] rounded-full" style={{ background: 'radial-gradient(circle, rgba(16,185,129,0.07) 0%, transparent 70%)', filter: 'blur(30px)' }} />
      </div>

      <div className="w-full max-w-[400px] fade-up relative z-10">
        {/* Logo section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 text-3xl" style={{ background: 'linear-gradient(135deg, var(--accent-from), var(--accent-to))', boxShadow: '0 0 40px var(--accent-glow)' }}>
            🚀
          </div>
          <h1 className="text-2xl font-black gradient-text">DSA Super Tracker</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-3)' }}>Complete Interview Preparation System</p>
          <div className="flex items-center justify-center gap-3 mt-3 text-xs" style={{ color: 'var(--text-3)' }}>
            <span className="flex items-center gap-1"><span className="text-blue-600">●</span> 616 Problems</span>
            <span>·</span>
            <span className="flex items-center gap-1"><span className="text-purple-400">●</span> SM-2 Spaced Rep</span>
            <span>·</span>
            <span className="flex items-center gap-1"><span className="text-emerald-400">●</span> Per-User Data</span>
          </div>
        </div>

        {/* Card */}
        <div className="modal-glass rounded-2xl p-8">
          <h2 className="text-base font-bold mb-6" style={{ color: 'var(--text)' }}>
            {mode === 'login' ? 'Sign in to your account' : mode === 'signup' ? 'Create free account' : 'Reset password'}
          </h2>

          <form onSubmit={handle} className="space-y-4">
            <div>
              <label className="form-label">Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                className="form-input" placeholder="you@example.com" required />
            </div>
            {mode !== 'reset' && (
              <div>
                <label className="form-label">Password</label>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                  className="form-input" placeholder="••••••••" required minLength={6} />
              </div>
            )}
            {msg && (
              <div className={`text-xs px-3 py-2.5 rounded-lg font-medium ${msg.ok ? 'text-emerald-400' : 'text-red-400'}`}
                style={{ background: msg.ok ? 'rgba(34,197,94,0.08)' : 'rgba(239,68,68,0.08)', border: `1px solid ${msg.ok ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)'}` }}>
                {msg.text}
              </div>
            )}
            <button type="submit" disabled={loading}
              className="btn btn-primary w-full justify-center py-2.5 text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed">
              {loading ? <span className="flex items-center gap-2"><span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />Processing…</span>
                : mode === 'login' ? 'Sign in →' : mode === 'signup' ? 'Create account →' : 'Send reset email →'}
            </button>
          </form>

          {googleEnabled && (
            <>
              <div className="relative my-5">
                <div className="absolute inset-0 flex items-center"><div className="w-full" style={{ height: 1, background: 'var(--border)' }} /></div>
                <div className="relative text-center"><span className="px-3 text-xs" style={{ background: 'var(--bg-card)', color: 'var(--text-3)' }}>or continue with</span></div>
              </div>
              <button className="btn w-full justify-center gap-2 py-2.5 text-sm">
                <svg width="16" height="16" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                Continue with Google
              </button>
            </>
          )}

          <div className="mt-5 text-center space-y-2 text-xs" style={{ color: 'var(--text-3)' }}>
            {mode === 'login' && <>
              <div>No account? <button onClick={() => { setMode('signup'); setMsg(null) }} className="text-blue-600 hover:text-blue-500 dark:text-blue-400 font-semibold transition-colors">Sign up free</button></div>
              <div><button onClick={() => { setMode('reset'); setMsg(null) }} className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Forgot password?</button></div>
            </>}
            {mode !== 'login' && <button onClick={() => { setMode('login'); setMsg(null) }} className="text-blue-600 hover:text-blue-500 dark:text-blue-400 font-semibold transition-colors">← Back to sign in</button>}
          </div>
        </div>

        <p className="text-center text-[10.5px] mt-4" style={{ color: 'var(--text-3)' }}>
          🔒 Data secured by Supabase Row Level Security — your progress is private
        </p>
      </div>
    </div>
  )
}
