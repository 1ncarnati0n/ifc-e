import type { StateCreator } from 'zustand';

export interface LoadingSlice {
  isLoading: boolean;
  progressLabel: string;
  setLoading: (isLoading: boolean, progressLabel?: string) => void;
  resetLoading: () => void;
}

export const createLoadingSlice: StateCreator<LoadingSlice, [], [], LoadingSlice> = (set) => ({
  isLoading: false,
  progressLabel: '대기 중',
  setLoading: (isLoading, progressLabel = isLoading ? '로딩 중' : '대기 중') =>
    set({ isLoading, progressLabel }),
  resetLoading: () => set({ isLoading: false, progressLabel: '대기 중' }),
});
