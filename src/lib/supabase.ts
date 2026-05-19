import { createClient } from '@supabase/supabase-js'

const url  = import.meta.env.VITE_SUPABASE_URL  as string
const key  = import.meta.env.VITE_SUPABASE_ANON_KEY as string

if (!url || !key) {
  console.error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env.local')
}

export const supabase = createClient(url, key)

export type Database = {
  public: {
    Tables: {
      problem_progress: {
        Row: {
          id: string
          user_id: string
          problem_id: string
          status: number
          time_taken: string | null
          attempts: number
          pattern: string | null
          last_solved: string | null
          next_revision: string | null
          revision_count: number
          confidence: number
          notes: string | null
          code: string | null
          sm2_ef: number
          sm2_interval: number
          sm2_reps: number
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['problem_progress']['Row'], 'id' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['problem_progress']['Insert']>
      }
      activity_log: {
        Row: { user_id: string; date: string; count: number }
        Insert: { user_id: string; date: string; count: number }
        Update: Partial<{ count: number }>
      }
      custom_problems: {
        Row: {
          id: string; user_id: string; topic: string; name: string
          difficulty: string; source: string; lc_slug: string | null
          gfg_slug: string | null; tags: string[]; created_at: string
        }
        Insert: Omit<Database['public']['Tables']['custom_problems']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['custom_problems']['Insert']>
      }
    }
  }
}
