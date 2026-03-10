import { create } from 'zustand';
import { createDataSlice, type DataSlice } from './slices/dataSlice';
import { createLoadingSlice, type LoadingSlice } from './slices/loadingSlice';
import { createSelectionSlice, type SelectionSlice } from './slices/selectionSlice';
import { createUISlice, type UISlice } from './slices/uiSlice';
import { createVisibilitySlice, type VisibilitySlice } from './slices/visibilitySlice';

export type ViewerState = UISlice & LoadingSlice & SelectionSlice & VisibilitySlice & DataSlice;

export const useViewerStore = create<ViewerState>()((...args) => ({
  ...createUISlice(...args),
  ...createLoadingSlice(...args),
  ...createSelectionSlice(...args),
  ...createVisibilitySlice(...args),
  ...createDataSlice(...args),
}));
