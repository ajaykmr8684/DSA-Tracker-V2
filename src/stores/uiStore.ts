import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { View, Filters } from '../types'

interface UIState {
  view: View
  theme: 'light' | 'dark'
  sidebarOpen: boolean
  filters: Filters
  sort: { col: string; dir: 1 | -1 }
  page: number
  perPage: number
  collapsedTopics: Set<string>
  editModalId: string | null
  isAddModal: boolean
  mockOpen: boolean
  shortcutsOpen: boolean

  setView: (v: View) => void
  toggleTheme: () => void
  toggleSidebar: () => void
  setFilter: (key: keyof Filters, val: string) => void
  clearFilters: () => void
  setSort: (col: string) => void
  setPage: (n: number) => void
  setPerPage: (n: number) => void
  toggleTopic: (topic: string) => void
  collapseAll: (topics: string[]) => void
  expandAll: () => void
  openEdit: (id: string) => void
  openAdd: () => void
  closeModal: () => void
  openMock: () => void
  closeMock: () => void
  openShortcuts: () => void
  closeShortcuts: () => void
}

const defaultFilters: Filters = {
  topic: '', difficulty: '', source: '', status: '', tag: '', search: '',
}

export const useUIStore = create<UIState>()(
  persist(
    (set, get) => ({
      view: 'table',
      theme: 'light',
      sidebarOpen: true,
      filters: defaultFilters,
      sort: { col: '', dir: 1 },
      page: 1,
      perPage: 50,
      collapsedTopics: new Set(),
      editModalId: null,
      isAddModal: false,
      mockOpen: false,
      shortcutsOpen: false,

      setView: (view) => set({ view, page: 1 }),
      toggleTheme: () => {
        const next = get().theme === 'light' ? 'dark' : 'light'
        set({ theme: next })
        document.documentElement.classList.toggle('dark', next === 'dark')
      },
      toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
      setFilter: (key, val) => set((s) => ({ filters: { ...s.filters, [key]: val }, page: 1 })),
      clearFilters: () => set({ filters: defaultFilters, page: 1 }),
      setSort: (col) =>
        set((s) => ({
          sort: s.sort.col === col ? { col, dir: (-s.sort.dir as 1 | -1) } : { col, dir: 1 },
          page: 1,
        })),
      setPage: (page) => set({ page }),
      setPerPage: (perPage) => set({ perPage, page: 1 }),
      toggleTopic: (topic) =>
        set((s) => {
          const next = new Set(s.collapsedTopics)
          next.has(topic) ? next.delete(topic) : next.add(topic)
          return { collapsedTopics: next }
        }),
      collapseAll: (topics) => set({ collapsedTopics: new Set(topics) }),
      expandAll: () => set({ collapsedTopics: new Set() }),
      openEdit: (id) => set({ editModalId: id, isAddModal: false }),
      openAdd: () => set({ editModalId: `custom_${Date.now()}`, isAddModal: true }),
      closeModal: () => set({ editModalId: null }),
      openMock: () => set({ mockOpen: true }),
      closeMock: () => set({ mockOpen: false }),
      openShortcuts: () => set({ shortcutsOpen: true }),
      closeShortcuts: () => set({ shortcutsOpen: false }),
    }),
    {
      name: 'dsa-ui-store',
      partialize: (s) => ({ theme: s.theme, sidebarOpen: s.sidebarOpen, perPage: s.perPage }),
    }
  )
)
