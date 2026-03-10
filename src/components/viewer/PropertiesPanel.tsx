import { useWebIfc } from '@/hooks/useWebIfc';
import { useViewerStore } from '@/stores';

export function PropertiesPanel() {
  const selectedEntityId = useViewerStore((state) => state.selectedEntityId);
  const hideEntity = useViewerStore((state) => state.hideEntity);
  const hiddenEntityIds = useViewerStore((state) => state.hiddenEntityIds);
  const resetHiddenEntities = useViewerStore((state) => state.resetHiddenEntities);
  const { properties } = useWebIfc();

  return (
    <aside className="viewer-panel viewer-panel--right">
      <div className="viewer-panel__header">Properties</div>
      <div className="viewer-panel__body">
        <p>다음 단계에서 실제 속성/PropertySet 패널로 대체됩니다.</p>
        <div className="viewer-panel__meta">
          <span>현재 선택</span>
          <strong>{selectedEntityId ?? '없음'}</strong>
        </div>
        <div className="viewer-panel__meta">
          <span>숨김 개수</span>
          <strong>{hiddenEntityIds.size}</strong>
        </div>
        <div className="viewer-panel__actions">
          <button
            type="button"
            onClick={() => {
              if (selectedEntityId !== null) {
                hideEntity(selectedEntityId);
              }
            }}
            disabled={selectedEntityId === null}
          >
            선택 숨기기
          </button>
          <button type="button" onClick={resetHiddenEntities}>
            숨김 초기화
          </button>
        </div>
        <div className="viewer-property-list">
          <div className="viewer-property-list__row">
            <span>GlobalId</span>
            <strong>{properties.globalId ?? '-'}</strong>
          </div>
          <div className="viewer-property-list__row">
            <span>IfcType</span>
            <strong>{properties.ifcType ?? '-'}</strong>
          </div>
          <div className="viewer-property-list__row">
            <span>Name</span>
            <strong>{properties.name ?? '-'}</strong>
          </div>
        </div>
      </div>
    </aside>
  );
}
