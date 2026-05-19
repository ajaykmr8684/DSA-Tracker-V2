# 🚀 DSA Super Tracker — React + Supabase

Complete interview preparation system with 616 problems, per-user data, analytics, and SM-2 spaced repetition.

## Stack
- **React 18 + Vite + TypeScript**
- **Tailwind CSS v3**
- **Supabase** (PostgreSQL + Auth)
- **Zustand** (state management)
- **Recharts** (analytics charts)
- **Lucide React** (icons)

---

## Setup (15 minutes)

### 1. Supabase Project
1. Go to [supabase.com](https://supabase.com) → New Project
2. Go to **SQL Editor** → paste contents of `supabase-schema.sql` → **Run**
3. Go to **Settings → API** → copy **Project URL** and **anon public** key

### 2. Environment Variables
```bash
cp .env.example .env.local
# Edit .env.local and fill in your Supabase URL and anon key
```

### 3. Install & Run
```bash
npm install
npm run dev
```

### 4. Deploy to Vercel (Free)
```bash
# Push to GitHub first
git init && git add . && git commit -m "initial commit"
git remote add origin https://github.com/YOUR_USERNAME/dsa-tracker.git
git push -u origin main

# Then on vercel.com:
# New Project → Import GitHub repo → Add env vars → Deploy
```

---

## Features
- ✅ **616 Problems**: Full A2Z Sheet + Google/Amazon/Meta/Microsoft questions
- ✅ **LC + GFG Links**: Direct links to LeetCode and GeeksForGeeks
- ✅ **4 Views**: Table (collapsible topics), Kanban, Pattern groups, Analytics
- ✅ **SM-2 Spaced Repetition**: Adaptive revision scheduling
- ✅ **Analytics**: Radar chart, velocity graph, difficulty breakdown, confidence distribution
- ✅ **Activity Heatmap**: GitHub-style 6-month activity grid
- ✅ **Problem of the Day**: Daily recommended problem
- ✅ **Mock Interview**: Timed simulation with company/difficulty filters
- ✅ **Per-User Data**: Each user's progress is completely isolated
- ✅ **Auth**: Email/password + Google OAuth
- ✅ **Dark Mode**: Full dark mode support
- ✅ **Keyboard Shortcuts**: Ctrl+K search, Ctrl+1-4 views, etc.
- ✅ **Import/Export**: JSON export for backup

## Keyboard Shortcuts
| Key | Action |
|-----|--------|
| `Ctrl+K` | Focus search |
| `Ctrl+N` | Add custom problem |
| `Ctrl+M` | Mock interview |
| `Ctrl+1` | Table view |
| `Ctrl+2` | Kanban view |
| `Ctrl+3` | Pattern view |
| `Ctrl+4` | Analytics |
| `?` | Shortcuts panel |
