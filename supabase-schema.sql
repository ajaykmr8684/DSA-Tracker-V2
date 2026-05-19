-- ================================================================
-- DSA Super Tracker — Supabase Schema
-- Run this in: Supabase Dashboard → SQL Editor → Run
-- ================================================================

-- Problem progress (one row per user per problem)
CREATE TABLE IF NOT EXISTS problem_progress (
  id              uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id         uuid REFERENCES auth.users NOT NULL,
  problem_id      text NOT NULL,
  status          int DEFAULT 0 CHECK (status BETWEEN 0 AND 3),
  time_taken      text,
  attempts        int DEFAULT 0,
  pattern         text,
  last_solved     date,
  next_revision   date,
  revision_count  int DEFAULT 0,
  confidence      int DEFAULT 0 CHECK (confidence BETWEEN 0 AND 5),
  notes           text,
  code            text,
  sm2_ef          float DEFAULT 2.5,
  sm2_interval    int DEFAULT 1,
  sm2_reps        int DEFAULT 0,
  updated_at      timestamptz DEFAULT now(),
  UNIQUE(user_id, problem_id)
);

-- Daily activity log (for heatmap)
CREATE TABLE IF NOT EXISTS activity_log (
  user_id  uuid REFERENCES auth.users NOT NULL,
  date     date NOT NULL,
  count    int DEFAULT 1,
  PRIMARY KEY (user_id, date)
);

-- Custom problems added by users
CREATE TABLE IF NOT EXISTS custom_problems (
  id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     uuid REFERENCES auth.users NOT NULL,
  topic       text NOT NULL,
  name        text NOT NULL,
  difficulty  text NOT NULL,
  source      text,
  lc_slug     text,
  gfg_slug    text,
  tags        text[] DEFAULT '{}',
  created_at  timestamptz DEFAULT now()
);

-- ================================================================
-- ROW LEVEL SECURITY (users only see their own data)
-- ================================================================
ALTER TABLE problem_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log     ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_problems  ENABLE ROW LEVEL SECURITY;

CREATE POLICY "own_progress" ON problem_progress FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "own_activity" ON activity_log    FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "own_problems" ON custom_problems FOR ALL USING (auth.uid() = user_id);

-- ================================================================
-- INDEXES for performance
-- ================================================================
CREATE INDEX IF NOT EXISTS idx_progress_user ON problem_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_user ON activity_log(user_id);
CREATE INDEX IF NOT EXISTS idx_progress_revision ON problem_progress(user_id, next_revision);

-- ================================================================
-- Auto-update updated_at
-- ================================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER set_updated_at
  BEFORE UPDATE ON problem_progress
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
