import { create } from 'zustand'

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
}))
