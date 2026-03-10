import { useWebIfc } from '@/hooks/useWebIfc';
import { useViewerStore } from '@/stores';
import type { IfcSpatialNode } from '@/types/worker-messages';

interface FlatHierarchyNode {
  id: number;
  label: string;
  depth: number;
}

function flattenSpatialTree(nodes: IfcSpatialNode[], depth = 0): FlatHierarchyNode[] {
  return nodes.flatMap((node) => [
    {
      id: node.expressID,
      label: `${node.type} / #${node.expressID}`,
      depth,
    },
    ...flattenSpatialTree(node.children, depth + 1),
  ]);
}

export function HierarchyPanel() {
  const selectedEntityId = useViewerStore((state) => state.selectedEntityId);
  const setSelectedEntityId = useViewerStore((state) => state.setSelectedEntityId);
  const { currentFileName, spatialTree } = useWebIfc();

  const flatNodes = flattenSpatialTree(spatialTree);
  const hasSpatialTree = currentFileName !== null && flatNodes.length > 0 && flatNodes[0]?.id !== 0;

  return (
    <aside className="viewer-panel viewer-panel--left">
      <div className="viewer-panel__header">Hierarchy</div>
      <div className="viewer-panel__body">
        <p>{hasSpatialTree ? '현재 IFC의 실제 spatial tree입니다.' : 'IFC 파일을 열면 실제 spatial tree가 표시됩니다.'}</p>
        <div className="viewer-panel__meta">
          <span>현재 파일</span>
          <strong>{currentFileName ?? '없음'}</strong>
        </div>
        <div className="viewer-panel__meta">
          <span>선택 엔티티</span>
          <strong>{selectedEntityId ?? '없음'}</strong>
        </div>
        <div className="viewer-tree">
          {flatNodes.map((node) => (
            <button
              key={node.id}
              type="button"
              className={`viewer-tree__item${selectedEntityId === node.id ? ' is-active' : ''}`}
              onClick={() => setSelectedEntityId(node.id)}
              style={{ paddingLeft: `${16 + node.depth * 14}px` }}
              disabled={node.id === 0}
            >
              {node.label}
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
}
