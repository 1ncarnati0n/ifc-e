import { ChevronDown, ChevronUp } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useWebIfc } from '@/hooks/useWebIfc';
import { useViewportGeometry } from '@/services/viewportGeometryStore';
import { useViewerStore } from '@/stores';
import type { IfcSpatialNode } from '@/types/worker-messages';
import { ViewportScene } from './ViewportScene';

function findStoreyNode(nodes: IfcSpatialNode[], targetStoreyId: number): IfcSpatialNode | null {
  for (const node of nodes) {
    if (node.expressID === targetStoreyId) {
      return node;
    }

    const childMatch = findStoreyNode(node.children, targetStoreyId);
    if (childMatch) {
      return childMatch;
    }
  }

  return null;
}

function collectDescendantIds(node: IfcSpatialNode, result = new Set<number>()) {
  result.add(node.expressID);
  node.children.forEach((child) => collectDescendantIds(child, result));
  return result;
}

function resolveIfcClass(ifcType: string) {
  if (ifcType.includes('WALL') || ifcType.includes('SLAB') || ifcType.includes('ROOF') || ifcType.includes('STAIR') || ifcType.includes('RAMP')) {
    return 'Architecture';
  }

  if (ifcType.includes('COLUMN') || ifcType.includes('BEAM') || ifcType.includes('MEMBER') || ifcType.includes('PLATE') || ifcType.includes('PILE') || ifcType.includes('FOOTING')) {
    return 'Structure';
  }

  if (ifcType.includes('DOOR') || ifcType.includes('WINDOW') || ifcType.includes('OPENING') || ifcType.includes('CURTAINWALL')) {
    return 'Envelope';
  }

  if (ifcType.includes('FLOW') || ifcType.includes('DUCT') || ifcType.includes('PIPE') || ifcType.includes('CABLE') || ifcType.includes('TERMINAL') || ifcType.includes('ELECTRIC')) {
    return 'MEP';
  }

  if (ifcType.includes('SPACE') || ifcType.includes('STOREY') || ifcType.includes('BUILDING') || ifcType.includes('SITE')) {
    return 'Spatial';
  }

  if (ifcType.includes('FURNISHING') || ifcType.includes('EQUIPMENT')) {
    return 'Equipment';
  }

  return 'Other';
}

