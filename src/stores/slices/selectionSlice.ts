import type { StateCreator } from 'zustand';

export interface SelectionSlice {
  selectedEntityId: number | null;
  setSelectedEntityId: (selectedEntityId: number | null) => void;
  clearSelection: () => void;
}

export const createSelectionSlice: StateCreator<SelectionSlice, [], [], SelectionSlice> = (set) => ({
  selectedEntityId: null,
  setSelectedEntityId: (selectedEntityId) => set({ selectedEntityId }),
  clearSelection: () => set({ selectedEntityId: null }),
});
