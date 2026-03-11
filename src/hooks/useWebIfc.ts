import { useCallback, useEffect, useMemo, useRef } from 'react';
import { ifcWorkerClient } from '@/services/IfcWorkerClient';
import { viewportGeometryStore } from '@/services/viewportGeometryStore';
import { useViewerStore } from '@/stores';
import type { IfcSpatialNode } from '@/types/worker-messages';

export interface MockPropertyRecord {
  expressID: number | null;
  globalId: string | null;
  ifcType: string | null;
  name: string | null;
}

export interface MockGeometryResult {
  ready: boolean;
  meshCount: number;
  vertexCount: number;
  indexCount: number;
}

export function useWebIfc() {
  const {
    isLoading,
    progressLabel,
    setLoading,
    resetLoading,
    setCurrentFileName,
    currentFileName,
    currentModelId,
    currentModelSchema,
    currentModelMaxExpressId,
    setCurrentModelInfo,
    clearCurrentModelInfo,
    setGeometryReady,
    geometryReady,
    geometryMeshCount,
    geometryVertexCount,
    geometryIndexCount,
    setGeometrySummary,
    resetGeometrySummary,
    spatialTree,
    setSpatialTree,
    clearSpatialTree,
    selectedEntityId,
    engineState,
    engineMessage,
    setEngineState,
  } = useViewerStore();
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current);
      }
    };
  }, []);

  const initEngine = useCallback(async () => {
    if (engineState === 'ready') {
      return;
    }

    try {
      setEngineState('initializing', 'web-ifc worker 초기화 중');
      const result = await ifcWorkerClient.init();
      setEngineState(
        'ready',
        result.singleThreaded
          ? 'web-ifc worker 준비 완료 (single-thread)'
          : 'web-ifc worker 준비 완료'
      );
    } catch (error) {
      setEngineState(
        'error',
        error instanceof Error ? error.message : 'web-ifc worker 초기화 실패'
      );
    }
  }, [engineState, setEngineState]);

  const loadFile = useCallback(async (file?: File) => {
    await initEngine();

    if (!file) {
      throw new Error('로드할 IFC 파일이 없습니다.');
    }

    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
    }

    setLoading(true, `${file.name} 로딩 중`);
    setGeometryReady(false);
    resetGeometrySummary();
    viewportGeometryStore.clear();
    clearSpatialTree();
    setCurrentFileName(file.name);

    try {
      if (currentModelId !== null) {
        await ifcWorkerClient.closeModel(currentModelId);
        clearCurrentModelInfo();
      }

      const data = await file.arrayBuffer();
      const result = await ifcWorkerClient.loadModel(data);

      setCurrentModelInfo(result.modelId, result.schema, result.maxExpressId);
      setLoading(true, `${file.name} geometry 추출 중`);
      const streamed = await ifcWorkerClient.streamMeshes(result.modelId);
      viewportGeometryStore.setMeshes(streamed.meshes);
      setGeometrySummary(streamed.meshCount, streamed.vertexCount, streamed.indexCount);
      setLoading(true, `${file.name} spatial tree 구성 중`);
      const spatial = await ifcWorkerClient.getSpatialStructure(result.modelId);
      setSpatialTree([spatial.tree]);
      setGeometryReady(true);
      setLoading(false, `${file.name} 로딩 완료`);
    } catch (error) {
      setGeometryReady(false);
      resetGeometrySummary();
      viewportGeometryStore.clear();
      clearSpatialTree();
      setLoading(false, '로딩 실패');
      throw error;
    }
  }, [
    clearSpatialTree,
    clearCurrentModelInfo,
    currentModelId,
    initEngine,
    resetGeometrySummary,
    setCurrentFileName,
    setCurrentModelInfo,
    setGeometryReady,
    setGeometrySummary,
    setLoading,
    setSpatialTree,
  ]);

  const resetSession = useCallback(async () => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    if (currentModelId !== null) {
      try {
        await ifcWorkerClient.closeModel(currentModelId);
      } catch (error) {
        console.error(error);
      }
    }

    resetLoading();
    setCurrentFileName(null);
    clearCurrentModelInfo();
    setGeometryReady(false);
    resetGeometrySummary();
    viewportGeometryStore.clear();
    clearSpatialTree();
  }, [
    clearCurrentModelInfo,
    clearSpatialTree,
    currentModelId,
    resetGeometrySummary,
    resetLoading,
    setCurrentFileName,
    setGeometryReady,
  ]);

  const geometryResult = useMemo<MockGeometryResult>(
    () => ({
      ready: geometryReady,
      meshCount: geometryMeshCount,
      vertexCount: geometryVertexCount,
      indexCount: geometryIndexCount,
    }),
    [geometryIndexCount, geometryMeshCount, geometryReady, geometryVertexCount]
  );

  const resolvedSpatialTree = useMemo<IfcSpatialNode[]>(
    () =>
      spatialTree.length > 0
        ? spatialTree
        : [
            {
              expressID: 0,
              type: currentFileName ? 'IFCPROJECT' : 'EMPTY',
              children: [],
            },
          ],
    [currentFileName, spatialTree]
  );

  const properties = useMemo<MockPropertyRecord>(
    () => ({
      expressID: selectedEntityId,
      globalId: selectedEntityId ? `MOCK-${selectedEntityId}` : null,
      ifcType: selectedEntityId ? 'IfcWall' : null,
      name: selectedEntityId ? `Mock Element ${selectedEntityId}` : null,
    }),
    [selectedEntityId]
  );

  return {
    loadFile,
    resetSession,
    initEngine,
    loading: isLoading,
    progress: progressLabel,
    error: null as string | null,
    currentFileName,
    currentModelId,
    currentModelSchema,
    currentModelMaxExpressId,
    geometryResult,
    spatialTree: resolvedSpatialTree,
    properties,
    engineState,
    engineMessage,
  };
}
