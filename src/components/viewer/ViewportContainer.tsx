import { useWebIfc } from '@/hooks/useWebIfc';
import { useViewportGeometry } from '@/services/viewportGeometryStore';
import { useViewerStore } from '@/stores';
import { ViewportScene } from './ViewportScene';

export function ViewportContainer() {
  const selectedEntityId = useViewerStore((state) => state.selectedEntityId);
  const setSelectedEntityId = useViewerStore((state) => state.setSelectedEntityId);
  const clearSelection = useViewerStore((state) => state.clearSelection);
  const hiddenEntityIds = useViewerStore((state) => state.hiddenEntityIds);
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
  } = useWebIfc();
  const hasRenderableGeometry = geometryResult.ready && meshes.length > 0;

  return (
    <section className="viewer-viewport">
      <div className="viewer-viewport__label">Viewport</div>
      <div className="viewer-viewport__surface">
        {hasRenderableGeometry ? (
          <ViewportScene
            meshes={meshes}
            selectedEntityId={selectedEntityId}
            hiddenEntityIds={[...hiddenEntityIds]}
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
              <small>3D 객체 클릭 또는 좌측 패널 선택</small>
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
          <div className="viewer-viewport__toolbar">
            <button type="button" onClick={() => setSelectedEntityId(1201)} disabled={hasRenderableGeometry}>
              Mock 엔티티 선택
            </button>
            <button type="button" onClick={() => setSelectedEntityId(2202)} disabled={hasRenderableGeometry}>
              다른 엔티티 선택
            </button>
            <button type="button" onClick={clearSelection}>
              선택 해제
            </button>
          </div>
          {error && <p className="viewer-viewport__error">오류: {error}</p>}
        </div>
      </div>
    </section>
  );
}