export function ViewportContainer() {
  const [debugPanelOpen, setDebugPanelOpen] = useState(false);
  const selectedEntityId = useViewerStore((state) => state.selectedEntityId);
  const setSelectedEntityId = useViewerStore((state) => state.setSelectedEntityId);
  const hiddenEntityIds = useViewerStore((state) => state.hiddenEntityIds);
  const viewportCommand = useViewerStore((state) => state.viewportCommand);
  const { meshes } = useViewportGeometry();
  const {
    loading,
    progress,
    geometryResult,
    error,
    engineState,
    engineMessage,
    currentFileName,
    currentModelId,
    currentModelSchema,
    currentModelMaxExpressId,
    spatialTree,
    activeClassFilter,
    activeTypeFilter,
    activeStoreyFilter,
  } = useWebIfc();
  const hasRenderableGeometry = geometryResult.ready && meshes.length > 0;
  const entityIds = useMemo(() => [...new Set(meshes.map((mesh) => mesh.expressId))], [meshes]);
  const filteredHiddenIds = useMemo(() => {
    if (!hasRenderableGeometry) {
      return [];
    }

    const hiddenByType =
      activeTypeFilter === null
        ? []
        : meshes.filter((mesh) => mesh.ifcType !== activeTypeFilter).map((mesh) => mesh.expressId);

    const hiddenByClass =
      activeClassFilter === null
        ? []
        : meshes
            .filter((mesh) => resolveIfcClass(mesh.ifcType) !== activeClassFilter)
            .map((mesh) => mesh.expressId);

    const hiddenByStorey = (() => {
      if (activeStoreyFilter === null) {
        return [];
      }

      const storeyNode = findStoreyNode(spatialTree, activeStoreyFilter);
      if (!storeyNode) {
        return [];
      }

      const visibleIds = collectDescendantIds(storeyNode);
      return meshes
        .filter((mesh) => !visibleIds.has(mesh.expressId))
        .map((mesh) => mesh.expressId);
    })();

    return [...new Set([...hiddenByClass, ...hiddenByType, ...hiddenByStorey])];
  }, [activeClassFilter, activeStoreyFilter, activeTypeFilter, hasRenderableGeometry, meshes, spatialTree]);
  const effectiveHiddenIds = useMemo(
    () => [...new Set([...hiddenEntityIds, ...filteredHiddenIds])],
    [filteredHiddenIds, hiddenEntityIds]
  );

  return (
    <section className="viewer-viewport">
      <div className="viewer-viewport__label">Viewport</div>
      <div className="viewer-viewport__surface">
        {hasRenderableGeometry ? (
          <ViewportScene
            meshes={meshes}
            selectedEntityId={selectedEntityId}
            hiddenEntityIds={effectiveHiddenIds}
            viewportCommand={viewportCommand}
            onSelectEntity={setSelectedEntityId}
          />
        ) : (
          <div className="viewer-viewport__empty-state">
            <h1>Step 4.1 준비</h1>
            <p>IFC 파일을 열면 이 영역에 실제 3D 모델이 바로 렌더링됩니다.</p>
            <p>다음 단계부터는 클릭 선택과 패널 연동을 같은 viewport 위에서 검증합니다.</p>
          </div>
        )}
        <div className="viewer-viewport__overlay">
          <div className={`viewer-viewport__debug-panel${debugPanelOpen ? ' is-open' : ''}`}>
            <button
              type="button"
              className="viewer-viewport__debug-toggle"
              onClick={() => setDebugPanelOpen((current) => !current)}
            >
              <span>Debug Panel</span>
              <small>
                {debugPanelOpen ? '상태창 접기' : '상태창 펼치기'}
              </small>
              {debugPanelOpen ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
            </button>
            {debugPanelOpen && (
              <div className="viewer-viewport__debug-body">
                <div className="viewer-viewport__meta-grid">
                  <div className="viewer-viewport__meta-card">
                    <span>엔진 상태</span>
                    <strong>{engineState}</strong>
                    <small>{engineMessage}</small>
                  </div>
                  <div className="viewer-viewport__meta-card">
                    <span>로딩 상태</span>
                    <strong>{loading ? '진행 중' : '대기'}</strong>
                    <small>{progress}</small>
                  </div>
                  <div className="viewer-viewport__meta-card">
                    <span>모델 상태</span>
                    <strong>{hasRenderableGeometry ? '렌더링 준비 완료' : '대기 중'}</strong>
                    <small>
                      {geometryResult.ready
                        ? `${geometryResult.meshCount} meshes / ${geometryResult.vertexCount} vertices / ${geometryResult.indexCount} indices`
                        : 'IFC 파일을 열면 viewport가 채워집니다.'}
                    </small>
                  </div>
                  <div className="viewer-viewport__meta-card">
                    <span>선택 상태</span>
                    <strong>{selectedEntityId ?? '없음'}</strong>
                    <small>
                      {activeTypeFilter || activeStoreyFilter
                        ? `필터 적용 중 · type ${activeTypeFilter ?? 'all'} · storey ${activeStoreyFilter ?? 'all'}`
                        : '3D 객체 클릭 또는 좌측 패널 선택'}
                    </small>
                  </div>
                </div>
                <div className="viewer-viewport__meta-grid viewer-viewport__meta-grid--secondary">
                  <div className="viewer-viewport__meta-card">
                    <span>파일명</span>
                    <strong>{currentFileName ?? '-'}</strong>
                    <small>선택된 IFC 파일</small>
                  </div>
                  <div className="viewer-viewport__meta-card">
                    <span>Model ID</span>
                    <strong>{currentModelId ?? '-'}</strong>
                    <small>worker OpenModel 결과</small>
                  </div>
                  <div className="viewer-viewport__meta-card">
                    <span>Schema</span>
                    <strong>{currentModelSchema ?? '-'}</strong>
                    <small>GetModelSchema 결과</small>
                  </div>
                  <div className="viewer-viewport__meta-card">
                    <span>MaxExpressID</span>
                    <strong>{currentModelMaxExpressId ?? '-'}</strong>
                    <small>GetMaxExpressID 결과</small>
                  </div>
                </div>
                {error && <p className="viewer-viewport__error">오류: {error}</p>}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
