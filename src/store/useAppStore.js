import { create } from 'zustand'
import { storage } from '../utils/storage'
import { GIRL_THEME } from '../themes/themes'

const STORAGE_KEY = 'gyan_galaxy_state'

export const useAppStore = create((set, get) => ({
  // Profile
  profileName: '',
  theme: GIRL_THEME,

  // Progress — stars earned per subject per level
  // shape: { math: { 1: 3, 2: 2 }, english: { 1: 1 }, ... }
  progress: {
    math:    {},
    english: {},
    telugu:  {},
    hindi:   {},
  },

  // Total currency earned
  gems: 0,

  // Whether onboarding (profile picker) has been completed
  onboardingDone: false,

  // ── Actions ──────────────────────────────────────────────

  setProfile: (name, theme) => {
    set({ profileName: name, theme, onboardingDone: true })
    get().persist()
  },

  setTheme: (theme) => {
    set({ theme })
    get().persist()
  },

  awardStars: (subject, level, stars) => {
    const prev = get().progress
    const current = prev[subject]?.[level] ?? 0
    if (stars <= current) return  // never overwrite a higher score
    const updated = {
      ...prev,
      [subject]: { ...prev[subject], [level]: stars },
    }
    const gemDelta = stars - current
    set({ progress: updated, gems: get().gems + gemDelta })
    get().persist()
  },

  starsFor: (subject, level) => get().progress[subject]?.[level] ?? 0,

  totalStars: () => {
    const p = get().progress
    return Object.values(p).reduce((sum, levels) =>
      sum + Object.values(levels).reduce((s, v) => s + v, 0), 0)
  },

  // ── Persistence ──────────────────────────────────────────

  persist: async () => {
    const { profileName, theme, progress, gems, onboardingDone } = get()
    await storage.setItem(STORAGE_KEY, JSON.stringify({
      profileName, themeId: theme.id, progress, gems, onboardingDone,
    }))
  },

  hydrate: async () => {
    try {
      const raw = await storage.getItem(STORAGE_KEY)
      if (!raw) return
      const { profileName, themeId, progress, gems, onboardingDone } = JSON.parse(raw)
      const { THEMES } = require('../themes/themes')
      set({
        profileName,
        theme: THEMES[themeId] ?? GIRL_THEME,
        progress,
        gems,
        onboardingDone,
      })
    } catch (_) {
      // corrupted storage — start fresh
    }
  },

  resetAll: async () => {
    await storage.removeItem(STORAGE_KEY)
    set({
      profileName: '',
      theme: GIRL_THEME,
      progress: { math: {}, english: {}, telugu: {}, hindi: {} },
      gems: 0,
      onboardingDone: false,
    })
  },
}))
