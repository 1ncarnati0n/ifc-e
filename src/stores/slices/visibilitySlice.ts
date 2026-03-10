import type { StateCreator } from 'zustand';

export interface VisibilitySlice {
  hiddenEntityIds: Set<number>;
  hideEntity: (entityId: number) => void;
  resetHiddenEntities: () => void;
}

export const createVisibilitySlice: StateCreator<VisibilitySlice, [], [], VisibilitySlice> = (set) => ({
  hiddenEntityIds: new Set<number>(),
  hideEntity: (entityId) =>
    set((state) => {
      const next = new Set(state.hiddenEntityIds);
      next.add(entityId);
      return { hiddenEntityIds: next };
    }),
  resetHiddenEntities: () => set({ hiddenEntityIds: new Set<number>() }),
});
