import { create } from 'zustand'
import { getTheme, THEME_IDS } from './themes'

export const useStore = create((set) => ({
  // Currently selected island (null = none)
  selectedIsland: null,
  setSelectedIsland: (island) => set({ selectedIsland: island }),

  // Ark target position (where it's heading)
  arkTarget: [0, 0, 0],
  setArkTarget: (pos) => set({ arkTarget: pos }),

  // Is the ark currently moving?
  arkMoving: false,
  setArkMoving: (moving) => set({ arkMoving: moving }),

  // Loading state
  loaded: false,
  setLoaded: (loaded) => set({ loaded }),

  // Info panel open
  panelOpen: false,
  setPanelOpen: (open) => set({ panelOpen: open }),

  // Theme
  themeId: THEME_IDS.POKEMON,
  setThemeId: (id) => set({ themeId: id }),
}))

// Convenience hook — returns the full theme object
export function useTheme() {
  const themeId = useStore((s) => s.themeId)
  return getTheme(themeId)
}
