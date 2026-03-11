import type { StateCreator } from 'zustand';
import type { IfcSpatialNode } from '@/types/worker-messages';

export interface DataSlice {
  currentFileName: string | null;
  currentModelId: number | null;
  currentModelSchema: string | null;
  currentModelMaxExpressId: number | null;
  geometryReady: boolean;
  geometryMeshCount: number;
  geometryVertexCount: number;
  geometryIndexCount: number;
  spatialTree: IfcSpatialNode[];
  engineState: 'idle' | 'initializing' | 'ready' | 'error';
  engineMessage: string;
  setCurrentFileName: (currentFileName: string | null) => void;
  setCurrentModelInfo: (modelId: number, schema: string, maxExpressId: number) => void;
  clearCurrentModelInfo: () => void;
  setGeometryReady: (geometryReady: boolean) => void;
  setGeometrySummary: (meshCount: number, vertexCount: number, indexCount: number) => void;
  resetGeometrySummary: () => void;
  setSpatialTree: (spatialTree: IfcSpatialNode[]) => void;
  clearSpatialTree: () => void;
  setEngineState: (engineState: DataSlice['engineState'], engineMessage: string) => void;
}

export const createDataSlice: StateCreator<DataSlice, [], [], DataSlice> = (set) => ({
  currentFileName: null,
  currentModelId: null,
  currentModelSchema: null,
  currentModelMaxExpressId: null,
  geometryReady: false,
  geometryMeshCount: 0,
  geometryVertexCount: 0,
  geometryIndexCount: 0,
  spatialTree: [],
  engineState: 'idle',
  engineMessage: '엔진 초기화 전',
  setCurrentFileName: (currentFileName) => set({ currentFileName }),
  setCurrentModelInfo: (currentModelId, currentModelSchema, currentModelMaxExpressId) =>
    set({ currentModelId, currentModelSchema, currentModelMaxExpressId }),
  clearCurrentModelInfo: () =>
    set({ currentModelId: null, currentModelSchema: null, currentModelMaxExpressId: null }),
  setGeometryReady: (geometryReady) => set({ geometryReady }),
  setGeometrySummary: (geometryMeshCount, geometryVertexCount, geometryIndexCount) =>
    set({ geometryMeshCount, geometryVertexCount, geometryIndexCount }),
  resetGeometrySummary: () => set({ geometryMeshCount: 0, geometryVertexCount: 0, geometryIndexCount: 0 }),
  setSpatialTree: (spatialTree) => set({ spatialTree }),
  clearSpatialTree: () => set({ spatialTree: [] }),
  setEngineState: (engineState, engineMessage) => set({ engineState, engineMessage }),
});
